# TODO: إصلاح مشاكل الإعلانات

## المعلومات التي تم جمعها
- نظام الإعلانات يتكون من: `js/banners.js` (سلايدر الواجهة)، `js/admin-banners.js` (لوحة تحكم المؤسس CRUD)، `banners.css`، وجزء HTML في `index.html`.
- `index.html` يعرّف دالة `window.switchFounderTab` في سكربت inline بدون معالجة تبويب `banners`.
- هذه الدالة تلغي تعريف `switchFounderTab` في `js/admin-dashboard.js` الذي كان يستدعي `refreshBannersAdmin()`.
- `js/banners.js` لا يخفي السلايدر عند فشل جلب البيانات (فقط عند صفر بيانات).
- دالة `previewBannerImage` غير مربوطة بحقل `bannerImageInput`.
- مشكلة إضافية: السلايدر لا يعرض سوى الإعلان الأول بسبب اتجاه RTL — `.hero-slides` (flex) تُرتب العناصر من اليمين لليسار بينما كان الكود يستخدم `translateX(-...)`. تم إصلاح ذلك في `updateHeroPosition()` ليكتشف الاتجاه ويستخدم `translateX(+)` عند RTL.

## الخطة

### 1. تعديل index.html
- إضافة `case 'banners'` في `switchFounderTab` (السكربت inline) لاستدعاء `refreshBannersAdmin()`.

### 2. تعديل js/banners.js
- إخفاء السلايدر عند حدوث خطأ في التحميل (وليس فقط عند صفر بيانات).

### 3. تعديل js/admin-banners.js
- ربط `bannerImageInput` بالدالة `previewBannerImage` لعرض معاينة الصورة فور اختيارها.

## الملفات التي سيتم تعديلها
1. `index.html`
2. `js/banners.js`
3. `js/admin-banners.js`

## الخطوات المتبعة
- [x] تعديل index.html لإضافة case banners
- [x] تعديل js/banners.js لإخفاء السلايدر عند الخطأ
- [x] تعديل js/admin-banners.js لربط معاينة الصورة
- [x] إصلاح اتجاه السلايدر في RTL في updateHeroPosition
- [x] تحسين CSS (موضع زر العرض + تنسيق المودال على الموبايل)
- [ ] اختبار الوظائف (يدوي في المتصفح)

