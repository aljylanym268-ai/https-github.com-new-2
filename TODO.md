# TODO - إضافة نظام URL Routing للتطبيق

## المهام المنجزة
- [x] تحليل الكود المصدري بالكامل
- [x] وضع خطة التعديل والموافقة عليها

## المهام الحالية
- [ ] 1. إضافة دالة `handleRoute()` في `supabase.js` (تقرأ URL parameters وتوجه للشاشة المناسبة)
- [ ] 2. تعديل `openProductDetail()` في `product.js` لتحديث الـ URL عند فتح تفاصيل المنتج
- [ ] 3. تعديل `index.html` لاستدعاء `handleRoute()` بعد تحميل الصفحة
- [ ] 4. اختبار النظام

## تفاصيل التنفيذ

### 1. `supabase.js` - إضافة `handleRoute()`
- `?id=XXX` → تفتح تفاصيل المنتج مع `?id=productId` في الـ URL
- `?store=XXX` → تفتح متجر البائع
- `?founder=XXX` → تفتح صفحة المؤسس
- استخدام `window.history.replaceState` لتحديث الـ URL عند التنقل
- تنظيف الـ URL بعد معالجة الـ parameters

### 2. `product.js` - تعديل `openProductDetail()`
- إضافة `window.history.pushState` لتحديث الـ URL عند فتح تفاصيل المنتج
- استخدام `popstate` event للرجوع إلى الصفحة السابقة عند الضغط على Back

### 3. `index.html` - استدعاء `handleRoute()`
- بعد تهيئة التطبيق (بعد `showScreen(appState.currentScreen)`)
- استدعاء `handleRoute()` لقراءة الـ URL parameters
