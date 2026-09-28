# Open Prompts mobil API kurulumu

1. Git, Python 3, Node.js 20+ ve PostgreSQL hazırlayın.
2. Proje kökünde `python3 backend/setup.py` çalıştırın (Windows: `py backend/setup.py`). Script upstream revizyonu `91c6b951e08d3033abe06f6b130e914e2178d0b9` indirir ve `overlay` dosyalarını ekler. Var olan klasörün üzerine yazmaz.
3. `backend/open-prompts/.env.local`: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, NEXT_PUBLIC_SITE_URL, ADMIN_EMAIL ve ADMIN_PASSWORD değerlerini kendi ortamınıza göre doldurun. OAuth kullanılacaksa sağlayıcı ayarlarını da girin. Upstream README ve .env.example esas alınır.
4. Bu klasörde `npm install` çalıştırın. `supabase/migrations/` SQL migrasyonlarını sırasıyla uygulayın; `npm run seed:admin` ile yönetici hesabını hazırlayın.
5. `npm run dev` ile çalıştırın. Dağıtım için upstream Node veya Cloudflare talimatlarını kullanın. Bu script yayınlama yapmaz.

Mevcut Open Prompts kurulumunda `overlay/` içeriğini aynı yollarla projenize ekleyebilirsiniz. Mevcut `/api/prompts` değişmez. Mobil yol kök `src/app/api/mobile/v1/prompts/route.ts` konumundadır ve locale öneki almaz.

## İçerik ekleme

Web panelinde yönetici olarak girin. Başlık, tam prompt, model, kategori ve erişilebilir **HTTPS görsel URL'lerini** ekleyin. Görünürlük **public**, onay durumu **approved** olmalı. Mobil API bu iki koşulu birlikte uygular; owner boş olsa da private/draft kayıtları döndürmez. Boş promptlar hariç tutulur. Görsel depolaması size aittir; eklenti dosya yükleme hizmeti sağlamaz.

Mobil API yalnızca veritabanını kullanır. DB yoksa 503, boş katalogda 200 ve boş items döner. Paketlenmiş topluluk arşivine sessizce geçmez. Uygulama içi üretim için AI anahtarı gerekmez.

## Sözleşme

`GET /api/mobile/v1/prompts?limit=30&cursor=123&q=portrait&category=portraitPhoto&model=Flux`

- limit: 1–60, varsayılan 30.
- cursor: önceki yanıttaki nextCursor; azalan DB ID'si ile sayfalama.
- q: en fazla 160 karakter; başlık/prompt/açıklama/model/etiket araması.
- category/model: en fazla 100 karakter; tam eşleşme.
- Yanıt: apiVersion=1, items, nextCursor, total, categories, models.
- Her item: id (slug), title, description, prompt, model, category, tags, images, sourceUrl, authorHandle, createdAt.
- Geçersiz sorgu 400; DB yapılandırılmamış 503; DB hatası 500. Hata cevabı DB detaylarını sızdırmaz.
- NEXT_PUBLIC_SITE_URL doğru dış adres olmalıdır; göreli görseller bu adrese çözülür.

Sunucu aramasındaki Türkçe aksan davranışı PostgreSQL collation'ına bağlıdır. Demo ve favori araması cihazda aksanları normalize eder.

## Test

`node --test backend/tests/catalog.test.mjs`

Gerçek veritabanında kabul kontrolü: bir public/approved, bir private/approved ve bir public/pending kayıt oluşturun; sadece ilki mobil API'de görünmeli. 31 public kayıt ilk sayfada 30, ikinci sayfada 1 kayıt vermeli. Bu teslimat için canlı PostgreSQL ile uçtan uca test yapılmamıştır.
