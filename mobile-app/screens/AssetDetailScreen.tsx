import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { assetsAPI } from '../lib/api';
import { COLORS } from '../lib/config';

const statusColors: Record<string, string> = {
    AVAILABLE: COLORS.success,
    ASSIGNED: COLORS.primary,
    MAINTENANCE: COLORS.warning,
    RETIRED: COLORS.textMuted,
};

const statusLabels: Record<string, string> = {
    AVAILABLE: 'متاح',
    ASSIGNED: 'مُعين',
    MAINTENANCE: 'صيانة',
    RETIRED: 'متقاعد',
};

interface InfoRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | undefined;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
    if (!value) return null;
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
                <Ionicons name={icon} size={18} color={COLORS.textMuted} />
                <Text style={styles.labelText}>{label}</Text>
            </View>
            <Text style={styles.valueText}>{value}</Text>
        </View>
    );
}

export default function AssetDetailScreen() {
    const route = useRoute<any>();
    const { id } = route.params;

    const { data, isLoading, error } = useQuery({
        queryKey: ['asset', id],
        queryFn: () => assetsAPI.getById(id),
    });

    const asset = data?.data;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error || !asset) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={60} color={COLORS.danger} />
                <Text style={styles.errorText}>فشل في تحميل بيانات الأصل</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header Card */}
            <View style={styles.headerCard}>
                <View style={styles.assetIcon}>
                    <Ionicons name="laptop-outline" size={40} color={COLORS.primary} />
                </View>
                <Text style={styles.assetName}>{asset.name}</Text>
                <Text style={styles.assetTag}>{asset.assetTag}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColors[asset.status]}20` }]}>
                    <Text style={[styles.statusText, { color: statusColors[asset.status] }]}>
                        {statusLabels[asset.status] || asset.status}
                    </Text>
                </View>
            </View>

            {/* Info Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>معلومات الأصل</Text>
                <InfoRow icon="pricetag" label="النوع" value={asset.type} />
                <InfoRow icon="business" label="الشركة المصنعة" value={asset.manufacturer} />
                <InfoRow icon="hardware-chip" label="الموديل" value={asset.model} />
                <InfoRow icon="barcode" label="الرقم التسلسلي" value={asset.serialNumber} />
            </View>

            {/* Assignment Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>التعيين</Text>
                <InfoRow icon="person" label="الموظف" value={asset.employee?.name} />
                <InfoRow icon="business" label="القسم" value={asset.employee?.department?.name} />
                <InfoRow icon="location" label="الموقع" value={asset.location?.name} />
            </View>

            {/* Financial Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>معلومات مالية</Text>
                <InfoRow icon="cash" label="السعر" value={asset.price ? `${asset.price} ريال` : undefined} />
                <InfoRow icon="calendar" label="تاريخ الشراء" value={asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('ar-SA') : undefined} />
                <InfoRow icon="shield" label="انتهاء الضمان" value={asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString('ar-SA') : undefined} />
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.primary }]}>
                    <Ionicons name="create" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>تعديل</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.success }]}>
                    <Ionicons name="swap-horizontal" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>نقل</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.warning }]}>
                    <Ionicons name="build" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>صيانة</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.textMuted,
    },
    headerCard: {
        backgroundColor: '#fff',
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
    },
    assetIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${COLORS.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    assetName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    assetTag: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 16,
        textAlign: 'right',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    infoLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    labelText: {
        fontSize: 14,
        color: COLORS.textMuted,
    },
    valueText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        padding: 16,
        marginBottom: 32,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
