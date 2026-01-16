export type TroubleshootNode = {
    id: string
    question: string
    options: TroubleshootOption[]
}

export type TroubleshootOption = {
    label: string
    nextNodeId?: string
    solution?: string // If present, this is a leaf node (Solution)
    action?: string // e.g., 'OPEN_TICKET'
}

export const TROUBLESHOOT_DATA: Record<string, TroubleshootNode> = {
    'root': {
        id: 'root',
        question: 'ما هي المشكلة التي تواجهها اليوم؟',
        options: [
            { label: 'مشكلة في الإنترنت / الشبكة', nextNodeId: 'internet_1' },
            { label: 'مشكلة في الطابعة', nextNodeId: 'printer_1' },
            { label: 'بطء في الجهاز', nextNodeId: 'slow_pc_1' },
            { label: 'نسيت كلمة المرور', nextNodeId: 'password_1' },
            { label: 'مشكلة أخرى', action: 'OPEN_TICKET' }
        ]
    },

    // --- INTERNET ---
    'internet_1': {
        id: 'internet_1',
        question: 'هل المشكلة في جميع المواقع أم (نظام داخلي) محدد؟',
        options: [
            { label: 'جميع المواقع لا تعمل', nextNodeId: 'internet_2' },
            { label: 'موقع محدد فقط', nextNodeId: 'internet_website' },
        ]
    },
    'internet_2': {
        id: 'internet_2',
        question: 'هل رمز "الواي فاي" أو "الشبكة" أسفل الشاشة عليه علامة خطأ (X) أو تعجب (!)',
        options: [
            { label: 'نعم، عليه علامة', solution: 'تأكد من توصيل كيبل الشبكة جيداً، أو حاول إيقاف الواي فاي وتشغيله مرة أخرى.' },
            { label: 'لا، متصل لكن لا يوجد نت', solution: 'جرب إعادة تشغيل المتصفح. إذا استمرت المشكلة، قد يكون هناك عطل عام، انتظر قليلاً أو افتح تذكرة.' },
        ]
    },
    'internet_website': {
        id: 'internet_website',
        question: 'هل يظهر لك رمز خطأ محدد (مثل 404 أو 500)؟',
        options: [
            { label: 'نعم', solution: 'التقط صورة للشاشة (Screenshot) وافتح تذكرة دعم فني مع إرفاق الصورة.' },
            { label: 'لا، فقط لا يحمل', solution: 'جرب فتح الموقع من متصفح آخر (مثل Chrome بدلاً من Edge) أو امسح الـ Cache.' },
        ]
    },

    // --- PRINTER ---
    'printer_1': {
        id: 'printer_1',
        question: 'ما نوع المشكلة في الطابعة؟',
        options: [
            { label: 'لا تطبع نهائياً', nextNodeId: 'printer_power' },
            { label: 'تحشر الورق', solution: 'افتح درج الورق وتأكد من عدم وجود ورق ممزق عالق. أخرج الورق وأعد ترتيبه ثم جرب الطباعة.' },
            { label: 'طباعة باهتة / حبر ضعيف', action: 'OPEN_TICKET_INK' },
        ]
    },
    'printer_power': {
        id: 'printer_power',
        question: 'هل شاشة الطابعة مضيئة؟',
        options: [
            { label: 'لا، مطفأة', solution: 'تأكد من توصيل كيبل الكهرباء، واضغط زر التشغيل.' },
            { label: 'نعم، مضيئة', nextNodeId: 'printer_error' },
        ]
    },
    'printer_error': {
        id: 'printer_error',
        question: 'هل توجد رسالة خطأ على شاشة الطابعة؟',
        options: [
            { label: 'نعم', solution: 'اقرأ الرسالة، غالباً تكون "Paper Jam" (حشر ورق) أو "Load Paper" (أضف ورق).' },
            { label: 'لا، الشاشة طبيعية', solution: 'تأكد أن الطابعة المختارة في الكمبيوتر هي الطابعة الصحيحة وليست "PDF" أو طابعة أخرى.' },
        ]
    },

    // --- SLOW PC ---
    'slow_pc_1': {
        id: 'slow_pc_1',
        question: 'متى بدأ البطء؟',
        options: [
            { label: 'فجأة الآن', nextNodeId: 'slow_pc_restart' },
            { label: 'منذ فترة طويلة', solution: 'جهازك قد يحتاج لتنظيف أو ترقية. يفضل فتح تذكرة صيانة لفحصه.' },
        ]
    },
    'slow_pc_restart': {
        id: 'slow_pc_restart',
        question: 'هل قمت بإعادة تشغيل الجهاز (Restart) اليوم؟',
        options: [
            { label: 'لا', solution: 'العديد من المشاكل تحل بإعادة التشغيل. جرب عمل Restart وأخبرنا بالنتيجة.' },
            { label: 'نعم ولم يتحسن', action: 'OPEN_TICKET' },
        ]
    },

    // --- PASSWORD ---
    'password_1': {
        id: 'password_1',
        question: 'أي كلمة مرور نسيت؟',
        options: [
            { label: 'دخول الويندوز', solution: 'تواصل مع الدعم الفني مباشرة لعمل Reset، لا يمكن عمل ذلك ذاتياً.' },
            { label: 'البريد الإلكتروني', nextNodeId: 'password_email' },
            { label: 'نظام ERP', action: 'OPEN_TICKET_ERP' }
        ]
    },
    'password_email': {
        id: 'password_email',
        question: 'هل قمت بربط بريدك برقم الجوال؟',
        options: [
            { label: 'نعم', solution: 'يمكنك الضغط على "نسيت كلمة المرور" في صفحة دخول البريد وسيصلك كود على الجوال.' },
            { label: 'لا / لا أعرف', action: 'OPEN_TICKET' },
        ]
    }
}
