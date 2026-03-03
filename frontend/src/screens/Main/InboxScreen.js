import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../config/theme';
import GlassCard from '../../components/ui/GlassCard';

const TABS = [
    { key: 'all', label: 'All', icon: 'inbox' },
    { key: 'whatsapp', label: 'WhatsApp', icon: 'message-circle' },
    { key: 'voice', label: 'Voice Notes', icon: 'mic' },
    { key: 'docs', label: 'Documents', icon: 'file-text' },
];

const INITIAL_ITEMS = [
    {
        id: '1',
        source: 'WhatsApp',
        sourceIcon: 'message-circle',
        rawText: 'Forwarded from Class Teacher: "PTM scheduled for Friday, 11 AM at Rahul\'s school. All parents must attend. Please confirm."',
        aiSuggestion: 'Event: Parent-Teacher Meeting',
        aiDetails: 'Friday, 11:00 AM | Rahul\'s School | Duration: 45 min',
        aiAction: 'Add to Calendar',
        timestamp: '2 min ago',
        tab: 'whatsapp',
        agentNote: 'Eva detected this is a school event and cross-checked with your work calendar — no conflicts found.',
        merged: false,
    },
    {
        id: '2',
        source: 'WhatsApp',
        sourceIcon: 'message-circle',
        rawText: 'Husband: "We need milk, also pick up bread." | Rahul: "Mom I need milk for my science experiment tomorrow!"',
        aiSuggestion: '🔗 MERGED: Milk + Bread Grocery Run',
        aiDetails: 'Merged 2 requests from husband & Rahul | Milk (Priority: High — science project) + Bread',
        aiAction: 'Add to Cart — BigBasket',
        timestamp: '12 min ago',
        tab: 'whatsapp',
        agentNote: 'Eva merged duplicate "milk" requests. Rahul\'s experiment makes this high-priority — auto-adding to Zepto cart.',
        merged: true,
    },
    {
        id: '3',
        source: 'Voice Note',
        sourceIcon: 'mic',
        rawText: '"Hey, the kitchen sink is leaking again... it\'s gotten worse. Can you call that plumber — Raju bhai?"',
        aiSuggestion: 'Task: Call Plumber (Raju) for Sink Repair',
        aiDetails: 'Priority: Today | Category: Home Maintenance',
        aiAction: 'Add to Planner + Message Raju',
        timestamp: '45 min ago',
        tab: 'voice',
        agentNote: 'Eva transcribed voice note and found "Raju Plumber" in your contacts. Ready to send WhatsApp message in Hindi.',
        merged: false,
    },
    {
        id: '4',
        source: 'PDF Scan',
        sourceIcon: 'file-text',
        rawText: 'School Circular: Annual Day rehearsals start Monday. Students must wear white. "Fancy dress day" on Friday — theme: Indian Freedom Fighters.',
        aiSuggestion: '2 Events Detected',
        aiDetails: 'Mon: Rehearsal starts (wear white) | Fri: Fancy Dress (Freedom Fighters theme)',
        aiAction: 'Add Both to Calendar',
        timestamp: '1 hr ago',
        tab: 'docs',
        agentNote: 'Eva extracted 2 separate events from this circular and created reminders to buy a white outfit and costume.',
        merged: false,
    },
    {
        id: '5',
        source: 'WhatsApp',
        sourceIcon: 'message-circle',
        rawText: 'Forwarded Flight Itinerary: Mumbai → Delhi, March 15, IndiGo 6E-302, Departure 6:00 AM, Terminal 2.',
        aiSuggestion: 'Trip: Mumbai → Delhi',
        aiDetails: 'Mar 15 | IndiGo 6E-302 | 06:00 AM | Terminal 2',
        aiAction: 'Add to Calendar + Set 4 AM Alarm',
        timestamp: '3 hrs ago',
        tab: 'whatsapp',
        agentNote: 'Eva set a 4 AM alarm, booked an Uber for 4:30 AM, and blocked the day on your work calendar.',
        merged: false,
    },
    {
        id: '6',
        source: 'WhatsApp',
        sourceIcon: 'message-circle',
        rawText: 'Mom: "Beta, your father\'s Telma-40 BP medicine will finish by Thursday. Also his eye drops."',
        aiSuggestion: '💊 Rx Refill: Dad\'s Medications',
        aiDetails: 'Telma-40 (BP) + Eye Drops | Running out: Thursday',
        aiAction: 'Auto-order via Apollo Pharmacy',
        timestamp: '5 hrs ago',
        tab: 'whatsapp',
        agentNote: 'Eva cross-referenced with Dad\'s prescription history. Auto-refill is within ₹800 pre-approved budget.',
        merged: false,
    },
];

export default function InboxScreen() {
    const [activeTab, setActiveTab] = useState('all');
    const [items, setItems] = useState(INITIAL_ITEMS);
    const [acceptedItems, setAcceptedItems] = useState([]);
    const [rejectedIds, setRejectedIds] = useState([]);

    const filteredItems = items.filter(
        (item) =>
            (activeTab === 'all' || item.tab === activeTab) &&
            !rejectedIds.includes(item.id)
    );

    const pendingItems = filteredItems.filter(
        (item) => !acceptedItems.find((a) => a.id === item.id)
    );
    const processedItems = filteredItems.filter((item) =>
        acceptedItems.find((a) => a.id === item.id)
    );

    const handleAccept = (item) => {
        setAcceptedItems((prev) => [
            ...prev,
            { ...item, acceptedAt: new Date().toLocaleTimeString() },
        ]);
    };

    const handleReject = (id) => {
        setRejectedIds((prev) => [...prev, id]);
    };

    const totalPending = items.filter(
        (item) =>
            !acceptedItems.find((a) => a.id === item.id) &&
            !rejectedIds.includes(item.id)
    ).length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Inbox</Text>
                    <Text style={styles.subtitle}>The Family Dump</Text>
                </View>
                <View style={styles.headerRight}>
                    {totalPending > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{totalPending} pending</Text>
                        </View>
                    )}
                    <View style={styles.agentStatus}>
                        <View style={styles.agentDot} />
                        <Text style={styles.agentStatusText}>Eva parsing</Text>
                    </View>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsScroll}
                >
                    {TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tabPill,
                                activeTab === tab.key && styles.tabPillActive,
                            ]}
                            onPress={() => setActiveTab(tab.key)}
                            activeOpacity={0.7}
                        >
                            <Feather
                                name={tab.icon}
                                size={14}
                                color={activeTab === tab.key ? COLORS.white : COLORS.black}
                            />
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab.key && styles.tabTextActive,
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Feed */}
            <ScrollView
                contentContainerStyle={styles.feedScroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Motivational quote */}
                <GlassCard color={COLORS.yellow2} style={styles.quoteCard}>
                    <Text style={styles.quoteText}>
                        "You don't have to carry it all alone. Let Eva turn the chaos into clarity."
                    </Text>
                </GlassCard>

                {/* Pending Items */}
                {pendingItems.length > 0 && (
                    <Text style={styles.feedSectionTitle}>
                        Awaiting your review
                    </Text>
                )}
                {pendingItems.map((item) => (
                    <View key={item.id} style={styles.parserCard}>
                        {/* Raw intake */}
                        <View style={styles.rawSection}>
                            <View style={styles.sourceRow}>
                                <Feather name={item.sourceIcon} size={14} color={COLORS.secondary} />
                                <Text style={styles.sourceLabel}>{item.source}</Text>
                                <Text style={styles.timestamp}>{item.timestamp}</Text>
                            </View>
                            <Text style={styles.rawText}>{item.rawText}</Text>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* AI suggestion */}
                        <View style={[styles.aiSection, item.merged && styles.aiSectionMerged]}>
                            <View style={styles.aiHeader}>
                                <View style={styles.aiAgent}>
                                    <Feather name="cpu" size={12} color={COLORS.white} />
                                </View>
                                <Text style={styles.aiLabel}>Eva suggests</Text>
                            </View>

                            <Text style={styles.aiSuggestionTitle}>{item.aiSuggestion}</Text>
                            <Text style={styles.aiDetailsText}>{item.aiDetails}</Text>

                            {/* Agent reasoning */}
                            <View style={styles.agentNote}>
                                <Feather name="zap" size={12} color={COLORS.secondary} />
                                <Text style={styles.agentNoteText}>{item.agentNote}</Text>
                            </View>

                            {/* Actions */}
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={styles.actionBtnAccept}
                                    onPress={() => handleAccept(item)}
                                    activeOpacity={0.7}
                                >
                                    <Feather name="check" size={16} color={COLORS.white} />
                                    <Text style={styles.actionBtnAcceptText}>{item.aiAction}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionBtnReject}
                                    onPress={() => handleReject(item.id)}
                                    activeOpacity={0.7}
                                >
                                    <Feather name="x" size={16} color={COLORS.secondary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}

                {/* Processed items */}
                {processedItems.length > 0 && (
                    <>
                        <Text style={styles.feedSectionTitle}>
                            ✅ Processed by Eva
                        </Text>
                        {processedItems.map((item) => {
                            const accepted = acceptedItems.find((a) => a.id === item.id);
                            return (
                                <View key={item.id} style={styles.processedCard}>
                                    <View style={styles.processedRow}>
                                        <View style={styles.processedCheckCircle}>
                                            <Feather name="check" size={14} color={COLORS.white} />
                                        </View>
                                        <View style={styles.processedContent}>
                                            <Text style={styles.processedTitle}>{item.aiSuggestion}</Text>
                                            <Text style={styles.processedAction}>
                                                {item.aiAction} • Added at {accepted?.acceptedAt}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </>
                )}

                {/* Empty state */}
                {pendingItems.length === 0 && processedItems.length === 0 && (
                    <View style={styles.emptyState}>
                        <Feather name="check-circle" size={48} color={COLORS.border} />
                        <Text style={styles.emptyTitle}>All caught up!</Text>
                        <Text style={styles.emptySubtitle}>
                            Eva has processed everything. Enjoy your peace.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    // Header
    header: {
        paddingHorizontal: SIZES.screenPadding,
        paddingTop: 60,
        paddingBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontFamily: FONTS.heading, fontSize: SIZES.xxl, color: COLORS.black,
    },
    subtitle: {
        fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, marginTop: 2,
    },
    headerRight: { alignItems: 'flex-end', gap: 6 },
    badge: {
        backgroundColor: COLORS.pink1,
        paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: SIZES.radiusPill,
    },
    badgeText: {
        fontFamily: FONTS.bodyMedium, fontSize: SIZES.xs, color: COLORS.black,
    },
    agentStatus: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
    },
    agentDot: {
        width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success,
    },
    agentStatusText: {
        fontFamily: FONTS.body, fontSize: SIZES.xs, color: COLORS.success,
    },
    // Tabs
    tabsContainer: {
        paddingVertical: 10,
    },
    tabsScroll: {
        paddingHorizontal: SIZES.screenPadding,
        gap: 8,
    },
    tabPill: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: SIZES.radiusPill, backgroundColor: COLORS.inputBg,
    },
    tabPillActive: { backgroundColor: COLORS.black },
    tabText: {
        fontFamily: FONTS.bodyMedium, fontSize: SIZES.sm, color: COLORS.black,
    },
    tabTextActive: { color: COLORS.white },
    // Feed
    feedScroll: {
        padding: SIZES.screenPadding,
        paddingBottom: 100,
    },
    feedSectionTitle: {
        fontFamily: FONTS.headingMedium, fontSize: SIZES.base,
        color: COLORS.black, marginBottom: 12, marginTop: 8,
    },
    // Quote
    quoteCard: { marginBottom: 16, padding: 16 },
    quoteText: {
        fontFamily: FONTS.headingLight, fontSize: SIZES.sm,
        color: COLORS.black, fontStyle: 'italic',
        textAlign: 'center', lineHeight: 20,
    },
    // Parser card
    parserCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radiusLG,
        overflow: 'hidden',
        marginBottom: SIZES.cardGap + 2,
        ...SHADOWS.soft,
    },
    rawSection: { padding: 18 },
    sourceRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8,
    },
    sourceLabel: {
        fontFamily: FONTS.bodyMedium, fontSize: SIZES.sm,
        color: COLORS.secondary, flex: 1,
    },
    timestamp: {
        fontFamily: FONTS.body, fontSize: SIZES.xs, color: COLORS.secondary,
    },
    rawText: {
        fontFamily: FONTS.body, fontSize: SIZES.md,
        color: COLORS.black, lineHeight: 21,
    },
    divider: {
        height: 1, backgroundColor: COLORS.border, marginHorizontal: 18,
    },
    // AI section
    aiSection: { padding: 18, backgroundColor: COLORS.pink2 },
    aiSectionMerged: { backgroundColor: COLORS.yellow1 },
    aiHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8,
    },
    aiAgent: {
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: COLORS.black,
        alignItems: 'center', justifyContent: 'center',
    },
    aiLabel: {
        fontFamily: FONTS.bodySemiBold, fontSize: SIZES.sm, color: COLORS.black,
    },
    aiSuggestionTitle: {
        fontFamily: FONTS.headingMedium, fontSize: SIZES.base,
        color: COLORS.black, marginBottom: 4,
    },
    aiDetailsText: {
        fontFamily: FONTS.body, fontSize: SIZES.sm,
        color: COLORS.black, lineHeight: 18, marginBottom: 8,
    },
    agentNote: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 6,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: SIZES.radiusSM, padding: 10, marginBottom: 14,
    },
    agentNoteText: {
        flex: 1, fontFamily: FONTS.body, fontSize: SIZES.xs,
        color: COLORS.secondary, lineHeight: 16, fontStyle: 'italic',
    },
    // Actions
    actionRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
    },
    actionBtnAccept: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, backgroundColor: COLORS.black,
        paddingVertical: 12, borderRadius: SIZES.radius,
    },
    actionBtnAcceptText: {
        fontFamily: FONTS.bodySemiBold, fontSize: SIZES.sm, color: COLORS.white,
    },
    actionBtnReject: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center', justifyContent: 'center',
    },
    // Processed
    processedCard: {
        backgroundColor: COLORS.meTime,
        borderRadius: SIZES.radiusLG,
        padding: 16, marginBottom: 10,
    },
    processedRow: { flexDirection: 'row', alignItems: 'center' },
    processedCheckCircle: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: COLORS.success,
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    processedContent: { flex: 1 },
    processedTitle: {
        fontFamily: FONTS.headingMedium, fontSize: SIZES.md, color: COLORS.black,
    },
    processedAction: {
        fontFamily: FONTS.body, fontSize: SIZES.xs, color: COLORS.secondary, marginTop: 2,
    },
    // Empty
    emptyState: {
        alignItems: 'center', justifyContent: 'center', paddingTop: 60,
    },
    emptyTitle: {
        fontFamily: FONTS.headingMedium, fontSize: SIZES.lg,
        color: COLORS.black, marginTop: 16,
    },
    emptySubtitle: {
        fontFamily: FONTS.body, fontSize: SIZES.md,
        color: COLORS.secondary, marginTop: 4, textAlign: 'center',
    },
});
