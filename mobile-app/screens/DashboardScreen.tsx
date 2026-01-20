import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { dashboardAPI, assetsAPI, ticketsAPI } from '../lib/api';
import { COLORS } from '../lib/config';
import { useAuth } from '../lib/auth';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
    return (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.statContent}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
                {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
            </View>
        </View>
    );
}

export default function DashboardScreen() {
    const { user } = useAuth();

    const { data: assets, isLoading: loadingAssets, refetch: refetchAssets } = useQuery({
        queryKey: ['assets-count'],
        queryFn: () => assetsAPI.getAll({ limit: 1 }),
    });

    const { data: tickets, isLoading: loadingTickets, refetch: refetchTickets } = useQuery({
        queryKey: ['tickets-count'],
        queryFn: () => ticketsAPI.getAll({ limit: 1 }),
    });

    const isLoading = loadingAssets || loadingTickets;

    const onRefresh = () => {
        refetchAssets();
        refetchTickets();
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
            }
        >
            {/* Welcome */}
            <View style={styles.welcomeCard}>
                <View style={styles.welcomeContent}>
                    <Text style={styles.welcomeTitle}>مرحباً، {user?.name || 'مستخدم'}</Text>
                    <Text style={styles.welcomeSubtitle}>مرحباً بك في نظام إدارة أصول تقنية المعلومات</Text>
                </View>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={28} color={COLORS.primary} />
                </View>
            </View>

            {/* Stats Grid */}
            <Text style={styles.sectionTitle}>نظرة عامة</Text>

            {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : (
                <View style={styles.statsGrid}>
                    <StatCard
                        title="إجمالي الأصول"
                        value={assets?.data?.total || 0}
                        icon="laptop"
                        color={COLORS.primary}
                    />
                    <StatCard
                        title="متاح"
                        value={assets?.data?.available || 0}
                        icon="checkmark-circle"
                        color={COLORS.success}
                    />
                    <StatCard
                        title="التذاكر المفتوحة"
                        value={tickets?.data?.open || 0}
                        icon="ticket"
                        color={COLORS.warning}
                    />
                    <StatCard
                        title="بانتظار الصيانة"
                        value={assets?.data?.maintenance || 0}
                        icon="build"
                        color={COLORS.danger}
                    />
                </View>
            )}

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
            <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionButton}>
                    <View style={[styles.actionIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                        <Ionicons name="add-circle" size={28} color={COLORS.primary} />
                    </View>
                    <Text style={styles.actionText}>إضافة أصل</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <View style={[styles.actionIcon, { backgroundColor: `${COLORS.secondary}15` }]}>
                        <Ionicons name="scan" size={28} color={COLORS.secondary} />
                    </View>
                    <Text style={styles.actionText}>مسح باركود</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <View style={[styles.actionIcon, { backgroundColor: `${COLORS.info}15` }]}>
                        <Ionicons name="create" size={28} color={COLORS.info} />
                    </View>
                    <Text style={styles.actionText}>فتح تذكرة</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <View style={[styles.actionIcon, { backgroundColor: `${COLORS.success}15` }]}>
                        <Ionicons name="clipboard" size={28} color={COLORS.success} />
                    </View>
                    <Text style={styles.actionText}>تدقيق</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 16,
    },
    welcomeCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    welcomeContent: {
        flex: 1,
    },
    welcomeTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'right',
    },
    welcomeSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        textAlign: 'right',
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 16,
        textAlign: 'right',
    },
    loader: {
        marginVertical: 40,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        width: '48%',
        borderLeftWidth: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statTitle: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    statSubtitle: {
        fontSize: 10,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        width: '48%',
        alignItems: 'center',
        gap: 8,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
});
