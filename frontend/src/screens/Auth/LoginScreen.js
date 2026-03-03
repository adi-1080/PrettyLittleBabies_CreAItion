import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../config/theme';
import AppButton from '../../components/ui/AppButton';
import GlassCard from '../../components/ui/GlassCard';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    // Fade-in animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleSendOtp = () => {
        if (phone.length >= 10) {
            setOtpSent(true);
        }
    };

    const handleVerify = () => {
        navigation.replace('Onboarding');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <Animated.View
                    style={[
                        styles.inner,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Logo / Branding */}
                    <View style={styles.brandBlock}>
                        <View style={styles.logoCircle}>
                            <Feather name="sun" size={32} color={COLORS.black} />
                        </View>
                        <Text style={styles.brandName}>Eva</Text>
                        <Text style={styles.brandTagline}>Your Quiet Household COO</Text>
                    </View>

                    {/* Login Card */}
                    <GlassCard style={styles.loginCard}>
                        <Text style={styles.cardTitle}>Welcome back</Text>
                        <Text style={styles.cardSubtitle}>
                            Sign in to resume your peaceful flow
                        </Text>

                        {/* Phone input */}
                        <View style={styles.inputWrap}>
                            <Feather name="phone" size={18} color={COLORS.secondary} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone number or email"
                                placeholderTextColor={COLORS.secondary}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* OTP input (shown after send) */}
                        {otpSent && (
                            <View style={styles.inputWrap}>
                                <Feather name="lock" size={18} color={COLORS.secondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter OTP"
                                    placeholderTextColor={COLORS.secondary}
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>
                        )}

                        {!otpSent ? (
                            <AppButton
                                title="Send OTP"
                                icon="arrow-right"
                                onPress={handleSendOtp}
                                style={{ marginTop: 8 }}
                            />
                        ) : (
                            <AppButton
                                title="Verify & Continue"
                                icon="check"
                                onPress={handleVerify}
                                style={{ marginTop: 8 }}
                            />
                        )}

                        {otpSent && (
                            <TouchableOpacity
                                onPress={() => setOtpSent(false)}
                                style={styles.resendRow}
                            >
                                <Text style={styles.resendText}>Didn't receive it? Resend OTP</Text>
                            </TouchableOpacity>
                        )}
                    </GlassCard>

                    {/* Footer accent */}
                    <View style={styles.footer}>
                        <View style={[styles.dot, { backgroundColor: COLORS.pink1 }]} />
                        <View style={[styles.dot, { backgroundColor: COLORS.pink2 }]} />
                        <View style={[styles.dot, { backgroundColor: COLORS.yellow1 }]} />
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    content: {
        flex: 1,
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: SIZES.screenPadding,
    },
    brandBlock: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.yellow2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    brandName: {
        fontFamily: FONTS.heading,
        fontSize: SIZES.hero,
        color: COLORS.black,
    },
    brandTagline: {
        fontFamily: FONTS.body,
        fontSize: SIZES.base,
        color: COLORS.secondary,
        marginTop: 4,
    },
    loginCard: {
        marginBottom: 30,
    },
    cardTitle: {
        fontFamily: FONTS.heading,
        fontSize: SIZES.xxl,
        color: COLORS.black,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontFamily: FONTS.body,
        fontSize: SIZES.md,
        color: COLORS.secondary,
        marginBottom: 24,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        borderRadius: SIZES.radius,
        paddingHorizontal: 16,
        marginBottom: 14,
        height: 54,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontFamily: FONTS.body,
        fontSize: SIZES.base,
        color: COLORS.black,
    },
    resendRow: {
        alignItems: 'center',
        marginTop: 16,
    },
    resendText: {
        fontFamily: FONTS.body,
        fontSize: SIZES.sm,
        color: COLORS.secondary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
