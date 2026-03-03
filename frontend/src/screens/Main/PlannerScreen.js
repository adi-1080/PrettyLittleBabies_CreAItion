import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Alert,
    Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../config/theme';
import GlassCard from '../../components/ui/GlassCard';
import AppButton from '../../components/ui/AppButton';
import AppModal from '../../components/ui/AppModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 600;

const categoryColors = {
    School: COLORS.pink2,
    Groceries: COLORS.yellow1,
    Health: COLORS.pink1,
    Eldercare: COLORS.pink1,
    Logistics: COLORS.yellow2,
    Work: '#E8E8FF',
    Home: COLORS.yellow2,
    Office: '#E8E8FF',
};

const INITIAL_COLUMNS = {
    backlog: {
        label: 'Backlog',
        tasks: [
            {
                id: 'b1', title: 'Sort winter clothes for donation',
                category: 'Home', weight: 3, weightLabel: '⚖️ Medium',
                assignee: 'You', dueLabel: 'Flexible',
                cogNote: 'Requires decisions — keep/donate',
            },
            {
                id: 'b2', title: 'Renew car insurance — due Mar 15',
                category: 'Logistics', weight: 4, weightLabel: '🪨 Heavy',
                assignee: 'You', dueLabel: 'Mar 15',
                cogNote: 'Compare plans + paperwork',
            },
            {
                id: 'b3', title: 'Plan Rahul\'s birthday party',
                category: 'School', weight: 5, weightLabel: '🪨 Heavy',
                assignee: 'You', dueLabel: 'Mar 20',
                cogNote: 'Venue, cake, invites, games',
            },
            {
                id: 'b4', title: 'Prepare Q3 investor deck',
                category: 'Office', weight: 5, weightLabel: '🪨 Heavy',
                assignee: 'You', dueLabel: 'Mar 22',
                cogNote: 'Revenue slides + projections — need Finance inputs',
                isWork: true,
            },
        ],
    },
    thisWeek: {
        label: 'This Week',
        tasks: [
            {
                id: 'w1', title: 'Buy chart paper for art project',
                category: 'School', weight: 1, weightLabel: '🪶 Light',
                assignee: 'You', dueLabel: 'Wed',
                cogNote: 'Simple purchase',
            },
            {
                id: 'w2', title: "Refill Dad's BP meds (Telma-40)",
                category: 'Eldercare', weight: 2, weightLabel: '🪶 Light',
                assignee: 'Eva (Auto)', dueLabel: 'Thu',
                cogNote: 'Eva auto-ordering via Apollo',
                delegated: true,
            },
            {
                id: 'w3', title: 'Review Rhea\'s math homework',
                category: 'School', weight: 2, weightLabel: '⚖️ Medium',
                assignee: 'Husband', dueLabel: 'Fri',
                cogNote: 'Eva shifted to partner — your Q3 week',
                delegated: true,
            },
            {
                id: 'w4', title: 'Submit sprint review slides',
                category: 'Office', weight: 3, weightLabel: '⚖️ Medium',
                assignee: 'You', dueLabel: 'Fri',
                cogNote: 'Dev team sync — gather metrics from Jira',
                isWork: true,
            },
            {
                id: 'w5', title: '1:1 prep — Manager feedback notes',
                category: 'Office', weight: 2, weightLabel: '⚖️ Medium',
                assignee: 'You', dueLabel: 'Thu',
                cogNote: 'Compile OKR updates + blockers list',
                isWork: true,
            },
        ],
    },
    today: {
        label: 'Today',
        tasks: [
            {
                id: 't1', title: 'Grocery order — cart ready ₹340',
                category: 'Groceries', weight: 1, weightLabel: '🪶 Light',
                assignee: 'Eva (Auto)', dueLabel: '10 AM',
                cogNote: 'Merged requests, under budget',
                delegated: true,
            },
            {
                id: 't2', title: 'Pick up Rahul from school',
                category: 'School', weight: 2, weightLabel: '⚖️ Medium',
                assignee: 'Husband', dueLabel: '3:30 PM',
                cogNote: 'Husband driving near school at 3 PM',
                delegated: true,
            },
            {
                id: 't3', title: 'Sprint Planning standup',
                category: 'Office', weight: 2, weightLabel: '⚖️ Medium',
                assignee: 'You', dueLabel: '9:00 AM',
                cogNote: 'Jira board walkthrough — 15 min max',
                isWork: true,
            },
            {
                id: 't4', title: 'Review PR #438 — auth module',
                category: 'Office', weight: 3, weightLabel: '⚖️ Medium',
                assignee: 'You', dueLabel: '2:00 PM',
                cogNote: 'Security-sensitive — needs thorough review',
                isWork: true,
            },
            {
                id: 't5', title: 'Call plumber for sink repair',
                category: 'Home', weight: 2, weightLabel: '⚖️ Medium',
                assignee: 'Eva (Auto)', dueLabel: 'Today',
                cogNote: 'Eva messaging Raju in Hindi',
                delegated: true,
            },
        ],
    },
    done: {
        label: 'Done',
        tasks: [
            {
                id: 'd1', title: 'Paid electricity bill',
                category: 'Logistics', weight: 1, weightLabel: '🪶 Light',
                assignee: 'Eva (Auto)', cogNote: 'Auto-paid via saved card',
                delegated: true,
            },
            {
                id: 'd2', title: 'Submitted client report',
                category: 'Office', weight: 3, weightLabel: '⚖️ Medium',
                assignee: 'You', cogNote: 'Sent to stakeholders at 8 PM',
                isWork: true,
            },
            {
                id: 'd3', title: 'Confirmed maid leave for tomorrow',
                category: 'Home', weight: 1, weightLabel: '🪶 Light',
                assignee: 'Eva (Auto)', cogNote: 'WhatsApp sent to Sunita in Marathi',
                delegated: true,
            },
        ],
    },
};

const COLUMN_ORDER = ['backlog', 'thisWeek', 'today', 'done'];
const COLUMN_MOVE_OPTIONS = {
    backlog: ['thisWeek', 'today'],
    thisWeek: ['backlog', 'today', 'done'],
    today: ['thisWeek', 'done'],
    done: ['today'],
};

const TASK_CATEGORIES = ['School', 'Home', 'Office', 'Groceries', 'Health', 'Eldercare', 'Logistics'];
const WEIGHT_OPTIONS = [
    { key: 1, label: '🪶 Light', labelShort: 'Light' },
    { key: 3, label: '⚖️ Medium', labelShort: 'Medium' },
    { key: 5, label: '🪨 Heavy', labelShort: 'Heavy' },
];

export default function PlannerScreen() {
    const [viewMode, setViewMode] = useState('kanban');
    const [columns, setColumns] = useState(INITIAL_COLUMNS);
    const [expandedCol, setExpandedCol] = useState('today');
    const [filter, setFilter] = useState('all');
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', category: 'Home', column: 'thisWeek', weight: 3, assignee: 'You' });

    const allTasks = COLUMN_ORDER.flatMap((k) => columns[k].tasks);
    const totalWeight = allTasks.reduce((s, t) => s + t.weight, 0);
    const yourWeight = allTasks.filter((t) => t.assignee === 'You').reduce((s, t) => s + t.weight, 0);
    const delegatedCount = allTasks.filter((t) => t.delegated).length;
    const workTaskCount = allTasks.filter((t) => t.isWork).length;

    const moveTask = (taskId, fromCol, toCol) => {
        const updated = { ...columns };
        const taskIdx = updated[fromCol].tasks.findIndex((t) => t.id === taskId);
        if (taskIdx === -1) return;
        const [task] = updated[fromCol].tasks.splice(taskIdx, 1);
        updated[toCol].tasks.push(task);
        setColumns({ ...updated });
    };

    const deleteTask = (taskId, fromCol) => {
        const updated = { ...columns };
        updated[fromCol].tasks = updated[fromCol].tasks.filter((t) => t.id !== taskId);
        setColumns({ ...updated });
    };

    const addNewTask = () => {
        if (!newTask.title) return;
        const weightObj = WEIGHT_OPTIONS.find((w) => w.key === newTask.weight) || WEIGHT_OPTIONS[1];
        const isWork = newTask.category === 'Office';
        const updated = { ...columns };
        updated[newTask.column].tasks.push({
            id: 'new' + Date.now(), title: newTask.title,
            category: newTask.category, weight: newTask.weight,
            weightLabel: weightObj.label, assignee: newTask.assignee,
            dueLabel: 'TBD', cogNote: null, isWork, delegated: newTask.assignee !== 'You',
        });
        setColumns({ ...updated });
        setNewTask({ title: '', category: 'Home', column: 'thisWeek', weight: 3, assignee: 'You' });
        setShowAddTask(false);
    };

    const handleMoveTask = (task, fromCol) => {
        const options = COLUMN_MOVE_OPTIONS[fromCol];
        if (!options || options.length === 0) return;
        if (Platform.OS === 'web') {
            const toCol = options[0];
            moveTask(task.id, fromCol, toCol);
        } else {
            Alert.alert(
                'Move Task',
                `Move "${task.title}" to:`,
                options.map((opt) => ({
                    text: columns[opt].label,
                    onPress: () => moveTask(task.id, fromCol, opt),
                }))
            );
        }
    };

    const filterTasks = (tasks) => {
        if (filter === 'work') return tasks.filter((t) => t.isWork);
        if (filter === 'home') return tasks.filter((t) => !t.isWork);
        return tasks;
    };

    const TaskCard = ({ task, columnKey }) => {
        const bgColor = categoryColors[task.category] || COLORS.inputBg;
        return (
            <View style={[styles.taskCard, { backgroundColor: bgColor }]}>
                {/* Delete X */}
                <TouchableOpacity style={styles.taskDeleteBtn} onPress={() => deleteTask(task.id, columnKey)}>
                    <Feather name="x" size={14} color={COLORS.secondary} />
                </TouchableOpacity>
                {/* Header row */}
                <View style={styles.taskTop}>
                    <View style={styles.taskTagRow}>
                        <View style={[styles.taskTag, task.isWork && styles.workTag]}>
                            <Text style={styles.taskTagText}>{task.category}</Text>
                        </View>
                        {task.isWork && (
                            <View style={styles.workBadge}>
                                <Feather name="briefcase" size={9} color={COLORS.white} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.taskWeight}>{task.weightLabel}</Text>
                </View>

                {/* Title */}
                <Text style={styles.taskTitle}>{task.title}</Text>

                {/* Agent note */}
                {task.cogNote && (
                    <View style={styles.cogNoteRow}>
                        <Feather name="cpu" size={10} color={COLORS.secondary} />
                        <Text style={styles.cogNoteText}>{task.cogNote}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.taskFooter}>
                    <View style={styles.assigneeRow}>
                        <Feather
                            name={task.delegated ? 'zap' : 'user'}
                            size={11}
                            color={task.delegated ? '#22C55E' : COLORS.secondary}
                        />
                        <Text style={[styles.footerText, task.delegated && { color: '#22C55E' }]}>
                            {task.assignee}
                        </Text>
                    </View>
                    {task.dueLabel && (
                        <View style={styles.dueRow}>
                            <Feather name="clock" size={11} color={COLORS.secondary} />
                            <Text style={styles.footerText}>{task.dueLabel}</Text>
                        </View>
                    )}
                </View>

                {/* Move button */}
                {columnKey !== 'done' && (
                    <TouchableOpacity
                        style={styles.moveBtn}
                        onPress={() => handleMoveTask(task, columnKey)}
                        activeOpacity={0.7}
                    >
                        <Feather name="arrow-right" size={12} color={COLORS.white} />
                        <Text style={styles.moveBtnText}>
                            Move to {columns[COLUMN_MOVE_OPTIONS[columnKey]?.[0]]?.label || 'Next'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    // --- MOBILE KANBAN: Vertical accordion ---
    const renderMobileKanban = () => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mobileKanban}
        >
            {COLUMN_ORDER.map((colKey) => {
                const col = columns[colKey];
                const filteredTasks = filterTasks(col.tasks);
                const isExpanded = expandedCol === colKey;
                return (
                    <View key={colKey} style={styles.mobileColumn}>
                        <TouchableOpacity
                            style={styles.mobileColHeader}
                            onPress={() => setExpandedCol(isExpanded ? null : colKey)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.mobileColHeaderLeft}>
                                <Feather
                                    name={isExpanded ? 'chevron-down' : 'chevron-right'}
                                    size={16}
                                    color={COLORS.black}
                                />
                                <Text style={styles.mobileColLabel}>{col.label}</Text>
                                <View style={styles.colBadge}>
                                    <Text style={styles.colBadgeText}>{filteredTasks.length}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {isExpanded && (
                            <View style={styles.mobileColTasks}>
                                {filteredTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} columnKey={colKey} />
                                ))}
                                {filteredTasks.length === 0 && (
                                    <Text style={styles.emptyCol}>No tasks here</Text>
                                )}
                            </View>
                        )}
                    </View>
                );
            })}
        </ScrollView>
    );

    // --- Desktop Kanban: Horizontal columns ---
    const renderDesktopKanban = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.desktopKanban}
            decelerationRate="fast"
        >
            {COLUMN_ORDER.map((colKey) => {
                const col = columns[colKey];
                const filteredTasks = filterTasks(col.tasks);
                return (
                    <View key={colKey} style={styles.desktopColumn}>
                        <View style={styles.desktopColHeader}>
                            <Text style={styles.desktopColLabel}>{col.label}</Text>
                            <View style={styles.colBadge}>
                                <Text style={styles.colBadgeText}>{filteredTasks.length}</Text>
                            </View>
                        </View>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.desktopColTasks}
                        >
                            {filteredTasks.map((task) => (
                                <TaskCard key={task.id} task={task} columnKey={colKey} />
                            ))}
                        </ScrollView>
                    </View>
                );
            })}
        </ScrollView>
    );

    // --- List view ---
    const renderListView = () => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
        >
            {COLUMN_ORDER.map((colKey) => {
                const col = columns[colKey];
                const filteredTasks = filterTasks(col.tasks);
                return (
                    <View key={colKey} style={styles.listSection}>
                        <View style={styles.listHeader}>
                            <Text style={styles.listHeaderText}>{col.label}</Text>
                            <View style={styles.colBadge}>
                                <Text style={styles.colBadgeText}>{filteredTasks.length}</Text>
                            </View>
                        </View>
                        {filteredTasks.map((task) => (
                            <TaskCard key={task.id} task={task} columnKey={colKey} />
                        ))}
                    </View>
                );
            })}
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={styles.title}>Planner</Text>
                    <TouchableOpacity onPress={() => setShowAddTask(true)}
                        style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center' }}>
                        <Feather name="plus" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
                <View style={styles.toggleRow}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, viewMode === 'list' && styles.toggleActive]}
                        onPress={() => setViewMode('list')}
                    >
                        <Feather name="list" size={14} color={viewMode === 'list' ? COLORS.white : COLORS.black} />
                        <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, viewMode === 'kanban' && styles.toggleActive]}
                        onPress={() => setViewMode('kanban')}
                    >
                        <Feather name="columns" size={14} color={viewMode === 'kanban' ? COLORS.white : COLORS.black} />
                        <Text style={[styles.toggleText, viewMode === 'kanban' && styles.toggleTextActive]}>Kanban</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter pills: All / Home / Work */}
            <View style={styles.filterRow}>
                {[
                    { key: 'all', label: 'All Tasks', icon: 'grid' },
                    { key: 'home', label: 'Home & Family', icon: 'home' },
                    { key: 'work', label: 'Workplace', icon: 'briefcase' },
                ].map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
                        onPress={() => setFilter(f.key)}
                        activeOpacity={0.7}
                    >
                        <Feather name={f.icon} size={12}
                            color={filter === f.key ? COLORS.white : COLORS.black} />
                        <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Cognitive Load Summary */}
            <View style={styles.loadBar}>
                <View style={styles.loadRow}>
                    <View style={styles.loadStat}>
                        <Text style={styles.loadValue}>{yourWeight}</Text>
                        <Text style={styles.loadLabel}>Your load</Text>
                    </View>
                    <View style={styles.loadDivider} />
                    <View style={styles.loadStat}>
                        <Text style={styles.loadValue}>{delegatedCount}</Text>
                        <Text style={styles.loadLabel}>Delegated</Text>
                    </View>
                    <View style={styles.loadDivider} />
                    <View style={styles.loadStat}>
                        <Text style={[styles.loadValue, { color: '#6366F1' }]}>{workTaskCount}</Text>
                        <Text style={styles.loadLabel}>Work tasks</Text>
                    </View>
                    <View style={styles.loadDivider} />
                    <View style={styles.loadStat}>
                        <Text style={styles.loadValue}>{totalWeight}</Text>
                        <Text style={styles.loadLabel}>Total</Text>
                    </View>
                </View>
            </View>

            {/* Smart Rebalancer */}
            <GlassCard color={COLORS.yellow2} style={styles.smartCta}>
                <View style={styles.smartCtaRow}>
                    <View style={styles.smartCtaIcon}>
                        <Feather name="cpu" size={13} color={COLORS.white} />
                    </View>
                    <Text style={styles.smartCtaText}>
                        <Text style={styles.smartCtaTitle}>Q3 Pitch Week detected </Text>
                        — Eva shifted 3 home tasks to your partner and auto-handled 2 via vendors.
                    </Text>
                </View>
            </GlassCard>

            {/* Board */}
            {viewMode === 'kanban'
                ? IS_MOBILE
                    ? renderMobileKanban()
                    : renderDesktopKanban()
                : renderListView()}

            {/* Add Task Modal */}
            <AppModal visible={showAddTask} onClose={() => setShowAddTask(false)}
                title="Add Task" subtitle="Add a new task to your board" fullHeight>
                <Text style={styles.mLabel}>Task title</Text>
                <TextInput style={styles.mInput} placeholder="e.g. Send invoice, Book cab for school"
                    placeholderTextColor={COLORS.secondary} value={newTask.title}
                    onChangeText={(v) => setNewTask({ ...newTask, title: v })} />

                <Text style={styles.mLabel}>Category</Text>
                <View style={styles.mChipGrid}>
                    {TASK_CATEGORIES.map((cat) => (
                        <TouchableOpacity key={cat}
                            style={[styles.mChip, newTask.category === cat && styles.mChipActive]}
                            onPress={() => setNewTask({ ...newTask, category: cat })}>
                            <Text style={[styles.mChipText, newTask.category === cat && styles.mChipTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.mLabel}>Add to column</Text>
                <View style={styles.mChipGrid}>
                    {COLUMN_ORDER.map((col) => (
                        <TouchableOpacity key={col}
                            style={[styles.mChip, newTask.column === col && styles.mChipActive]}
                            onPress={() => setNewTask({ ...newTask, column: col })}>
                            <Text style={[styles.mChipText, newTask.column === col && styles.mChipTextActive]}>
                                {columns[col].label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.mLabel}>Effort</Text>
                <View style={styles.mChipGrid}>
                    {WEIGHT_OPTIONS.map((w) => (
                        <TouchableOpacity key={w.key}
                            style={[styles.mChip, newTask.weight === w.key && styles.mChipActive]}
                            onPress={() => setNewTask({ ...newTask, weight: w.key })}>
                            <Text style={[styles.mChipText, newTask.weight === w.key && styles.mChipTextActive]}>{w.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.mLabel}>Assign to</Text>
                <View style={styles.mChipGrid}>
                    {['You', 'Husband', 'Eva (Auto)'].map((a) => (
                        <TouchableOpacity key={a}
                            style={[styles.mChip, newTask.assignee === a && styles.mChipActive]}
                            onPress={() => setNewTask({ ...newTask, assignee: a })}>
                            <Text style={[styles.mChipText, newTask.assignee === a && styles.mChipTextActive]}>{a}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <AppButton title="Add Task" icon="plus" onPress={addNewTask} style={{ marginTop: 24 }} />
            </AppModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    // Header
    header: {
        paddingHorizontal: SIZES.screenPadding, paddingTop: 60, paddingBottom: 6,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    title: { fontFamily: FONTS.heading, fontSize: SIZES.xxl, color: COLORS.black },
    toggleRow: {
        flexDirection: 'row', backgroundColor: COLORS.inputBg,
        borderRadius: SIZES.radiusPill, padding: 3,
    },
    toggleBtn: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: SIZES.radiusPill, gap: 5,
    },
    toggleActive: { backgroundColor: COLORS.black },
    toggleText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.sm, color: COLORS.black },
    toggleTextActive: { color: COLORS.white },
    // Filter
    filterRow: {
        flexDirection: 'row', paddingHorizontal: SIZES.screenPadding,
        gap: 8, marginBottom: 8, marginTop: 6,
    },
    filterPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 11, paddingVertical: 7,
        borderRadius: SIZES.radiusPill, backgroundColor: COLORS.inputBg,
    },
    filterPillActive: { backgroundColor: COLORS.black },
    filterText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.xs, color: COLORS.black },
    filterTextActive: { color: COLORS.white },
    // Load bar
    loadBar: {
        paddingHorizontal: SIZES.screenPadding, marginBottom: 8,
    },
    loadRow: {
        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
        backgroundColor: COLORS.inputBg, borderRadius: SIZES.radius, padding: 12,
    },
    loadStat: { alignItems: 'center' },
    loadValue: { fontFamily: FONTS.heading, fontSize: SIZES.lg, color: COLORS.black },
    loadLabel: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.secondary, marginTop: 1 },
    loadDivider: { width: 1, height: 24, backgroundColor: COLORS.border },
    // Smart CTA
    smartCta: { marginHorizontal: SIZES.screenPadding, marginBottom: 10, padding: 14 },
    smartCtaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    smartCtaIcon: {
        width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.black,
        alignItems: 'center', justifyContent: 'center', marginTop: 2,
    },
    smartCtaTitle: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.sm, color: COLORS.black },
    smartCtaText: {
        flex: 1, fontFamily: FONTS.body, fontSize: SIZES.sm,
        color: COLORS.secondary, lineHeight: 18,
    },
    // ------- MOBILE KANBAN -------
    mobileKanban: { paddingBottom: 100 },
    mobileColumn: {
        marginHorizontal: SIZES.screenPadding, marginBottom: 4,
    },
    mobileColHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    mobileColHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    mobileColLabel: { fontFamily: FONTS.headingMedium, fontSize: SIZES.base, color: COLORS.black },
    mobileColTasks: { paddingTop: 10, paddingBottom: 6 },
    emptyCol: {
        fontFamily: FONTS.body, fontSize: SIZES.sm, color: COLORS.secondary,
        textAlign: 'center', paddingVertical: 16,
    },
    // ------- DESKTOP KANBAN -------
    desktopKanban: { paddingHorizontal: SIZES.screenPadding, paddingBottom: 100, gap: 14 },
    desktopColumn: { width: 280 },
    desktopColHeader: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8,
    },
    desktopColLabel: { fontFamily: FONTS.headingMedium, fontSize: SIZES.md, color: COLORS.black },
    desktopColTasks: { paddingBottom: 20 },
    // Badge
    colBadge: {
        backgroundColor: COLORS.inputBg, paddingHorizontal: 8,
        paddingVertical: 2, borderRadius: SIZES.radiusPill,
    },
    colBadgeText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.xs, color: COLORS.secondary },
    // ------- TASK CARD -------
    taskCard: {
        borderRadius: SIZES.radiusLG, padding: 16,
        marginBottom: 10, ...SHADOWS.soft, position: 'relative',
    },
    taskDeleteBtn: {
        position: 'absolute', top: 8, right: 8, width: 24, height: 24,
        borderRadius: 12, alignItems: 'center', justifyContent: 'center', zIndex: 2,
    },
    taskTop: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 8,
    },
    taskTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    taskTag: {
        backgroundColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 8,
        paddingVertical: 3, borderRadius: SIZES.radiusPill,
    },
    workTag: { backgroundColor: 'rgba(99,102,241,0.15)' },
    taskTagText: {
        fontFamily: FONTS.bodyMedium, fontSize: 10,
        color: COLORS.black, textTransform: 'uppercase', letterSpacing: 0.5,
    },
    workBadge: {
        width: 18, height: 18, borderRadius: 9, backgroundColor: '#6366F1',
        alignItems: 'center', justifyContent: 'center',
    },
    taskWeight: { fontFamily: FONTS.body, fontSize: SIZES.xs, color: COLORS.secondary },
    taskTitle: {
        fontFamily: FONTS.headingMedium, fontSize: SIZES.md,
        color: COLORS.black, marginBottom: 4, lineHeight: 20,
    },
    cogNoteRow: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 4,
        marginBottom: 8, paddingTop: 2,
    },
    cogNoteText: {
        flex: 1, fontFamily: FONTS.body, fontSize: 11,
        color: COLORS.secondary, fontStyle: 'italic', lineHeight: 14,
    },
    taskFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    assigneeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    footerText: { fontFamily: FONTS.body, fontSize: SIZES.xs, color: COLORS.secondary },
    // Move button
    moveBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 5, marginTop: 10, backgroundColor: COLORS.black,
        paddingVertical: 8, borderRadius: SIZES.radiusSM,
    },
    moveBtnText: {
        fontFamily: FONTS.bodyMedium, fontSize: 11, color: COLORS.white,
    },
    // List
    listContent: { padding: SIZES.screenPadding, paddingBottom: 100 },
    listSection: { marginBottom: 20 },
    listHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10,
        paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    listHeaderText: { fontFamily: FONTS.headingMedium, fontSize: SIZES.md, color: COLORS.black },
    // Modal
    mLabel: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.sm, color: COLORS.black, marginBottom: 8, marginTop: 14 },
    mInput: { backgroundColor: COLORS.inputBg, borderRadius: SIZES.radius, paddingHorizontal: 16, height: 50, fontFamily: FONTS.body, fontSize: SIZES.base, color: COLORS.black },
    mChipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    mChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: SIZES.radiusPill, backgroundColor: COLORS.inputBg },
    mChipActive: { backgroundColor: COLORS.black },
    mChipText: { fontFamily: FONTS.bodyMedium, fontSize: SIZES.sm, color: COLORS.black },
    mChipTextActive: { color: COLORS.white },
});
