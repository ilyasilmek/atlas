# Prompt Atlas 0.2.0 — 28 Eylül 2026

Gerçek katalog: 1221 görsel/prompt. Kaynak dağılımı: {"open-prompts": 91, "chaos-gallery": 1100, "gpt4o-gallery": 30}.
Tüm önizlemeler indirildi ve Pillow ile açılarak doğrulandı. Aynı promptlar ve aynı kodlanmış önizlemeler ayıklandı; erişilemeyen kayıtlar alınmadı.

- Kotlin: 12 birim testi, 0 hata.
- Backend: 4 yardımcı katman testi başarılı.
- Android Kotlin derlemesi ve lintDebug başarılı.
- Debug APK ile R8 küçültülmüş release AAB oluşturuldu.
- Debug APK imzası doğrulandı; içindeki katalog ve bütün önizleme yolları kontrol edildi.
- Fiziksel cihaz/emülatör UI testi ve canlı Open Prompts/PostgreSQL testi yapılmadı.

APK geliştirme sertifikasıyla imzalıdır. AAB imzasızdır; Play Console için kendi keystore'unuzla imzalı paket üretin.
Galeri APK içinde gelir. GitHub kaynak güncellemeleri otomatik değildir; catalog/import_catalog.py ile yeni sürüm hazırlayın.
