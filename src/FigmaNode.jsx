import { useEffect, useMemo, useState } from 'react';

const IMAGE_FILL_SOURCE = '/figma-image-fills.json';
const VECTOR_TYPES = new Set(['VECTOR', 'STAR', 'BOOLEAN_OPERATION', 'LINE', 'REGULAR_POLYGON']);

function colorToCss(color, opacity = 1) {
  if (!color) return 'transparent';
  const alpha = (color.a ?? 1) * opacity;
  return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${alpha})`;
}

function firstVisiblePaint(paints = [], type) {
  return paints.find((paint) => paint.visible !== false && (!type || paint.type === type));
}

function imageUrlForPaint(paint, imageFills) {
  if (!paint) return undefined;
  return paint.assetUrl || imageFills?.[paint.imageRef] || (paint.imageRef ? `/figma-assets/${paint.imageRef}.png` : undefined);
}

function imageSizingForScaleMode(scaleMode) {
  switch (scaleMode) {
    case 'FILL':
      return { backgroundSize: 'cover', objectFit: 'cover' };
    case 'FIT':
      return { backgroundSize: 'contain', objectFit: 'contain' };
    case 'TILE':
      return { backgroundSize: 'auto', backgroundRepeat: 'repeat', objectFit: 'fill' };
    case 'STRETCH':
    default:
      return { backgroundSize: '100% 100%', objectFit: 'fill' };
  }
}

function cssBoxShadow(effects = []) {
  const shadows = effects
    .filter((effect) => effect.visible !== false && effect.type === 'DROP_SHADOW')
    .map((effect) => {
      const x = effect.offset?.x ?? 0;
      const y = effect.offset?.y ?? 0;
      const radius = effect.radius ?? 0;
      const spread = effect.spread ?? 0;
      return `${x}px ${y}px ${radius}px ${spread}px ${colorToCss(effect.color)}`;
    });
  return shadows.length ? shadows.join(', ') : undefined;
}

function baseStyle(node, rootBox, imageFills) {
  const box = node.absoluteBoundingBox;
  if (!box) return { display: 'contents' };

  const fills = node.fills || node.background || [];
  const solidFill = firstVisiblePaint(fills, 'SOLID');
  const imageFill = firstVisiblePaint(fills, 'IMAGE');
  const solidStroke = firstVisiblePaint(node.strokes || [], 'SOLID');
  const imageUrl = imageUrlForPaint(imageFill, imageFills);
  const imageSizing = imageSizingForScaleMode(imageFill?.scaleMode);

  const style = {
    position: 'absolute',
    left: box.x - rootBox.x,
    top: box.y - rootBox.y,
    width: box.width,
    height: box.height,
    opacity: node.opacity ?? 1,
    overflow: node.clipsContent ? 'hidden' : undefined,
    mixBlendMode: node.blendMode && !['NORMAL', 'PASS_THROUGH'].includes(node.blendMode) ? node.blendMode.toLowerCase() : undefined,
  };

  if (solidFill) style.backgroundColor = colorToCss(solidFill.color, solidFill.opacity ?? 1);
  if (imageUrl) {
    style.backgroundImage = `url(${imageUrl})`;
    style.backgroundSize = imageSizing.backgroundSize;
    style.backgroundRepeat = imageSizing.backgroundRepeat || 'no-repeat';
    style.backgroundPosition = 'center';
  }

  if (solidStroke) {
    style.border = `${node.strokeWeight || 1}px solid ${colorToCss(solidStroke.color, solidStroke.opacity ?? 1)}`;
  }

  if (node.cornerRadius != null) style.borderRadius = node.cornerRadius;
  if (Array.isArray(node.rectangleCornerRadii)) {
    style.borderRadius = node.rectangleCornerRadii.map((radius) => `${radius}px`).join(' ');
  }
  if (node.type === 'ELLIPSE') style.borderRadius = '50%';

  const shadow = cssBoxShadow(node.effects || []);
  if (shadow) style.boxShadow = shadow;

  return style;
}

function textStyle(node, rootBox, imageFills) {
  const style = baseStyle(node, rootBox, imageFills);
  const text = node.style || {};
  const fill = firstVisiblePaint(node.fills || [], 'SOLID');
  return {
    ...style,
    color: colorToCss(fill?.color || { r: 0, g: 0, b: 0, a: 1 }, fill?.opacity ?? 1),
    fontFamily: text.fontFamily ? `'${text.fontFamily}', sans-serif` : 'sans-serif',
    fontSize: text.fontSize,
    fontWeight: text.fontWeight,
    fontStyle: text.fontStyle?.toLowerCase()?.includes('italic') ? 'italic' : undefined,
    lineHeight: text.lineHeightPx ? `${text.lineHeightPx}px` : undefined,
    letterSpacing: text.letterSpacing != null ? `${text.letterSpacing}px` : undefined,
    textAlign: text.textAlignHorizontal?.toLowerCase(),
    whiteSpace: 'pre-wrap',
    display: 'flex',
    alignItems: text.textAlignVertical === 'CENTER' ? 'center' : text.textAlignVertical === 'BOTTOM' ? 'flex-end' : 'flex-start',
    justifyContent: text.textAlignHorizontal === 'CENTER' ? 'center' : text.textAlignHorizontal === 'RIGHT' ? 'flex-end' : 'flex-start',
  };
}

function hasPrototypeInteraction(node) {
  return Array.isArray(node.interactions) && node.interactions.length > 0;
}

function geometryRule(rule) {
  return rule === 'EVENODD' ? 'evenodd' : 'nonzero';
}

function renderGeometryPaths(paths = [], paint, fallbackColor) {
  const fill = paint?.type === 'SOLID' ? colorToCss(paint.color, paint.opacity ?? 1) : fallbackColor;
  return paths.map((geometry, index) => (
    <path
      key={`${geometry.path}-${index}`}
      d={geometry.path}
      fill={fill}
      fillRule={geometryRule(geometry.windingRule)}
      clipRule={geometryRule(geometry.windingRule)}
    />
  ));
}

function FigmaGeometryNode({ node, root, imageFills }) {
  const box = node.absoluteBoundingBox;
  if (!box) return null;
  const style = baseStyle(node, root, imageFills);
  delete style.background;
  delete style.backgroundColor;
  delete style.backgroundImage;
  delete style.backgroundSize;
  delete style.backgroundRepeat;
  delete style.backgroundPosition;
  delete style.border;
  style.overflow = 'visible';

  const fillPaint = firstVisiblePaint(node.fills || [], 'SOLID');
  const strokePaint = firstVisiblePaint(node.strokes || [], 'SOLID');
  return (
    <svg
      data-figma-id={node.id}
      data-figma-name={node.name}
      data-figma-type={node.type}
      viewBox={`0 0 ${box.width} ${box.height}`}
      preserveAspectRatio="none"
      style={style}
      aria-hidden="true"
    >
      {renderGeometryPaths(node.fillGeometry || [], fillPaint, 'transparent')}
      {renderGeometryPaths(node.strokeGeometry || [], strokePaint, strokePaint ? undefined : 'transparent')}
    </svg>
  );
}

export function FigmaNode({ node, root, imageFills, onAction }) {
  if (!node || node.visible === false) return null;

  if (VECTOR_TYPES.has(node.type)) {
    if (node.fillGeometry || node.strokeGeometry) return <FigmaGeometryNode node={node} root={root} imageFills={imageFills} />;
    // Exact geometry was not present in the Figma payload; do not approximate VECTOR-like nodes.
    return null;
  }

  if (node.type === 'TEXT') {
    return (
      <span data-figma-id={node.id} data-figma-name={node.name} style={textStyle(node, root, imageFills)}>
        {node.characters}
      </span>
    );
  }

  const children = node.children || [];
  const style = baseStyle(node, root, imageFills);
  const imagePaint = firstVisiblePaint(node.fills || node.background || [], 'IMAGE');
  const imageUrl = imageUrlForPaint(imagePaint, imageFills);
  const imageSizing = imageSizingForScaleMode(imagePaint?.scaleMode);

  if (imageUrl && children.length === 0 && node.type !== 'FRAME') {
    const imageStyle = { ...style, objectFit: imageSizing.objectFit };
    delete imageStyle.backgroundImage;
    delete imageStyle.backgroundSize;
    delete imageStyle.backgroundRepeat;
    delete imageStyle.backgroundPosition;
    return <img data-figma-id={node.id} data-figma-name={node.name} src={imageUrl} alt="" draggable="false" style={imageStyle} />;
  }

  const interactive = hasPrototypeInteraction(node);
  const Tag = interactive ? 'button' : 'div';
  if (interactive) {
    style.cursor = 'pointer';
    style.padding = 0;
    style.border = style.border || 0;
    style.background = style.background || 'transparent';
    style.font = 'inherit';
    style.color = 'inherit';
    style.textAlign = 'inherit';
  }

  return (
    <Tag
      data-figma-id={node.id}
      data-figma-name={node.name}
      data-figma-type={node.type}
      style={style}
      onClick={interactive ? () => onAction?.({ nodeId: node.id, name: node.name, interactions: node.interactions }) : undefined}
    >
      {children.map((child) => (
        <FigmaNode key={child.id} node={child} root={root} imageFills={imageFills} onAction={onAction} />
      ))}
    </Tag>
  );
}

export function FigmaFrame({ source, onAction }) {
  const [frame, setFrame] = useState(null);
  const [imageFills, setImageFills] = useState({});
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    fetch(source).then((response) => response.json()).then(setFrame);
  }, [source]);

  useEffect(() => {
    fetch(IMAGE_FILL_SOURCE)
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => setImageFills(payload?.meta?.images || payload?.images || {}))
      .catch(() => setImageFills({}));
  }, []);

  const rootBox = frame?.absoluteBoundingBox;
  const viewportStyle = useMemo(() => {
    if (!rootBox) return undefined;
    return {
      width: rootBox.width,
      height: rootBox.height,
      transform: `scale(${scale})`,
    };
  }, [rootBox, scale]);

  useEffect(() => {
    const fit = () => {
      if (!rootBox) return;
      setScale(Math.min((window.innerWidth - 320) / rootBox.width, (window.innerHeight - 48) / rootBox.height, 1));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [rootBox]);

  if (!frame || !rootBox) return null;

  return (
    <div className="figma-frame" style={viewportStyle}>
      <FigmaNode node={frame} root={rootBox} imageFills={imageFills} onAction={onAction} />
    </div>
  );
}
