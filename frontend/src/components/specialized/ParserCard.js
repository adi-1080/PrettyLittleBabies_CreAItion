import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../config/theme';

const ParserCard = ({
    source = 'WhatsApp',
    rawText,
    aiSuggestion,
    timestamp,
    onAccept,
    onReject,
    style,
}) => {
    const sourceIcons = {
        WhatsApp: 'message-circle',
        'Voice Note': 'mic',
        PDF: 'file-text',
        Email: 'mail',
    };

    return (
        <View style={[styles.card, style]}>
            {/* Raw intake section */}
            <View style={styles.rawSection}>
                <View style={styles.sourceRow}>
                    <Feather
                        name={sourceIcons[source] || 'inbox'}
                        size={14}
                        color={COLORS.secondary}
                    />
                    <Text style={styles.sourceLabel}>{source}</Text>
                    {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
                </View>
                <Text style={styles.rawText}>{rawText}</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* AI suggestion section */}
            <View style={styles.aiSection}>
                <View style={styles.aiHeader}>
                    <Feather name="cpu" size={14} color={COLORS.black} />
                    <Text style={styles.aiLabel}>Eva suggests</Text>
                </View>
                <Text style={styles.aiText}>{aiSuggestion}</Text>

                {/* Action buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.acceptBtn]}
                        onPress={onAccept}
                        activeOpacity={0.7}
                    >
                        <Feather name="check" size={18} color={COLORS.success} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={onReject}
                        activeOpacity={0.7}
                    >
                        <Feather name="x" size={18} color={COLORS.danger} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLG,
        overflow: 'hidden',
        marginBottom: SIZES.cardGap,
        ...SHADOWS.soft,
    },
    rawSection: {
        padding: SIZES.cardPadding,
    },
    sourceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    sourceLabel: {
        fontFamily: FONTS.bodyMedium,
        fontSize: SIZES.sm,
        color: COLORS.secondary,
        flex: 1,
    },
    timestamp: {
        fontFamily: FONTS.body,
        fontSize: SIZES.xs,
        color: COLORS.secondary,
    },
    rawText: {
        fontFamily: FONTS.body,
        fontSize: SIZES.md,
        color: COLORS.black,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: SIZES.cardPadding,
    },
    aiSection: {
        padding: SIZES.cardPadding,
        backgroundColor: COLORS.pink2,
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    aiLabel: {
        fontFamily: FONTS.bodySemiBold,
        fontSize: SIZES.sm,
        color: COLORS.black,
    },
    aiText: {
        fontFamily: FONTS.body,
        fontSize: SIZES.md,
        color: COLORS.black,
        lineHeight: 20,
        marginBottom: 14,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptBtn: {
        backgroundColor: 'rgba(76,175,80,0.12)',
    },
    rejectBtn: {
        backgroundColor: 'rgba(255,82,82,0.12)',
    },
});

export default ParserCard;
