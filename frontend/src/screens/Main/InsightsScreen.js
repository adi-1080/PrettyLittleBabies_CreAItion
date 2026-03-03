import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Animated,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../config/theme';
import GlassCard from '../../components/ui/GlassCard';
import AppButton from '../../components/ui/AppButton';
import AppModal from '../../components/ui/AppModal';

/* ─────────── Fade-in animation hook ─────────── */
const useFadeIn = (delay = 0) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(18)).current;
    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
        ]).start();
    }, []);
    return { opacity, transform: [{ translateY }] };
};

/* ─────────── Circular Gauge (RN text overlay, no SVG text) ─────────── */
const CircularGauge = ({ percentage = 72, size = 150, strokeWidth = 14, label }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const center = size / 2;
    const color = percentage > 75 ? '#EF4444' : percentage > 50 ? COLORS.pink2 : '#22C55E';

    return (
        <View style={{ alignItems: 'center', width: size, height: size }}>
            <Svg width={size} height={size}>
                <G rotation={-90} origin={`${center}, ${center}`}>
                    <Circle cx={center} cy={center} r={radius} stroke={COLORS.border}
                        strokeWidth={strokeWidth} fill="none" />
                    <Circle cx={center} cy={center} r={radius} stroke={color}
                        strokeWidth={strokeWidth} fill="none"
                        strokeDasharray={`${circumference}`} strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round" />
                </G>
            </Svg>
            <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontFamily: FONTS.heading, fontSize: 28, color: COLORS.black }}>
                    {percentage}%
                </Text>
                <Text style={{ fontFamily: FONTS.body, fontSize: 10, color: COLORS.secondary }}>
                    {label}
                </Text>
            </View>
        </View>
    );
};

/* ─────────── Bar chart — FIXED layout ─────────── */
const BarChart = ({ data }) => {
    const maxVal = Math.max(...data.map((d) => d.value));
    return (
        <View style={styles.barChart}>
            {data.map((item, i) => (
                <View key={i} style={styles.barCol}>
                    <Text style={styles.barValue}>{item.value}</Text>
                    <View style={styles.barTrack}>
                        <View style={[styles.barFill, {
                            height: `${(item.value / maxVal) * 100}%`,
                            backgroundColor: item.color || COLORS.pink1,
                        }]} />
                    </View>
                    <Text style={styles.barLabel}>{item.label}</Text>
                </View>
            ))}
        </View>
    );
};

/* ─────────── DATA ─────────── */
const CHORES_DATA = [
    { label: 'Mon', value: 8, color: COLORS.pink1 },
    { label: 'Tue', value: 12, color: COLORS.pink2 },
    { label: 'Wed', value: 6, color: COLORS.yellow1 },
    { label: 'Thu', value: 14, color: COLORS.pink1 },
    { label: 'Fri', value: 10, color: COLORS.pink2 },
    { label: 'Sat', value: 4, color: COLORS.yellow1 },
    { label: 'Sun', value: 3, color: COLORS.meTime },
];

const EQUITY_DATA = [
    { label: 'Meal Planning', you: 90, partner: 10 },
    { label: 'School Logistics', you: 75, partner: 25 },
    { label: 'Grocery', you: 60, partner: 40 },
    { label: 'Meds/Health', you: 85, partner: 15 },
    { label: 'Homework Help', you: 45, partner: 55 },
];

const WORK_STATS = [
    { label: 'Meetings today', value: '4', icon: 'video', color: '#E8E8FF' },
    { label: 'Focus blocks', value: '2 hrs', icon: 'shield', color: COLORS.meTime },
    { label: 'PRs pending', value: '3', icon: 'git-pull-request', color: COLORS.yellow2 },
    { label: 'Slack unread', value: '12', icon: 'message-square', color: COLORS.pink2 },
];

/* ─────── Micro-Finance Auditor: UPI Transactions ─────── */
const UPI_TRANSACTIONS = [
    { id: 'u1', payer: 'You', method: 'GPay', to: 'BigBasket', amount: 1240, category: 'Groceries', date: 'Mar 1', icon: 'shopping-cart', color: COLORS.yellow1 },
    { id: 'u2', payer: 'Rohit', method: 'PhonePe', to: 'Petrol Pump HP', amount: 3200, category: 'Transport', date: 'Mar 1', icon: 'truck', color: COLORS.pink1 },
    { id: 'u3', payer: 'You', method: 'GPay', to: 'Apollo Pharmacy', amount: 2100, category: 'Medicines', date: 'Mar 2', icon: 'heart', color: COLORS.pink2 },
    { id: 'u4', payer: 'You', method: 'Paytm', to: 'Zepto', amount: 680, category: 'Groceries', date: 'Mar 2', icon: 'zap', color: COLORS.meTime },
    { id: 'u5', payer: 'Rohit', method: 'Cash', to: 'Sunita (Maid)', amount: 6000, category: 'Staff Salary', date: 'Mar 3', icon: 'user', color: COLORS.yellow2 },
    { id: 'u6', payer: 'You', method: 'GPay', to: 'DPS School Portal', amount: 1650, category: 'School', date: 'Mar 3', icon: 'book', color: '#E8E8FF' },
    { id: 'u7', payer: 'You', method: 'Amazon Pay', to: 'Amazon.in', amount: 860, category: 'School Supplies', date: 'Mar 3', icon: 'book-open', color: COLORS.pink1 },
    { id: 'u8', payer: 'Rohit', method: 'PhonePe', to: 'Swiggy', amount: 520, category: 'Food', date: 'Mar 3', icon: 'coffee', color: COLORS.yellow1 },
    { id: 'u9', payer: 'You', method: 'GPay', to: 'Lata (Cook)', amount: 4500, category: 'Staff Salary', date: 'Mar 3', icon: 'coffee', color: COLORS.meTime },
    { id: 'u10', payer: 'You', method: 'Paytm', to: 'Electricity Bill', amount: 2800, category: 'Utilities', date: 'Mar 2', icon: 'zap', color: COLORS.yellow2 },
];

const REFLECTIONS = [
    { id: 'r1', icon: 'clock', title: '12 hours saved this week', desc: 'Eva handled scheduling, vendor calls, cart prep, and maid coordination autonomously.', color: COLORS.meTime },
    { id: 'r2', icon: 'check-circle', title: '23 tasks completed', desc: '10 by you • 7 delegated to partner • 6 auto-handled by Eva agents', color: COLORS.yellow2 },
    { id: 'r3', icon: 'briefcase', title: '8 work tasks shipped', desc: 'Sprint review ✓ | Client report ✓ | 3 PRs reviewed ✓ | Investor deck 60% done', color: '#E8E8FF' },
    { id: 'r4', icon: 'heart', title: '4 hrs Me-Time protected', desc: 'Eva declined 3 meeting invites and blocked 4 focus hours for you 🎉', color: COLORS.pink1 },
    { id: 'r5', icon: 'zap', title: '6 tasks auto-delegated', desc: 'Eva detected your "Q3 Pitch Week" and shifted 6 home tasks off your plate.', color: COLORS.pink2 },
];

/* ═══════════════════════════════════════════════════ */
export default function InsightsScreen() {
    const [showLedger, setShowLedger] = useState(false);
    const [showFirewall, setShowFirewall] = useState(false);
    const [firewallDeployed, setFirewallDeployed] = useState(false);
    const [txFilter, setTxFilter] = useState('all'); // 'all','you','partner'

    // Animated sections
    const headerAnim = useFadeIn(0);
    const workPulseAnim = useFadeIn(100);
    const gaugeAnim = useFadeIn(200);
    const chartAnim = useFadeIn(300);
    const financeAnim = useFadeIn(400);

    // Compute finance summary
    const yourTotal = UPI_TRANSACTIONS.filter(t => t.payer === 'You').reduce((s, t) => s + t.amount, 0);
    const partnerTotal = UPI_TRANSACTIONS.filter(t => t.payer === 'Rohit').reduce((s, t) => s + t.amount, 0);
    const grandTotal = yourTotal + partnerTotal;

    const filteredTx = txFilter === 'all' ? UPI_TRANSACTIONS
        : txFilter === 'you' ? UPI_TRANSACTIONS.filter(t => t.payer === 'You')
            : UPI_TRANSACTIONS.filter(t => t.payer === 'Rohit');

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View style={[styles.header, headerAnim]}>
                    <Text style={styles.title}>Insights</Text>
                    <Text style={styles.subtitle}>Your Mental Load Dashboard</Text>
                </Animated.View>

                {/* Quote */}
                <Animated.View style={headerAnim}>
                    <GlassCard color={COLORS.yellow2} style={styles.quoteCard}>
                        <Text style={styles.quoteText}>
                            "The most powerful woman in the room isn't the one doing everything — she's the one whose system handles the rest."
                        </Text>
                    </GlassCard>
                </Animated.View>

                {/* Work Pulse */}
                <Animated.View style={workPulseAnim}>
                    <Text style={styles.sectionTitle}>Today's Work Pulse</Text>
                    <View style={styles.workGrid}>
                        {WORK_STATS.map((stat, i) => (
                            <GlassCard key={i} color={stat.color} style={styles.workStatCard}>
                                <Feather name={stat.icon} size={16} color={COLORS.black} />
                                <Text style={styles.workStatValue}>{stat.value}</Text>
                                <Text style={styles.workStatLabel}>{stat.label}</Text>
                            </GlassCard>
                        ))}
                    </View>
                </Animated.View>

                {/* Cognitive Load Gauge */}
                <Animated.View style={gaugeAnim}>
                    <GlassCard style={styles.gaugeCard}>
                        <Text style={styles.cardTitle}>Cognitive Load Score</Text>
                        <Text style={styles.cardDesc}>
                            Weighted by decision complexity — planning a meal (3pts) counts more than chopping vegetables (1pt)
                        </Text>
                        <View style={styles.gaugeRow}>
                            <CircularGauge percentage={84} label="your load" />
                            <View style={styles.gaugeStats}>
                                <View style={styles.gaugeStat}>
                                    <Text style={styles.gaugeStatValue}>42</Text>
                                    <Text style={styles.gaugeStatLabel}>points / week</Text>
                                </View>
                                <View style={styles.gaugeStat}>
                                    <Text style={styles.gaugeStatValue}>6</Text>
                                    <Text style={styles.gaugeStatLabel}>auto-handled</Text>
                                </View>
                                <View style={styles.gaugeStat}>
                                    <Text style={[styles.gaugeStatValue, { color: '#EF4444' }]}>↑ 12%</Text>
                                    <Text style={styles.gaugeStatLabel}>vs last week</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.nudgeCard}>
                            <Feather name="alert-circle" size={14} color="#EF4444" />
                            <Text style={styles.nudgeText}>
                                Load spike detected. Eva is auto-shifting 3 non-urgent tasks to your partner and deferring 2 to next week.
                            </Text>
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* Household Equity */}
                <Animated.View style={gaugeAnim}>
                    <GlassCard style={styles.equityCard}>
                        <Text style={styles.cardTitle}>Household Equity Split</Text>
                        <Text style={styles.cardDesc}>
                            You did 84% of total cognitive home tasks last week
                        </Text>
                        {EQUITY_DATA.map((item, i) => (
                            <View key={i} style={styles.equityRow}>
                                <Text style={styles.equityLabel}>{item.label}</Text>
                                <View style={styles.equityBarTrack}>
                                    <View style={[styles.equityBarYou, { width: `${item.you}%` }]} />
                                </View>
                                <Text style={styles.equityPercent}>{item.you}%</Text>
                            </View>
                        ))}
                        <View style={styles.equityLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: COLORS.pink1 }]} />
                                <Text style={styles.legendText}>You</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: COLORS.border }]} />
                                <Text style={styles.legendText}>Partner</Text>
                            </View>
                        </View>
                    </GlassCard>
                </Animated.View>

                {/* Weekly Chart — FIXED */}
                <Animated.View style={chartAnim}>
                    <GlassCard style={styles.chartCard}>
                        <Text style={styles.cardTitle}>Weekly Task Distribution</Text>
                        <BarChart data={CHORES_DATA} />
                    </GlassCard>
                </Animated.View>

                {/* ══════ MICRO-FINANCE AUDITOR ══════ */}
                <Animated.View style={financeAnim}>
                    <Text style={styles.sectionTitle}>💰 Micro-Finance Auditor</Text>
                    <Text style={[styles.sectionSub, { paddingHorizontal: SIZES.screenPadding }]}>
                        Parsed from UPI screenshots, digital receipts & bank SMS dropped in Eva's "Dump"
                    </Text>

                    {/* Summary cards */}
                    <View style={styles.finSummaryRow}>
                        <GlassCard color={COLORS.pink1} style={styles.finSummaryCard}>
                            <Text style={styles.finSummaryLabel}>You paid</Text>
                            <Text style={styles.finSummaryAmount}>₹{yourTotal.toLocaleString('en-IN')}</Text>
                            <Text style={styles.finSummaryMeta}>{UPI_TRANSACTIONS.filter(t => t.payer === 'You').length} transactions</Text>
                        </GlassCard>
                        <GlassCard color={COLORS.yellow2} style={styles.finSummaryCard}>
                            <Text style={styles.finSummaryLabel}>Rohit paid</Text>
                            <Text style={styles.finSummaryAmount}>₹{partnerTotal.toLocaleString('en-IN')}</Text>
                            <Text style={styles.finSummaryMeta}>{UPI_TRANSACTIONS.filter(t => t.payer === 'Rohit').length} transactions</Text>
                        </GlassCard>
                    </View>

                    {/* Total household spending */}
                    <GlassCard style={styles.settlementCard}>
                        <View style={styles.settlementRow}>
                            <View style={styles.settlementLeft}>
                                <Feather name="pie-chart" size={16} color={COLORS.black} />
                                <Text style={styles.settlementLabel}>Total Household</Text>
                            </View>
                            <Text style={[styles.settlementAmount, { color: COLORS.black }]}>
                                ₹{grandTotal.toLocaleString('en-IN')}
                            </Text>
                        </View>
                        <View style={styles.equityBarTrack}>
                            <View style={[styles.equityBarYou, {
                                width: `${(yourTotal / grandTotal) * 100}%`,
                                backgroundColor: COLORS.pink1,
                            }]} />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                            <Text style={styles.finSummaryMeta}>You: {Math.round((yourTotal / grandTotal) * 100)}%</Text>
                            <Text style={styles.finSummaryMeta}>Rohit: {Math.round((partnerTotal / grandTotal) * 100)}%</Text>
                        </View>
                    </GlassCard>

                    {/* Recent transactions preview */}
                    <GlassCard style={styles.txListCard}>
                        <View style={styles.txHeaderRow}>
                            <Text style={styles.txHeaderTitle}>Recent Transactions</Text>
                            <TouchableOpacity onPress={() => setShowLedger(true)} style={styles.txViewAllBtn}>
                                <Text style={styles.txViewAllText}>View All</Text>
                                <Feather name="arrow-right" size={14} color={COLORS.black} />
                            </TouchableOpacity>
                        </View>
                        {UPI_TRANSACTIONS.slice(0, 5).map((tx) => (
                            <View key={tx.id} style={styles.txRow}>
                                <View style={[styles.txIcon, { backgroundColor: tx.color }]}>
                                    <Feather name={tx.icon} size={13} color={COLORS.black} />
                                </View>
                                <View style={styles.txContent}>
                                    <Text style={styles.txTo}>{tx.to}</Text>
                                    <Text style={styles.txMeta}>
                                        {tx.payer} • {tx.method} • {tx.date}
                                    </Text>
                                </View>
                                <Text style={styles.txAmount}>-₹{tx.amount.toLocaleString('en-IN')}</Text>
                            </View>
                        ))}
                        <AppButton title="Open Full Ledger" icon="file-text" variant="outline"
                            onPress={() => setShowLedger(true)}
                            textStyle={{ fontSize: SIZES.sm }} style={{ marginTop: 10 }} />
                    </GlassCard>
                </Animated.View>

                {/* Reflections */}
                <Text style={styles.sectionTitle}>Weekly Reflections</Text>
                {REFLECTIONS.map((item, i) => (
                    <Animated.View key={item.id} style={useFadeIn(450 + i * 80)}>
                        <GlassCard color={item.color} style={styles.reflectionCard}>
                            <View style={styles.reflectionRow}>
                                <View style={styles.reflectionIcon}>
                                    <Feather name={item.icon} size={18} color={COLORS.black} />
                                </View>
                                <View style={styles.reflectionContent}>
                                    <Text style={styles.reflectionTitle}>{item.title}</Text>
                                    <Text style={styles.reflectionDesc}>{item.desc}</Text>
                                </View>
                            </View>
                        </GlassCard>
                    </Animated.View>
                ))}

                {/* Emergency Firewall */}
                <Text style={styles.sectionTitle}>Emergency Mode</Text>
                <View style={styles.firewallCard}>
                    <View style={styles.firewallContent}>
                        <Feather name="shield" size={28} color="#EF4444" />
                        <Text style={styles.firewallTitle}>The Corporate Firewall</Text>
                        <Text style={styles.firewallDesc}>
                            Sick child? Home emergency? One tap to: auto-cancel next 48hrs of meetings,
                            draft Slack handover notes, notify school, and alert your partner.
                        </Text>
                    </View>
                    <AppButton
                        title={firewallDeployed ? 'Firewall Active ✓' : 'Deploy Emergency Mode'}
                        icon="alert-triangle"
                        variant="primary"
                        onPress={() => setShowFirewall(true)}
                        style={{ backgroundColor: firewallDeployed ? '#22C55E' : '#EF4444' }}
                    />
                </View>

                {/* Bottom quote */}
                <GlassCard color={COLORS.pink1} style={styles.bottomQuote}>
                    <Text style={styles.quoteText}>
                        "A mother's work is real work. Now it's finally tracked, measured, and respected."
                    </Text>
                </GlassCard>
            </ScrollView>

            {/* ═══════ FULL LEDGER MODAL ═══════ */}
            <AppModal visible={showLedger} onClose={() => setShowLedger(false)}
                title="Micro-Finance Ledger" subtitle="All payments extracted from UPI & receipts" fullHeight>
                {/* Filter pills */}
                <View style={styles.txFilterRow}>
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'you', label: 'Your Payments' },
                        { key: 'partner', label: "Rohit's Payments" },
                    ].map((f) => (
                        <TouchableOpacity key={f.key}
                            style={[styles.txFilterPill, txFilter === f.key && styles.txFilterPillActive]}
                            onPress={() => setTxFilter(f.key)}>
                            <Text style={[styles.txFilterText, txFilter === f.key && styles.txFilterTextActive]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Summary */}
                <GlassCard color={COLORS.yellow2} style={{ marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={styles.finSummaryLabel}>Total</Text>
                            <Text style={styles.finSummaryAmount}>
                                ₹{filteredTx.reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.finSummaryLabel}>{filteredTx.length} payments</Text>
                            <Text style={styles.finSummaryMeta}>This month</Text>
                        </View>
                    </View>
                </GlassCard>

                {/* Full transaction list */}
                {filteredTx.map((tx) => (
                    <View key={tx.id} style={styles.txRowFull}>
                        <View style={[styles.txIcon, { backgroundColor: tx.color }]}>
                            <Feather name={tx.icon} size={13} color={COLORS.black} />
                        </View>
                        <View style={styles.txContent}>
                            <Text style={styles.txTo}>{tx.to}</Text>
                            <Text style={styles.txMeta}>{tx.category} • {tx.method}</Text>
                            <Text style={styles.txMetaSub}>{tx.payer} • {tx.date}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.txAmount}>-₹{tx.amount.toLocaleString('en-IN')}</Text>
                            <View style={[styles.txPayerBadge, { backgroundColor: tx.payer === 'You' ? COLORS.pink1 : COLORS.yellow2 }]}>
                                <Text style={styles.txPayerBadgeText}>{tx.payer}</Text>
                            </View>
                        </View>
                    </View>
                ))}

                {/* Total summary */}
                <GlassCard color={COLORS.meTime} style={{ marginTop: 16, marginBottom: 8 }}>
                    <Text style={{ fontFamily: FONTS.headingMedium, fontSize: SIZES.base, color: COLORS.black, textAlign: 'center' }}>
                        Total Household Spending
                    </Text>
                    <Text style={{ fontFamily: FONTS.heading, fontSize: SIZES.xxl, color: COLORS.black, textAlign: 'center', marginTop: 6 }}>
                        ₹{grandTotal.toLocaleString('en-IN')}
                    </Text>
                    <Text style={{ fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, textAlign: 'center', marginTop: 4 }}>
                        You: ₹{yourTotal.toLocaleString('en-IN')} • Rohit: ₹{partnerTotal.toLocaleString('en-IN')}
                    </Text>
                </GlassCard>
                <AppButton title="Close Ledger" icon="x" variant="outline"
                    onPress={() => setShowLedger(false)} style={{ marginTop: 8 }} />
            </AppModal>

            {/* ═══════ EMERGENCY FIREWALL MODAL ═══════ */}
            <AppModal visible={showFirewall} onClose={() => setShowFirewall(false)}
                title="Emergency Mode" subtitle="One tap to handle everything">
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Feather name="shield" size={40} color="#EF4444" />
                    <Text style={{ fontFamily: FONTS.heading, fontSize: SIZES.xl, color: COLORS.black, marginTop: 12 }}>Activate Corporate Firewall?</Text>
                    <Text style={{ fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
                        This will automatically perform the following actions:
                    </Text>
                </View>
                {[
                    { icon: 'calendar', text: 'Cancel next 48 hours of meetings' },
                    { icon: 'message-square', text: 'Draft Slack handover notes to team' },
                    { icon: 'mail', text: 'Send OOO email to stakeholders' },
                    { icon: 'book', text: 'Notify school about child absence' },
                    { icon: 'user', text: 'Alert partner & family members' },
                    { icon: 'phone', text: 'Message domestic staff re: schedule change' },
                ].map((action, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.conflict, alignItems: 'center', justifyContent: 'center' }}>
                            <Feather name={action.icon} size={14} color="#EF4444" />
                        </View>
                        <Text style={{ flex: 1, fontFamily: FONTS.body, fontSize: SIZES.md, color: COLORS.black }}>{action.text}</Text>
                    </View>
                ))}
                <AppButton title="Deploy Now" icon="zap" variant="primary"
                    onPress={() => { setFirewallDeployed(true); setShowFirewall(false); }}
                    style={{ marginTop: 20, backgroundColor: '#EF4444' }} />
                <AppButton title="Cancel" icon="x" variant="ghost"
                    onPress={() => setShowFirewall(false)} style={{ marginTop: 8 }} />
            </AppModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    scrollContent: { paddingTop: 60, paddingBottom: 100 },
    header: { paddingHorizontal: SIZES.screenPadding, marginBottom: 16 },
    title: { fontFamily: FONTS.heading, fontSize: SIZES.xxl, color: COLORS.black },
    subtitle: { fontFamily: FONTS.body, fontSize: SIZES.md, color: COLORS.secondary, marginTop: 4 },
    sectionTitle: {
        fontFamily: FONTS.headingMedium, fontSize: SIZES.lg, color: COLORS.black,
        paddingHorizontal: SIZES.screenPadding, marginBottom: 6, marginTop: 8,
    },
    sectionSub: {
        fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary,
        marginBottom: 14, lineHeight: 18,
    },
    // Quote
    quoteCard: { marginHorizontal: SIZES.screenPadding, marginBottom: 16, padding: 16 },
    bottomQuote: { marginHorizontal: SIZES.screenPadding, marginBottom: 16, marginTop: 8, padding: 16 },
    quoteText: { fontFamily: FONTS.headingLight || FONTS.body, fontSize: SIZES.sm, color: COLORS.black, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },
    // Work stats
    workGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SIZES.screenPadding, gap: 10, marginBottom: 16 },
    workStatCard: { width: '47%', alignItems: 'center', padding: 14 },
    workStatValue: { fontFamily: FONTS.heading, fontSize: SIZES.xl, color: COLORS.black, marginTop: 6 },
    workStatLabel: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.secondary, marginTop: 2, textAlign: 'center' },
    // Cards common
    cardTitle: { fontFamily: FONTS.headingMedium, fontSize: SIZES.lg, color: COLORS.black, marginBottom: 4 },
    cardDesc: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, marginBottom: 16, lineHeight: 18 },
    // Gauge
    gaugeCard: { marginHorizontal: SIZES.screenPadding, marginBottom: 16 },
    gaugeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 14 },
    gaugeStats: { gap: 14 },
    gaugeStat: { alignItems: 'center' },
    gaugeStatValue: { fontFamily: FONTS.heading, fontSize: SIZES.xl, color: COLORS.black },
    gaugeStatLabel: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.secondary },
    nudgeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FEF2F2', borderRadius: SIZES.radiusSM, padding: 12 },
    nudgeText: { flex: 1, fontFamily: FONTS.body, fontSize: SIZES.sm, color: '#EF4444', lineHeight: 18 },
    // Equity
    equityCard: { marginHorizontal: SIZES.screenPadding, marginBottom: 16 },
    equityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    equityLabel: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.secondary, width: 95 },
    equityBarTrack: { flex: 1, height: 12, backgroundColor: COLORS.border, borderRadius: 6, overflow: 'hidden', marginHorizontal: 8 },
    equityBarYou: { height: '100%', backgroundColor: COLORS.pink1, borderRadius: 6 },
    equityPercent: { fontFamily: FONTS.bodyMedium, fontSize: 11, color: COLORS.black, width: 30, textAlign: 'right' },
    equityLegend: { flexDirection: 'row', gap: 16, marginTop: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontFamily: FONTS.body, fontSize: SIZES.xs, color: COLORS.secondary },
    // ═══ Bar Chart — FIXED ═══
    chartCard: { marginHorizontal: SIZES.screenPadding, marginBottom: 16 },
    barChart: {
        flexDirection: 'row', justifyContent: 'space-around',
        alignItems: 'flex-end', height: 160, paddingTop: 10,
    },
    barCol: { alignItems: 'center', flex: 1 },
    barTrack: {
        width: 22, height: 100, backgroundColor: COLORS.inputBg,
        borderRadius: 11, justifyContent: 'flex-end', overflow: 'hidden',
    },
    barFill: { width: '100%', borderRadius: 11 },
    barValue: {
        fontFamily: FONTS.bodyMedium, fontSize: 11, color: COLORS.black,
        marginBottom: 4,
    },
    barLabel: {
        fontFamily: FONTS.bodyMedium, fontSize: 11, color: COLORS.secondary,
        marginTop: 8,
    },
    // ═══ Micro-Finance Auditor ═══
    finSummaryRow: { flexDirection: 'row', paddingHorizontal: SIZES.screenPadding, gap: 10, marginBottom: 12 },
    finSummaryCard: { flex: 1, alignItems: 'center', padding: 16 },
    finSummaryLabel: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary },
    finSummaryAmount: { fontFamily: FONTS.heading, fontSize: SIZES.xl, color: COLORS.black, marginTop: 4 },
    finSummaryMeta: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.secondary, marginTop: 2 },
    settlementCard: { marginHorizontal: SIZES.screenPadding, marginBottom: 14 },
    settlementRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    settlementLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    settlementLabel: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.md, color: COLORS.black },
    settlementAmount: { fontFamily: FONTS.heading, fontSize: SIZES.xl },
    // Transaction list
    txListCard: { marginHorizontal: SIZES.screenPadding, marginBottom: 16 },
    txHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    txHeaderTitle: { fontFamily: FONTS.headingMedium, fontSize: SIZES.md, color: COLORS.black },
    txViewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    txViewAllText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.sm, color: COLORS.black },
    txRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    txRowFull: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    txIcon: {
        width: 34, height: 34, borderRadius: 17,
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    txContent: { flex: 1 },
    txTo: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.md, color: COLORS.black },
    txMeta: { fontFamily: FONTS.body, fontSize: SIZES.xs, color: COLORS.secondary, marginTop: 1 },
    txMetaSub: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.secondary, marginTop: 1 },
    txAmount: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.md, color: COLORS.black },
    txPayerBadge: {
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: SIZES.radiusPill, marginTop: 4,
    },
    txPayerBadgeText: { fontFamily: FONTS.body, fontSize: 9, color: COLORS.black },
    // Modal filter
    txFilterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    txFilterPill: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: SIZES.radiusPill,
        backgroundColor: COLORS.inputBg,
    },
    txFilterPillActive: { backgroundColor: COLORS.black },
    txFilterText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.sm, color: COLORS.black },
    txFilterTextActive: { color: COLORS.white },
    // Reflections
    reflectionCard: { marginHorizontal: SIZES.screenPadding, marginBottom: 10 },
    reflectionRow: { flexDirection: 'row', alignItems: 'center' },
    reflectionIcon: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    reflectionContent: { flex: 1 },
    reflectionTitle: { fontFamily: FONTS.headingMedium, fontSize: SIZES.md, color: COLORS.black },
    reflectionDesc: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, marginTop: 2, lineHeight: 17 },
    // Firewall
    firewallCard: {
        marginHorizontal: SIZES.screenPadding, marginBottom: 16,
        borderWidth: 1.5, borderColor: '#EF4444', borderStyle: 'dashed',
        borderRadius: SIZES.radiusLG, padding: SIZES.cardPadding,
        backgroundColor: COLORS.white,
    },
    firewallContent: { alignItems: 'center', marginBottom: 16 },
    firewallTitle: { fontFamily: FONTS.heading, fontSize: SIZES.xl, color: COLORS.black, marginTop: 10 },
    firewallDesc: { fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary, textAlign: 'center', marginTop: 6, lineHeight: 18 },
});
