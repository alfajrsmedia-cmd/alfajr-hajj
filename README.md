# منصة إدارة تسكين الحجاج - الفجر للحج والعمرة

نظام إدارة شامل لتسكين الحجاج، مبني بـ Next.js 15 + Supabase + TypeScript.

## ✨ المميزات

### بوابة الحاج
- 🔍 بحث بالاسم، رقم الجواز، أو الهاتف
- 🏨 عرض بيانات السكن (الفندق، الطابق، الغرفة)
- 👥 عرض المرافقين في الغرفة
- 📱 بطاقة QR للتعريف
- 🖨️ طباعة بطاقة تعريف

### لوحة الإدارة
- 📊 Dashboard شامل مع إحصائيات
- 👤 إدارة كاملة لبيانات الحجاج (تعديل، بحث، فلترة)
- 🏨 إدارة الغرف والتسكين مع توزيع الطوابق
- 👥 إدارة المجموعات
- 🖨️ كشوف طباعة بنفس تنسيق الـ PDFs الأصلية

## 🚀 البدء السريع

### 1. تثبيت الـ Dependencies

```bash
npm install
```

### 2. إعداد متغيرات البيئة

انسخ `.env.local.example` إلى `.env.local`:

```bash
cp .env.local.example .env.local
```

ثم عدّل القيم (افتراضياً مضبوطة على مشروعك):

```env
NEXT_PUBLIC_SUPABASE_URL=https://gnsdsisqsltxoujfslvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Jkx9OWee5RXdeu-uTtw4kg_RsUnPNkF
ADMIN_PASSWORD=alfajr2026
```

### 3. تشغيل المشروع محلياً

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

### 4. Build للإنتاج

```bash
npm run build
npm start
```

## 🌐 النشر على Vercel

### الطريقة الأولى - من GitHub (موصى بها):

1. ارفع المشروع على GitHub repository
2. ادخل [vercel.com/new](https://vercel.com/new)
3. استورد الـ repository
4. في "Environment Variables" أضف:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_PASSWORD`
5. اضغط Deploy

### الطريقة الثانية - عبر Vercel CLI:

```bash
npm i -g vercel
vercel
```

## 🗄️ قاعدة البيانات

البيانات الحالية مُحمّلة بالكامل:
- ✅ **739 حاج** مُدخلين
- ✅ **293 غرفة** موزعة
- ✅ **223 مجموعة**
- ✅ **6 طوابق** في فندق فجر الإمارات-1
- ✅ **التسكين الكامل** للجميع

## 🛠️ التقنيات

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Cookie-based للإدارة، بحث بالاسم/الجواز للحاج
- **Icons**: Lucide React
- **QR**: qrcode.react

## 📁 بنية المشروع

```
src/
├── app/
│   ├── page.tsx                 # الصفحة الرئيسية
│   ├── pilgrim/
│   │   ├── login/               # تسجيل دخول الحاج
│   │   └── [id]/                # عرض بيانات حاج
│   ├── admin/
│   │   ├── login/               # تسجيل دخول الإدارة
│   │   └── (dashboard)/         # كل صفحات الإدارة
│   │       ├── dashboard/
│   │       ├── pilgrims/
│   │       ├── rooms/
│   │       ├── groups/
│   │       └── print/
│   └── api/admin/               # API routes
├── components/                  # المكونات المشتركة
├── lib/
│   ├── supabase/                # Supabase clients
│   └── types.ts                 # TypeScript types
└── middleware.ts                # حماية الإدارة
```

## 🔐 تسجيل الدخول

### الحاج
يبحث بـ:
- الاسم الكامل (جزئي)
- رقم الجواز
- رقم الهوية
- رقم الهاتف

### الإدارة
كلمة المرور الافتراضية: `alfajr2026`

⚠️ **غيّر `ADMIN_PASSWORD` في الإنتاج!**

## 📝 المرحلة القادمة

- [ ] تسكين الحجاج بـ Drag & Drop
- [ ] خوارزمية تسكين ذكي
- [ ] إشعارات SMS/WhatsApp
- [ ] جدول الرحلات والمواقيت
- [ ] نظام شكاوى
- [ ] تطبيق المشرف/قائد المجموعة
- [ ] OTP authentication للحجاج

## 📞 الدعم

شركة الفجر للحج والعمرة  
هاتف: 065389222  
فاكس: 065387077
