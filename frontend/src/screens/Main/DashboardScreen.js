import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    FlatList,
    TextInput,
    Dimensions,
    Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../config/theme';
import GlassCard from '../../components/ui/GlassCard';
import AppButton from '../../components/ui/AppButton';
import AppModal from '../../components/ui/AppModal';

const useFadeIn = (delay = 0) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(16)).current;
    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 450, delay, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 450, delay, useNativeDriver: true }),
        ]).start();
    }, []);
    return { opacity, transform: [{ translateY }] };
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = width > 500 ? 300 : width * 0.72;

const QUOTES = [
    '"She believed she could, so she automated the rest."',
    '"Running a household is project management. You deserve a COO."',
    '"Behind every calm morning is a system working silently overnight."',
];

const INITIAL_CRITICAL = [
    { id: '1', title: 'Chart Paper for Rahul', subtitle: 'Art project due tomorrow — Eva found it on Amazon.', color: COLORS.pink2, icon: 'book-open', agentStatus: '🤖 Cart ready' },
    { id: '2', title: "Dad's BP Refill — 2 days", subtitle: 'Telma-40 running out Thu. Apollo auto-refill ₹380.', color: COLORS.pink1, icon: 'heart', agentStatus: '💊 Auto-refill' },
    { id: '3', title: 'Milk + Bread — Cart ₹340', subtitle: 'Merged 2 requests. BigBasket auto-order 10 AM.', color: COLORS.yellow1, icon: 'shopping-cart', agentStatus: '🛒 Auto-order' },
];

const INITIAL_TIMELINE = [
    { id: 'u1', time: '9:00 AM', title: 'Sprint Planning', type: 'work', agent: null },
    { id: 'u2', time: '11:30 AM', title: "Rahul's PTM", type: 'school', agent: 'Eva auto-blocked 30 min travel buffer' },
    { id: 'u3', time: '2:00 PM', title: '1:1 with Manager', type: 'work', agent: null },
    { id: 'u4', time: '4:00 PM', title: 'Protected Focus Time ☕', type: 'me', agent: 'Eva guarded this — no meetings' },
    { id: 'u5', time: '5:30 PM', title: "Rhea's dance pickup", type: 'school', agent: 'Husband notified via GPS' },
    { id: 'u6', time: '7:00 PM', title: 'Family Dinner', type: 'home', agent: 'Cook messaged meal plan in Hindi' },
];

const INITIAL_STAFF = [
    { id: 's1', name: 'Sunita (Maid)', status: 'On Leave Tomorrow', icon: 'user', color: COLORS.pink1, phone: '+91 98765 43210' },
    { id: 's2', name: 'Ram (Driver)', status: 'Arriving 8:30 AM', icon: 'truck', color: COLORS.yellow1, phone: '+91 98765 43211' },
    { id: 's3', name: 'Lata (Cook)', status: 'Meal plan sent ✓', icon: 'coffee', color: COLORS.meTime, phone: '+91 98765 43212' },
];

const typeColors = { work: '#E8E8FF', school: COLORS.pink2, me: COLORS.meTime, home: COLORS.yellow2 };

const TASK_CATEGORIES = ['School', 'Home', 'Office', 'Groceries', 'Health', 'Logistics'];

export default function DashboardScreen() {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    // Animations
    const a1 = useFadeIn(0);
    const a2 = useFadeIn(80);
    const a3 = useFadeIn(160);
    const a4 = useFadeIn(240);
    const a5 = useFadeIn(320);
    const a6 = useFadeIn(400);
    const a7 = useFadeIn(480);

    const [criticalTasks, setCriticalTasks] = useState(INITIAL_CRITICAL);
    const [timeline, setTimeline] = useState(INITIAL_TIMELINE);
    const [staffList, setStaffList] = useState(INITIAL_STAFF);

    // Modals
    const [showAddTask, setShowAddTask] = useState(false);
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showVoice, setShowVoice] = useState(false);
    const [chatTarget, setChatTarget] = useState(null);

    // New task form
    const [newTask, setNewTask] = useState({ title: '', time: '', category: 'Home' });
    // New staff form
    const [newStaff, setNewStaff] = useState({ name: '', role: '', phone: '' });
    // Chat
    const [chatMsg, setChatMsg] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    const addTask = () => {
        if (!newTask.title) return;
        const id = 'n' + Date.now();
        setTimeline([...timeline, {
            id, time: newTask.time || 'TBD', title: newTask.title,
            type: newTask.category === 'Office' ? 'work' : newTask.category === 'School' ? 'school' : 'home',
            agent: null,
        }]);
        setNewTask({ title: '', time: '', category: 'Home' });
        setShowAddTask(false);
    };

    const removeTimelineItem = (id) => {
        setTimeline(timeline.filter((t) => t.id !== id));
    };

    const addStaff = () => {
        if (!newStaff.name) return;
        setStaffList([...staffList, {
            id: 'ns' + Date.now(), name: newStaff.name, status: 'Just added',
            icon: 'user', color: COLORS.yellow2, phone: newStaff.phone,
        }]);
        setNewStaff({ name: '', role: '', phone: '' });
        setShowAddStaff(false);
    };

    const removeStaff = (id) => {
        setStaffList(staffList.filter((s) => s.id !== id));
    };

    const openChat = (person) => {
        setChatTarget(person);
        setChatHistory([
            { from: 'eva', text: `Hi ${person.name.split('(')[0].trim()}, you have been scheduled for work tomorrow.` },
            { from: 'eva', text: 'Timing: 8:00 AM — 12:00 PM. Please confirm.' },
        ]);
        setShowChat(true);
    };

    const sendChat = () => {
        if (!chatMsg.trim()) return;
        setChatHistory([...chatHistory, { from: 'you', text: chatMsg }]);
        setChatMsg('');
        setTimeout(() => {
            setChatHistory((prev) => [...prev, { from: 'eva', text: 'Message delivered via WhatsApp ✓' }]);
        }, 800);
    };

    const renderCriticalCard = ({ item }) => (
        <GlassCard color={item.color} style={styles.critCard}>
            <View style={styles.critTopRow}>
                <View style={styles.critIconWrap}>
                    <Feather name={item.icon} size={18} color={COLORS.black} />
                </View>
                <View style={styles.agentBadge}>
                    <Text style={styles.agentBadgeText}>{item.agentStatus}</Text>
                </View>
            </View>
            <Text style={styles.critTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.critSubtitle} numberOfLines={3}>{item.subtitle}</Text>
        </GlassCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View style={[styles.header, a1]}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.greeting}>{greeting},</Text>
                        <Text style={styles.greetingName}>Tanay</Text>
                        <Text style={styles.greetingSub}>Eva is handling 3 things in the background.</Text>
                    </View>
                    <View style={styles.avatarCircle}>
                        <Feather name="user" size={22} color={COLORS.black} />
                    </View>
                </Animated.View>

                {/* Agent Bar */}
                <Animated.View style={a1}>
                    <GlassCard style={styles.agentBar}>
                        <View style={styles.agentBarRow}>
                            <View style={styles.agentBarDot} />
                            <Text style={styles.agentBarText}>Eva active — 3 tasks processing, 2 reminders queued, 1 cart ready</Text>
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* Quote */}
                <Animated.View style={a2}>
                    <GlassCard color={COLORS.yellow2} style={styles.quoteCard}>
                        <Text style={styles.quoteText}>{quote}</Text>
                    </GlassCard>
                </Animated.View>

                <Animated.View style={a3}>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Today at a Glance</Text>
                            <View style={styles.urgentBadge}>
                                <Text style={styles.urgentBadgeText}>{criticalTasks.length} urgent</Text>
                            </View>
                        </View>
                        <FlatList data={criticalTasks} renderItem={renderCriticalCard}
                            keyExtractor={(i) => i.id} horizontal showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.critList} snapToInterval={CARD_WIDTH + 14} decelerationRate="fast" />
                    </View>
                </Animated.View>

                <Animated.View style={a4}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitleInline}>Your Protected Time</Text>
                        <GlassCard color={COLORS.meTime} style={styles.meTimeCard}>
                            <View style={styles.meTimeRow}>
                                <View style={styles.meTimeIcon}>
                                    <Feather name="shield" size={20} color={COLORS.black} />
                                </View>
                                <View style={styles.meTimeContent}>
                                    <Text style={styles.meTimeTitle}>Focus Time — Guarded by Eva</Text>
                                    <Text style={styles.meTimeSub}>4:00 — 5:00 PM • No interruptions</Text>
                                </View>
                            </View>
                            <Text style={styles.meTimeHint}>Eva declined 2 meeting requests for this block ✨</Text>
                        </GlassCard>
                    </View>
                </Animated.View>

                <Animated.View style={a5}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitleInline}>Smart Autopilot</Text>
                        <View style={styles.autopilotGrid}>
                            <GlassCard color={COLORS.pink1} style={styles.autopilotCard}>
                                <Feather name="activity" size={18} color={COLORS.black} />
                                <Text style={styles.autopilotTitle}>Rx Tracker</Text>
                                <Text style={styles.autopilotValue}>2 refills</Text>
                                <Text style={styles.autopilotDesc}>Dad's BP meds: 2 days</Text>
                            </GlassCard>
                            <GlassCard color={COLORS.yellow1} style={styles.autopilotCard}>
                                <Feather name="shopping-bag" size={18} color={COLORS.black} />
                                <Text style={styles.autopilotTitle}>Cart Ready</Text>
                                <Text style={styles.autopilotValue}>₹340</Text>
                                <Text style={styles.autopilotDesc}>BigBasket • 10 AM</Text>
                            </GlassCard>
                        </View>
                    </View>
                </Animated.View>

                {/* Staff */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Staff Status</Text>
                        <TouchableOpacity onPress={() => setShowAddStaff(true)} style={styles.addSmallBtn}>
                            <Feather name="plus" size={14} color={COLORS.white} />
                            <Text style={styles.addSmallBtnText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    {staffList.map((staff) => (
                        <GlassCard key={staff.id} color={staff.color} style={styles.staffCard}>
                            <View style={styles.staffRow}>
                                <View style={styles.staffIcon}>
                                    <Feather name={staff.icon} size={16} color={COLORS.black} />
                                </View>
                                <View style={styles.staffContent}>
                                    <Text style={styles.staffName}>{staff.name}</Text>
                                    <Text style={styles.staffStatus}>{staff.status}</Text>
                                </View>
                                <TouchableOpacity style={styles.staffActionBtn} onPress={() => openChat(staff)}>
                                    <Feather name="message-circle" size={16} color={COLORS.black} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.staffActionBtn}
                                    onPress={() => { setChatTarget(staff); setShowVoice(true); }}>
                                    <Feather name="phone" size={16} color={COLORS.black} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.staffRemoveBtn} onPress={() => removeStaff(staff.id)}>
                                    <Feather name="x" size={14} color={COLORS.secondary} />
                                </TouchableOpacity>
                            </View>
                        </GlassCard>
                    ))}
                </View>

                {/* Timeline */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today's Flow</Text>
                        <TouchableOpacity onPress={() => setShowAddTask(true)} style={styles.addSmallBtn}>
                            <Feather name="plus" size={14} color={COLORS.white} />
                            <Text style={styles.addSmallBtnText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    {timeline.map((item) => (
                        <View key={item.id} style={styles.timelineItem}>
                            <Text style={styles.timelineTime}>{item.time}</Text>
                            <View style={[styles.timelineDot, { backgroundColor: typeColors[item.type] || COLORS.border }]} />
                            <View style={styles.timelineRight}>
                                <View style={[styles.timelineCard, { backgroundColor: typeColors[item.type] || COLORS.white }]}>
                                    <Text style={styles.timelineTitle}>{item.title}</Text>
                                    <TouchableOpacity onPress={() => removeTimelineItem(item.id)} style={styles.timelineRemove}>
                                        <Feather name="x" size={14} color={COLORS.secondary} />
                                    </TouchableOpacity>
                                </View>
                                {item.agent && (
                                    <View style={styles.timelineAgent}>
                                        <Feather name="cpu" size={10} color={COLORS.secondary} />
                                        <Text style={styles.timelineAgentText}>{item.agent}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* FAB Cluster */}
            <View style={styles.fabCluster}>
                <TouchableOpacity style={styles.fabMini} activeOpacity={0.85}
                    onPress={() => setShowVoice(true)}>
                    <Feather name="mic" size={18} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.fab} activeOpacity={0.85}
                    onPress={() => setShowAddTask(true)}>
                    <Feather name="plus" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {/* =========== ADD TASK MODAL =========== */}
            <AppModal visible={showAddTask} onClose={() => setShowAddTask(false)}
                title="Add Task" subtitle="Add to today's flow or planner">
                <Text style={styles.modalLabel}>What needs to happen?</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. Pick up groceries, Review PR"
                    placeholderTextColor={COLORS.secondary} value={newTask.title}
                    onChangeText={(v) => setNewTask({ ...newTask, title: v })} />

                <Text style={styles.modalLabel}>Time (optional)</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. 3:00 PM"
                    placeholderTextColor={COLORS.secondary} value={newTask.time}
                    onChangeText={(v) => setNewTask({ ...newTask, time: v })} />

                <Text style={styles.modalLabel}>Category</Text>
                <View style={styles.chipGrid}>
                    {TASK_CATEGORIES.map((cat) => (
                        <TouchableOpacity key={cat}
                            style={[styles.chip, newTask.category === cat && styles.chipActive]}
                            onPress={() => setNewTask({ ...newTask, category: cat })}>
                            <Text style={[styles.chipText, newTask.category === cat && styles.chipTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <AppButton title="Add to Timeline" icon="plus" onPress={addTask} style={{ marginTop: 20 }} />
            </AppModal>

            {/* =========== ADD STAFF MODAL =========== */}
            <AppModal visible={showAddStaff} onClose={() => setShowAddStaff(false)}
                title="Add Staff" subtitle="Eva coordinates via WhatsApp">
                <Text style={styles.modalLabel}>Name</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. Sunita"
                    placeholderTextColor={COLORS.secondary} value={newStaff.name}
                    onChangeText={(v) => setNewStaff({ ...newStaff, name: v })} />

                <Text style={styles.modalLabel}>Role</Text>
                <View style={styles.chipGrid}>
                    {['Maid', 'Cook', 'Driver', 'Nanny', 'Gardener', 'Watchman'].map((r) => (
                        <TouchableOpacity key={r}
                            style={[styles.chip, newStaff.role === r && styles.chipActive]}
                            onPress={() => setNewStaff({ ...newStaff, role: r })}>
                            <Text style={[styles.chipText, newStaff.role === r && styles.chipTextActive]}>{r}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.modalLabel}>Phone</Text>
                <TextInput style={styles.modalInput} placeholder="WhatsApp number"
                    placeholderTextColor={COLORS.secondary} value={newStaff.phone}
                    keyboardType="phone-pad"
                    onChangeText={(v) => setNewStaff({ ...newStaff, phone: v })} />

                <AppButton title="Add Staff" icon="user-plus" onPress={addStaff} style={{ marginTop: 20 }} />
            </AppModal>

            {/* =========== CHAT MODAL =========== */}
            <AppModal visible={showChat} onClose={() => setShowChat(false)}
                title={chatTarget ? `Chat — ${chatTarget.name}` : 'Chat'}
                subtitle="Messages sent via Eva's WhatsApp agent" fullHeight>
                <View style={styles.chatFeed}>
                    {chatHistory.map((msg, i) => (
                        <View key={i} style={[styles.chatBubble, msg.from === 'you' ? styles.chatBubbleYou : styles.chatBubbleEva]}>
                            {msg.from === 'eva' && (
                                <View style={styles.chatAgentDot}>
                                    <Feather name="cpu" size={8} color={COLORS.white} />
                                </View>
                            )}
                            <Text style={[styles.chatText, msg.from === 'you' && { color: COLORS.white }]}>{msg.text}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.chatInputRow}>
                    <TextInput style={styles.chatInput} placeholder="Type a message..."
                        placeholderTextColor={COLORS.secondary} value={chatMsg}
                        onChangeText={setChatMsg} onSubmitEditing={sendChat} />
                    <TouchableOpacity style={styles.chatSendBtn} onPress={sendChat}>
                        <Feather name="send" size={18} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </AppModal>

            {/* =========== VOICE / CALL MODAL =========== */}
            <AppModal visible={showVoice} onClose={() => setShowVoice(false)}
                title={chatTarget ? `Call ${chatTarget.name}` : 'Voice Note'}
                subtitle={chatTarget?.phone || 'Record and send via WhatsApp'}>
                <View style={styles.callContent}>
                    <View style={styles.callAvatar}>
                        <Feather name="phone" size={32} color={COLORS.white} />
                    </View>
                    <Text style={styles.callName}>{chatTarget?.name || 'Voice Note'}</Text>
                    <Text style={styles.callPhone}>{chatTarget?.phone || ''}</Text>
                    <Text style={styles.callStatus}>Connecting via WhatsApp...</Text>
                    <View style={styles.callActions}>
                        <TouchableOpacity style={[styles.callBtn, { backgroundColor: '#EF4444' }]}
                            onPress={() => setShowVoice(false)}>
                            <Feather name="phone-off" size={20} color={COLORS.white} />
                            <Text style={styles.callBtnText}>End</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.callBtn, { backgroundColor: COLORS.black }]}
                            onPress={() => setShowVoice(false)}>
                            <Feather name="mic" size={20} color={COLORS.white} />
                            <Text style={styles.callBtnText}>Voice Note</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </AppModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    scrollContent: { paddingTop: 60, paddingBottom: 120 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: SIZES.screenPadding, marginBottom: 16 },
    headerLeft: { flex: 1 },
    greeting: { fontFamily: FONTS.body, fontSize: SIZES.base, color: COLORS.secondary },
    greetingName: { fontFamily: FONTS.heading, fontSize: 32, color: COLORS.black, marginTop: 2 },
    greetingSub: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, marginTop: 4, lineHeight: 18 },
    avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.yellow2, alignItems: 'center', justifyContent: 'center' },
    agentBar: { marginHorizontal: SIZES.screenPadding, marginBottom: 12, padding: 14 },
    agentBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    agentBarDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
    agentBarText: { flex: 1, fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary },
    quoteCard: { marginHorizontal: SIZES.screenPadding, marginBottom: 20, padding: 16 },
    quoteText: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.black, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.screenPadding, marginBottom: 14 },
    sectionTitle: { fontFamily: FONTS.headingMedium, fontSize: SIZES.lg, color: COLORS.black },
    sectionTitleInline: { fontFamily: FONTS.headingMedium, fontSize: SIZES.lg, color: COLORS.black, paddingHorizontal: SIZES.screenPadding, marginBottom: 14 },
    urgentBadge: { backgroundColor: COLORS.black, paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radiusPill },
    urgentBadgeText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.xs, color: COLORS.white },
    addSmallBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.black, paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusPill },
    addSmallBtnText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.xs, color: COLORS.white },
    // Critical
    critList: { paddingHorizontal: SIZES.screenPadding, gap: 14 },
    critCard: { width: CARD_WIDTH, minHeight: 140 },
    critTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    critIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
    agentBadge: { backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: SIZES.radiusPill },
    agentBadgeText: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.black },
    critTitle: { fontFamily: FONTS.headingMedium, fontSize: SIZES.base, color: COLORS.black, marginBottom: 4 },
    critSubtitle: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, lineHeight: 17 },
    // Me-Time
    meTimeCard: { marginHorizontal: SIZES.screenPadding },
    meTimeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    meTimeIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    meTimeContent: { flex: 1 },
    meTimeTitle: { fontFamily: FONTS.headingMedium, fontSize: SIZES.base, color: COLORS.black },
    meTimeSub: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, marginTop: 2 },
    meTimeHint: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, fontStyle: 'italic' },
    // Autopilot
    autopilotGrid: { flexDirection: 'row', paddingHorizontal: SIZES.screenPadding, gap: 12 },
    autopilotCard: { flex: 1, alignItems: 'center', padding: 14 },
    autopilotTitle: { fontFamily: FONTS.bodyMedium, fontSize: 10, color: COLORS.secondary, marginTop: 6 },
    autopilotValue: { fontFamily: FONTS.heading, fontSize: SIZES.xl, color: COLORS.black, marginTop: 2 },
    autopilotDesc: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.secondary, textAlign: 'center', marginTop: 2 },
    // Staff
    staffCard: { marginHorizontal: SIZES.screenPadding, marginBottom: 8, padding: 12 },
    staffRow: { flexDirection: 'row', alignItems: 'center' },
    staffIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    staffContent: { flex: 1 },
    staffName: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.md, color: COLORS.black },
    staffStatus: { fontFamily: FONTS.body, fontSize: SIZES.xs, color: COLORS.secondary, marginTop: 1 },
    staffActionBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
    staffRemoveBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
    // Timeline
    timelineItem: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: SIZES.screenPadding, marginBottom: 8 },
    timelineTime: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.sm, color: COLORS.secondary, width: 72, marginTop: 10 },
    timelineDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12, marginTop: 14, borderWidth: 1.5, borderColor: COLORS.border },
    timelineRight: { flex: 1 },
    timelineCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: SIZES.radius },
    timelineTitle: { flex: 1, fontFamily: FONTS.bodyMedium, fontSize: SIZES.md, color: COLORS.black },
    timelineRemove: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    timelineAgent: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 16, marginTop: 2 },
    timelineAgentText: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.secondary, fontStyle: 'italic' },
    // FAB
    fabCluster: { position: 'absolute', bottom: 28, right: 22, alignItems: 'center', gap: 10 },
    fabMini: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center', ...SHADOWS.soft },
    fab: { width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium },
    // Modal shared
    modalLabel: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.sm, color: COLORS.black, marginBottom: 8, marginTop: 14 },
    modalInput: { backgroundColor: COLORS.inputBg, borderRadius: SIZES.radius, paddingHorizontal: 16, height: 50, fontFamily: FONTS.body, fontSize: SIZES.base, color: COLORS.black },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: SIZES.radiusPill, backgroundColor: COLORS.inputBg },
    chipActive: { backgroundColor: COLORS.black },
    chipText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.sm, color: COLORS.black },
    chipTextActive: { color: COLORS.white },
    // Chat
    chatFeed: { minHeight: 200 },
    chatBubble: { marginBottom: 10, padding: 12, borderRadius: SIZES.radius, maxWidth: '85%' },
    chatBubbleEva: { backgroundColor: COLORS.inputBg, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    chatBubbleYou: { backgroundColor: COLORS.black, alignSelf: 'flex-end' },
    chatAgentDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    chatText: { fontFamily: FONTS.body, fontSize: SIZES.md, color: COLORS.black, lineHeight: 20, flex: 1 },
    chatInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
    chatInput: { flex: 1, backgroundColor: COLORS.inputBg, borderRadius: 24, paddingHorizontal: 16, height: 46, fontFamily: FONTS.body, fontSize: SIZES.md, color: COLORS.black },
    chatSendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center' },
    // Call
    callContent: { alignItems: 'center', paddingVertical: 30 },
    callAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    callName: { fontFamily: FONTS.heading, fontSize: SIZES.xl, color: COLORS.black },
    callPhone: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, marginTop: 4 },
    callStatus: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: '#22C55E', marginTop: 8, marginBottom: 30 },
    callActions: { flexDirection: 'row', gap: 20 },
    callBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: SIZES.radiusPill },
    callBtnText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.md, color: COLORS.white },
});
