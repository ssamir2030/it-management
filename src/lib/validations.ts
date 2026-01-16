import { z } from 'zod'

/**
 * Validation Schemas using Zod
 * جميع schemas للنماذج في مكان واحد
 */

// ==============================================================================
// Asset Validation Schema
// ==============================================================================

export const assetSchema = z.object({
  name: z.string()
    .min(1, 'اسم الأصل مطلوب')
    .min(3, 'اسم الأصل يجب أن يكون 3 أحرف على الأقل')
    .max(100, 'اسم الأصل طويل جداً'),

  tag: z.string()
    .min(1, 'Tag مطلوب')
    .regex(/^[A-Z0-9-]+$/, 'Tag يجب أن يحتوي على أحرف إنجليزية كبيرة وأرقام فقط'),

  serialNumber: z.string()
    .optional()
    .nullable(),

  type: z.string()
    .min(1, 'نوع الأصل مطلوب'),

  model: z.string()
    .optional()
    .nullable(),

  manufacturer: z.string()
    .optional()
    .nullable(),

  purchaseDate: z.date()
    .optional()
    .nullable(),

  warrantyExpiry: z.date()
    .optional()
    .nullable(),

  status: z.enum(['AVAILABLE', 'ASSIGNED', 'BROKEN', 'REPAIR', 'RETIRED']),

  employeeId: z.string()
    .optional()
    .nullable(),

  locationId: z.string()
    .optional()
    .nullable(),
})

export type AssetFormData = z.infer<typeof assetSchema>

// ==============================================================================
// Employee Validation Schema
// ==============================================================================

export const employeeSchema = z.object({
  name: z.string()
    .min(1, 'اسم الموظف مطلوب')
    .min(3, 'اسم الموظف يجب أن يكون 3 أحرف على الأقل')
    .max(100, 'اسم الموظف طويل جداً'),

  identityNumber: z.string()
    .min(1, 'رقم الهوية مطلوب')
    .length(10, 'رقم الهوية يجب أن يكون 10 أرقام')
    .regex(/^[0-9]+$/, 'رقم الهوية يجب أن يحتوي على أرقام فقط'),

  email: z.string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صحيح'),

  phone: z.string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true
      return /^[0-9+\s()-]+$/.test(val)
    }, 'رقم الهاتف غير صحيح'),

  password: z.string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),

  jobTitle: z.string()
    .optional()
    .nullable(),

  departmentId: z.string()
    .optional()
    .nullable(),

  locationId: z.string()
    .optional()
    .nullable(),
})

export type EmployeeFormData = z.infer<typeof employeeSchema>

// ==============================================================================
// Department Validation Schema
// ==============================================================================

export const departmentSchema = z.object({
  name: z.string()
    .min(1, 'اسم الإدارة مطلوب')
    .min(2, 'اسم الإدارة يجب أن يكون حرفين على الأقل')
    .max(50, 'اسم الإدارة طويل جداً'),

  managerName: z.string()
    .optional()
    .nullable(),

  description: z.string()
    .optional()
    .nullable(),
})

export type DepartmentFormData = z.infer<typeof departmentSchema>

// ==============================================================================
// Location Validation Schema
// ==============================================================================

export const locationSchema = z.object({
  name: z.string()
    .min(1, 'اسم الموقع مطلوب')
    .min(2, 'اسم الموقع يجب أن يكون حرفين على الأقل')
    .max(100, 'اسم الموقع طويل جداً'),

  address: z.string()
    .optional()
    .nullable(),
})

export type LocationFormData = z.infer<typeof locationSchema>

// ==============================================================================
// Document Validation Schema
// ==============================================================================

export const documentSchema = z.object({
  name: z.string()
    .min(1, 'اسم المستند مطلوب')
    .min(3, 'اسم المستند يجب أن يكون 3 أحرف على الأقل'),

  type: z.enum(['CONTRACT', 'INVOICE', 'WARRANTY', 'LICENSE', 'MANUAL', 'CERTIFICATE', 'OTHER']),

  number: z.string()
    .optional()
    .nullable(),

  issueDate: z.date()
    .optional()
    .nullable(),

  expiryDate: z.date()
    .optional()
    .nullable(),

  status: z.enum(['ACTIVE', 'EXPIRED', 'ARCHIVED', 'CANCELLED', 'PENDING']),

  assetId: z.string()
    .optional()
    .nullable(),

  employeeId: z.string()
    .optional()
    .nullable(),

  notes: z.string()
    .optional()
    .nullable(),
})

export type DocumentFormData = z.infer<typeof documentSchema>

// ==============================================================================
// Consumable Validation Schema
// ==============================================================================

export const consumableSchema = z.object({
  name: z.string()
    .min(1, 'اسم المادة مطلوب')
    .min(3, 'اسم المادة يجب أن يكون 3 أحرف على الأقل'),

  category: z.enum(['INK', 'TONER', 'PAPER', 'ACCESSORIES', 'OTHER']),

  quantity: z.number()
    .int('الكمية يجب أن تكون رقم صحيح')
    .min(0, 'الكمية لا يمكن أن تكون سالبة'),

  minQuantity: z.number()
    .int('الحد الأدنى يجب أن يكون رقم صحيح')
    .min(0, 'الحد الأدنى لا يمكن أن يكون سالب')
    .default(5),

  unit: z.string()
    .optional()
    .nullable(),

  unitPrice: z.number()
    .min(0, 'السعر لا يمكن أن يكون سالب')
    .optional()
    .nullable(),
})

export type ConsumableFormData = z.infer<typeof consumableSchema>

// ==============================================================================
// User Validation Schema
// ==============================================================================

export const userSchema = z.object({
  name: z.string()
    .min(1, 'الاسم مطلوب')
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),

  email: z.string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صحيح'),

  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير')
    .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير')
    .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم'),

  role: z.enum(['ADMIN', 'USER', 'TECHNICIAN'])
    .default('USER'),
})

export type UserFormData = z.infer<typeof userSchema>

// ==============================================================================
// Support Ticket Validation Schema
// ==============================================================================

export const ticketSchema = z.object({
  title: z.string()
    .min(1, 'العنوان مطلوب')
    .min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل'),

  description: z.string()
    .min(1, 'الوصف مطلوب')
    .min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),

  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .default('MEDIUM'),

  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
    .default('OPEN'),

  contactPhone: z.string()
    .optional()
    .nullable(),

  remoteAccessId: z.string()
    .optional()
    .nullable(),

  remoteAccessPass: z.string()
    .optional()
    .nullable(),
})

export type TicketFormData = z.infer<typeof ticketSchema>

// ==============================================================================
// Helper Functions
// ==============================================================================

/**
 * تحويل Zod errors إلى رسائل عربية واضحة
 */
export function getZodErrorMessage(error: z.ZodError): string {
  return error.errors.map(err => err.message).join(', ')
}

/**
 * التحقق من صحة البيانات
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: getZodErrorMessage(error) }
    }
    return { success: false, error: 'حدث خطأ في التحقق من البيانات' }
  }
}
