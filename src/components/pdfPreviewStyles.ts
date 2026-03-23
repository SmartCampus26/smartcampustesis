/**
 * pdfPreviewStyles.ts
 *
 * Estilos de la pantalla PdfPreview (previsualización del PDF General
 * para jefes de área).
 *
 * Ubicación: src/components/ (capa de estilos/presentación)
 */

import { StyleSheet } from 'react-native'

export const pdfPreviewStyles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#f8fafc' },
  scroll:     { padding: 18, paddingBottom: 40 },
  centrado:   { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8fafc' },
  cargandoText: { marginTop: 14, fontSize: 15, color: '#6b7280' },
  errorText:    { marginTop: 14, fontSize: 15, color: '#EF4444', textAlign: 'center', lineHeight: 22 },

  // Encabezado
  header: {
    alignItems: 'center', backgroundColor: '#fff', borderRadius: 14,
    padding: 22, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  headerTitulo: { fontSize: 16, fontWeight: '700', color: '#1e3a5f', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  headerSub:    { fontSize: 13, color: '#059669', fontWeight: '600', marginTop: 5, textAlign: 'center' },
  headerFecha:  { fontSize: 11, color: '#9ca3af', marginTop: 3 },
  deptBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginTop: 10,
  },
  deptText: { fontSize: 13, color: '#1e40af', fontWeight: '600' },

  // Secciones
  seccion: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  seccionTitulo: {
    fontSize: 13, fontWeight: '700', color: '#1e3a5f',
    marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Stats grid
  statsGrid:    { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statCard:     { flex: 1, backgroundColor: '#f9fafb', borderRadius: 8, padding: 10, alignItems: 'center', borderLeftWidth: 3 },
  statNum:      { fontSize: 22, fontWeight: '800' },
  statLbl:      { fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 },
  statEmpleados: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f5f3ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7,
  },
  statEmpleadosText: { fontSize: 13, color: '#8B5CF6', fontWeight: '600' },

  // Lista de empleados
  filaEmpleado:   { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  empleadoLeft:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar:         { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e40af', justifyContent: 'center', alignItems: 'center', marginRight: 10, flexShrink: 0 },
  avatarText:     { color: '#fff', fontWeight: '700', fontSize: 15 },
  empleadoInfo:   { flex: 1 },
  empleadoNombre: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  empleadoCargo:  { fontSize: 11, color: '#6b7280', marginTop: 1, textTransform: 'capitalize' },
  empleadoTotal:  { alignItems: 'center', marginLeft: 8 },
  empleadoTotalNum: { fontSize: 20, fontWeight: '800', color: '#1e40af' },
  empleadoTotalLbl: { fontSize: 9, color: '#9ca3af' },

  empleadoStatsRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  miniStat:     { flex: 0, alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, borderLeftWidth: 2 },
  miniStatNum:  { fontSize: 14, fontWeight: '800' },
  miniStatLbl:  { fontSize: 9, color: '#9ca3af', textTransform: 'uppercase' },
  progresoWrap: { flex: 1, gap: 3 },
  progresoBar:  { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  progresoFill: { height: 6, backgroundColor: '#22C55E', borderRadius: 3 },
  progresoLbl:  { fontSize: 10, color: '#6b7280' },

  sinDatos:     { alignItems: 'center', paddingVertical: 24, gap: 8 },
  sinDatosText: { color: '#9ca3af', fontSize: 14 },

  // Resultado descarga
  exitoCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0',
    borderRadius: 10, padding: 14, marginBottom: 14,
  },
  exitoTitulo: { fontSize: 14, fontWeight: '700', color: '#166534' },
  exitoNombre: { fontSize: 13, fontWeight: '600', color: '#1f2937', marginTop: 2 },
  exitoUri:    { fontSize: 10, color: '#6b7280', marginTop: 4, lineHeight: 14 },

  // Botones
  btnDescargar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#1e40af', borderRadius: 12, paddingVertical: 15, marginBottom: 10,
    shadowColor: '#1e40af', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 8, elevation: 4,
  },
  btnDescargarDisabled: { backgroundColor: '#93c5fd', elevation: 0, shadowOpacity: 0 },
  btnDescargarText:     { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnVolver:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  btnVolverText:        { color: '#6b7280', fontSize: 14, fontWeight: '500' },
})