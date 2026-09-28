# Prompt Atlas 0.2.0 — Android Studio

Kotlin + Jetpack Compose Android galerisi. Paket: `com.promptatlas.app`, Android 8+. Open Prompts, GPT Image 2 Hub ve Awesome GPT-4o koleksiyonlarındaki gerçek görselleri ve tam promptları birleştirir. Kesin sayılar `catalog/import-report.json` içindedir.

## Aç ve çalıştır

1. ZIP'i çıkarın. Android Studio → Open → `PromptAtlas`.
2. JDK 17, Android SDK 36, Build Tools 36.0.0 ve AGP 8.13 destekleyen Android Studio kullanın.
3. Gradle Sync tamamlanınca `app` modülünü çalıştırın.

İlk Gradle Sync internet ister. **Hazır koleksiyon için sunucu veya API anahtarı gerekmez.** Promptlar ve küçük önizlemeler APK içinde bulunur; internet olmadan açılır. Detay ekranı bağlantı varsa orijinal görseli yükler; yoksa küçük önizleme kalır. Ek görseller ve kaynak bağlantıları internet gerektirir.

## Özellikler

Kaynak/kategori/model filtreleri, metin araması, 30'arlı sayfalama, tam prompt kopyalama, paylaşma, kalıcı favoriler, açık/koyu tema, yazar/kaynak/lisans bilgisi ve orijinal görsel bağlantıları. Promptlar kaynak dilinde korunur. Referans görsel gerektirebilen örnekler etiketlenir; aynı prompt aynı çıktıyı garanti etmez.

## Yeni koleksiyonlar

```sh
python3 -m pip install Pillow
python3 catalog/import_catalog.py --workers 8
python3 catalog/verify_catalog.py
./gradlew :core:test :app:lintDebug :app:assembleDebug :app:bundleRelease
```

Windows: `python` ve `gradlew.bat`. Ayrıntılar `catalog/README.md`. `sources.json` kaynakları, commit sürümlerini ve limitleri tanımlar. Yeni veri biçimleri için dönüştürücü eklenebilir.

Hazır koleksiyon sabitlenmiş bir sürümdür; GitHub'daki yeni paylaşımlar telefona kendiliğinden eklenmez. Yeni içerik için içe aktarma aracını çalıştırıp APK'yı yeniden oluşturun.

İsteğe bağlı canlı içerik için `backend/README.md` adımlarıyla kendi Open Prompts sunucunuzu kurup Ayarlar'dan bağlayın. Galeri sunucunuzun kataloğuna geçer; Yenile sunucudan yeni verileri alır. **Hazır koleksiyonu aç** ile geri dönülür. Varsayılan `OPEN_PROMPTS_BASE_URL` boş bırakılmalıdır.

## Dağıtım ve test

Hazır debug APK ve imzasız release AAB `distribution/` içindedir. Doğrulama sonucu `docs/BUILD_STATUS.md` içindedir. AAB'yi Play Console'a göndermeden önce Android Studio'da kendi keystore'unuzla imzalı sürüm üretin.

Önceki test APK farklı bir debug anahtarıyla imzalandıysa güncelleme kabul edilmeyebilir. Aynı keystore ile derleyin veya eski test uygulamasını kaldırın; kaldırmak yerel favorileri siler.

## Lisans ve yapı

Uygulama kodu Apache-2.0. Harici koleksiyonlar kendi lisanslarını korur: `catalog/licenses/`, `catalog/attribution/`, `LICENSE`, `NOTICE`. Lisans metinleri APK varlıklarında da bulunur. Kaynak/yazar ve önizlemenin küçültüldüğü bilgisi korunur. Uygulama koleksiyonların resmî ürünü değildir.

`app/`: Android UI ve veri katmanı; `core/`: modeller, arama ve testler; `catalog/`: gerçek içerik içe aktarma araçları; `backend/`: isteğe bağlı Open Prompts mobil API. Reklam/analitik SDK'sı yoktur. Uygulama görsel üretmez; promptu kendi AI aracınızda kullanırsınız.
