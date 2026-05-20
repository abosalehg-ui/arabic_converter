<div align="center">

# 🔄 عاكس النصوص العربية

### Arabic Text Converter

أداة متقدمة لعكس وتحويل النصوص العربية مع دعم التشكيل التلقائي

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-222222?style=for-the-badge&logo=github)](https://abosalehg-ui.github.io/arabic_converter/)

[🌐 جرب التطبيق](https://abosalehg-ui.github.io/arabic_converter/) · [📝 الإبلاغ عن مشكلة](https://github.com/abosalehg-ui/arabic_converter/issues)

</div>

---

<div dir="rtl">

## 📌 نظرة عامة

**عاكس النصوص العربية** هو تطبيق ويب مصمم لحل مشاكل عرض النصوص العربية في البرامج والتطبيقات التي لا تدعم اتجاه الكتابة من اليمين إلى اليسار (RTL). يقوم التطبيق بعكس النصوص العربية مع الحفاظ على التشكيل الصحيح للحروف.

### 🎯 لماذا هذا التطبيق؟

| المشكلة | الحل |
|---------|------|
| برامج كثيرة لا تدعم RTL | عكس النص ليظهر صحيحاً |
| الحروف تظهر مفككة | تشكيل تلقائي للحروف |
| النص يظهر معكوساً | تحويل ذكي مع الحفاظ على المعنى |

---

## ✨ المميزات

| الميزة | الوصف |
|--------|-------|
| 🔄 **عكس ذكي** | يحافظ على تشكيل الحروف العربية (معزول، ابتدائي، وسطي، نهائي) |
| 📁 **معالجة الملفات** | دعم كامل لملفات TXT مع السحب والإفلات |
| 🎨 **نصوص ملونة** | معالجة العلامات الملونة `<clr:RGB>` |
| 📋 **نصوص محددة** | معالجة النصوص بين علامات التنصيص |
| 🌙 **وضع ليلي/نهاري** | تبديل يدوي مع احترام إعدادات النظام |
| 🌐 **ثنائي اللغة** | واجهة بالعربية والإنجليزية مع RTL/LTR صحيح |
| ⌨️ **اختصارات لوحة المفاتيح** | `Ctrl+Enter` للتحويل · `Ctrl+K` للوحة الأوامر |
| 📜 **سجل التحويلات** | حفظ آخر 50 تحويل محليًا مع استعادة بنقرة |
| 📊 **إحصائيات النص الحيّة** | عدّاد للأحرف والكلمات والأسطر |
| 💻 **بدون تثبيت** | يعمل مباشرة في المتصفح |
| 🔒 **خصوصية تامة** | المعالجة تتم محلياً - لا إرسال للبيانات |

---

## 🖥️ التبويبات الأربعة

### 1️⃣ تحويل النص
للنصوص العربية البسيطة:
```
الإدخال: مرحبا بكم
النتيجة: مكب احبرم
```

### 2️⃣ معالجة الملفات
لملفات TXT الكبيرة:
- اسحب الملف أو اضغط للاختيار
- معالجة وتحميل النتيجة

### 3️⃣ نصوص ملونة
للنصوص مع علامات الألوان (مثل ملفات الألعاب):
```
الإدخال: <clr:255,212,255>مرحبا</clr>
النتيجة: <clr:255,212,255>احبرم</clr>
```

### 4️⃣ نصوص محددة
للنصوص بين علامات التنصيص (مثل ملفات الترجمة):
```
الإدخال: "ep_02.test" "النص العربي"
النتيجة: "ep_02.test" "يبرعلا صنلا"
```

---

## 🎮 حالات الاستخدام

| المجال | الاستخدام |
|--------|-----------|
| 🎮 **الألعاب** | إضافة نصوص عربية لـ Unity / Unreal Engine |
| 🎬 **الترجمة** | ملفات ترجمة الأفلام (SRT, ASS, SSA) |
| 🎨 **التصميم** | Photoshop وبرامج التصميم القديمة |
| 💻 **البرمجة** | البرامج التي لا تدعم RTL |

---

## 🚀 التشغيل

### أونلاين مباشرة
```
https://abosalehg-ui.github.io/arabic_converter/
```

### محلياً (تطوير)
```bash
# استنساخ المستودع
git clone https://github.com/abosalehg-ui/arabic_converter.git
cd arabic_converter

# تثبيت الاعتماديات
npm install

# تشغيل خادم التطوير
npm run dev

# بناء نسخة الإنتاج
npm run build

# معاينة نسخة الإنتاج محلياً
npm run preview
```

---

## 🔧 كيفية عمل الخوارزمية

تقوم الخوارزمية بتحديد شكل كل حرف عربي حسب موقعه:

| الشكل | الوصف | مثال (ب) |
|-------|-------|----------|
| معزول | حرف منفرد | ب |
| ابتدائي | بداية الكلمة | بـ |
| وسطي | وسط الكلمة | ـبـ |
| نهائي | نهاية الكلمة | ـب |

### الحروف غير المتصلة
```
ا - د - ذ - ر - ز - و
هذه الحروف لا تتصل بما بعدها
```

---

## 📁 هيكل المشروع

```
arabic_converter/
├── index.html                       # قالب Vite (نقطة الدخول)
├── vite.config.js                   # base path للنشر على GitHub Pages
├── package.json
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                     # نقطة دخول React
│   ├── App.jsx                      # تركيب الجذر
│   ├── index.css                    # متغيرات التصميم (light + dark)
│   ├── lib/
│   │   ├── arabicConverter.js       # منطق التشكيل والعكس
│   │   └── storage.js               # غلاف آمن حول localStorage
│   ├── theme/ThemeProvider.jsx
│   ├── i18n/                        # I18nProvider + ar.json + en.json
│   ├── hooks/                       # useHotkeys, useTextStats
│   ├── feedback/ToastProvider.jsx
│   ├── history/HistoryProvider.jsx
│   └── components/
│       ├── layout/                  # Header, TabBar, Footer
│       ├── controls/                # TextArea, TextStats, ThemeToggle, ...
│       ├── tabs/                    # التبويبات الأربعة
│       ├── palette/CommandPalette.jsx
│       └── history/HistoryDrawer.jsx
└── .github/workflows/deploy.yml     # نشر تلقائي على GitHub Pages
```

---

## 🛠️ التقنيات المستخدمة

| التقنية | الاستخدام |
|---------|-----------|
| **React 18** | نظام المكونات وإدارة الحالة |
| **Vite 6** | البناء والتطوير |
| **lucide-react** | الأيقونات |
| **CSS Variables** | متغيرات التصميم ودعم الثيمات |
| **FileReader API** | معالجة الملفات |
| **localStorage** | حفظ الثيم واللغة وسجل التحويلات |
| **Unicode Presentation Forms** | تشكيل الحروف العربية |

---

## ⌨️ اختصارات لوحة المفاتيح

| الاختصار | الإجراء |
|----------|---------|
| `Ctrl + Enter` | تشغيل تحويل التبويب الحالي |
| `Ctrl + K` | فتح لوحة الأوامر |
| `↑` / `↓` | التنقل بين الأوامر |
| `Enter` | تنفيذ الأمر المحدد |
| `Esc` | إغلاق لوحة الأوامر أو السجل |

---

## 📊 المواصفات

| المعيار | القيمة |
|---------|--------|
| 📝 الحروف المدعومة | 28+ حرف عربي |
| 🎨 الأشكال | 4 أشكال لكل حرف |
| 📁 أنواع الملفات | TXT |
| 💾 حجم الباندل (gzipped) | ~62 KB |
| ⚡ سرعة المعالجة | < 100ms |

---

## 🔒 الخصوصية والأمان

| الميزة | الحالة |
|--------|--------|
| 🔒 معالجة محلية | ✅ كل شيء على جهازك |
| 🌐 بدون خوادم | ✅ لا إرسال للبيانات |
| 👤 بدون تسجيل | ✅ لا حاجة لحساب |
| 📊 بدون تتبع | ✅ خصوصية كاملة |

---

## 🌐 المتصفحات المدعومة

| المتصفح | الإصدار |
|---------|---------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |

---

## 💡 أمثلة عملية

### مثال 1: نص بسيط
```
الإدخال: السلام عليكم
النتيجة: مكيلع ملاسلا
```

### مثال 2: نص مختلط
```
الإدخال: Hello مرحباً World
النتيجة: World ابحرم Hello
```

### مثال 3: ملف ترجمة
```
الإدخال:
"scene_01" "مرحباً بك في اللعبة"
"scene_02" "اضغط زر البداية"

النتيجة:
"scene_01" "ةبعللا يف كب ابحرم"
"scene_02" "ةيادبلا رز طغضا"
```

---

## 🤝 المساهمة

المساهمات مرحب بها! يمكنك:

1. عمل Fork للمستودع
2. إنشاء فرع جديد (`git checkout -b feature/ميزة-جديدة`)
3. تنفيذ التغييرات (`git commit -m 'إضافة ميزة'`)
4. رفع التغييرات (`git push origin feature/ميزة-جديدة`)
5. فتح Pull Request

---

## 📄 الترخيص

هذا المشروع متاح للاستخدام الحر - شخصي وتجاري.

---

## 👨‍💻 المطور

</div>

<div align="center">

**عبدالكريم العبود | ABDULKARIM ALOBUD**

[![Email](https://img.shields.io/badge/Email-abo.saleh.g%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:abo.saleh.g@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-abosalehg--ui-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/abosalehg-ui)

---

### 🔄 حوّل نصوصك العربية بسهولة!

[🌐 جرب التطبيق الآن](https://abosalehg-ui.github.io/arabic_converter/)

صُنع بـ ❤️ للمجتمع العربي

</div>
