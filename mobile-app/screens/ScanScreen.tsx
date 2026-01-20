import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { assetsAPI } from '../lib/api';
import { COLORS } from '../lib/config';

export default function ScanScreen() {
    const navigation = useNavigation<any>();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={80} color={COLORS.textMuted} />
                <Text style={styles.permissionTitle}>صلاحية الكاميرا</Text>
                <Text style={styles.permissionText}>
                    يحتاج التطبيق إلى صلاحية الوصول للكاميرا لمسح الباركود
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>منح الصلاحية</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        if (scanned || loading) return;

        setScanned(true);
        setLoading(true);

        try {
            const result = await assetsAPI.getByBarcode(data);

            if (result.success && result.data) {
                navigation.navigate('AssetDetail', { id: result.data.id });
            } else {
                Alert.alert(
                    'غير موجود',
                    `لم يتم العثور على أصل بهذا الباركود: ${data}`,
                    [
                        { text: 'إضافة جديد', onPress: () => console.log('Add new') },
                        { text: 'إعادة المسح', onPress: () => setScanned(false) },
                    ]
                );
            }
        } catch (error) {
            Alert.alert('خطأ', 'فشل في البحث عن الأصل', [
                { text: 'حسناً', onPress: () => setScanned(false) },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'ean8'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            >
                {/* Overlay */}
                <View style={styles.overlay}>
                    <View style={styles.overlayTop} />
                    <View style={styles.overlayMiddle}>
                        <View style={styles.overlaySide} />
                        <View style={styles.scanArea}>
                            <View style={[styles.corner, styles.cornerTL]} />
                            <View style={[styles.corner, styles.cornerTR]} />
                            <View style={[styles.corner, styles.cornerBL]} />
                            <View style={[styles.corner, styles.cornerBR]} />
                        </View>
                        <View style={styles.overlaySide} />
                    </View>
                    <View style={styles.overlayBottom}>
                        <Text style={styles.scanText}>
                            {loading ? 'جاري البحث...' : 'وجه الكاميرا نحو الباركود'}
                        </Text>
                        {scanned && !loading && (
                            <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
                                <Ionicons name="refresh" size={20} color="#fff" />
                                <Text style={styles.rescanText}>إعادة المسح</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: COLORS.background,
    },
    permissionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 24,
        marginBottom: 8,
    },
    permissionText: {
        fontSize: 16,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: 24,
    },
    permissionButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
    },
    overlayTop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlayMiddle: {
        flexDirection: 'row',
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    scanArea: {
        width: 280,
        height: 280,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: COLORS.primary,
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 12,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 12,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 12,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 12,
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        paddingTop: 40,
    },
    scanText: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 20,
    },
    rescanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    rescanText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
