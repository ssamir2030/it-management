import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useAuth } from '../lib/auth';
import { COLORS } from '../lib/config';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
            return;
        }

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (!result.success) {
            Alert.alert('خطأ', result.error || 'فشل تسجيل الدخول');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="laptop-outline" size={50} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>IT Asset</Text>
                    <Text style={styles.subtitle}>نظام إدارة أصول تقنية المعلومات</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="البريد الإلكتروني"
                            placeholderTextColor={COLORS.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="كلمة المرور"
                            placeholderTextColor={COLORS.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={COLORS.textMuted}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>تسجيل الدخول</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>© 2024 IT Asset Management</Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: `${COLORS.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
        textAlign: 'right',
    },
    eyeIcon: {
        padding: 8,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        textAlign: 'center',
        color: COLORS.textMuted,
        marginTop: 40,
        fontSize: 12,
    },
});
