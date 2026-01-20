import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ticketsAPI } from '../lib/api';
import { COLORS } from '../lib/config';

const statusColors: Record<string, string> = {
    OPEN: COLORS.warning,
    IN_PROGRESS: COLORS.info,
    RESOLVED: COLORS.success,
    CLOSED: COLORS.textMuted,
};

const statusLabels: Record<string, string> = {
    OPEN: 'مفتوحة',
    IN_PROGRESS: 'قيد المعالجة',
    RESOLVED: 'تم الحل',
    CLOSED: 'مغلقة',
};

const priorityColors: Record<string, string> = {
    LOW: COLORS.info,
    MEDIUM: COLORS.warning,
    HIGH: COLORS.danger,
    CRITICAL: '#dc2626',
};

interface Ticket {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    employee?: { name: string };
}

function TicketCard({ ticket }: { ticket: Ticket }) {
    return (
        <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.priorityDot, { backgroundColor: priorityColors[ticket.priority] }]} />
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{ticket.title}</Text>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                        {ticket.description}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColors[ticket.status]}20` }]}>
                    <Text style={[styles.statusText, { color: statusColors[ticket.status] }]}>
                        {statusLabels[ticket.status] || ticket.status}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                    <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.footerText}>{ticket.employee?.name || 'غير معروف'}</Text>
                </View>
                <View style={styles.footerItem}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.footerText}>
                        {new Date(ticket.createdAt).toLocaleDateString('ar-SA')}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function TicketsScreen() {
    const [filter, setFilter] = useState<string>('all');

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['tickets', filter],
        queryFn: () => ticketsAPI.getAll({ status: filter === 'all' ? undefined : filter }),
    });

    const tickets = data?.data?.tickets || [];

    const filters = [
        { key: 'all', label: 'الكل' },
        { key: 'OPEN', label: 'مفتوحة' },
        { key: 'IN_PROGRESS', label: 'قيد المعالجة' },
        { key: 'RESOLVED', label: 'تم الحل' },
    ];

    return (
        <View style={styles.container}>
            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {filters.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tickets List */}
            {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={tickets}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <TicketCard ticket={item} />}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="ticket-outline" size={60} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>لا توجد تذاكر</Text>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 8,
        gap: 8,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        fontSize: 13,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#fff',
    },
    loader: {
        marginTop: 100,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'right',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: 'right',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textMuted,
        marginTop: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
});
