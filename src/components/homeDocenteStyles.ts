import { StyleSheet } from 'react-native'

export const homeDocenteStyles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#F5F7FA' },
  scrollView:          { flex: 1 },
  centeredContainer:   { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  header:              { backgroundColor: '#2F455C', padding: 24, paddingTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting:            { fontSize: 16, color: '#FFFFFF', opacity: 0.8 },
  username:            { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
  statsContainer:      { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  statCard:            { flex: 1, minWidth: '45%', padding: 20, borderRadius: 16, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  statNumber:          { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginTop: 8, marginBottom: 4 },
  statLabel:           { fontSize: 12, color: '#FFFFFF', opacity: 0.9, textTransform: 'uppercase', letterSpacing: 0.5 },
  createSection:       { padding: 16, paddingTop: 8 },
  createButton:        { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, elevation: 3, shadowColor: '#21D0B2', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8 },
  createButtonContent: { flexDirection: 'row', alignItems: 'center' },
  createIcon:          { width: 56, height: 56, borderRadius: 28, backgroundColor: '#21D0B2', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  createTextContainer: { flex: 1 },
  createTitle:         { fontSize: 18, fontWeight: 'bold', color: '#2F455C', marginBottom: 4 },
  createSubtitle:      { fontSize: 14, color: '#8B9BA8' },
  bottomSpacer:        { height: 100 },
})