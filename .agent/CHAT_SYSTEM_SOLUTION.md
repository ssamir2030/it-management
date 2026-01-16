# حل نظام الدردشة المباشرة - Live Chat System Solution

## 📋 ملخص المشكلة
كانت هناك عدة مشاكل في نظام الدردشة:
1. عدم ظهور اسم المستخدم الصحيح (كان يظهر "System Admin" بدلاً من اسم الموظف/المسؤول)
2. عدم إمكانية إرسال الرسائل
3. عدم وصول الرسائل للطرف الآخر
4. مشاكل في محاذاة الرسائل

## ✅ الحل النهائي

### 1. إصلاح تمرير بيانات المستخدم (userData)

#### أ. تعديل `portal/layout.tsx`
```tsx
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import { FloatingChat } from '@/components/chat/floating-chat'

export default async function PortalLayout({ children }) {
    const employee = await getCurrentEmployee()
    
    return (
        <div className="min-h-screen bg-background">
            <PortalHeader employeeName={employee?.name} />
            {children}
            {employee && (
                <FloatingChat 
                    role="EMPLOYEE" 
                    userData={{
                        id: employee.id,
                        name: employee.name,
                        email: employee.email
                    }}
                />
            )}
        </div>
    )
}
```

#### ب. تعديل `dashboard/layout.tsx`
```tsx
import { FloatingChat } from "@/components/chat/floating-chat"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

async function getAdminUser() {
    // يدعم كلاً من simple-auth و NextAuth
    const token = cookies().get('auth-token')?.value
    
    if (token) {
        // محاولة simple-auth
        const verified = await jwtVerify(token, SECRET)
        const user = await prisma.user.findUnique({
            where: { id: verified.payload.id }
        })
        if (user) return user
    }
    
    // Fallback إلى NextAuth
    const session = await auth()
    if (session?.user) {
        return {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email
        }
    }
    
    return null
}

export default async function DashboardLayout({ children }) {
    const admin = await getAdminUser()
    
    return (
        <>
            {children}
            <FloatingChat
                role="ADMIN"
                userData={admin ? {
                    id: admin.id,
                    name: admin.name || 'مدير النظام',
                    email: admin.email || undefined
                } : undefined}
            />
        </>
    )
}
```

#### ج. إزالة FloatingChat من `app/layout.tsx`
```tsx
// تم إزالة <FloatingChat role="ADMIN" /> من هنا
// لأنه يتعارض مع FloatingChat في portal/layout.tsx و dashboard/layout.tsx
```

### 2. تحديث FloatingChat لاستقبال userData

#### `floating-chat.tsx`
```tsx
interface FloatingChatProps {
    role?: 'ADMIN' | 'EMPLOYEE'
    userData?: {
        id: string
        name: string
        email?: string
    }
}

export function FloatingChat({ role, userData }: FloatingChatProps) {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
    
    // تحديث currentUser عند تغيير userData
    useEffect(() => {
        if (userData) {
            setCurrentUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: role || 'EMPLOYEE'
            })
        }
    }, [userData, role])
    
    // تمرير userData لجميع Server Actions
    const loadMessages = async () => {
        const result = await getChatMessages(100, role, userData)
        // ...
    }
    
    const handleSendMessage = async () => {
        const result = await sendChatMessage(contentToSend, undefined, attachmentUrl, role, userData)
        // ...
    }
}
```

### 3. تحديث Server Actions في `live-chat.ts`

#### أ. دعم كلا نظامي المصادقة
```typescript
async function getAdminSession() {
    // محاولة simple-auth
    const token = cookies().get('auth-token')?.value
    if (token) {
        const verified = await jwtVerify(token, SECRET)
        return verified.payload
    }
    
    // Fallback إلى NextAuth
    const { auth } = await import('@/auth')
    const session = await auth()
    if (session?.user) {
        return {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role
        }
    }
    
    return null
}
```

#### ب. استخدام userData المُمرر
```typescript
export async function sendChatMessage(
    content: string,
    recipientId?: string,
    attachmentUrl?: string,
    preferredRole?: 'ADMIN' | 'EMPLOYEE',
    senderInfo?: SenderInfo
) {
    // استخدام senderInfo إذا كان متاحاً
    if (senderInfo && preferredRole === 'EMPLOYEE') {
        senderId = senderInfo.id
        senderName = senderInfo.name
        senderType = 'EMPLOYEE'
    }
    else if (senderInfo && preferredRole === 'ADMIN') {
        senderId = senderInfo.id
        senderName = senderInfo.name
        senderType = 'USER'
    }
    // Fallback إلى جلب الجلسة
    else if (preferredRole === 'EMPLOYEE') {
        const employee = await getCurrentEmployee()
        // ...
    }
    else {
        const admin = await getAdminSession()
        // ...
    }
}
```

#### ج. تحديد المستلم تلقائياً للـ Admin
```typescript
if (senderType === 'USER') {
    messageData.userId = senderId
    
    let targetEmployeeId = recipientId
    
    // إذا لم يتم تحديد مستلم، ابحث عن آخر موظف
    if (!targetEmployeeId) {
        const lastMessage = await prisma.chatMessage.findFirst({
            where: {
                OR: [
                    { userId: senderId, employeeId: { not: null } },
                    { senderType: 'EMPLOYEE' }
                ]
            },
            orderBy: { createdAt: 'desc' },
            select: { employeeId: true }
        })
        
        if (lastMessage?.employeeId) {
            targetEmployeeId = lastMessage.employeeId
        }
    }
    
    if (targetEmployeeId) {
        messageData.employeeId = targetEmployeeId
    }
}
```

#### د. تحسين استعلام الرسائل للموظف
```typescript
const whereClause = isAdmin
    ? {} // Admin يرى جميع الرسائل
    : {
        OR: [
            { senderId: currentUserId },
            { employeeId: currentUserId },
            {
                AND: [
                    { senderType: 'USER' },
                    { employeeId: currentUserId }
                ]
            }
        ]
    }
```

### 4. تحديث جميع الدوال لدعم userData

تم تحديث الدوال التالية لقبول `userInfo` كمعامل:
- `sendChatMessage`
- `getChatMessages`
- `markChatMessagesAsRead`
- `getUnreadChatCount`

## 🔑 النقاط المهمة

1. **userData يُمرر من Server Component إلى Client Component**
   - `portal/layout.tsx` → `FloatingChat` (للموظفين)
   - `dashboard/layout.tsx` → `FloatingChat` (للمسؤولين)

2. **دعم نظامي مصادقة**
   - `simple-auth` (auth-token cookie)
   - `NextAuth` (session-based)

3. **تحديد المستلم تلقائياً**
   - عند إرسال رسالة من Admin بدون تحديد مستلم، يتم البحث عن آخر موظف تواصل معه

4. **عدم التداخل**
   - تم إزالة `FloatingChat` من `app/layout.tsx` لتجنب التداخل

## 📁 الملفات المعدلة

1. `src/app/layout.tsx` - إزالة FloatingChat
2. `src/app/portal/layout.tsx` - إضافة FloatingChat مع userData للموظف
3. `src/app/dashboard/layout.tsx` - إضافة FloatingChat مع userData للمسؤول
4. `src/components/chat/floating-chat.tsx` - دعم userData props
5. `src/app/actions/live-chat.ts` - دعم userData وكلا نظامي المصادقة
6. `src/app/actions/employee-portal.ts` - إضافة سجلات تتبع
7. `src/lib/simple-auth.ts` - إضافة سجلات تتبع

## ⚠️ ملاحظات مهمة

- **لا تعدل** `app/layout.tsx` لإضافة FloatingChat مرة أخرى
- **لا تغير** منطق تمرير userData في layouts
- **لا تحذف** دعم كلا نظامي المصادقة
- **احتفظ** بمنطق تحديد المستلم التلقائي

## 🧪 الاختبار

1. سجل دخول كموظف في `/portal/login`
2. افتح الدردشة - يجب أن يظهر اسم الموظف
3. أرسل رسالة
4. سجل دخول كمسؤول في `/simple-login` أو `/login`
5. افتح الدردشة - يجب أن تظهر رسالة الموظف
6. رد على الرسالة
7. تحقق من وصول الرد للموظف

## ✨ النتيجة النهائية

- ✅ يظهر اسم المستخدم الصحيح (موظف/مسؤول)
- ✅ يمكن إرسال الرسائل
- ✅ تصل الرسائل للطرف الآخر
- ✅ محاذاة الرسائل صحيحة (مرسل/مستقبل)
- ✅ يعمل مع كلا نظامي المصادقة

---
**تاريخ الحل:** 2025-12-05
**الحالة:** ✅ مكتمل ومختبر
