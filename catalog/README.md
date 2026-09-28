# Çok kaynaklı gerçek görsel / prompt kataloğu

Android 0.2.0 ilk açılışta `app/src/main/assets/catalog/catalog.json` içeriğini gösterir. Demo çizimler varsayılan galeriden kaldırıldı. Küçük önizlemeler APK içinde bulunur; çevrimdışı açılır. Orijinal görseller ve Open Prompts kayıtlarının ek görselleri internetten açılır.

## Kaynaklar

| Kaynak | Sabitlenen sürüm | Bildirilen lisans / kapsam |
|---|---|---|
| rudy2steiner/open-prompts | 91c6b951e08d3033abe06f6b130e914e2178d0b9 | Depo Apache-2.0; topluluk yazarları ve X kaynak bağlantıları korunur. |
| ChaosRealmsAI/gpt-image-2-gallery | 5296db8c996e38776c83a0bc8c64f848dcd512b3 | Depo MIT; bağımsız görsel örnekleri, orijinal meta.json promptları ve kaynak bağlantıları. |
| jamez-bondos/awesome-gpt4o-images | 3ed4dbb0f1ae6f7385c81e1fcea48d9eefd2e596 | Kayıt bazında ATTRIBUTION.yml kontrol edilir; yalnızca CC-BY-4.0 kayıtları alınır. OpenAI örneklerinin bulunduğu ayrı klasör alınmaz. |

Lisans metinleri `licenses/`, kayıt bazında atıflar `attribution/` içindedir. Bunlar uygulamanın Apache-2.0 kod lisansından ayrıdır. Görsellerin küçültüldüğü/sıkıştırıldığı detay ekranında belirtilir. Kaynakta adı verilen yazar korunur; uygulama bu koleksiyonların resmî ürünü değildir. Depo lisansları üçüncü kişilerin marka, kişilik veya başka hakları için garanti oluşturmaz. Kaynak kaldırma taleplerinde ilgili kayıt ve önizlemesini katalogdan çıkarıp uygulamayı güncelleyin.

## Koleksiyonu büyütme / güncelleme

Proje kökünde:

```sh
python3 -m pip install Pillow
python3 catalog/import_catalog.py --workers 8
python3 catalog/verify_catalog.py
./gradlew :core:test :app:assembleDebug :app:bundleRelease
```

Windows: `python` ve `gradlew.bat`. İçe aktarma aracı Python 3.10+ ve internet gerektirir. Uygulamayı çalıştırmak için Python gerekmez.

`sources.json` içindeki limitler artırılabilir. Sabit revizyon yeni bir commit ile güncellenebilir; önce yeni sürümün veri yapısı ve lisansı kontrol edilmelidir. Farklı bir veri biçimi için `ADAPTERS` sözlüğüne dönüştürücü ekleyin. Uygulamaya sadece kaynak URL'si eklemek, her sitenin farklı biçimini otomatik olarak tanımaz.

Mevcut üç dönüştürücü metadata ve görselleri indirir, gerçekten çözülebilen görselleri kabul eder, tam promptu korur ve tekrar eden promptları (boşluk/büyük-küçük harf farkları hariç) ayıklar. Genel koleksiyona uygun olmayan bazı terimler elenir; bu otomatik filtre insan incelemesinin yerini tutmaz. Seri örneklerinin başka görsellere bağımlı olanları GPT Image 2 Hub'dan alınmaz. Diğer kaynaklarda referans gerektiren örnekler etiketlenir; metni kopyalamak tek başına aynı görüntüyü garanti etmez.

`import-report.json` sayıları, başarısız indirmeleri ve revizyonları verir. 1.000'in altında sonuçta mevcut katalog değiştirilmez. Cache `.catalog-cache/` içindedir ve dağıtıma dahil edilmez. Başarılı katalog çıktıları sürüm paketine dahil edilir.

## Canlı içerik

Bu başlangıç koleksiyonu **sabitlenmiş bir sürümdür**; uygulama GitHub'daki değişiklikleri kendiliğinden taramaz. Yeni kayıtlar için içe aktarma aracını çalıştırıp yeni APK üretin. Yayınlanmış kendi Open Prompts sunucunuzu ayarlardan bağlarsanız, o sunucunun güncel kataloğuna geçilir. Bu modda Yenile düğmesi sunucudan veri alır. Hazır koleksiyona geri dönülebilir. Sunucu kurulumu isteğe bağlıdır ve `backend/README.md` içinde anlatılır.
