// ─── reasignarEmpleadoStyles.ts ───────────────────────────────────────────────
// Estilos de ReasignarEmpleado.tsx
// Ubicación: src/components/reasignarEmpleadoStyles.ts

import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F8FAFB' },
  section:        { padding: 20 },
  sectionTitle:   { fontSize: 22, fontWeight: 'bold', color: '#2F455C', marginBottom: 4 },
  sectionSub:     { fontSize: 15, color: '#6B7280', marginBottom: 16 },
  card:           { backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  cardHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge:          { backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText:      { fontSize: 12, fontWeight: 'bold', color: '#1DCDFE' },
  desc:           { fontSize: 14, color: '#6B7280', marginBottom: 12, lineHeight: 20 },
  statusRow:      { flexDirection: 'row', gap: 8, marginBottom: 12 },
  pill:           { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pillText:       { fontSize: 11, fontWeight: '600', color: '#2F455C' },
  assigned:       { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  assignedText:   { fontSize: 14, color: '#6B7280', marginLeft: 8 },
  btnDetail:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', padding: 10, borderRadius: 12, marginBottom: 8, gap: 6 },
  btnDetailText:  { color: '#1DCDFE', fontWeight: '600', fontSize: 14 },
  btnReassign:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1DCDFE', padding: 14, borderRadius: 12, gap: 8 },
  btnReassignTxt: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  // Filtros del modal
  filterWrap:     { padding: 16, backgroundColor: 'rgba(28, 48, 69, 0.6)' },
  filterLabel:    { fontSize: 14, fontWeight: '600', color: '#FFF', marginBottom: 10 },
  filterRow:      { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  chip:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive:     { backgroundColor: '#1DCDFE', borderColor: '#1DCDFE' },
  chipText:       { fontSize: 13, fontWeight: '600', color: '#2F455C' },
  chipTextActive: { color: '#FFF' },
})