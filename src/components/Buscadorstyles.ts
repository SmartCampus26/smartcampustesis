// 🎨 Buscadorstyles.ts
// Estilos centralizados para el listado de personal (ListadoMaxAutoridad).
// Organizado por secciones: layout, header, búsqueda, filtros, tarjetas, toast y modal.

import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({

  // ─── Layout general ──────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8B9BA8',
  },

  // ─── Encabezado ───────────────────────────────────────────────────────────────
  header: {
    backgroundColor: '#2F455C',
    padding: 24,
    paddingTop: 15,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#21D0B2',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B9BA8',
  },

  // ─── Buscador ─────────────────────────────────────────────────────────────────
  searchContainer: {
    padding: 20,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2F455C',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },

  // ─── Filtros ──────────────────────────────────────────────────────────────────
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E1E8ED',
  },
  filterButtonActive: {
    backgroundColor: '#21D0B2',
    borderColor: '#21D0B2',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F455C',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },

  // ─── Lista ────────────────────────────────────────────────────────────────────
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F455C',
    marginTop: 16,
    marginBottom: 12,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#8B9BA8',
    marginTop: 40,
  },

  // ─── Tarjetas ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Borde izquierdo diferenciador por tipo
  usuarioCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  empleadoCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD93D',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 8,
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B9BA8',
    width: 100,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#2F455C',
  },

  // ─── Badges (etiquetas de rol / cargo / departamento) ─────────────────────────
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeAutoridad: {
    backgroundColor: '#FF6B6B20',
  },
  badgeDocente: {
    backgroundColor: '#4ECDC420',
  },
  badgeDepartamento: {
    backgroundColor: '#FFD93D20',
  },
  badgeJefe: {
    backgroundColor: '#9B59B620',
  },
  badgeEmpleado: {
    backgroundColor: '#95A5A620',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F455C',
  },

  // ─── Botón eliminar ───────────────────────────────────────────────────────────
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },

  // ─── Toast ────────────────────────────────────────────────────────────────────
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    top: 80,
    transform: [{ translateY: -30 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  toastSuccess: {
    backgroundColor: '#0d1f1a',
    borderColor: '#2dc653',
  },
  toastError: {
    backgroundColor: '#1a1a2e',
    borderColor: '#E6B239',
  },
  toastInfo: {
    backgroundColor: '#0f1623',
    borderColor: '#4895ef',
  },
  toastDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toastText: {
    color: '#f1f1f1',
    fontSize: 14,
    fontWeight: '500',
  },

  // ─── Modal de confirmación ────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#4a5568',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalBold: {
    fontWeight: 'bold',
    color: '#2F455C',
  },
  modalRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E1E8ED',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: '#8B9BA8',
    fontWeight: '600',
    fontSize: 15,
  },
  modalBtnDelete: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#e63946',
    alignItems: 'center',
  },
  modalBtnDeleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
})