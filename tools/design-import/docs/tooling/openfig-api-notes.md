# OpenFig API Bulguları — budlum.xyz UI Tasarımı

## Export edilen fonksiyonlar (ES module)

`openfig-cli` paketinin default export'ı slides API'sini sunar:
- Deck, Slide, Symbol, TextNode, ImageNode, Shape (sınıflar)

## Gerçek .fig parse API

CLI komutları aracılığıyla:
- `openfig inspect <file.fig>` → node hierarchy tree (metin)
- `openfig inspect <file.fig> --json` → JSON format node ağacı
  - Her node: id, type (FRAME/TEXT/VECTOR/etc), name, phase, symbolID, overrides, depth
  - Geometry/style alanları (x, y, width, height, fills, stroke, vb.) bu çıktıda YOK
  - İçeride: `openfig-core` paketi (kiwi-schema + zstd decompression) gerçek binary parser

## Çalışan pipeline

1. `.fig` dosyası → `openfig inspect --json` → Node JSON array
2. JSON parse → node tipine/ismine göre React component üretim

## Örnek çıktı

Bkz. `fixtures/untitled-inspect.json` (budlum.xyz tasarımından gerçek excerpt)
