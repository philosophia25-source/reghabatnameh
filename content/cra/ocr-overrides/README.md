# CRA OCR overrides

این پوشه متن‌های OCR بازبینی‌شده‌ای را نگه می‌دارد که جای تصاویر متن‌دار در صفحه‌های مصوبات CRA نمایش داده می‌شوند.

- فایل‌های `content/cra/documents` خروجی واردکننده و بدون تغییر باقی می‌مانند
- `manifest.json` رکوردهایی را مشخص می‌کند که نسخه جایگزین دارند
- فایل‌های HTML و manifest با `scripts/apply-cra-ocr.py` تولید می‌شوند
- یادداشت‌های کاری و نشانه‌های ویرایش نباید وارد خروجی عمومی شوند
- متن تنقیحی غیررسمی باید از اسناد رسمی جدا و صریحاً برچسب‌گذاری شود

فرمان بازتولید

```bash
python scripts/apply-cra-ocr.py /path/to/reviewed-ocr.docx /path/to/reghabatnameh
```
