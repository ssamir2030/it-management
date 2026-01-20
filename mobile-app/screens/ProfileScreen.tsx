import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/auth';
import { COLORS, APP_CONFIG } from '../lib/config';

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    danger?: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, danger }: MenuItemProps) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
                <Ionicons name={icon} size={22} color={danger ? COLORS.danger : COLORS.primary} />
            </View>
            <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-back" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
    );
}

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'تسجيل الخروج',
            'هل أنت متأكد من تسجيل الخروج؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                { text: 'تسجيل الخروج', style: 'destructive', onPress: logout },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={40} color={COLORS.primary} />
                </View>
                <Text style={styles.name}>{user?.name || 'مستخدم'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user?.role || 'USER'}</Text>
                </View>
            </View>

            {/* Menu Sections */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>الحساب</Text>
                <MenuItem
                    icon="person-outline"
                    title="الملف الشخصي"
                    subtitle="تعديل البيانات الشخصية"
                />
                <MenuItem
                    icon="notifications-outline"
                    title="الإشعارات"
                    subtitle="إعدادات التنبيهات"
                />
                <MenuItem
                    icon="lock-closed-outline"
                    title="الأمان"
                    subtitle="كلمة المرور والمصادقة"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>الإعدادات</Text>
                <MenuItem
                    icon="globe-outline"
                    title="اللغة"
                    subtitle="العربية"
                />
                <MenuItem
                    icon="moon-outline"
                    title="المظهر"
                    subtitle="فاتح"
                />
                <MenuItem
                    icon="server-outline"
                    title="الخادم"
                    subtitle="إعدادات الاتصال"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>المساعدة</Text>
                <MenuItem
                    icon="help-circle-outline"
                    title="الدعم الفني"
                />
                <MenuItem
                    icon="document-text-outline"
                    title="الشروط والأحكام"
                />
                <MenuItem
                    icon="information-circle-outline"
                    title="حول التطبيق"
                    subtitle={`الإصدار ${APP_CONFIG.VERSION}`}
                />
            </View>

            <View style={styles.section}>
                <MenuItem
                    icon="log-out-outline"
                    title="تسجيل الخروج"
                    onPress={handleLogout}
                    danger
                />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>IT Asset Management</Text>
                <Text style={styles.footerVersion}>v{APP_CONFIG.VERSION}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${COLORS.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: `${COLORS.primary}15`,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    roleText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMuted,
        paddingHorizontal: 16,
        paddingVertical: 12,
        textAlign: 'right',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: `${COLORS.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuIconDanger: {
        backgroundColor: `${COLORS.danger}10`,
    },
    menuContent: {
        flex: 1,
        marginRight: 12,
    },
    menuTitle: {
        fontSize: 16,
        color: COLORS.text,
        textAlign: 'right',
    },
    menuTitleDanger: {
        color: COLORS.danger,
    },
    menuSubtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        textAlign: 'right',
        marginTop: 2,
    },
    footer: {
        padding: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    footerVersion: {
        fontSize: 10,
        color: COLORS.textMuted,
        marginTop: 4,
    },
});
