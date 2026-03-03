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
import { COLORS, FONTS, SIZES } from '../../config/theme';
import GlassCard from '../../components/ui/GlassCard';
import AppButton from '../../components/ui/AppButton';
import AppModal from '../../components/ui/AppModal';

const RELATION_TYPES = [
    { key: 'husband', label: 'Husband / Partner', icon: 'user' },
    { key: 'child', label: 'Child', icon: 'smile' },
    { key: 'parent', label: 'Parent (Elderly)', icon: 'heart' },
    { key: 'sibling', label: 'Sibling', icon: 'users' },
    { key: 'inlaw', label: 'In-Law', icon: 'home' },
    { key: 'other', label: 'Other', icon: 'user-plus' },
];

const CHILD_STAGES = [
    { key: 'toddler', label: '👶 Toddler (0-3 yrs)' },
    { key: 'preschool', label: '🧒 Pre-School (3-5 yrs)' },
    { key: 'school', label: '🎒 School-going (5-17 yrs)' },
    { key: 'college', label: '🎓 College (17+ yrs)' },
];

export default function OnboardingScreen({ navigation }) {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');

    // Family members
    const [family, setFamily] = useState([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', relation: '', stage: '', school: '', phone: '' });

    // Toggles
    const [hasElders, setHasElders] = useState(false);
    const [hasStaff, setHasStaff] = useState(false);

    // Connections
    const [gmailConnected, setGmailConnected] = useState(false);
    const [calendarSynced, setCalendarSynced] = useState(false);
    const [whatsappConnected, setWhatsappConnected] = useState(false);

    // Budget
    const [weeklyBudget, setWeeklyBudget] = useState('3000');

    // Staff
    const [staff, setStaff] = useState([]);
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', role: '', phone: '' });

    const totalSteps = 3;
    const handleFinish = () => navigation.replace('Main');

    const addFamilyMember = () => {
        if (!newMember.name || !newMember.relation) return;
        setFamily([...family, { ...newMember, id: Date.now().toString() }]);
        setNewMember({ name: '', relation: '', stage: '', school: '', phone: '' });
        setShowAddMember(false);
    };

    const removeMember = (id) => {
        setFamily(family.filter((m) => m.id !== id));
    };

    const addStaffMember = () => {
        if (!newStaff.name || !newStaff.role) return;
        setStaff([...staff, { ...newStaff, id: Date.now().toString() }]);
        setNewStaff({ name: '', role: '', phone: '' });
        setShowAddStaff(false);
    };

    const removeStaff = (id) => {
        setStaff(staff.filter((s) => s.id !== id));
    };

    // ==================== STEP 0: HOUSEHOLD ====================
    const renderStep0 = () => (
        <View>
            <Text style={styles.stepTitle}>Tell Eva about your household</Text>
            <Text style={styles.stepSubtitle}>The more Eva knows, the better she orchestrates</Text>

            <Text style={styles.fieldLabel}>Your name</Text>
            <View style={styles.inputWrap}>
                <Feather name="user" size={18} color={COLORS.secondary} style={{ marginRight: 12 }} />
                <TextInput style={styles.input} placeholder="e.g. Priya" placeholderTextColor={COLORS.secondary}
                    value={name} onChangeText={setName} />
            </View>

            {/* Family Members */}
            <View style={styles.sectionRow}>
                <Text style={styles.fieldLabel}>Family Members</Text>
                <TouchableOpacity onPress={() => setShowAddMember(true)} style={styles.addMiniBtn}>
                    <Feather name="plus" size={14} color={COLORS.white} />
                    <Text style={styles.addMiniBtnText}>Add Member</Text>
                </TouchableOpacity>
            </View>

            {family.length === 0 ? (
                <GlassCard color={COLORS.yellow2} style={styles.emptyCard}>
                    <Feather name="users" size={20} color={COLORS.secondary} />
                    <Text style={styles.emptyText}>Tap "Add Member" to add husband, kids, parents, etc.</Text>
                </GlassCard>
            ) : (
                family.map((m) => (
                    <GlassCard key={m.id}
                        color={m.relation === 'child' ? COLORS.pink2 : m.relation === 'parent' ? COLORS.pink1 : COLORS.yellow2}
                        style={styles.memberCard}>
                        <View style={styles.memberRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.memberName}>{m.name}</Text>
                                <Text style={styles.memberMeta}>
                                    {RELATION_TYPES.find((r) => r.key === m.relation)?.label || m.relation}
                                    {m.stage ? ` • ${CHILD_STAGES.find((s) => s.key === m.stage)?.label || m.stage}` : ''}
                                    {m.school ? ` • ${m.school}` : ''}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => removeMember(m.id)} style={styles.removeBtn}>
                                <Feather name="x" size={16} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                ))
            )}

            {/* Staff */}
            <View style={[styles.sectionRow, { marginTop: 16 }]}>
                <Text style={styles.fieldLabel}>Domestic Staff</Text>
                <TouchableOpacity onPress={() => setShowAddStaff(true)} style={styles.addMiniBtn}>
                    <Feather name="plus" size={14} color={COLORS.white} />
                    <Text style={styles.addMiniBtnText}>Add Staff</Text>
                </TouchableOpacity>
            </View>

            {staff.length === 0 ? (
                <GlassCard color={COLORS.yellow2} style={styles.emptyCard}>
                    <Feather name="briefcase" size={20} color={COLORS.secondary} />
                    <Text style={styles.emptyText}>Add maids, cooks, drivers, nannies — Eva can message them</Text>
                </GlassCard>
            ) : (
                staff.map((s) => (
                    <GlassCard key={s.id} color={COLORS.meTime} style={styles.memberCard}>
                        <View style={styles.memberRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.memberName}>{s.name}</Text>
                                <Text style={styles.memberMeta}>{s.role}{s.phone ? ` • ${s.phone}` : ''}</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeStaff(s.id)} style={styles.removeBtn}>
                                <Feather name="x" size={16} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                ))
            )}
        </View>
    );

    // ==================== STEP 1: CONNECTIONS ====================
    const renderStep1 = () => (
        <View>
            <Text style={styles.stepTitle}>Connect your ecosystem</Text>
            <Text style={styles.stepSubtitle}>Eva syncs your calendars, messages, and platforms</Text>

            <GlassCard color={COLORS.yellow2} style={styles.quoteCard}>
                <Text style={styles.quoteText}>
                    "Behind every successful woman is herself — and an AI that handles the rest."
                </Text>
            </GlassCard>

            {[
                {
                    key: 'gmail', connected: gmailConnected, toggle: () => setGmailConnected(!gmailConnected),
                    icon: 'mail', label: 'Gmail', desc: 'Read & auto-draft reschedule emails'
                },
                {
                    key: 'cal', connected: calendarSynced, toggle: () => setCalendarSynced(!calendarSynced),
                    icon: 'calendar', label: 'Google Calendar', desc: 'Detect work-home conflicts automatically'
                },
                {
                    key: 'wa', connected: whatsappConnected, toggle: () => setWhatsappConnected(!whatsappConnected),
                    icon: 'message-circle', label: 'WhatsApp', desc: 'Family drops chaos here — Eva parses it'
                },
            ].map((item) => (
                <TouchableOpacity key={item.key}
                    style={[styles.connectBtn, item.connected && styles.connectBtnDone]}
                    onPress={item.toggle} activeOpacity={0.8}>
                    <Feather name={item.icon} size={20} color={item.connected ? '#22C55E' : COLORS.black} />
                    <View style={styles.connectTextWrap}>
                        <Text style={styles.connectTitle}>
                            {item.connected ? `${item.label} Connected ✓` : `Connect ${item.label}`}
                        </Text>
                        <Text style={styles.connectDesc}>{item.desc}</Text>
                    </View>
                    <Feather name={item.connected ? 'check-circle' : 'arrow-right'} size={18}
                        color={item.connected ? '#22C55E' : COLORS.secondary} />
                </TouchableOpacity>
            ))}
        </View>
    );

    // ==================== STEP 2: PREFERENCES ====================
    const renderStep2 = () => (
        <View>
            <Text style={styles.stepTitle}>Set autopilot preferences</Text>
            <Text style={styles.stepSubtitle}>Eva auto-orders groceries within your budget</Text>

            <GlassCard color={COLORS.meTime} style={styles.budgetCard}>
                <Text style={styles.budgetLabel}>Weekly quick-commerce restock budget</Text>
                <View style={styles.budgetInputRow}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput style={styles.budgetInput} value={weeklyBudget}
                        onChangeText={setWeeklyBudget} keyboardType="number-pad" placeholder="3000"
                        placeholderTextColor={COLORS.secondary} />
                </View>
                <Text style={styles.budgetHint}>Under this → auto-order. Over this → Eva asks first.</Text>
            </GlassCard>

            <GlassCard color={COLORS.yellow2} style={styles.featurePreview}>
                <Text style={styles.previewTitle}>🤖 What Eva will do</Text>
                {[
                    'Parse WhatsApp chaos into structured tasks',
                    'Detect calendar conflicts & draft reschedule emails',
                    'Auto-refill medications before they run out',
                    'Track cognitive load & ensure fair task distribution',
                    'Protect your focus time & me-time blocks',
                    'Message staff in their preferred language',
                ].map((text, i) => (
                    <View key={i} style={styles.previewItem}>
                        <Feather name="check" size={14} color="#22C55E" />
                        <Text style={styles.previewText}>{text}</Text>
                    </View>
                ))}
            </GlassCard>

            <GlassCard color={COLORS.pink1} style={styles.quoteCard}>
                <Text style={styles.quoteText}>
                    "She doesn't need to do it all — she needs a system that does it intelligently."
                </Text>
            </GlassCard>
        </View>
    );

    const steps = [renderStep0, renderStep1, renderStep2];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.progressRow}>
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
                    ))}
                </View>
                <Text style={styles.stepCounter}>Step {step + 1} of {totalSteps}</Text>
                {steps[step]()}
                <View style={styles.navRow}>
                    {step > 0 && (
                        <AppButton title="Back" variant="ghost" icon="arrow-left"
                            onPress={() => setStep(step - 1)} style={{ flex: 1, marginRight: 10 }} />
                    )}
                    {step < totalSteps - 1 ? (
                        <AppButton title="Continue" icon="arrow-right"
                            onPress={() => setStep(step + 1)} style={{ flex: 1 }} />
                    ) : (
                        <AppButton title="Launch Eva ✨" icon="zap"
                            onPress={handleFinish} style={{ flex: 1 }} />
                    )}
                </View>
            </ScrollView>

            {/* Add Family Member Modal */}
            <AppModal visible={showAddMember} onClose={() => setShowAddMember(false)}
                title="Add Family Member" subtitle="Add anyone who lives in or depends on the household" fullHeight>
                <Text style={styles.modalLabel}>Name</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. Rohit, Amma, Rahul"
                    placeholderTextColor={COLORS.secondary} value={newMember.name}
                    onChangeText={(v) => setNewMember({ ...newMember, name: v })} />

                <Text style={styles.modalLabel}>Relationship</Text>
                <View style={styles.chipGrid}>
                    {RELATION_TYPES.map((r) => (
                        <TouchableOpacity key={r.key}
                            style={[styles.chip, newMember.relation === r.key && styles.chipActive]}
                            onPress={() => setNewMember({ ...newMember, relation: r.key })}>
                            <Feather name={r.icon} size={14}
                                color={newMember.relation === r.key ? COLORS.white : COLORS.black} />
                            <Text style={[styles.chipText, newMember.relation === r.key && styles.chipTextActive]}>
                                {r.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {newMember.relation === 'child' && (
                    <>
                        <Text style={styles.modalLabel}>Age Group</Text>
                        <View style={styles.chipGrid}>
                            {CHILD_STAGES.map((s) => (
                                <TouchableOpacity key={s.key}
                                    style={[styles.chip, newMember.stage === s.key && styles.chipActive]}
                                    onPress={() => setNewMember({ ...newMember, stage: s.key })}>
                                    <Text style={[styles.chipText, newMember.stage === s.key && styles.chipTextActive]}>
                                        {s.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {(newMember.stage === 'school' || newMember.stage === 'college') && (
                            <>
                                <Text style={styles.modalLabel}>
                                    {newMember.stage === 'college' ? 'College Name' : 'School Name'}
                                </Text>
                                <TextInput style={styles.modalInput}
                                    placeholder={newMember.stage === 'college' ? 'e.g. IIT Bombay' : 'e.g. DPS Noida'}
                                    placeholderTextColor={COLORS.secondary} value={newMember.school}
                                    onChangeText={(v) => setNewMember({ ...newMember, school: v })} />
                            </>
                        )}
                    </>
                )}

                <Text style={styles.modalLabel}>Phone (optional)</Text>
                <TextInput style={styles.modalInput} placeholder="WhatsApp number"
                    placeholderTextColor={COLORS.secondary} keyboardType="phone-pad"
                    value={newMember.phone}
                    onChangeText={(v) => setNewMember({ ...newMember, phone: v })} />

                <AppButton title="Add to Family" icon="user-plus" onPress={addFamilyMember}
                    style={{ marginTop: 20 }} />
            </AppModal>

            {/* Add Staff Modal */}
            <AppModal visible={showAddStaff} onClose={() => setShowAddStaff(false)}
                title="Add Staff" subtitle="Eva will coordinate with them via WhatsApp">
                <Text style={styles.modalLabel}>Name</Text>
                <TextInput style={styles.modalInput} placeholder="e.g. Sunita, Ram"
                    placeholderTextColor={COLORS.secondary} value={newStaff.name}
                    onChangeText={(v) => setNewStaff({ ...newStaff, name: v })} />

                <Text style={styles.modalLabel}>Role</Text>
                <View style={styles.chipGrid}>
                    {['Maid', 'Cook', 'Driver', 'Nanny', 'Gardener', 'Watchman'].map((role) => (
                        <TouchableOpacity key={role}
                            style={[styles.chip, newStaff.role === role && styles.chipActive]}
                            onPress={() => setNewStaff({ ...newStaff, role })}>
                            <Text style={[styles.chipText, newStaff.role === role && styles.chipTextActive]}>
                                {role}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.modalLabel}>Phone (for WhatsApp)</Text>
                <TextInput style={styles.modalInput} placeholder="WhatsApp number"
                    placeholderTextColor={COLORS.secondary} keyboardType="phone-pad"
                    value={newStaff.phone}
                    onChangeText={(v) => setNewStaff({ ...newStaff, phone: v })} />

                <AppButton title="Add Staff" icon="user-plus" onPress={addStaffMember}
                    style={{ marginTop: 20 }} />
            </AppModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    scrollContent: { padding: SIZES.screenPadding, paddingTop: 60, paddingBottom: 40 },
    progressRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
    progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.border },
    progressDotActive: { backgroundColor: COLORS.black },
    stepCounter: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.sm, color: COLORS.secondary, marginBottom: 8 },
    stepTitle: { fontFamily: FONTS.heading, fontSize: SIZES.xxl, color: COLORS.black, marginBottom: 6 },
    stepSubtitle: { fontFamily: FONTS.body, fontSize: SIZES.md, color: COLORS.secondary, marginBottom: 24, lineHeight: 22 },
    fieldLabel: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.sm, color: COLORS.black, marginBottom: 8, marginTop: 4 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg,
        borderRadius: SIZES.radius, paddingHorizontal: 16, height: 54, marginBottom: 18,
    },
    input: { flex: 1, fontFamily: FONTS.body, fontSize: SIZES.base, color: COLORS.black },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    addMiniBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.black,
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusPill,
    },
    addMiniBtnText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.xs, color: COLORS.white },
    emptyCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, padding: 16 },
    emptyText: { flex: 1, fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary },
    memberCard: { marginBottom: 8, padding: 14 },
    memberRow: { flexDirection: 'row', alignItems: 'center' },
    memberName: { fontFamily: FONTS.headingMedium, fontSize: SIZES.md, color: COLORS.black },
    memberMeta: { fontFamily: FONTS.body, fontSize: SIZES.xs, color: COLORS.secondary, marginTop: 2 },
    removeBtn: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center', justifyContent: 'center',
    },
    // Connect
    connectBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg,
        borderRadius: SIZES.radiusLG, padding: 18, marginBottom: 14, gap: 14,
    },
    connectBtnDone: { backgroundColor: COLORS.meTime },
    connectTextWrap: { flex: 1 },
    connectTitle: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.base, color: COLORS.black },
    connectDesc: { fontFamily: FONTS.body, fontSize: SIZES.xs, color: COLORS.secondary, marginTop: 2 },
    // Budget
    budgetCard: { alignItems: 'center', marginBottom: 16, padding: 20 },
    budgetLabel: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.sm, color: COLORS.secondary, marginBottom: 8 },
    budgetInputRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: SIZES.radius, paddingHorizontal: 16, marginBottom: 8,
    },
    currencySymbol: { fontFamily: FONTS.heading, fontSize: SIZES.xxl, color: COLORS.black, marginRight: 4 },
    budgetInput: {
        fontFamily: FONTS.heading, fontSize: 32, color: COLORS.black,
        paddingVertical: 10, minWidth: 100, textAlign: 'center',
    },
    budgetHint: { fontFamily: FONTS.body, fontSize: SIZES.xs, color: COLORS.secondary, textAlign: 'center' },
    featurePreview: { marginBottom: 16, padding: 18 },
    previewTitle: { fontFamily: FONTS.headingMedium, fontSize: SIZES.base, color: COLORS.black, marginBottom: 12 },
    previewItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
    previewText: { flex: 1, fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.black, lineHeight: 18 },
    quoteCard: { marginBottom: 16, padding: 16 },
    quoteText: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.black, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },
    navRow: { flexDirection: 'row', marginTop: 32 },
    // Modal inputs
    modalLabel: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.sm, color: COLORS.black, marginBottom: 8, marginTop: 14 },
    modalInput: {
        backgroundColor: COLORS.inputBg, borderRadius: SIZES.radius,
        paddingHorizontal: 16, height: 50, fontFamily: FONTS.body,
        fontSize: SIZES.base, color: COLORS.black,
    },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 10, borderRadius: SIZES.radiusPill,
        backgroundColor: COLORS.inputBg, flexDirection: 'row', alignItems: 'center', gap: 6,
    },
    chipActive: { backgroundColor: COLORS.black },
    chipText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.sm, color: COLORS.black },
    chipTextActive: { color: COLORS.white },
});
