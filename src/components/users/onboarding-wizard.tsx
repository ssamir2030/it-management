"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { User, Shield, Laptop, CheckCircle2, Save, Printer, ArrowRight, ArrowLeft } from "lucide-react"
import { createEmployeeAndAssign, getAvailableAssetsAndLicenses } from "@/app/actions/onboarding"
import { HandoverForm } from "./handover-form"

interface OnboardingWizardProps { }

export function OnboardingWizard({ }: OnboardingWizardProps) {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [successData, setSuccessData] = useState<any>(null)

    // Data State
    const [availableAssets, setAvailableAssets] = useState<any[]>([])
    const [availableLicenses, setAvailableLicenses] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    // Form State
    const [formData, setFormData] = useState({
        user: {
            name: '',
            email: '',
            password: '', // Should be generated or input
            employeeId: '',
            department: '',
            jobTitle: '',
            role: 'USER'
        },
        assets: [] as string[],
        licenses: [] as string[]
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setIsLoading(true)
        const result = await getAvailableAssetsAndLicenses()
        if (result.success) {
            setAvailableAssets(result.assets || [])
            setAvailableLicenses(result.licenses || [])
        } else {
            toast.error(result.error)
        }
        setIsLoading(false)
    }

    const handleUserChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, user: { ...prev.user, [field]: value } }))
    }

    const toggleAsset = (id: string) => {
        setFormData(prev => {
            const current = prev.assets
            const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id]
            return { ...prev, assets: next }
        })
    }

    const toggleLicense = (id: string) => {
        setFormData(prev => {
            const current = prev.licenses
            const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id]
            return { ...prev, licenses: next }
        })
    }

    const handleSubmit = async () => {
        setIsSaving(true)
        try {
            const res = await createEmployeeAndAssign(formData)
            if (res.success) {
                setSuccessData(res.data)
                setStep(5) // Success Step
                toast.success("تم إنشاء الموظف وتجهيز العهدة بنجاح")
            } else {
                toast.error(res.error)
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setIsSaving(false)
        }
    }

    // --- STEP COMPONENTS ---

    const renderStep1_UserInfo = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>اسم الموظف</Label>
                    <Input
                        value={formData.user.name}
                        onChange={e => handleUserChange('name', e.target.value)}
                        placeholder="محمد أحمد"
                        autoFocus
                    />
                </div>
                <div className="space-y-2">
                    <Label>البريد الإلكتروني</Label>
                    <Input
                        type="email"
                        value={formData.user.email}
                        onChange={e => handleUserChange('email', e.target.value)}
                        placeholder="mohammed@company.com"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>كلمة المرور (مؤقتة)</Label>
                    <Input
                        value={formData.user.password}
                        onChange={e => handleUserChange('password', e.target.value)}
                        placeholder="********"
                    />
                </div>
                <div className="space-y-2">
                    <Label>الرقم الوظيفي</Label>
                    <Input
                        value={formData.user.employeeId}
                        onChange={e => handleUserChange('employeeId', e.target.value)}
                        placeholder="EMP-001"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>القسم</Label>
                    <Select onValueChange={val => handleUserChange('department', val)} value={formData.user.department}>
                        <SelectTrigger><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="IT">تقنية المعلومات</SelectItem>
                            <SelectItem value="HR">الموارد البشرية</SelectItem>
                            <SelectItem value="FINANCE">المالية</SelectItem>
                            <SelectItem value="SALES">المبيعات</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>المسمى الوظيفي</Label>
                    <Input
                        value={formData.user.jobTitle}
                        onChange={e => handleUserChange('jobTitle', e.target.value)}
                        placeholder="مدير مبيعات"
                    />
                </div>
            </div>
        </div>
    )

    const renderStep2_Assets = () => {
        const filtered = availableAssets.filter(a =>
            a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.model?.toLowerCase().includes(searchQuery.toLowerCase())
        )

        return (
            <div className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="بحث عن جهاز (لابتوب، جوال...)"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="border rounded-md h-[300px] overflow-y-auto p-2 space-y-2 bg-muted/20">
                    {filtered.map(asset => (
                        <div key={asset.id} className="flex items-center space-x-2 space-x-reverse p-2 hover:bg-muted/50 rounded-lg transition-colors border bg-card">
                            <Checkbox
                                id={asset.id}
                                checked={formData.assets.includes(asset.id)}
                                onCheckedChange={() => toggleAsset(asset.id)}
                            />
                            <Label htmlFor={asset.id} className="flex-1 cursor-pointer grid grid-cols-3 gap-2">
                                <span className="font-bold">{asset.type}</span>
                                <span>{asset.name}</span>
                                <span className="font-mono text-muted-foreground">{asset.tag}</span>
                            </Label>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <p className="text-center py-10 text-muted-foreground">لا توجد أجهزة متطابقة</p>
                    )}
                </div>
                <div className="text-sm text-muted-foreground">
                    تم اختيار: {formData.assets.length} جهاز
                </div>
            </div>
        )
    }

    const renderStep3_Licenses = () => {
        return (
            <div className="space-y-4">
                <div className="border rounded-md h-[300px] overflow-y-auto p-2 space-y-2 bg-muted/20">
                    {availableLicenses.map(license => (
                        <div key={license.id} className="flex items-center space-x-2 space-x-reverse p-2 hover:bg-muted/50 rounded-lg transition-colors border bg-card">
                            <Checkbox
                                id={license.id}
                                checked={formData.licenses.includes(license.id)}
                                onCheckedChange={() => toggleLicense(license.id)}
                            />
                            <Label htmlFor={license.id} className="flex-1 cursor-pointer grid grid-cols-2 gap-2">
                                <span className="font-bold">{license.softwareName}</span>
                                <span className="text-muted-foreground flex justify-end">
                                    متبقي: {license.totalCount - license.usedCount}
                                </span>
                            </Label>
                        </div>
                    ))}
                </div>
                <div className="text-sm text-muted-foreground">
                    تم اختيار: {formData.licenses.length} رخصة
                </div>
            </div>
        )
    }

    const renderStep4_Review = () => {
        const selectedAssets = availableAssets.filter(a => formData.assets.includes(a.id))
        const selectedLicenses = availableLicenses.filter(l => formData.licenses.includes(l.id))

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div className="font-bold text-muted-foreground">الاسم:</div>
                    <div>{formData.user.name}</div>
                    <div className="font-bold text-muted-foreground">البريد:</div>
                    <div>{formData.user.email}</div>
                    <div className="font-bold text-muted-foreground">الوظيفة:</div>
                    <div>{formData.user.jobTitle} - {formData.user.department}</div>
                </div>

                <Separator />

                <div>
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Laptop className="h-4 w-4" />
                        الأجهزة ({selectedAssets.length})
                    </h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {selectedAssets.map(a => (
                            <li key={a.id}>{a.type} - {a.model} <span className="text-muted-foreground text-xs">({a.tag})</span></li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        البرامج ({selectedLicenses.length})
                    </h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {selectedLicenses.map(l => (
                            <li key={l.id}>{l.softwareName}</li>
                        ))}
                    </ul>
                </div>
            </div>
        )
    }

    const renderStep5_Success = () => (
        <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">تمت العملية بنجاح!</h2>
                <p className="text-muted-foreground">
                    تم إنشاء حساب الموظف <strong>{successData?.name}</strong> وتعيين العهدة له.
                </p>
            </div>

            <div className="flex gap-4 justify-center">
                <Button onClick={() => window.print()} size="lg" className="gap-2">
                    <Printer className="h-4 w-4" />
                    طباعة نموذج الاستلام
                </Button>
                <Button variant="outline" onClick={() => router.push('/admin/users')} size="lg">
                    العودة للمستخدمين
                </Button>
            </div>

            {/* Hidden Print Area */}
            <HandoverForm data={successData} />
        </div>
    )

    // --- MAIN RENDER ---

    return (
        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card className="border-t-4 border-t-primary shadow-lg">
                    <CardHeader className="text-center border-b bg-muted/20 pb-8">
                        <CardTitle className="text-2xl">معالج الموظف الجديد</CardTitle>
                        <CardDescription>إنشاء حساب، تعيين أجهزة، وطباعة نموذج الاستلام في خطوة واحدة</CardDescription>

                        {/* Steps Indicator */}
                        <div className="flex justify-center items-center mt-6 gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                                ${step === i ? 'border-primary bg-primary text-white' :
                                            step > i ? 'border-primary bg-primary/20 text-primary' : 'border-muted text-muted-foreground'}
                            `}>
                                        {i}
                                    </div>
                                    {i < 4 && <div className={`w-12 h-1 ${step > i ? 'bg-primary' : 'bg-muted'} mx-1 transition-colors`} />}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between px-16 text-xs text-muted-foreground mt-2">
                            <span>البيانات</span>
                            <span>الأجهزة</span>
                            <span>البرامج</span>
                            <span>المراجعة</span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 min-h-[400px]">
                        {isLoading ? (
                            <div className="text-center py-20">جاري التحميل...</div>
                        ) : (
                            <>
                                {step === 1 && renderStep1_UserInfo()}
                                {step === 2 && renderStep2_Assets()}
                                {step === 3 && renderStep3_Licenses()}
                                {step === 4 && renderStep4_Review()}
                                {step === 5 && renderStep5_Success()}
                            </>
                        )}
                    </CardContent>

                    {step < 5 && (
                        <CardFooter className="flex justify-between border-t bg-muted/20 p-6">
                            <Button
                                variant="ghost"
                                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                                disabled={step === 1 || isSaving}
                            >
                                <ArrowRight className="h-4 w-4 ml-2" />
                                السابق
                            </Button>

                            {step < 4 ? (
                                <Button onClick={() => setStep(prev => prev + 1)}>
                                    التالي
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={isSaving}>
                                    {isSaving ? "جاري الحفظ..." : "تأكيد وإنشاء"}
                                    {!isSaving && <Save className="h-4 w-4 mr-2" />}
                                </Button>
                            )}
                        </CardFooter>
                    )}
                </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
                <Card className="bg-muted/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-lg text-foreground">خطوات المعالج</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-foreground">1. البيانات الأساسية</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                إدخال اسم الموظف، البريد الإلكتروني، كلمة المرور المؤقتة، والقسم.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-foreground">2. تعيين الأجهزة</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                اختيار الأجهزة المتاحة لتسليمها للموظف الجديد.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-foreground">3. تعيين البرامج</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                اختيار التراخيص والبرامج المطلوبة للموظف.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-foreground">4. المراجعة والتأكيد</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                مراجعة جميع البيانات قبل الحفظ وطباعة نموذج الاستلام.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
