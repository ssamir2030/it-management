# 🎯 UI/UX Guidelines
# دليل واجهة المستخدم وتجربة المستخدم

## 📐 مبادئ التصميم الأساسية

### 1. **التناسق (Consistency)**
- استخدم نفس الألوان والأنماط في جميع أنحاء التطبيق
- التزم بنظام التصميم المحدد في `DESIGN_SYSTEM.md`
- استخدم المكونات الموحدة (`Page`, `EnhancedStatsCard`, إلخ)

### 2. **الوضوح (Clarity)**
- استخدم عناوين واضحة وموجزة
- أضف أوصاف للصفحات الرئيسية
- استخدم أيقونات معبرة مع النصوص

### 3. **التجاوب (Responsiveness)**
- صمم للموبايل أولاً (Mobile First)
- اختبر على جميع أحجام الشاشات
- استخدم Grid و Flexbox بشكل صحيح

### 4. **التغذية الراجعة (Feedback)**
- أضف حالات تحميل (Loading States)
- استخدم Toasts للإشعارات
- أضف تأكيدات للإجراءات المهمة

### 5. **الأداء (Performance)**
- استخدم Lazy Loading للصور والمكونات
- قلل من استخدام Animations الثقيلة
- استخدم Suspense للبيانات الثقيلة

---

## 🎨 معايير الألوان

### استخدام الألوان حسب الحالة

```tsx
// ✅ صحيح
<Badge className="bg-green-500">نجح</Badge>
<Badge className="bg-red-500">فشل</Badge>
<Badge className="bg-yellow-500">تحذير</Badge>

// ❌ خطأ - عدم اتساق الألوان
<Badge className="bg-blue-500">نجح</Badge>
<Badge className="bg-purple-500">فشل</Badge>
```

### التدرجات (Gradients)

```tsx
// ✅ استخدم التدرجات المعرفة مسبقاً
<div className="gradient-primary">محتوى</div>

// ❌ لا تعرف تدرجات جديدة بدون داعٍ
<div className="bg-gradient-to-r from-blue-500 to-green-500">محتوى</div>
```

---

## 📝 معايير الطباعة

### العناوين (Headings)

```tsx
// ✅ تدرج منطقي للعناوين
<h1 className="text-4xl font-bold">العنوان الرئيسي</h1>
<h2 className="text-3xl font-semibold">عنوان فرعي</h2>
<h3 className="text-2xl font-medium">عنوان صغير</h3>

// ❌ لا تقفز من h1 إلى h3
<h1>العنوان</h1>
<h3>فرعي</h3> // ❌
```

### النصوص

```tsx
// ✅ استخدام الأحجام المناسبة
<p className="text-base">نص عادي</p>
<p className="text-sm text-muted-foreground">نص توضيحي</p>

// ❌ أحجام عشوائية
<p className="text-[13px]">نص</p> // ❌
```

---

## 🔲بناء الصفحات

### هيكل الصفحة الموحد

```tsx
import { Page } from '@/components/page-layout'
import { Monitor, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MyPage() {
    return (
        <Page
            title="اسم الصفحة"
            description="وصف موجز للصفحة"
            icon={Monitor}
            actions={
                <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة جديد
                </Button>
            }
            breadcrumbs={[
                { label: 'الرئيسية', href: '/dashboard' },
                { label: 'الصفحة الحالية' }
            ]}
        >
            {/* محتوى الصفحة */}
        </Page>
    )
}
```

### بطاقات الإحصائيات

```tsx
import { StatsGrid, EnhancedStatsCard } from '@/components/enhanced-stats-card'
import { Users, Package } from 'lucide-react'

<StatsGrid cols={4}>
    <EnhancedStatsCard
        title="إجمالي الأصول"
        value={123}
        icon={Package}
        description="أصول نشطة"
        trend={{ value: 12, label: 'من الشهر الماضي' }}
        color="primary"
    />
    <EnhancedStatsCard
        title="الموظفين"
        value={45}
        icon={Users}
        variant="glass"
        color="success"
    />
</StatsGrid>
```

---

## ⚡ الرسوم المتحركة

### متى تستخدم Animations

✅ **استخدم Animations في:**
- دخول العناصر للصفحة (Page Entry)
- حالات التحميل (Loading States)
- التفاعلات (Hover, Click)
- التنقلات (Transitions)

❌ **لا تستخدم Animations في:**
- النصوص الطويلة
- الجداول الكبيرة
- العناصر التي تتكرر بكثرة

###  تطبيق Animations

```tsx
// ✅ رسوم متحركة خفيفة
<Card className="animate-fade-in card-hover">
    محتوى
</Card>

// ❌ رسوم متحركة ثقيلة
<Card className="animate-bounce animate-spin animate-ping">
    محتوى 
</Card>
```

---

## 🎯 التفاعلية

### Hover States

```tsx
// ✅ تأثيرات ناعمة
<Button className="transition-smooth hover:shadow-lg">
    زر
</Button>

// ❌ تأثيرات مفاجئة
<Button className="hover:scale-150">
    زر
</Button>
```

### Focus States

```tsx
// ✅ دائماً أضف focus states
<Input className="focus:ring-2 focus:ring-primary" />

// ❌ لا تزل focus states
<Input className="outline-none" />
```

---

## 📱 Responsive Design

### Mobile First

```tsx
// ✅ ابدأ بالموبايل ثم وسع
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// ❌ لا تبدأ بالديسكتوب
<div className="grid grid-cols-4 md:grid-cols-1">
```

### Breakpoints

```tsx
// ✅ استخدم Breakpoints المعيارية
sm: 640px   // موبايل عرضي
md: 768px   // تابلت
lg: 1024px  // ديسكتوب صغير
xl: 1280px  // ديسكتوب كبير

// ❌ لا تستخدم قيم عشوائية
@media (max-width: 850px) // ❌
```

---

## 🚦 حالات التحميل

### Skeleton Loaders

```tsx
// ✅ استخدم Skeletons للمحتوى
<div className="skeleton h-20 w-full"></div>

// ❌ لا تستخدم Spinners فقط
<div className="animate-spin">...</div>
```

### Suspense Boundaries

```tsx
// ✅ استخدم Suspense للبيانات
<Suspense fallback={<Skeleton />}>
    <DataComponent />
</Suspense>

// ❌ بدون loading state
<DataComponent />
```

---

## 🎨 Glassmorphism

### متى تستخدم Glass Effect

✅ **مناسب لـ:**
- Modals و Dialogs
- Floating Elements
- Overlays
- Cards المميزة

❌ **غير مناسب لـ:**
- المحتوى الرئيسي
- النصوص الطويلة
- الخلفيات الداكنة

```tsx
// ✅ استخدام صحيح
<Dialog className="glass">
    <DialogContent className="glass-strong">
        محتوى
    </DialogContent>
</Dialog>

// ❌ استخدام خاطئ
<div className="glass">
    <p>نص طويل جداً جداً...</p>
</div>
```

---

## ♿ Accessibility

### ARIA Labels

```tsx
// ✅ دائماً أضف ARIA labels
<Button aria-label="إضافة مستخدم جديد">
    <Plus />
</Button>

// ❌ بدون labels
<Button>
    <Plus />
</Button>
```

### Keyboard Navigation

```tsx
// ✅ دعم الكيبورد
<Dialog>
    <DialogTrigger>فتح</DialogTrigger>
    {/* يُفتح ويُغلق بـ Escape تلقائياً */}
</Dialog>

// ✅ ترتيب Tab منطقي
<form>
    <Input tabIndex={1} />
    <Input tabIndex={2} />
    <Button tabIndex={3} />
</form>
```

---

## 🎯 أمثلة كاملة

### صفحة List Page

```tsx
import { Page } from '@/components/page-layout'
import { StatsGrid, EnhancedStatsCard } from '@/components/enhanced-stats-card'
import { Package, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AssetsPage() {
    const stats = await getAssetStats()
    const assets = await getAssets()

    return (
        <Page
            title="الأصول"
            description="إدارة جميع أصول الشركة"
            icon={Package}
            actions={
                <Button className="btn-gradient">
                    <Plus className="ml-2 h-4 w-4" />
                    أصل جديد
                </Button>
            }
        >
            <StatsGrid>
                <EnhancedStatsCard
                    title="الإجمالي"
                    value={stats.total}
                    icon={Package}
                    color="primary"
                />
            </StatsGrid>

            <Card className="card-glass">
                <CardContent className="p-6">
                    {/* جدول الأصول */}
                </CardContent>
            </Card>
        </Page>
    )
}
```

---

## 🔍 Checklist قبل النشر

- [ ] جميع الألوان من نظام التصميم
- [ ] Animations ناعمة وبدون lag
- [ ] Responsive على جميع الأجهزة
- [ ] Loading states في كل مكان
- [ ] Error states مُعرَّفة
- [ ] Aria labels موجودة
- [ ] Keyboard navigation يعمل
- [ ] Dark mode يعمل بشكل صحيح
- [ ] لا توجد Console errors
- [ ] Performance جيد (Lighthouse > 90)

---

**آخر تحديث:** 2025-12-04
**الإصدار:** 2.0.0
