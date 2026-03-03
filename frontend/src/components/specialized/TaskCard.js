import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../config/theme';

const categoryColors = {
    School: COLORS.pink2,
    Groceries: COLORS.yellow1,
    Health: COLORS.pink1,
    Eldercare: COLORS.pink1,
    Logistics: COLORS.yellow2,
    Default: COLORS.inputBg,
};

const weightIcons = {
    light: { emoji: '🪶', label: 'Light' },
    medium: { emoji: '⚖️', label: 'Medium' },
    heavy: { emoji: '🪨', label: 'Heavy' },
};

const TaskCard = ({
    title,
    subtitle,
    category = 'Default',
    weight = 'light',
    assignee,
    dueLabel,
    onPress,
    style,
}) => {
    const bgColor = categoryColors[category] || categoryColors.Default;
    const w = weightIcons[weight] || weightIcons.light;

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: bgColor }, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Category tag */}
            <View style={styles.tagRow}>
                <View style={styles.tag}>
                    <Text style={styles.tagText}>{category}</Text>
                </View>
                <Text style={styles.weight}>
                    {w.emoji} {w.label}
                </Text>
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
                {title}
            </Text>

            {/* Subtitle */}
            {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                    {subtitle}
                </Text>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                {assignee && (
                    <View style={styles.assigneeRow}>
                        <Feather name="user" size={12} color={COLORS.secondary} />
                        <Text style={styles.footerText}>{assignee}</Text>
                    </View>
                )}
                {dueLabel && (
                    <View style={styles.dueRow}>
                        <Feather name="clock" size={12} color={COLORS.secondary} />
                        <Text style={styles.footerText}>{dueLabel}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: SIZES.radiusLG,
        padding: SIZES.cardPadding,
        marginBottom: SIZES.cardGap,
        minWidth: 200,
        ...SHADOWS.soft,
    },
    tagRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: SIZES.radiusPill,
    },
    tagText: {
        fontFamily: FONTS.bodyMedium,
        fontSize: SIZES.xs,
        color: COLORS.black,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    weight: {
        fontFamily: FONTS.body,
        fontSize: SIZES.xs,
        color: COLORS.secondary,
    },
    title: {
        fontFamily: FONTS.headingMedium,
        fontSize: SIZES.base,
        color: COLORS.black,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: FONTS.body,
        fontSize: SIZES.sm,
        color: COLORS.secondary,
        marginBottom: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    assigneeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontFamily: FONTS.body,
        fontSize: SIZES.xs,
        color: COLORS.secondary,
    },
});

export default TaskCard;
