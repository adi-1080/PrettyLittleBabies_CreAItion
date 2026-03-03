import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../config/theme';

const AppButton = ({
    title,
    onPress,
    variant = 'primary',
    icon,
    iconSize = 18,
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const btnStyle = variants[variant] || variants.primary;

    return (
        <TouchableOpacity
            style={[styles.base, btnStyle.container, disabled && styles.disabled, style]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={btnStyle.textColor} size="small" />
            ) : (
                <>
                    {icon && (
                        <Feather
                            name={icon}
                            size={iconSize}
                            color={btnStyle.textColor}
                            style={title ? { marginRight: 8 } : {}}
                        />
                    )}
                    {title && (
                        <Text style={[styles.text, { color: btnStyle.textColor }, textStyle]}>
                            {title}
                        </Text>
                    )}
                </>
            )}
        </TouchableOpacity>
    );
};

const variants = {
    primary: {
        container: {
            backgroundColor: COLORS.black,
        },
        textColor: COLORS.white,
    },
    outline: {
        container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: COLORS.black,
        },
        textColor: COLORS.black,
    },
    ghost: {
        container: {
            backgroundColor: COLORS.inputBg,
        },
        textColor: COLORS.black,
    },
    accent: {
        container: {
            backgroundColor: COLORS.pink1,
        },
        textColor: COLORS.black,
    },
    soft: {
        container: {
            backgroundColor: COLORS.yellow2,
        },
        textColor: COLORS.black,
    },
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: SIZES.radius,
    },
    text: {
        fontFamily: FONTS.bodySemiBold,
        fontSize: SIZES.base,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default AppButton;
