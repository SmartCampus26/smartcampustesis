import { StyleSheet } from 'react-native'

export const homeAutoridadStyles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#F5F7FA' },
  scrollView:         { flex: 1 },
  centeredContainer:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  header:             { backgroundColor: '#2F455C', padding: 24, paddingTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting:           { fontSize: 16, color: '#FFFFFF', opacity: 0.8 },
  username:           { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
  statsContainer:     { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  statCard:           { flex: 1, minWidth: '45%', padding: 20, borderRadius: 16, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  statNumber:         { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginTop: 8, marginBottom: 4 },
  statLabel:          { fontSize: 12, color: '#FFFFFF', opacity: 0.9, textTransform: 'uppercase', letterSpacing: 0.5 },
  createSection:      { padding: 16, paddingTop: 8 },
  createButton:       { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, elevation: 3, shadowColor: '#1DCDFE', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 },
  createButtonContent:{ flexDirection: 'row', alignItems: 'center' },
  createIcon:         { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1DCDFE', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  createTextContainer:{ flex: 1 },
  createTitle:        { fontSize: 18, fontWeight: 'bold', color: '#2F455C', marginBottom: 4 },
  createSubtitle:     { fontSize: 14, color: '#8B9BA8' },
  section:            { padding: 16 },
  sectionHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle:       { fontSize: 20, fontWeight: 'bold', color: '#2F455C' },
  seeAllText:         { fontSize: 14, color: '#1DCDFE', fontWeight: '600' },
  emptyState:         { alignItems: 'center', padding: 40, backgroundColor: '#FFFFFF', borderRadius: 16 },
  emptyText:          { fontSize: 18, fontWeight: '600', color: '#2F455C', marginTop: 16, marginBottom: 8 },
  emptySubtext:       { fontSize: 14, color: '#8B9BA8', marginBottom: 24, textAlign: 'center' },
  emptyButton:        { backgroundColor: '#1DCDFE', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  emptyButtonText:    { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  reportCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',  // ← FIX: igual que homeEmpleado
    alignItems: 'center',
    marginBottom: 12,
  },
  reportId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F455C',
    flexShrink: 1,        // ← FIX
    marginRight: 8,       // ← FIX
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexShrink: 0,        // ← FIX
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reportDesc: {
    fontSize: 14,
    color: '#2F455C',
    marginBottom: 12,
    lineHeight: 20,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportDate: {
    fontSize: 12,
    color: '#8B9BA8',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportPriority: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tipsCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F455C',
  },
  tipsText: {
    fontSize: 14,
    color: '#2F455C',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
})