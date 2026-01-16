export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    IT_MANAGER = 'IT_MANAGER',
    IT_SUPPORT = 'IT_SUPPORT',
    VIEWER = 'VIEWER',
    USER = 'USER' // Fallback for existing users
}

export const PERMISSIONS = {
    [UserRole.SUPER_ADMIN]: ['*'],
    [UserRole.IT_MANAGER]: [
        'view_dashboard',
        'manage_requests',
        'manage_inventory',
        'manage_employees',
        'view_reports',
        'manage_users',
        'manage_settings'
    ],
    [UserRole.IT_SUPPORT]: [
        'view_dashboard',
        'view_requests',
        'update_request_status',
        'view_inventory',
        'update_inventory',
        'view_employees',
        'view_users'
    ],
    [UserRole.VIEWER]: [
        'view_dashboard',
        'view_reports',
        'view_inventory',
        'view_users',
        'view_settings',
        'view_employees',
        'view_requests'
    ],
    [UserRole.USER]: []
}

export function hasPermission(userRole: string | undefined | null, permission: string): boolean {
    if (!userRole) return false;
    if (userRole === UserRole.SUPER_ADMIN || userRole === 'ADMIN') return true;

    const role = userRole as UserRole;
    const userPermissions: string[] = PERMISSIONS[role] || [];

    return userPermissions.includes(permission);
}


export const ROLE_LABELS = {
    [UserRole.SUPER_ADMIN]: 'مدير النظام (Super Admin)',
    [UserRole.IT_MANAGER]: 'مدير تقنية المعلومات',
    [UserRole.IT_SUPPORT]: 'دعم فني',
    [UserRole.VIEWER]: 'مشاهد فقط',
    [UserRole.USER]: 'مستخدم'
}
