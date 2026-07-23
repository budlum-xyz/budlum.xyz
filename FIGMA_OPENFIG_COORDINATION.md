# Figma + OpenFig Koordinasyon Talimatı

Bu dosya, Arena instance'larının Figma API, repodaki Figma JSON snapshot'ları ve OpenFig `.fig` dosyasıyla aynı anda ama çakışmadan çalışması için oluşturuldu.

Okunan kaynaklar:

- `AI_COLLABORATOR_BRIEF.md`
- `FIGMA_RATE_LIMIT_PLAYBOOK.md`
- `tools/design-import/docs/tooling/openfig-api-notes.md`
- `tools/design-import/fixtures/untitled-inspect.json`
- `figma-audit/live-rate-limit-status.json`

## 1. Ana kural değişmiyor

**Görsel doğruluk kaynağı Figma verisidir.** Renk, spacing, typography, stroke, radius, asset, SVG path, prototype interaction veya state OpenFig'den tahmin edilerek üretilmeyecek.

OpenFig bu projede **yardımcı koordinasyon ve offline envanter aracı** olarak kullanılacak; Figma'nın yerini almayacak.

## 2. Kaynakların rolleri

| Kaynak | Rol | Kullanım sınırı |
|---|---|---|
| Canlı Figma REST API | Birincil gerçek kaynak | Geometry, style, image fill, SVG path, prototype, component/state/variant için asıl kaynak. Rate-limit varsa zorlanmaz. |
| `figma-nodes/*.json` ve `public/figma-frames/*.json` | Committed Figma snapshot | Canlı API kapalıyken mevcut doğrulanmış Figma verisi olarak kullanılır. Eksik geometry uydurulmaz. |
| `figma-audit/*.json` ve `*.md` | Koordinasyon/açık iş kayıtları | Eksik exact vector, unsupported feature, prototype/variant belirsizlikleri burada tutulur. |
| OpenFig `.fig` dosyası | Offline hiyerarşi ve node/layer varlık kontrolü | Frame/layer isimleri, type, depth, symbol/instance varlığı için yardımcıdır. Geometry/style değeri sağlamadığı için görsel implementasyon kaynağı değildir. |
| `src/FigmaNode.jsx` ve `src/frames/*` | Render katmanı | Sadece Figma JSON'daki gerçek node verilerini render eder. |

## 3. Şu anki durum — 2026-07-24

- Canlı Figma refresh denemesi `429 Rate limit exceeded` ile bloklandı.
- `Retry-After` penceresi yaklaşık `366k` saniye, yani yaklaşık `4.2` gün.
- Bu bilgi `figma-audit/live-rate-limit-status.json` içinde token içermeden kayıtlıdır.
- Bu süre boyunca live refresh tekrar tekrar denenmeyecek; Arena instance'ları beklemeye bırakılmayacak.
- Committed JSON + OpenFig offline inceleme ile audit/koordinasyon işleri yapılabilir.

## 4. OpenFig'in mevcut kabiliyeti

Repo içindeki mevcut OpenFig notuna göre:

```bash
openfig inspect <file.fig>
openfig inspect <file.fig> --json
```

çıktıları node ağacını verir. Her kayıtta pratikte şu alanlar bulunur:

- `id`
- `type`
- `name`
- `phase`
- `symbolID`
- `overrides`
- `depth`

**Bulunmayan alanlar:** `x`, `y`, `width`, `height`, `fills`, `strokes`, `cornerRadius`, font style, image fill, SVG path, prototype transition.

Bu nedenle OpenFig çıktısı ile:

- Frame/layer var mı kontrol edilir.
- İsim/depth/type hiyerarşisi çıkarılır.
- Figma manifest'te görünmeyen olası frame/layer adları audit'e aday olarak işaretlenir.
- Ancak görsel CSS/React değeri yazılmaz.

## 5. Mevcut OpenFig snapshot özeti

`tools/design-import/fixtures/untitled-inspect.json` mevcut durumda UTF-16 BOM ile kayıtlıdır ve parse edilebilir.

Özet:

| Metrik | Değer |
|---|---:|
| Toplam node | `25,658` |
| Maksimum depth | `15` |
| `FRAME` | `4,562` |
| `TEXT` | `1,511` |
| `VECTOR` | `654` |
| `LINE` | `235` |
| `REGULAR_POLYGON` | `41` |
| `INSTANCE` | `31` |
| `SYMBOL` | `3` |
| `CANVAS` | `2` |

Bu sayıların tamamı OpenFig hiyerarşi envanteridir; Figma geometry/style coverage yerine geçmez.

## 6. Çakışma çözüm sırası

1. **Figma REST veya committed Figma JSON'da değer varsa:** kodda yalnızca o değer kullanılır.
2. **OpenFig layer var diyor, Figma JSON'da yoksa:** kod yazılmaz; audit'e `openfig-only / Figma reconciliation needed` olarak kaydedilir.
3. **Figma JSON layer var diyor, OpenFig'te yoksa:** Figma JSON güvenilir kabul edilir; gerekirse audit'e `snapshot mismatch` kaydı açılır.
4. **ID'ler uyuşmazsa:** doğrudan ID eşlemesi yapılmaz. Eşleştirme ancak `name + type + depth + parent path` üzerinden aday olarak yapılır ve Figma ile doğrulanmadan kodlanmaz.
5. **Prototype/state/variant sadece OpenFig'te ima ediliyorsa:** davranış eklenmez. Figma prototype/interactions JSON veya canlı Figma doğrulaması gerekir.

## 7. OpenFig kullanarak yapılacak güvenli işler

Canlı Figma limitliyken şunlar yapılabilir:

- OpenFig hiyerarşi envanteri üretmek.
- OpenFig node type/name/depth listesi ile `figma-nodes/manifest.json` karşılaştırması için plan hazırlamak.
- Potansiyel eksik frame/layer isimlerini audit formatında taslaklamak.
- Committed Figma JSON ile OpenFig hiyerarşisi arasında isim/type/depth tutarsızlıkları aramak.
- Rate-limit sonrası live Figma refresh batch sırasını daha doğru planlamak.

Yapılmayacaklar:

- OpenFig'ten görsel değer tahmin ederek CSS yazmak.
- OpenFig `VECTOR` veya `LINE` node'unu Figma SVG/path olmadan benzetmek.
- OpenFig'te adı geçen ama Figma JSON'da bulunmayan frame'i gerçekmiş gibi component'e çevirmek.
- OpenFig'te görülen layer adına dayanarak interaction varsaymak.

## 8. Önerilen offline workflow

### 8.1 OpenFig inspect üretimi

```bash
cd tools/design-import
npm ci
npx openfig inspect fixtures/untitled.fig --json > fixtures/untitled-inspect.json
```

Eğer çıktı UTF-16 ise parse/normalize için UTF-8'e çevrilmiş ara dosya kullanılabilir. Ara dosya commitlenmeden önce boyut ve ihtiyaç kontrolü yapılmalı.

Örnek parse kontrolü:

```bash
python3 - <<'PY'
from pathlib import Path
import json, collections
p = Path('tools/design-import/fixtures/untitled-inspect.json')
data = json.loads(p.read_bytes().decode('utf-16'))
print(len(data))
print(collections.Counter(item.get('type') for item in data if isinstance(item, dict)).most_common())
PY
```

### 8.2 Figma snapshot kontrolleri

Canlı API çağırmadan:

```bash
npm run figma:doctor
npm run figma:next
npm run figma:coverage:check
npm run figma:unsupported:check
```

### 8.3 Canlı Figma tekrar açıldığında

Rate-limit kalkınca tek instance çalışacak:

```bash
FIGMA_TOKEN=<figma-token> \
FIGMA_CHUNK_SIZE=1 \
FIGMA_MAX_RETRIES=2 \
FIGMA_RETRY_WAIT_MS=600000 \
FIGMA_MAX_WAIT_MS=900000 \
FIGMA_SKIP_RATE_LIMITED=1 \
npm run figma:refresh -- --ids=<safe-batch-ids>
```

Başarılı refresh sonrası:

```bash
npm run figma:doctor
npm run build
git status --short
```

## 9. Audit dosyaları için önerilen genişleme

OpenFig ile Figma snapshot'ları karşılaştırılırsa yeni audit dosyaları şu isimlerle tutulmalı:

```txt
figma-audit/openfig-inventory-summary.json
figma-audit/openfig-figma-crosswalk-candidates.json
figma-audit/openfig-only-nodes.json
figma-audit/openfig-snapshot-mismatches.json
```

Bu dosyalar kod üretmek için otomatik onay değildir; yalnızca Figma ile doğrulanacak iş listeleridir.

## 10. Güvenlik ve branch/push notu

- Tokenlar hiçbir dosyaya, log'a, README'ye veya PR/issue metnine yazılmayacak.
- Komutlarda yalnızca env variable placeholder kullanılacak.
- Eğer kullanıcı açıkça farklı yönlendirme vermezse repo talimatı gereği branch + PR tercih edilir; kullanıcı açıkça `main` push talimatı verdiyse commit öncesi token scan yapılmalı ve sadece sanitized değişiklik pushlanmalıdır.

## 11. Görev kapatma kriteri

Figma/OpenFig koordinasyonlu bir frontend görevi ancak şu koşullarda kapanabilir:

- İlgili frame/component Figma JSON veya canlı Figma API'den okunmuş olmalı.
- Tüm state/variant/prototype bilgileri Figma kaynaklı doğrulanmış olmalı.
- OpenFig sadece hiyerarşi/checklist olarak kullanılmış olmalı; görsel değer kaynağı yapılmamış olmalı.
- Missing exact geometry ve unsupported render feature audit'i güncel olmalı.
- `npm run figma:doctor` ve gerekiyorsa `npm run build` geçmiş olmalı.

Bu koşullardan biri eksikse görev açık/blokeli kalır.

## 12. 2026-07-24 OpenFig geometry approval and result

User approved using OpenFig binary geometry as an exact offline source for nodes whose Figma/OpenFig mapping is deterministic. The approved rule is:

- Use OpenFig geometry only when frame mapping is verified by compatible name, exact frame size, and dominant coordinate offset.
- Use OpenFig node geometry only when node mapping is verified by compatible type, exact layer name, and relative bbox match.
- If multiple OpenFig candidates match, accept only when decoded geometry signatures are identical.
- If a VECTOR-like node has no visible fill/stroke/effect/render bounds, treat it as an exact no-op rather than a missing render asset.

Cumulative result recorded in `figma-audit/openfig-geometry-final-report.md`:

- Initial missing exact geometry records: `774`
- OpenFig geometry records resolved: `742`
- Empty/no-op vector records removed from missing audit: `32`
- Final missing exact geometry records: `0`

This does not weaken the no-guessing rule: geometry was copied from the checked-in `.fig` binary and only after deterministic crosswalk validation.
