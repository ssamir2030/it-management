export const emailStyles = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; background-color: #f3f4f6; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(to right, #4f46e5, #7c3aed); color: white; padding: 20px; text-align: center; }
  .content { padding: 30px; color: #374151; line-height: 1.6; }
  .footer { background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
  .button { display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
  .status-badge { display: inline-block; padding: 5px 10px; border-radius: 4px; font-size: 14px; font-weight: bold; }
  .status-completed { background-color: #d1fae5; color: #065f46; }
  .status-rejected { background-color: #fee2e2; color: #991b1b; }
  .status-progress { background-color: #dbeafe; color: #1e40af; }
`

export function getBaseTemplate(title: string, content: string) {
    return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0; font-size: 24px;">${title}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>هذه رسالة تلقائية من نظام إدارة أصول تقنية المعلومات. الرجاء عدم الرد على هذه الرسالة.</p>
          <p>&copy; ${new Date().getFullYear()} IT Asset Management System</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getStatusUpdateTemplate(employeeName: string, requestType: string, status: string, requestId: string) {
    let statusText = ''
    let statusClass = ''
    let message = ''

    switch (status) {
        case 'COMPLETED':
            statusText = 'مكتمل'
            statusClass = 'status-completed'
            message = 'يسعدنا إخبارك بأنه تم إنجاز طلبك بنجاح.'
            break
        case 'REJECTED':
            statusText = 'مرفوض'
            statusClass = 'status-rejected'
            message = 'نأسف لإخبارك بأنه تم رفض طلبك. يمكنك مراجعة سبب الرفض في البوابة.'
            break
        case 'IN_PROGRESS':
            statusText = 'قيد التنفيذ'
            statusClass = 'status-progress'
            message = 'جاري العمل حالياً على طلبك من قبل الفريق المختص.'
            break
        default:
            statusText = status
            statusClass = 'status-progress'
            message = 'تم تحديث حالة طلبك.'
    }

    const content = `
    <h2 style="color: #111827; margin-top: 0;">مرحباً ${employeeName}،</h2>
    <p>${message}</p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>نوع الطلب:</strong> ${requestType}</p>
      <p style="margin: 5px 0;"><strong>رقم الطلب:</strong> #${requestId.slice(-6)}</p>
      <p style="margin: 5px 0;"><strong>الحالة الجديدة:</strong> <span class="status-badge ${statusClass}">${statusText}</span></p>
    </div>
    <p>يمكنك متابعة تفاصيل الطلب من خلال البوابة.</p>
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/requests/${requestId}" class="button">عرض تفاصيل الطلب</a>
    </div>
  `

    return getBaseTemplate(`تحديث حالة الطلب`, content)
}

export function getNewRequestTemplate(adminName: string, employeeName: string, requestType: string, requestId: string) {
    const content = `
    <h2 style="color: #111827; margin-top: 0;">مرحباً ${adminName}،</h2>
    <p>تم استلام طلب جديد من الموظف <strong>${employeeName}</strong>.</p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>نوع الطلب:</strong> ${requestType}</p>
      <p style="margin: 5px 0;"><strong>رقم الطلب:</strong> #${requestId.slice(-6)}</p>
    </div>
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/requests" class="button">مراجعة الطلب</a>
    </div>
  `
    return getBaseTemplate('طلب جديد', content)
}
