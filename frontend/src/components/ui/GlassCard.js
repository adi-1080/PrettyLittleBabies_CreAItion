import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../config/theme';

const GlassCard = ({ children, style, color, noPadding }) => {
    return (
        <View
            style={[
                styles.card,
                color && { backgroundColor: color },
                noPadding && { padding: 0 },
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLG,
        padding: SIZES.cardPadding,
        ...SHADOWS.soft,
    },
});

export default GlassCard;
