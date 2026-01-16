export interface AIAnalysisResult {
    suggestion: string
    confidence: number
    actions: string[]
}

const KNOWLEDGE_BASE = [
    {
        keywords: ['طابعة', 'printer', 'printing', 'ورق', 'حبر'],
        suggestion: "قد تكون المشكلة متعلقة بالاتصال بالشبكة أو نفاذ الحبر. يرجى التحقق من حالة الطابعة المادية.",
        actions: ["إعادة تشغيل الطابعة", "التحقق من خرطوشة الحبر", "التحقق من عنوان IP للطابعة"]
    },
    {
        keywords: ['إنترنت', 'internet', 'network', 'wifi', 'اتصال', 'بطيء'],
        suggestion: "مشاكل الشبكة غالباً ما تكون بسبب إعدادات DNS أو الأسلاك. تحقق من الكابل الموصل للجهاز.",
        actions: ["اختبار سرعة الاتصال", "التحقق من الكابل", "إعادة تشغيل الراوتر"]
    },
    {
        keywords: ['شاشة', 'screen', 'monitor', 'display'],
        suggestion: "تأكد من توصيل كابل HDMI/DisplayPort بشكل صحيح وتحديث تعريفات كرت الشاشة.",
        actions: ["فحص كابل الشاشة", "تجربة شاشة أخرى"]
    },
    {
        keywords: ['كلمة المرور', 'password', 'login', 'دخول'],
        suggestion: "يمكن حل مشاكل الدخول غالباً بإعادة تعيين كلمة المرور من لوحة التحكم.",
        actions: ["إرسال رابط إعادة تعيين", "التحقق من حالة الحساب"]
    }
]

export const AIService = {
    analyzeTicket: async (description: string): Promise<AIAnalysisResult> => {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        const lowerDesc = description.toLowerCase();

        for (const item of KNOWLEDGE_BASE) {
            if (item.keywords.some(k => lowerDesc.includes(k))) {
                return {
                    suggestion: item.suggestion,
                    confidence: 0.85 + (Math.random() * 0.1),
                    actions: item.actions
                }
            }
        }

        return {
            suggestion: "لم أتمكن من تحديد المشكلة بدقة. يرجى مراجعة السجلات أو التواصل مع المستخدم لمزيد من التفاصيل.",
            confidence: 0.4,
            actions: ["مراجعة السجلات", "الاتصال بالمستخدم"]
        }
    }
}
