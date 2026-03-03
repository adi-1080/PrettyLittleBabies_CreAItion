import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../config/theme';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';

// Main Screens
import DashboardScreen from '../screens/Main/DashboardScreen';
import PlannerScreen from '../screens/Main/PlannerScreen';
import CalendarScreen from '../screens/Main/CalendarScreen';
import InboxScreen from '../screens/Main/InboxScreen';
import InsightsScreen from '../screens/Main/InsightsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_CONFIG = [
    { name: 'Dashboard', component: DashboardScreen, icon: 'home' },
    { name: 'Planner', component: PlannerScreen, icon: 'layout' },
    { name: 'Calendar', component: CalendarScreen, icon: 'calendar' },
    { name: 'Inbox', component: InboxScreen, icon: 'inbox' },
    { name: 'Insights', component: InsightsScreen, icon: 'bar-chart-2' },
];

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.black,
                tabBarInactiveTintColor: COLORS.secondary,
                tabBarLabelStyle: {
                    fontFamily: FONTS.bodyMedium,
                    fontSize: SIZES.xs,
                    marginTop: -2,
                    marginBottom: Platform.OS === 'ios' ? 0 : 6,
                },
                tabBarStyle: {
                    backgroundColor: COLORS.tabBarBg,
                    borderTopWidth: 0,
                    height: Platform.OS === 'ios' ? 88 : 64,
                    paddingTop: 8,
                    ...SHADOWS.soft,
                },
            }}
        >
            {TAB_CONFIG.map((tab) => (
                <Tab.Screen
                    key={tab.name}
                    name={tab.name}
                    component={tab.component}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <View
                                style={[
                                    styles.iconWrap,
                                    focused && styles.iconWrapActive,
                                ]}
                            >
                                <Feather name={tab.icon} size={20} color={focused ? COLORS.white : color} />
                            </View>
                        ),
                    }}
                />
            ))}
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'fade',
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    iconWrap: {
        width: 40,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapActive: {
        backgroundColor: COLORS.black,
        borderRadius: 16,
    },
});
