#!/usr/bin/env python3
import argparse
import hashlib
import json
import shutil
import sys
import zipfile
from pathlib import Path

FIG_PATH = Path('tools/design-import/fixtures/untitled.fig')
FRAMES_DIR = Path('public/figma-frames')
ASSET_DIR = Path('public/figma-assets')
IMAGE_MAP_PATH = Path('public/figma-image-fills.json')
AUDIT_JSON = Path('figma-audit/local-image-assets.json')
AUDIT_MD = Path('figma-audit/local-image-assets.md')


def read_json(path: Path):
    return json.loads(path.read_text(encoding='utf-8'))


def collect_used_image_refs():
    refs = set()

    def walk(node):
        for key in ('fills', 'background'):
            for paint in node.get(key) or []:
                if paint.get('type') == 'IMAGE' and paint.get('imageRef'):
                    refs.add(paint['imageRef'])
        for child in node.get('children') or []:
            walk(child)

    for file in sorted(FRAMES_DIR.glob('*.json')):
        if file.name == 'manifest.json':
            continue
        walk(read_json(file))
    return refs


def extension_for(data: bytes):
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        return 'png'
    if data.startswith(b'\xff\xd8\xff'):
        return 'jpg'
    if data.startswith(b'GIF87a') or data.startswith(b'GIF89a'):
        return 'gif'
    if data.startswith(b'RIFF') and data[8:12] == b'WEBP':
        return 'webp'
    if data.lstrip().startswith(b'<svg'):
        return 'svg'
    return 'bin'


def build_payload(local_map):
    return {
        'error': False,
        'status': 200,
        'source': 'openfig-local-assets',
        'meta': {
            'images': dict(sorted(local_map.items())),
        },
    }


def stable_json(data):
    return json.dumps(data, ensure_ascii=False, indent=2, sort_keys=False) + '\n'


def write_or_check(path: Path, next_text: str, check: bool, label: str):
    if check:
        current = path.read_text(encoding='utf-8') if path.exists() else None
        if current != next_text:
            print(f'{label} is stale: {path}', file=sys.stderr)
            return False
        return True
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(next_text, encoding='utf-8')
    return True


def main():
    parser = argparse.ArgumentParser(description='Extract used Figma image fills from checked-in OpenFig .fig archive.')
    parser.add_argument('--check', action='store_true', help='Verify committed local assets and maps without rewriting files.')
    args = parser.parse_args()

    if not FIG_PATH.exists():
        print(f'Missing OpenFig file: {FIG_PATH}', file=sys.stderr)
        return 1
    if not zipfile.is_zipfile(FIG_PATH):
        print(f'OpenFig file is not a zip archive: {FIG_PATH}', file=sys.stderr)
        return 1

    used_refs = collect_used_image_refs()
    local_map = {}
    asset_records = []
    missing_in_openfig = []

    with zipfile.ZipFile(FIG_PATH) as archive:
        archive_names = set(archive.namelist())
        for ref in sorted(used_refs):
            entry = f'images/{ref}'
            if entry not in archive_names:
                missing_in_openfig.append(ref)
                continue
            data = archive.read(entry)
            ext = extension_for(data)
            asset_path = ASSET_DIR / f'{ref}.{ext}'
            sha1 = hashlib.sha1(data).hexdigest()
            local_map[ref] = f'/figma-assets/{ref}.{ext}'
            asset_records.append({
                'imageRef': ref,
                'archiveEntry': entry,
                'assetPath': str(asset_path),
                'publicPath': local_map[ref],
                'extension': ext,
                'bytes': len(data),
                'sha1': sha1,
                'sha1MatchesImageRef': sha1 == ref,
            })
            if args.check:
                if not asset_path.exists():
                    print(f'Missing local image asset: {asset_path}', file=sys.stderr)
                    return 1
                if asset_path.read_bytes() != data:
                    print(f'Local image asset differs from OpenFig archive: {asset_path}', file=sys.stderr)
                    return 1
            else:
                ASSET_DIR.mkdir(parents=True, exist_ok=True)
                asset_path.write_bytes(data)

    if missing_in_openfig:
        print(f'{len(missing_in_openfig)} used image refs were not found in OpenFig archive.', file=sys.stderr)
        for ref in missing_in_openfig[:20]:
            print(f'  {ref}', file=sys.stderr)
        return 1

    if not args.check and ASSET_DIR.exists():
        expected = {Path(record['assetPath']).name for record in asset_records}
        for file in ASSET_DIR.iterdir():
            if file.is_file() and file.name not in expected:
                file.unlink()
            elif file.is_dir():
                shutil.rmtree(file)

    payload = build_payload(local_map)
    audit = {
        'generatedFrom': [str(FIG_PATH), str(FRAMES_DIR), str(IMAGE_MAP_PATH)],
        'purpose': 'Ensures runtime Figma image fills use committed local assets instead of expiring Figma/S3 signed URLs.',
        'aggregate': {
            'usedImageRefs': len(used_refs),
            'localAssets': len(asset_records),
            'missingInOpenFig': len(missing_in_openfig),
            'totalBytes': sum(record['bytes'] for record in asset_records),
            'allSha1MatchImageRef': all(record['sha1MatchesImageRef'] for record in asset_records),
        },
        'imageMapPolicy': {
            'runtimeMap': str(IMAGE_MAP_PATH),
            'containsOnlyUsedImageRefs': True,
            'usesLocalPublicPaths': True,
            'externalSignedUrlsAllowed': False,
        },
        'assets': asset_records,
    }
    audit_lines = [
        '# Local Figma Image Assets',
        '',
        'Generated from the checked-in OpenFig `.fig` archive and committed runtime frame JSON.',
        '',
        f'- Used image refs: `{audit["aggregate"]["usedImageRefs"]}`',
        f'- Local assets: `{audit["aggregate"]["localAssets"]}`',
        f'- Total bytes: `{audit["aggregate"]["totalBytes"]}`',
        f'- Missing in OpenFig archive: `{audit["aggregate"]["missingInOpenFig"]}`',
        f'- All asset SHA-1 values match image refs: `{str(audit["aggregate"]["allSha1MatchImageRef"]).lower()}`',
        '',
        'Runtime policy: `public/figma-image-fills.json` contains only used image refs and maps them to committed `/figma-assets/...` files. Expiring Figma/S3 signed URLs are not used for runtime frame rendering.',
        '',
        '| Image ref | Extension | Bytes | Public path |',
        '|---|---|---:|---|',
    ]
    for record in asset_records:
        audit_lines.append(f'| `{record["imageRef"]}` | `{record["extension"]}` | {record["bytes"]} | `{record["publicPath"]}` |')

    ok = True
    ok &= write_or_check(IMAGE_MAP_PATH, stable_json(payload), args.check, 'Figma image fill map')
    ok &= write_or_check(AUDIT_JSON, stable_json(audit), args.check, 'Local image asset audit JSON')
    ok &= write_or_check(AUDIT_MD, '\n'.join(audit_lines) + '\n', args.check, 'Local image asset audit Markdown')
    if not ok:
        return 1

    print(f'Local Figma image assets: {len(asset_records)} asset(s), {audit["aggregate"]["totalBytes"]} bytes.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
