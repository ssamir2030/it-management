import { format } from "date-fns"
import { arSA } from "date-fns/locale"

interface HandoverFormProps {
    data: any
}

export function HandoverForm({ data }: HandoverFormProps) {
    if (!data) return null

    return (
        <div className="hidden print:block p-8 bg-white text-black font-serif" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-1">نموذج استلام عهدة</h1>
                    <p className="text-sm">Asset Handover Form</p>
                </div>
                <div className="text-left">
                    <h2 className="text-xl font-bold">شركة أصول التقنية</h2>
                    <p className="text-sm">قسم تقنية المعلومات</p>
                </div>
            </div>

            {/* Employee Info */}
            <div className="mb-8 grid grid-cols-2 gap-4 border p-4">
                <div>
                    <p className="font-bold">اسم الموظف:</p>
                    <p>{data.name}</p>
                </div>
                <div>
                    <p className="font-bold">الرقم الوظيفي:</p>
                    <p>{data.employeeId || '-'}</p>
                </div>
                <div>
                    <p className="font-bold">القسم:</p>
                    <p>{data.department || '-'}</p>
                </div>
                <div>
                    <p className="font-bold">المسمى الوظيفي:</p>
                    <p>{data.jobTitle || '-'}</p>
                </div>
                <div>
                    <p className="font-bold">تاريخ الاستلام:</p>
                    <p>{format(new Date(), 'yyyy/MM/dd', { locale: arSA })}</p>
                </div>
            </div>

            {/* Assets Table */}
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-2 border-b border-black inline-block">الأجهزة والمعدات (Hardware)</h3>
                <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2">م</th>
                            <th className="border border-black p-2">نوع الجهاز</th>
                            <th className="border border-black p-2">الموديل</th>
                            <th className="border border-black p-2">Asset Tag</th>
                            <th className="border border-black p-2">Serial Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.assets?.length > 0 ? (
                            data.assets.map((asset: any, index: number) => (
                                <tr key={asset.id}>
                                    <td className="border border-black p-2 text-center">{index + 1}</td>
                                    <td className="border border-black p-2">{asset.type}</td>
                                    <td className="border border-black p-2">{asset.model}</td>
                                    <td className="border border-black p-2 font-mono">{asset.tag}</td>
                                    <td className="border border-black p-2 font-mono">{asset.serialNumber}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="border border-black p-4 text-center">لا توجد أجهزة مستلمة</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Licenses Table */}
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-2 border-b border-black inline-block">البرامج والتراخيص (Software)</h3>
                <table className="w-full border-collapse border border-black text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2">م</th>
                            <th className="border border-black p-2">اسم البرنامج</th>
                            <th className="border border-black p-2">مفتاح الترخيص (Key)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.licenseAssignments?.length > 0 ? (
                            data.licenseAssignments.map((assignment: any, index: number) => (
                                <tr key={assignment.id}>
                                    <td className="border border-black p-2 text-center">{index + 1}</td>
                                    <td className="border border-black p-2">{assignment.license?.softwareName}</td>
                                    <td className="border border-black p-2 font-mono">{assignment.license?.key}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="border border-black p-4 text-center">لا توجد تراخيص مستلمة</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Declaration */}
            <div className="mb-12 text-sm leading-relaxed text-justify">
                <p>
                    أقر أنا الموقع أدناه باستلامي للأجهزة والبرامج الموضحة أعلاه بحالة جيدة وصالحة للعمل.
                    وأتعهد بالمحافظة عليها واستخدامها لأغراض العمل فقط، وإعادتها عند طلب الشركة أو عند انتهاء خدماتي.
                    كما أتحمل المسؤولية الكاملة في حال فقدانها أو تلفها نتيجة الإهمال أو سوء الاستخدام.
                </p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-start mt-20 px-8">
                <div className="text-center">
                    <p className="font-bold mb-12">توقيع المستلم (Employee)</p>
                    <div className="border-t border-black w-48 mx-auto"></div>
                </div>
                <div className="text-center">
                    <p className="font-bold mb-12">اعتماد مسؤول الـ IT</p>
                    <div className="border-t border-black w-48 mx-auto"></div>
                </div>
            </div>
        </div>
    )
}
