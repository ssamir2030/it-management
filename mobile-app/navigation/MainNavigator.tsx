import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/auth';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../lib/config';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AssetsScreen from '../screens/AssetsScreen';
import AssetDetailScreen from '../screens/AssetDetailScreen';
import ScanScreen from '../screens/ScanScreen';
import TicketsScreen from '../screens/TicketsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    switch (route.name) {
                        case 'الرئيسية':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'الأصول':
                            iconName = focused ? 'laptop' : 'laptop-outline';
                            break;
                        case 'مسح':
                            iconName = focused ? 'scan' : 'scan-outline';
                            break;
                        case 'التذاكر':
                            iconName = focused ? 'ticket' : 'ticket-outline';
                            break;
                        case 'حسابي':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarStyle: {
                    backgroundColor: COLORS.background,
                    borderTopColor: COLORS.border,
                    paddingBottom: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerStyle: {
                    backgroundColor: COLORS.primary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            })}
        >
            <Tab.Screen
                name="الرئيسية"
                component={DashboardScreen}
                options={{ headerTitle: 'لوحة التحكم' }}
            />
            <Tab.Screen
                name="الأصول"
                component={AssetsScreen}
                options={{ headerTitle: 'إدارة الأصول' }}
            />
            <Tab.Screen
                name="مسح"
                component={ScanScreen}
                options={{ headerTitle: 'مسح الباركود' }}
            />
            <Tab.Screen
                name="التذاكر"
                component={TicketsScreen}
                options={{ headerTitle: 'التذاكر' }}
            />
            <Tab.Screen
                name="حسابي"
                component={ProfileScreen}
                options={{ headerTitle: 'الملف الشخصي' }}
            />
        </Tab.Navigator>
    );
}

export default function MainNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <>
                        <Stack.Screen name="Main" component={TabNavigator} />
                        <Stack.Screen
                            name="AssetDetail"
                            component={AssetDetailScreen}
                            options={{
                                headerShown: true,
                                headerTitle: 'تفاصيل الأصل',
                                headerStyle: { backgroundColor: COLORS.primary },
                                headerTintColor: '#fff',
                            }}
                        />
                    </>
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
