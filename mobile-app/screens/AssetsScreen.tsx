import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
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

interface Asset {
    id: string;
    name: string;
    assetTag: string;
    type: string;
    status: string;
    employee?: { name: string };
    location?: { name: string };
}

function AssetCard({ asset, onPress }: { asset: Asset; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                    <Ionicons name="laptop-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{asset.name}</Text>
                    <Text style={styles.cardSubtitle}>{asset.assetTag}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColors[asset.status]}20` }]}>
                    <Text style={[styles.statusText, { color: statusColors[asset.status] }]}>
                        {statusLabels[asset.status] || asset.status}
                    </Text>
                </View>
            </View>

            <View style={styles.cardDetails}>
                {asset.employee && (
                    <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{asset.employee.name}</Text>
                    </View>
                )}
                {asset.location && (
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.detailText}>{asset.location.name}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

export default function AssetsScreen() {
    const navigation = useNavigation<any>();
    const [search, setSearch] = useState('');

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['assets', search],
        queryFn: () => assetsAPI.getAll({ search, limit: 50 }),
    });

    const assets = data?.data?.assets || [];

    const navigateToDetail = (id: string) => {
        navigation.navigate('AssetDetail', { id });
    };

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="بحث عن أصل..."
                    placeholderTextColor={COLORS.textMuted}
                    value={search}
                    onChangeText={setSearch}
                    textAlign="right"
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Assets List */}
            {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={assets}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <AssetCard asset={item} onPress={() => navigateToDetail(item.id)} />
                    )}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={isFetching} onRefresh={refetch} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="file-tray-outline" size={60} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>لا توجد أصول</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        height: 48,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    loader: {
        marginTop: 100,
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: `${COLORS.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'right',
    },
    cardSubtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        textAlign: 'right',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardDetails: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        justifyContent: 'flex-end',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
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
});
