#!/usr/bin/env node
/**
 * Audit: strokeGeometry overlay coverage for image-fill nodes.
 *
 * Checks which image-fill nodes have exact strokeGeometry rendered via
 * FigmaStrokeGeometryOverlay (SVG overlay) and which use CSS border fallback.
 * - SVG overlay: exact when strokeGeometry decoded from OpenFig
 * - CSS border: exact for INSIDE-aligned solid strokes (rectangle)
 *
 * Output:
 *   figma-audit/stroke-overlay-coverage.json
 *   figma-audit/stroke-overlay-coverage.md
 */

import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const CHECK = process.argv.includes('--check');

async function frameFilesById(dir) {
  const out = new Map();
  for (const fileName of await readdir(dir)) {
    if (!fileName.endsWith('.json')) continue;
    const filePath = path.join(dir, fileName);
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      if (data?.id) out.set(data.id, filePath);
    } catch {
      // ignore
    }
  }
  return out;
}

function walk(nodes, visitor) {
  for (const node of nodes || []) {
    visitor(node);
    if (node.children) walk(node.children, visitor);
  }
}

function firstVisiblePaint(paints = [], type) {
  return paints?.find((paint) => paint.visible !== false && (!type || paint.type === type));
}

async function main() {
  const manifestPath = path.join(repoRoot, 'figma-nodes/manifest.json');
  const runtimeDir = path.join(repoRoot, 'public/figma-frames');
  const outJson = path.join(repoRoot, 'figma-audit/stroke-overlay-coverage.json');
  const outMd = path.join(repoRoot, 'figma-audit/stroke-overlay-coverage.md');

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const runtimeFiles = await frameFilesById(runtimeDir);

  const results = [];

  for (const frame of manifest) {
    const framePath = runtimeFiles.get(frame.id);
    if (!framePath) continue;
    const frameData = JSON.parse(readFileSync(framePath, 'utf8'));

    walk(frameData.children || [], (node) => {
      const allFills = [...(node.fills || []), ...(node.background || [])];
      const imageFills = allFills.filter((p) => p.visible !== false && p.type === 'IMAGE');
      if (!imageFills.length) return;

      const visibleStrokes = (node.strokes || []).filter((s) => s.visible !== false);
      const hasVisibleStroke = visibleStrokes.length > 0;
      const hasStrokeGeometry = !!(node.strokeGeometry && node.strokeGeometry.length);
      const strokeAlign = node.strokeAlign || 'CENTER';
      const strokeWeight = node.strokeWeight;
      const strokeTypes = [...new Set(visibleStrokes.map((s) => s.type))];
      const solidStroke = firstVisiblePaint(visibleStrokes, 'SOLID');

      // Renderer policy:
      // 1. strokeGeometry exists → SVG overlay via FigmaStrokeGeometryOverlay (exact)
      // 2. No strokeGeometry + solid stroke + INSIDE → CSS border (exact for rectangles)
      // 3. No strokeGeometry + solid stroke + CENTER/OUTSIDE → CSS border (approximation)
      // 4. No strokeGeometry + non-solid stroke → not rendered

      let renderMethod;
      let exactness;
      if (hasStrokeGeometry) {
        renderMethod = 'svg-overlay';
        exactness = 'exact';
      } else if (hasVisibleStroke) {
        if (solidStroke && strokeAlign === 'INSIDE') {
          renderMethod = 'css-border';
          exactness = 'exact';
        } else if (solidStroke) {
          renderMethod = 'css-border';
          exactness = 'approximate';
        } else {
          renderMethod = 'not-rendered';
          exactness = 'not-rendered';
        }
      } else {
        renderMethod = 'none';
        exactness = 'none';
      }

      results.push({
        frameId: frame.id,
        frameName: frame.name,
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        hasVisibleStroke,
        hasStrokeGeometry,
        strokeAlign,
        strokeWeight,
        strokeTypes,
        renderMethod,
        exactness,
      });
    });
  }

  // Aggregate
  const withOverlay = results.filter((r) => r.renderMethod === 'svg-overlay');
  const cssBorderExact = results.filter((r) => r.renderMethod === 'css-border' && r.exactness === 'exact');
  const cssBorderApprox = results.filter((r) => r.renderMethod === 'css-border' && r.exactness === 'approximate');
  const notRendered = results.filter((r) => r.exactness === 'not-rendered' || r.renderMethod === 'none');

  const stableOutput = {
    totalImageFillNodes: results.length,
    svgOverlayExact: withOverlay.length,
    cssBorderExact,
    cssBorderApprox: cssBorderApprox.length,
    notRendered: notRendered.length,
    svgOverlayNodes: withOverlay,
    cssBorderApproxNodes: cssBorderApprox,
  };

  const output = {
    generated: new Date().toISOString(),
    ...stableOutput,
  };

  const lines = [
    '# Stroke Overlay Coverage — Image-Fill Nodes',
    '',
    `Generated: ${output.generated}`,
    '',
    '## Summary',
    '',
    '| Category | Count | Exactness |',
    '|---|---|---|',
    `| SVG overlay (strokeGeometry) | ${withOverlay.length} | exact |`,
    `| CSS border (INSIDE, solid stroke) | ${cssBorderExact.length} | exact |`,
    `| CSS border (CENTER/OUTSIDE or non-solid) | ${cssBorderApprox.length} | approximate |`,
    `| Not rendered | ${notRendered.length} | n/a |`,
    `| **Total image-fill nodes** | **${results.length}** | |`,
    '',
    '## Render method reference',
    '',
    '| Method | Trigger | Exactness rationale |',
    '|---|---|---|',
    '| `svg-overlay` | `strokeGeometry` present | Exact SVG path from OpenFig binary |',
    '| `css-border` (INSIDE) | INSIDE + solid stroke, no strokeGeometry | CSS border is inside by default; exact for rectangles |',
    '| `css-border` (CENTER/OUTSIDE) | solid stroke, no strokeGeometry | Border position differs from Figma CENTER/OUTSIDE |',
    '| `not-rendered` | Non-solid stroke, no strokeGeometry | CSS cannot replicate gradient/image stroke |',
    '',
    '## SVG overlay nodes (exact strokeGeometry)',
    '',
    ...(withOverlay.length
      ? [
          '| Frame | Node | Type | Align | Weight |',
          '|---|---|---|---|---|',
          ...withOverlay.map(
            (n) =>
              `| ${n.frameName} | ${n.nodeName} | \`${n.nodeType}\` | \`${n.strokeAlign}\` | ${n.strokeWeight} |`,
          ),
        ]
      : ['_None_']),
    '',
    ...(cssBorderApprox.length
      ? [
          '## CSS border — approximate (CENTER/OUTSIDE or non-solid stroke, no strokeGeometry)',
          '',
          '| Frame | Node | Type | Align | Weight | Stroke Types |',
          '|---|---|---|---|---|---|',
          ...cssBorderApprox.map(
            (n) =>
              `| ${n.frameName} | ${n.nodeName} | \`${n.nodeType}\` | \`${n.strokeAlign}\` | ${n.strokeWeight} | ${n.strokeTypes.join(', ')} |`,
          ),
        ]
      : []),
  ];

  const jsonText = `${JSON.stringify(stableOutput, null, 2)}\n`;
  const mdText = `${lines.join('\n')}\n`;

  if (!CHECK) {
    const { writeFileSync } = await import('node:fs');
    writeFileSync(outJson, jsonText, 'utf8');
    writeFileSync(outMd, mdText, 'utf8');
    console.log(
      `Stroke overlay coverage: ${withOverlay.length} overlay, ${cssBorderExact.length} css-border-exact, ${cssBorderApprox.length} css-border-approx, ${notRendered.length} none.`,
    );
  } else {
    const current = JSON.parse(readFileSync(outJson, 'utf8'));
    if (
      JSON.stringify(current.svgOverlayNodes) !== JSON.stringify(stableOutput.svgOverlayNodes) ||
      JSON.stringify(current.cssBorderApproxNodes) !== JSON.stringify(stableOutput.cssBorderApproxNodes) ||
      current.totalImageFillNodes !== stableOutput.totalImageFillNodes
    ) {
      console.error('Stroke overlay coverage is stale. Run npm run figma:stroke-overlay.');
      process.exit(1);
    }
    console.log(
      `Stroke overlay coverage is current: ${withOverlay.length} overlay, ${cssBorderExact.length} css-border-exact, ${cssBorderApprox.length} css-border-approx, ${notRendered.length} none.`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
