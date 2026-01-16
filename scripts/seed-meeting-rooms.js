const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedMeetingRooms() {
    console.log('🏢 جاري إضافة قاعات الاجتماعات...')

    const rooms = [
        {
            name: 'قاعة الاجتماعات الكبرى',
            nameEn: 'Grand Conference Room',
            description: 'قاعة اجتماعات رئيسية مجهزة بأحدث التقنيات',
            location: 'الطابق الأول - القسم الإداري',
            capacity: 30,
            floor: 'الطابق الأول',
            hasProjector: true,
            hasWhiteboard: true,
            hasVideoConf: true,
            hasScreen: true,
            hasSoundSystem: true,
            hasWifi: true,
            hasAirConditioning: true,
            isActive: true,
            isAvailable: true,
            notes: 'يجب الحجز قبل 24 ساعة على الأقل'
        },
        {
            name: 'قاعة الاجتماعات التنفيذية',
            nameEn: 'Executive Meeting Room',
            description: 'قاعة صغيرة للاجتماعات التنفيذية',
            location: 'الطابق الثاني - جناح الإدارة',
            capacity: 8,
            floor: 'الطابق الثاني',
            hasProjector: true,
            hasWhiteboard: true,
            hasVideoConf: true,
            hasScreen: true,
            hasSoundSystem: false,
            hasWifi: true,
            hasAirConditioning: true,
            isActive: true,
            isAvailable: true
        },
        {
            name: 'قاعة التدريب',
            nameEn: 'Training Room',
            description: 'قاعة مخصصة للتدريب وورش العمل',
            location: 'الطابق الأرضي - قسم الموارد البشرية',
            capacity: 40,
            floor: 'الطابق الأرضي',
            hasProjector: true,
            hasWhiteboard: true,
            hasVideoConf: false,
            hasScreen: true,
            hasSoundSystem: true,
            hasWifi: true,
            hasAirConditioning: true,
            isActive: true,
            isAvailable: true,
            notes: 'متاحة للحجز من الأحد إلى الخميس فقط'
        },
        {
            name: 'قاعة الاجتماعات السريعة',
            nameEn: 'Quick Meeting Room',
            description: 'قاعة صغيرة للاجتماعات السريعة',
            location: 'الطابق الأول - قسم المبيعات',
            capacity: 4,
            floor: 'الطابق الأول',
            hasProjector: false,
            hasWhiteboard: true,
            hasVideoConf: false,
            hasScreen: false,
            hasSoundSystem: false,
            hasWifi: true,
            hasAirConditioning: true,
            isActive: true,
            isAvailable: true
        },
        {
            name: 'قاعة الابتكار',
            nameEn: 'Innovation Lab',
            description: 'قاعة مجهزة للعصف الذهني والابتكار',
            location: 'الطابق الثالث - قسم التطوير',
            capacity: 15,
            floor: 'الطابق الثالث',
            hasProjector: true,
            hasWhiteboard: true,
            hasVideoConf: true,
            hasScreen: true,
            hasSoundSystem: true,
            hasWifi: true,
            hasAirConditioning: true,
            isActive: true,
            isAvailable: true,
            notes: 'تحتوي على أدوات تفاعلية للعصف الذهني'
        },
        {
            name: 'قاعة المؤتمرات الافتراضية',
            nameEn: 'Virtual Conference Room',
            description: 'قاعة مخصصة للمؤتمرات الافتراضية',
            location: 'الطابق الثاني - قسم تقنية المعلومات',
            capacity: 10,
            floor: 'الطابق الثاني',
            hasProjector: true,
            hasWhiteboard: false,
            hasVideoConf: true,
            hasScreen: true,
            hasSoundSystem: true,
            hasWifi: true,
            hasAirConditioning: true,
            isActive: true,
            isAvailable: true,
            notes: 'مجهزة بكاميرات عالية الدقة ونظام صوتيات احترافي'
        }
    ]

    for (const room of rooms) {
        await prisma.meetingRoom.create({
            data: room
        })
        console.log(`✅ تمت إضافة: ${room.name}`)
    }

    console.log(`\n🎉 تم إضافة ${rooms.length} قاعة اجتماعات بنجاح!`)
}

seedMeetingRooms()
    .catch((e) => {
        console.error('❌ خطأ في إضافة القاعات:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
