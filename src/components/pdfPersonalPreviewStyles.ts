/**
 * pdfPersonalPreviewStyles.ts
 *
 * Estilos de la pantalla PdfPersonalPreview (previsualización del PDF
 * personal del empleado con sus estadísticas y gráficos).
 *
 * Ubicación: src/components/ (capa de estilos/presentación)
 */

import { StyleSheet } from 'react-native'

export const pdfPersonalPreviewStyles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f8fafc' },
  scroll:       { padding: 18, paddingBottom: 40 },
  centrado:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8fafc' },
  cargandoText: { marginTop: 14, fontSize: 15, color: '#6b7280' },

  // Encabezado
  header: {
    alignItems: 'center', backgroundColor: '#fff', borderRadius: 14,
    padding: 22, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  headerTitulo: { fontSize: 17, fontWeight: '700', color: '#1e3a5f', textAlign: 'center', marginTop: 10, lineHeight: 24 },
  headerSub:    { fontSize: 13, color: '#059669', fontWeight: '600', marginTop: 6, textAlign: 'center' },
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
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statCard:  { flex: 1, backgroundColor: '#f9fafb', borderRadius: 8, padding: 10, alignItems: 'center', borderLeftWidth: 3 },
  statNum:   { fontSize: 22, fontWeight: '800' },
  statLbl:   { fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2, textAlign: 'center' },

  // Gráficos
  graficosRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  graficoWrap: {
    flex: 1, alignItems: 'center', backgroundColor: '#f9fafb',
    borderRadius: 12, padding: 12,
  },
  graficoTitulo: {
    fontSize: 11, color: '#6b7280', textTransform: 'uppercase',
    letterSpacing: 0.4, marginBottom: 10, textAlign: 'center',
  },

  // Leyenda
  leyendaRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 12 },
  leyendaItem:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  leyendaDot:   { width: 10, height: 10, borderRadius: 5 },
  leyendaTexto: { fontSize: 12, color: '#374151' },

  // Sin datos
  sinDatos:     { alignItems: 'center', paddingVertical: 28, gap: 8 },
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