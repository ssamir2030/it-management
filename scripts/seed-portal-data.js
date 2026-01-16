const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Starting portal data seeding...')

    // 1. Get the first employee to assign data to
    const employee = await prisma.employee.findFirst()

    if (!employee) {
        console.error('No employees found! Please create an employee first.')
        return
    }

    console.log(`Seeding data for employee: ${employee.name} (${employee.id})`)

    // 2. Create Meeting Rooms (if not exist)
    const rooms = [
        { name: 'قاعة الاجتماعات الرئيسية', capacity: 20, location: 'الدور الأول', hasProjector: true, hasVideoConf: true },
        { name: 'قاعة الابتكار', capacity: 8, location: 'الدور الثاني', hasProjector: true, hasVideoConf: false },
        { name: 'قاعة التدريب', capacity: 15, location: 'الدور الأرضي', hasProjector: true, hasVideoConf: true },
    ]

    for (const roomData of rooms) {
        const existing = await prisma.meetingRoom.findFirst({ where: { name: roomData.name } })
        if (!existing) {
            await prisma.meetingRoom.create({ data: roomData })
            console.log(`Created room: ${roomData.name}`)
        }
    }

    const allRooms = await prisma.meetingRoom.findMany()

    // 3. Create Bookings
    const today = new Date()
    const bookings = [
        {
            title: 'اجتماع الفريق الأسبوعي',
            startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
            endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
            meetingType: 'PHYSICAL',
            roomId: allRooms[0].id
        },
        {
            title: 'مقابلة مرشحين',
            startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
            endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 0),
            meetingType: 'ONLINE',
            roomId: allRooms[1].id
        },
        {
            title: 'ورشة عمل تقنية',
            startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 9, 0),
            endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 12, 0),
            meetingType: 'HYBRID',
            roomId: allRooms[2].id
        }
    ]

    for (const booking of bookings) {
        await prisma.roomBooking.create({
            data: {
                ...booking,
                employeeId: employee.id,
                status: 'CONFIRMED',
                attendeesCount: 5
            }
        })
    }
    console.log('Created sample bookings')

    // 4. Create Requests with Timeline
    const requests = [
        {
            type: 'HARDWARE',
            subject: 'طلب ماوس لاسلكي',
            details: 'الماوس الحالي لا يعمل بشكل جيد، أحتاج ماوس لاسلكي مريح.',
            priority: 'NORMAL',
            status: 'COMPLETED',
            timeline: [
                { status: 'PENDING', title: 'تم إنشاء الطلب', description: 'تم استلام الطلب', actorName: 'النظام', createdAt: new Date(today.getTime() - 86400000 * 5) },
                { status: 'IN_PROGRESS', title: 'جاري المعالجة', description: 'تم تعميد الطلب للمستودع', actorName: 'مدير النظام', createdAt: new Date(today.getTime() - 86400000 * 4) },
                { status: 'COMPLETED', title: 'تم التسليم', description: 'تم تسليم الماوس للموظف', actorName: 'مسؤول العهد', createdAt: new Date(today.getTime() - 86400000 * 3) }
            ]
        },
        {
            type: 'SUPPORT',
            subject: 'مشكلة في الدخول للبريد',
            details: 'لا أستطيع الدخول لبريدي الإلكتروني من الجوال.',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            timeline: [
                { status: 'PENDING', title: 'تم إنشاء الطلب', description: 'تم استلام البلاغ', actorName: 'النظام', createdAt: new Date(today.getTime() - 3600000 * 4) },
                { status: 'IN_PROGRESS', title: 'جاري الفحص', description: 'جاري التحقق من إعدادات الحساب', actorName: 'الدعم الفني', createdAt: new Date(today.getTime() - 3600000 * 2) }
            ]
        },
        {
            type: 'INK',
            subject: 'حبر طابعة HP 2055',
            details: 'الحبر الأسود على وشك الانتهاء.',
            priority: 'NORMAL',
            status: 'PENDING',
            timeline: [
                { status: 'PENDING', title: 'تم إنشاء الطلب', description: 'بانتظار الموافقة', actorName: 'النظام', createdAt: new Date() }
            ]
        }
    ]

    for (const req of requests) {
        const { timeline, ...reqData } = req
        const createdReq = await prisma.employeeRequest.create({
            data: {
                ...reqData,
                employeeId: employee.id,
                timeline: {
                    create: timeline
                }
            }
        })
    }
    console.log('Created sample requests')

    // 5. Create Notifications
    const notifications = [
        {
            title: 'تم تأكيد حجز القاعة',
            message: 'تم تأكيد حجزك لقاعة الاجتماعات الرئيسية غداً الساعة 10:00 صباحاً.',
            type: 'BOOKING',
            isRead: false,
            priority: 'NORMAL'
        },
        {
            title: 'تحديث على طلبك #HARD-001',
            message: 'تم تغيير حالة طلبك "ماوس لاسلكي" إلى مكتمل.',
            type: 'REQUEST',
            isRead: true,
            priority: 'LOW'
        },
        {
            title: 'تذكير: صيانة دورية',
            message: 'سيتم إجراء صيانة دورية للأنظمة يوم الجمعة القادم.',
            type: 'SYSTEM',
            isRead: false,
            priority: 'HIGH'
        }
    ]

    for (const notif of notifications) {
        await prisma.employeeNotification.create({
            data: {
                ...notif,
                employeeId: employee.id
            }
        })
    }
    console.log('Created sample notifications')

    console.log('Seeding completed successfully! 🚀')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
