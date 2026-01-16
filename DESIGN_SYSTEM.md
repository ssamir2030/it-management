# 🎨 Design System Documentation
# نظام التصميم الشامل لإدارة الأصول

## 📋 جدول المحتويات
1. [الألوان (Colors)](#الألوان)
2. [الطباعة (Typography)](#الطباعة)
3. [المسافات (Spacing)](#المسافات)
4. [الظلال (Shadows)](#الظلال)
5. [الرسوم المتحركة (Animations)](#الرسوم-المتحركة)
6. [المكونات (Components)](#المكونات)
7. [الأنماط الخاصة (Utilities)](#الأنماط-الخاصة)

---

## 🎨 الألوان

### الألوان الأساسية
- **Primary**: `hsl(250, 84%, 60%)` - اللون الأساسي (Purple/Indigo)
- **Primary Light**: `hsl(250, 84%, 70%)` - نسخة فاتحة
- **Primary Dark**: `hsl( 250, 84%, 50%)` - نسخة داكنة

### ألوان الحالة
- **Success**: `hsl(142, 76%, 36%)` - أخضر للنجاح
- **Warning**: `hsl(38, 92%, 50%)` - برتقالي للتحذير
- **Destructive**: `hsl(0, 84%, 60%)` - أحمر للخطر
- **Info**: `hsl(199, 89%, 48%)` - أزرق للمعلومات

### استخدام الألوان
```tsx
// في JSX
<div className="bg-primary text-primary-foreground">
  محتوى بلون أساسي
</div>

// Gradients
<div className="gradient-primary">
  خلفية متدرجة
</div>

// Text Gradients
<h1 className="text-gradient-primary">
  نص بلون متدرج
</h1>
```

---

## ✍️ الطباعة

### العناوين
```tsx
<h1 className="text-4xl font-bold tracking-tight">عنوان رئيسي</h1>
<h2 className="text-3xl font-semibold">عنوان فرعي</h2>
<h3 className="text-2xl font-medium">عنوان صغير</h3>
```

### النصوص
```tsx
<p className="text-base text-muted-foreground">نص عادي</p>
<p className="text-sm text-muted-foreground">نص صغير</p>
<p className="text-xs text-muted-foreground">نص صغير جداً</p>
```

---

## 📏 المسافات

### Padding & Margin
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)
- **2xl**: `3rem` (48px)

```tsx
<div className="p-4 m-4">محتوى بمسافات متوسطة</div>
<div className="px-6 py-4">مسافات أفقية ورأسية مختلفة</div>
```

---

## 🌑 الظلال

### الظلال المتاحة
```tsx
// ظل خفيف
<Card className="shadow-sm">محتوى</Card>

// ظل متوسط
<Card className="shadow-md">محتوى</Card>

// ظل كبير
<Card className="shadow-lg">محتوى</Card>

// ظل متوهج
<Card className="shadow-glow">محتوى متوهج</Card>
```

---

## ⚡ الرسوم المتحركة

### الرسوم المتاحة

#### Fade In
```tsx
<div className="animate-fade-in">
  يظهر تدريجياً
</div>
```

#### Fade In Scale
```tsx
<div className="animate-fade-in-scale">
  يظهر مع تكبير
</div>
```

#### Slide In
```tsx
<div className="animate-slide-in-right">
  ينزلق من اليمين
</div>

<div className="animate-slide-in-left">
  ينزلق من اليسار
</div>
```

#### Shimmer (للتحميل)
```tsx
<div className="animate-shimmer skeleton h-20 w-full">
  حالة تحميل
</div>
```

#### Pulse Subtle
```tsx
<Badge className="animate-pulse-subtle">
  نبض خفيف
</Badge>
```

#### Float
```tsx
<div className="animate-float">
  طفو
</div>
```

---

## 💎 المكونات الخاصة

### Glass Effect (Glassmorphism)
```tsx
// Glass عادي
<Card className="glass">
  بطاقة زجاجية
</Card>

// Glass قوي
<Card className="glass-strong">
  بطاقة زجاجية قوية
</Card>
```

### Gradient Backgrounds
```tsx
<div className="gradient-primary">خلفية متدرجة أساسية</div>
<div className="gradient-success">خلفية متدرجة للنجاح</div>
<div className="gradient-warning">خلفية متدرجة للتحذير</div>
<div className="gradient-danger">خلفية متدرجة للخطر</div>
<div className="gradient-mesh">خلفية شبكية متدرجة</div>
```

### Card Enhancements
```tsx
// Card with Hover Effect
<Card className="card-hover">
  بطاقة مع تأثير عند التمرير
</Card>

// Glass Card
<Card className="card-glass">
  بطاقة زجاجية
</Card>

// Gradient Border Card
<Card className="card-gradient-border">
  بطاقة بحدود متدرجة
</Card>
```

### Button Styles
```tsx
// Gradient Button
<Button className="btn-gradient">
  زر متدرج
</Button>

// Glass Button
<Button className="btn-glass">
  زر زجاجي
</Button>
```

---

## 🛠️ الأنماط الخاصة (Utilities)

### Transitions
```tsx
<div className="transition-smooth">
  انتقال ناعم
</div>

<div className="transition-smooth-slow">
  انتقال ناعم بطيء
</div>
```

### Custom Scrollbar
```tsx
<div className="custom-scrollbar overflow-auto">
  محتوى بشريط تمرير مخصص
</div>
```

### Loading States
```tsx
// Skeleton Loader
<div className="skeleton h-10 w-full"></div>

// Loading Dots
<div className="loading-dots">
  <span></span>
  <span></span>
  <span></span>
</div>
```

---

## 📱 Responsive Design

### Breakpoints
- **sm**: `640px`
- **md**: `768px`
- **lg**: `1024px`
- **xl**: `1280px`
- **2xl**: `1536px`

### استخدام Responsive Classes
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
</div>
```

---

## 🎯 أمثلة عملية

### بطاقة بتصميم متقدم
```tsx
<Card className="card-glass card-hover animate-fade-in">
  <CardHeader className="gradient-primary text-white">
    <CardTitle className="flex items-center gap-2">
      <Icon className="h-5 w-5" />
      العنوان
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <p className="text-muted-foreground">المحتوى هنا</p>
    <Button className="btn-gradient w-full">
      إجراء
    </Button>
  </CardContent>
</Card>
```

### عنوان صفحة
```tsx
<div className="space-y-2 animate-fade-in">
  <h1 className="text-4xl font-bold tracking-tight">
    <span className="text-gradient-primary">
      عنوان الصفحة
    </span>
  </h1>
  <p className="text-muted-foreground">
    وصف الصفحة
  </p>
</div>
```

### Stats Card
```tsx
<Card className="card-gradient-border card-hover">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">العنوان</p>
        <h3 className="text-3xl font-bold">١٢٣</h3>
      </div>
      <div className="p-3 bg-primary/10 rounded-lg">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 🌗 Dark Mode

جميع المكونات تدعم Dark Mode تلقائياً. لا حاجة لتعديلات إضافية!

```tsx
// Dark mode يعمل تلقائياً
<Card className="glass">
  يتغير تلقائياً في الوضع الليلي
</Card>
```

---

## ⚡ Performance Tips

1. استخدم `transition-smooth` بدلاً من transitions مخصصة
2. استخدم `animate-` classes للرسوم المتحركة المعدة مسبقاً
3. استخدم `glass` effects بحذر (تؤثر على الأداء)
4. استخدم `skeleton` للتحميل بدلاً من spinners

---

## 📚 الموارد الإضافية

- [Tailwind CSS Docs](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

---

**تم التحديث في:** 2025-12-04
**الإصدار:** 2.0.0
