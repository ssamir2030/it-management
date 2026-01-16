# خطوات حل مشكلة تسجيل الدخول - التشخيص المتقدم

## 🔍 الخطوة 1: تشغيل الاختبار المتقدم

شغّل هذا الأمر في Terminal جديد:

```powershell
node scripts/test-auth-flow.js
```

هذا سيختبر كل خطوة في عملية التحقق من كلمة المرور.

## 🔄 الخطوة 2: إعادة تشغيل السيرفر

1. **أوقف السيرفر الحالي** (اضغط Ctrl+C في Terminal حيث يعمل السيرفر)

2. **نظّف الكاش**:
   ```powershell
   Remove-Item -Recurse -Force .next
   ```

3. **شغّل السيرفر من جديد**:
   ```powershell
   npm run dev
   ```

## 🌐 الخطوة 3: حاول تسجيل الدخول مع مراقبة Logs

1. افتح `http://localhost:4002/login`
2. أدخل:
   - Email: `admin@system.com`
   - Password: `password`
3. **راقب Terminal بعناية**

يجب أن ترى تفاصيل كاملة مثل:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 AUTHORIZE FUNCTION CALLED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Raw credentials: { email: 'admin@system.com', password: 'password' }
Email: admin@system.com
Password length: 8

📋 Step 1: Parsing credentials...
✅ Credentials parsed successfully
Parsed email: admin@system.com
Parsed password length: 8

📋 Step 2: Finding user in database...
✅ User found: { id: '...', email: 'admin@system.com', role: 'ADMIN' }

📋 Step 3: Checking password hash...
✅ Password hash exists (length: 60 )

📋 Step 4: Comparing passwords...
Input password: password
Hash (first 20 chars): $2a$10$...
bcrypt.compare result: true
✅✅✅ PASSWORD MATCH! Logging in user: ...
```

## 📸 الخطوة 4: التقط Screenshots وأرسلها

إذا فشل تسجيل الدخول، التقط:
1. Screenshot من Terminal (كل ال logs)
2. Screenshot من Browser Console (F12 → Console tab)
3. Screenshot من Browser Network tab (F12 → Network tab)

## 🎯 ما نبحث عنه:

### إذا كانت كلمة المرور صحيحة في logs:
- يعني المشكلة في NextAuth configuration
- أو في session/jwt callbacks
- أو في middleware

### إذا كانت كلمة المرور خاطئة في logs:
- يعني المشكلة في قاعدة البيانات
- شغّل `test-auth-flow.js` مرة أخرى
- ثم `node scripts/fix-auth.js`

## ⚡ حل سريع بديل

إذا استمرت المشكلة، جرب:

```powershell
# 1. احذف قاعدة البيانات
Remove-Item prisma/dev.db -ErrorAction SilentlyContinue

# 2. أعد إنشاءها
npx prisma db push

# 3. أعد البذر (seed)
npx prisma db seed

# 4. أعد تعيين كلمة المرور
node scripts/fix-auth.js

# 5. نظف وشغل
Remove-Item -Recurse -Force .next
npm run dev
```
