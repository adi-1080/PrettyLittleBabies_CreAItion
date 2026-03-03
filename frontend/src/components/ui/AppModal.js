import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../config/theme';

export default function AppModal({
    visible,
    onClose,
    title,
    subtitle,
    children,
    fullHeight = false,
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, fullHeight && styles.containerFull]}
            >
                <View style={[styles.sheet, fullHeight && styles.sheetFull]}>
                    {/* Handle bar */}
                    <View style={styles.handleRow}>
                        <View style={styles.handle} />
                    </View>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{title}</Text>
                            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                            <Feather name="x" size={20} color={COLORS.black} />
                        </TouchableOpacity>
                    </View>
                    {/* Content */}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                    >
                        {children}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    containerFull: {},
    sheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
        ...SHADOWS.medium,
    },
    sheetFull: { maxHeight: '92%' },
    handleRow: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
    handle: {
        width: 36, height: 4, borderRadius: 2,
        backgroundColor: COLORS.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontFamily: FONTS.heading,
        fontSize: SIZES.xl,
        color: COLORS.black,
    },
    subtitle: {
        fontFamily: FONTS.body,
        fontSize: SIZES.sm,
        color: COLORS.secondary,
        marginTop: 2,
    },
    closeBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: COLORS.inputBg,
        alignItems: 'center', justifyContent: 'center',
        marginLeft: 12,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
});
