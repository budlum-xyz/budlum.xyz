# Budlum.xyz — İkinci AI Çalışma Talimatı

## Proje

- **GitHub repository:** `https://github.com/budlum-xyz/budlum.xyz`
- **Figma file key:** `RiA8nK980GGodTdKpD24hh`
- **Figma page:** `WEB` (`10:603`)
- **Çalışma hedefi:** Figma’daki `budlum.xyz` alanındaki her frame’i, frame içindeki tüm gerçek layer/node/assetleriyle React olarak uygulamak.

## Kesin kurallar

1. **Tahmin üretme.** Renk, spacing, typography, border, ikon, layout veya davranışı Figma’da yoksa uydurma.
2. **Tam frame screenshot/PNG ile UI oluşturma.** Screenshot yalnızca görsel karşılaştırma referansıdır.
3. Her Figma layer/node ayrı DOM, gerçek image asset veya gerçek SVG asset olarak ele alınmalıdır.
4. Her component dosyasında Figma frame adı ve node ID yorum olarak bulunmalıdır.
5. Figma’da görünmeyen state/variant/interaction varsayılmayacak; `figma-audit/` altına eksik veri olarak yazılacak.
6. Figma REST node JSON’unda SVG geometry yoksa CSS ile benzetme yapma. Gerçek SVG exportu alınana kadar node’u audit listesinde beklet.
7. `main` branch’e doğrudan push etme. Kendi branch’inde çalış ve Pull Request aç.
8. Figma ve GitHub erişim anahtarlarını commit, source code, README, issue veya chat çıktısına yazma.

## Repository yapısı

```txt
src/
  FigmaNode.jsx              # Ortak node renderer
  frames/                    # Üst seviye Figma frame wrapper'ları
public/
  figma-frames/              # Runtime için Figma frame node JSON'ları
figma-nodes/                 # Kaynak frame node JSON'ları
figma-audit/                 # Eksik asset/vector/prototype audit kayıtları
```

## Sizin göreviniz: Wallet frame/state grubu

Yalnızca aşağıdaki top-level Figma frame’leri inceleyin ve uygulayın:

| Figma node ID | Frame adı |
|---|---|
| `2223:54` | `kullanıcı bir cüzdanı açtı` |
| `2446:824` | `kullanıcı boş bir cüzdanı açtı` |
| `2377:22` | `kullanıcı kendi cüzdanını açtı` |
| `2901:266` | `kullanıcı kendi cüzdanını açtı` |
| `2901:704` | `kullanıcı kendi cüzdanını açtı` |
| `2902:961` | `kullanıcı kendi cüzdanını açtı` |
| `2907:1281` | `kullanıcı kendi cüzdanını açtı` |
| `2972:3658` | `kullanıcı kendi cüzdanını açtı` |
| `2972:3858` | `kullanıcı kendi cüzdanını açtı` |
| `2972:4204` | `kullanıcı kendi cüzdanını açtı` |

Başka frame’lere müdahale etmeyin; ortak bir eksik/bug görürseniz doğrudan değiştirmek yerine audit kaydı açın.

## Başlangıç adımları

```bash
git clone https://github.com/budlum-xyz/budlum.xyz.git
cd budlum.xyz
npm install
git checkout -b figma/wallet-states
npm run dev
```

## Uygulama standardı

Her frame için ayrı dosya tutun:

```txt
src/frames/Frame2223_54.jsx
src/frames/Frame2446_824.jsx
...
```

Dosya başlangıcı örneği:

```jsx
// Figma frame: kullanıcı bir cüzdanı açtı
// Figma node ID: 2223:54
```

- Node ID’leri `data-figma-id` ile korunmalı.
- Görünürlük, opacity, x/y, width/height, fill, stroke, corner radius ve typography doğrudan Figma JSON’dan alınmalı.
- `TEXT` node’ları gerçek metin node’u olarak uygulanmalı.
- Figma image-fill node’ları gerçek asset olarak işlenmeli.
- SVG/vector node’ları yalnızca gerçek Figma SVG exportu ile kullanılmalı.
- Bir node tıklanabilir görünüyorsa ancak Figma prototype interaction verisi yoksa davranış eklemeyin; `figma-audit/` altına kaydedin.

## Doğrulama ve teslim

PR açmadan önce:

```bash
npm run build
```

PR açıklamasına ekleyin:

- Kodlanan frame node ID’leri
- Kullanılan gerçek asset node ID’leri
- Eksik SVG/vector node ID’leri
- Figma’da tanımlı interaction olup olmadığı
- Bilinen doğrulama eksikleri

## Mevcut audit durumu

- `figma-audit/nested-frames.json`: nested frame/component/instance envanteri
- `figma-audit/prototype-interactions.json`: REST node response’unda bulunan interaction kayıtları
- `figma-audit/missing-exact-assets.json`: gerçek SVG geometry exportu bekleyen vector node’ları

Görev yalnızca ilgili frame’lerin tüm görünür node’ları gerçek Figma verisiyle işlendiğinde tamamlanmış sayılır.
