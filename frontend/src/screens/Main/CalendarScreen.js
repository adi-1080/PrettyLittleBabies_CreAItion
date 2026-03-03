import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../config/theme';
import GlassCard from '../../components/ui/GlassCard';
import AppButton from '../../components/ui/AppButton';
import AppModal from '../../components/ui/AppModal';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const FILTERS = [
    { key: 'all', label: 'All', icon: 'grid' },
    { key: 'school', label: 'School', icon: 'book' },
    { key: 'me', label: 'Me Time', icon: 'heart' },
    { key: 'family', label: 'Family', icon: 'users' },
    { key: 'work', label: 'Work', icon: 'briefcase' },
];

const EVENT_DOTS = {
    3: [{ type: 'work' }, { type: 'school' }],
    5: [{ type: 'me' }],
    7: [{ type: 'family' }, { type: 'work' }],
    10: [{ type: 'school' }],
    12: [{ type: 'work' }, { type: 'school' }, { type: 'me' }],
    14: [{ type: 'family' }],
    15: [{ type: 'work' }, { type: 'family' }],
    17: [{ type: 'work' }],
    19: [{ type: 'school' }, { type: 'family' }],
    21: [{ type: 'me' }, { type: 'work' }],
    24: [{ type: 'school' }],
    26: [{ type: 'work' }, { type: 'family' }],
    28: [{ type: 'me' }],
};

const TYPE_COLORS = {
    work: '#1A1A2E',
    school: COLORS.pink2,
    me: COLORS.meTime,
    family: COLORS.pink1,
};

const TYPE_LABELS = {
    work: 'Work',
    school: 'School',
    me: 'Me Time',
    family: 'Family',
};

const INITIAL_EVENTS = [
    {
        id: 'e1', time: '9:00 — 10:00 AM', title: 'Sprint Planning',
        type: 'work', conflict: false, agentNote: null,
    },
    {
        id: 'e2', time: '11:00 — 11:45 AM', title: "Rahul's PTM at School",
        type: 'school', conflict: true,
        conflictWith: '1:1 with Manager (11:00 AM)',
        agentNote: 'Eva detected Level 1 Collision — both parents have meetings. Drafting reschedule email to manager.',
    },
    {
        id: 'e3', time: '2:00 — 3:00 PM', title: '1:1 with Manager',
        type: 'work', conflict: false,
        agentNote: 'Eva postponed from 11 AM to resolve collision with PTM.',
        agentAction: 'reschedule',
    },
    {
        id: 'e4', time: '4:00 — 5:00 PM', title: '☕ Protected Focus Time',
        type: 'me', conflict: false,
        agentNote: 'Eva guarded this block. 2 meeting invites auto-declined.',
    },
    {
        id: 'e5', time: '5:30 PM', title: 'Rhea\'s dance class pickup',
        type: 'school', conflict: false,
        agentNote: 'Husband GPS shows him near studio at 5:15 PM.',
    },
    {
        id: 'e6', time: '7:00 PM', title: 'Family Dinner',
        type: 'family', conflict: false,
        agentNote: 'Cook messaged today\'s meal plan in Hindi.',
    },
];

export default function CalendarScreen() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [events, setEvents] = useState(INITIAL_EVENTS);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [showReschedule, setShowReschedule] = useState(false);
    const [rescheduleTarget, setRescheduleTarget] = useState(null);
    const [showCall, setShowCall] = useState(false);

    // New event form
    const [newEvent, setNewEvent] = useState({ title: '', time: '', type: 'work' });

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIdx = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;

    const calendarDays = [];
    for (let i = 0; i < firstDayIdx; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

    const filteredEvents =
        activeFilter === 'all'
            ? events
            : events.filter((e) => e.type === activeFilter);

    const collisionCount = events.filter((e) => e.conflict).length;

    const addEvent = () => {
        if (!newEvent.title) return;
        setEvents([...events, {
            id: 'ne' + Date.now(), time: newEvent.time || 'TBD', title: newEvent.title,
            type: newEvent.type, conflict: false, agentNote: null,
        }]);
        setNewEvent({ title: '', time: '', type: 'work' });
        setShowAddEvent(false);
    };

    const removeEvent = (id) => {
        setEvents(events.filter((e) => e.id !== id));
    };

    const openReschedule = (event) => {
        setRescheduleTarget(event);
        setShowReschedule(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Calendar</Text>
                        <Text style={styles.monthLabel}>
                            {MONTH_NAMES[currentMonth]} {currentYear}
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        {collisionCount > 0 && (
                            <View style={styles.collisionBadge}>
                                <Feather name="alert-triangle" size={12} color="#EF4444" />
                                <Text style={styles.collisionBadgeText}>{collisionCount} collision</Text>
                            </View>
                        )}
                        <TouchableOpacity onPress={() => setShowAddEvent(true)} style={styles.addBtn}>
                            <Feather name="plus" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Calendar Grid */}
                <GlassCard style={styles.calendarCard}>
                    <View style={styles.weekRow}>
                        {DAYS_OF_WEEK.map((d) => (
                            <Text key={d} style={styles.weekDay}>{d}</Text>
                        ))}
                    </View>
                    <View style={styles.dateGrid}>
                        {calendarDays.map((day, i) => {
                            const dots = day ? EVENT_DOTS[day] || [] : [];
                            const isToday = day === currentDay;
                            return (
                                <View key={i} style={styles.dateCell}>
                                    {day ? (
                                        <TouchableOpacity
                                            style={[styles.dateBtn, isToday && styles.dateBtnToday]}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.dateText, isToday && styles.dateTextToday]}>{day}</Text>
                                            {dots.length > 0 && (
                                                <View style={styles.dotsRow}>
                                                    {dots.slice(0, 3).map((dot, j) => (
                                                        <View key={j} style={[styles.eventDot,
                                                        { backgroundColor: TYPE_COLORS[dot.type] || COLORS.secondary }
                                                        ]} />
                                                    ))}
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            );
                        })}
                    </View>
                    <View style={styles.legend}>
                        {Object.keys(TYPE_COLORS).map((type) => (
                            <View key={type} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: TYPE_COLORS[type] }]} />
                                <Text style={styles.legendText}>{TYPE_LABELS[type]}</Text>
                            </View>
                        ))}
                    </View>
                </GlassCard>

                {/* Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}>
                    {FILTERS.map((f) => (
                        <TouchableOpacity key={f.key}
                            style={[styles.filterPill, activeFilter === f.key && styles.filterPillActive]}
                            onPress={() => setActiveFilter(f.key)} activeOpacity={0.7}>
                            <Feather name={f.icon} size={13}
                                color={activeFilter === f.key ? COLORS.white : COLORS.black} />
                            <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Events */}
                <View style={styles.eventSection}>
                    <View style={styles.eventSectionRow}>
                        <Text style={styles.eventSectionTitle}>Today's Schedule</Text>
                        <TouchableOpacity onPress={() => setShowAddEvent(true)} style={styles.addSmallBtn}>
                            <Feather name="plus" size={14} color={COLORS.white} />
                            <Text style={styles.addSmallBtnText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    {filteredEvents.length === 0 && (
                        <GlassCard color={COLORS.yellow2} style={{ padding: 20, alignItems: 'center' }}>
                            <Feather name="calendar" size={24} color={COLORS.secondary} />
                            <Text style={{ fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, marginTop: 8 }}>
                                No events match this filter
                            </Text>
                        </GlassCard>
                    )}
                    {filteredEvents.map((event) => (
                        <GlassCard key={event.id}
                            color={event.conflict ? COLORS.conflict : undefined}
                            style={styles.eventCard}>
                            <View style={styles.eventRow}>
                                <View style={[styles.eventTypeLine,
                                { backgroundColor: TYPE_COLORS[event.type] || COLORS.secondary }
                                ]} />
                                <View style={styles.eventContent}>
                                    <Text style={styles.eventTime}>{event.time}</Text>
                                    <Text style={styles.eventTitle}>{event.title}</Text>
                                    {event.conflict && (
                                        <View style={styles.conflictRow}>
                                            <Feather name="alert-triangle" size={13} color="#EF4444" />
                                            <Text style={styles.conflictText}>
                                                Level 1 Collision with "{event.conflictWith}"
                                            </Text>
                                        </View>
                                    )}
                                    {event.agentNote && (
                                        <View style={styles.agentNoteRow}>
                                            <View style={styles.agentIcon}>
                                                <Feather name="cpu" size={10} color={COLORS.white} />
                                            </View>
                                            <Text style={styles.agentNoteText}>{event.agentNote}</Text>
                                        </View>
                                    )}
                                </View>
                                <TouchableOpacity onPress={() => removeEvent(event.id)} style={styles.eventRemoveBtn}>
                                    <Feather name="x" size={14} color={COLORS.secondary} />
                                </TouchableOpacity>
                            </View>
                            {event.conflict && (
                                <View style={styles.conflictActions}>
                                    <AppButton title="Draft Email" icon="mail" variant="outline"
                                        onPress={() => openReschedule(event)} style={styles.conflictBtn}
                                        textStyle={{ fontSize: SIZES.xs }} />
                                    <AppButton title="Call Sitter" icon="phone" variant="ghost"
                                        onPress={() => setShowCall(true)} style={styles.conflictBtn}
                                        textStyle={{ fontSize: SIZES.xs }} />
                                </View>
                            )}
                        </GlassCard>
                    ))}
                </View>

                {/* Quote */}
                <GlassCard color={COLORS.meTime} style={styles.quoteCard}>
                    <Text style={styles.quoteText}>
                        "Every hour protected is an hour invested in the woman you're becoming."
                    </Text>
                </GlassCard>
            </ScrollView>

            {/* =========== ADD EVENT MODAL =========== */}
            <AppModal visible={showAddEvent} onClose={() => setShowAddEvent(false)}
                title="Add Event" subtitle="Schedule a new event on today">
                <Text style={styles.modalLabel}>Event title</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. Doctor appointment, Team standup"
                    placeholderTextColor={COLORS.secondary} value={newEvent.title}
                    onChangeText={(v) => setNewEvent({ ...newEvent, title: v })} />

                <Text style={styles.modalLabel}>Time</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. 3:00 — 4:00 PM"
                    placeholderTextColor={COLORS.secondary} value={newEvent.time}
                    onChangeText={(v) => setNewEvent({ ...newEvent, time: v })} />

                <Text style={styles.modalLabel}>Type</Text>
                <View style={styles.chipGrid}>
                    {Object.keys(TYPE_LABELS).map((type) => (
                        <TouchableOpacity key={type}
                            style={[styles.chip, newEvent.type === type && styles.chipActive]}
                            onPress={() => setNewEvent({ ...newEvent, type })}>
                            <View style={[styles.chipDot, { backgroundColor: TYPE_COLORS[type] }]} />
                            <Text style={[styles.chipText, newEvent.type === type && styles.chipTextActive]}>
                                {TYPE_LABELS[type]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <AppButton title="Add to Calendar" icon="calendar" onPress={addEvent}
                    style={{ marginTop: 24 }} />
            </AppModal>

            {/* =========== RESCHEDULE EMAIL MODAL =========== */}
            <AppModal visible={showReschedule} onClose={() => setShowReschedule(false)}
                title="Draft Reschedule" subtitle="Eva drafts in your tone and sends for approval">
                <GlassCard color={COLORS.yellow2} style={{ marginBottom: 16 }}>
                    <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: SIZES.sm, color: COLORS.black, marginBottom: 8 }}>
                        Subject: Schedule Conflict — Request to Reschedule
                    </Text>
                    <Text style={{ fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, lineHeight: 20 }}>
                        Hi [Manager],{'\n\n'}
                        I have a conflict with {rescheduleTarget?.conflictWith || 'another commitment'} at the same time as our scheduled meeting. Would it be possible to move our 1:1 to 2:00 PM today?{'\n\n'}
                        I'll have all my OKR updates prepared.{'\n\n'}
                        Thank you for understanding,{'\n'}
                        Tanay
                    </Text>
                </GlassCard>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <AppButton title="Send via Gmail" icon="send" variant="primary"
                        onPress={() => setShowReschedule(false)} style={{ flex: 1 }} />
                    <AppButton title="Edit" icon="edit-2" variant="outline"
                        onPress={() => setShowReschedule(false)} style={{ flex: 1 }} />
                </View>
            </AppModal>

            {/* =========== CALL SITTER MODAL =========== */}
            <AppModal visible={showCall} onClose={() => setShowCall(false)}
                title="Call Sitter" subtitle="Eva can coordinate via WhatsApp">
                <View style={styles.callContent}>
                    <View style={styles.callAvatar}>
                        <Feather name="phone" size={28} color={COLORS.white} />
                    </View>
                    <Text style={styles.callName}>Priya (Backup Sitter)</Text>
                    <Text style={styles.callPhone}>+91 98123 45678</Text>
                    <Text style={styles.callStatus}>Connecting via WhatsApp...</Text>
                    <View style={styles.callActions}>
                        <TouchableOpacity style={[styles.callBtn, { backgroundColor: '#EF4444' }]}
                            onPress={() => setShowCall(false)}>
                            <Feather name="phone-off" size={18} color={COLORS.white} />
                            <Text style={styles.callBtnText}>End</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.callBtn, { backgroundColor: COLORS.black }]}
                            onPress={() => setShowCall(false)}>
                            <Feather name="message-circle" size={18} color={COLORS.white} />
                            <Text style={styles.callBtnText}>Message</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </AppModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    scrollContent: { paddingTop: 60, paddingBottom: 100 },
    header: {
        paddingHorizontal: SIZES.screenPadding, marginBottom: 16,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    },
    title: { fontFamily: FONTS.heading, fontSize: SIZES.xxl, color: COLORS.black },
    monthLabel: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.md, color: COLORS.secondary, marginTop: 4 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    addBtn: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.black,
        alignItems: 'center', justifyContent: 'center',
    },
    collisionBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: COLORS.conflict, paddingHorizontal: 10, paddingVertical: 5, borderRadius: SIZES.radiusPill,
    },
    collisionBadgeText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.xs, color: '#EF4444' },
    addSmallBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.black,
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusPill,
    },
    addSmallBtnText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.xs, color: COLORS.white },
    // Calendar
    calendarCard: { marginHorizontal: SIZES.screenPadding, marginBottom: 14 },
    weekRow: { flexDirection: 'row', marginBottom: 8 },
    weekDay: { flex: 1, textAlign: 'center', fontFamily: FONTS.bodyMedium, fontSize: SIZES.xs, color: COLORS.secondary },
    dateGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dateCell: { width: '14.285%', alignItems: 'center', marginBottom: 4 },
    dateBtn: { width: 36, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    dateBtnToday: { backgroundColor: COLORS.black },
    dateText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.md, color: COLORS.black },
    dateTextToday: { color: COLORS.white },
    dotsRow: { flexDirection: 'row', gap: 3, marginTop: 2 },
    eventDot: { width: 5, height: 5, borderRadius: 2.5 },
    legend: {
        flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 10, paddingTop: 10,
        borderTopWidth: 1, borderTopColor: COLORS.border,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontFamily: FONTS.body, fontSize: SIZES.xs, color: COLORS.secondary },
    // Filters
    filterScroll: { paddingHorizontal: SIZES.screenPadding, gap: 8, marginBottom: 18 },
    filterPill: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 13, paddingVertical: 9,
        borderRadius: SIZES.radiusPill, backgroundColor: COLORS.inputBg,
    },
    filterPillActive: { backgroundColor: COLORS.black },
    filterText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.sm, color: COLORS.black },
    filterTextActive: { color: COLORS.white },
    // Events
    eventSection: { paddingHorizontal: SIZES.screenPadding },
    eventSectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    eventSectionTitle: { fontFamily: FONTS.headingMedium, fontSize: SIZES.lg, color: COLORS.black },
    eventCard: { marginBottom: 12 },
    eventRow: { flexDirection: 'row', alignItems: 'flex-start' },
    eventTypeLine: { width: 4, borderRadius: 2, alignSelf: 'stretch', marginRight: 14 },
    eventContent: { flex: 1 },
    eventTime: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, marginBottom: 2 },
    eventTitle: { fontFamily: FONTS.headingMedium, fontSize: SIZES.base, color: COLORS.black },
    eventRemoveBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    conflictRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    conflictText: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: '#EF4444', flex: 1 },
    agentNoteRow: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8,
        backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: SIZES.radiusSM, padding: 8,
    },
    agentIcon: {
        width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.black,
        alignItems: 'center', justifyContent: 'center', marginTop: 1,
    },
    agentNoteText: { flex: 1, fontFamily: FONTS.body, fontSize: SIZES.xs, color: COLORS.secondary, fontStyle: 'italic', lineHeight: 16 },
    conflictActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
    conflictBtn: { flex: 1, paddingVertical: 9 },
    // Quote
    quoteCard: { marginHorizontal: SIZES.screenPadding, marginTop: 8, marginBottom: 16, padding: 16 },
    quoteText: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.black, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },
    // Modal
    modalLabel: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.sm, color: COLORS.black, marginBottom: 8, marginTop: 14 },
    modalInput: { backgroundColor: COLORS.inputBg, borderRadius: SIZES.radius, paddingHorizontal: 16, height: 50, fontFamily: FONTS.body, fontSize: SIZES.base, color: COLORS.black },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: SIZES.radiusPill, backgroundColor: COLORS.inputBg },
    chipActive: { backgroundColor: COLORS.black },
    chipDot: { width: 10, height: 10, borderRadius: 5 },
    chipText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.sm, color: COLORS.black },
    chipTextActive: { color: COLORS.white },
    // Call
    callContent: { alignItems: 'center', paddingVertical: 30 },
    callAvatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    callName: { fontFamily: FONTS.heading, fontSize: SIZES.xl, color: COLORS.black },
    callPhone: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, marginTop: 4 },
    callStatus: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: '#22C55E', marginTop: 8, marginBottom: 24 },
    callActions: { flexDirection: 'row', gap: 16 },
    callBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: SIZES.radiusPill },
    callBtnText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.md, color: COLORS.white },
});
