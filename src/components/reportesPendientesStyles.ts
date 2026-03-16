import { StyleSheet } from 'react-native'

// Paleta centralizada
const C = {
  bg:           '#0F1E2E',
  card:         '#162535',
  cardBorder:   '#1E3448',
  surface:      '#1C3045',
  surfaceAlt:   '#243D55',
  accent:       '#1DCDFE',
  accentDim:    '#0E7A96',
  mint:         '#21D0B2',
  mintDark:     '#179A83',
  white:        '#FFFFFF',
  textPrimary:  '#E8F4FD',
  textSecondary:'#7FA8C4',
  textMuted:    '#4A7294',
  divider:      '#1A3147',
}

export const styles = StyleSheet.create({

  // ─── Layout base ────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    padding: 16,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },

  // ─── Encabezado ──────────────────────────────────────────────────────────────
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: C.white,
    marginBottom: 4,
    letterSpacing: 0.3,
  },

  // ─── Estados globales ─────────────────────────────────────────────────────
  loadingText: {
    color: C.textSecondary,
    fontSize: 15,
    marginTop: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },

  // ─── Estado vacío ────────────────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: C.textSecondary,
    fontSize: 15,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ─── Tabs ─────────────────────────────────────────────────────────────────
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabActivo: {
    backgroundColor: C.accent,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  tabTexto: {
    color: C.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  tabTextoActivo: {
    color: C.bg,
    fontWeight: '700',
    fontSize: 13,
  },

  // ─── Refresh ─────────────────────────────────────────────────────────────
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.accentDim,
    marginBottom: 16,
    alignSelf: 'flex-end',
  },
  refreshButtonText: {
    color: C.accent,
    fontWeight: '600',
    fontSize: 13,
  },

  // ─── Grid ────────────────────────────────────────────────────────────────
  reportesGrid: {
    gap: 16,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TARJETA
  // ═══════════════════════════════════════════════════════════════════════════
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    marginBottom: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  // Franja de color superior (se aplica inline con backgroundColor dinámico)
  cardAccentBar: {
    height: 3,
    width: '100%',
  },
  cardContent: {
    padding: 18,
  },

  // ─── Header: título + fecha ───────────────────────────────────────────────
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.white,
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  cardDate: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
    flexShrink: 0,
  },
  cardDescription: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 19,
    marginBottom: 14,
  },

  // ─── Divisor interno ─────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: 12,
  },

  // ─── Sección usuario ─────────────────────────────────────────────────────
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.accentDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: C.white,
    fontSize: 13,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  userName: {
    color: C.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  userEmail: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 1,
  },

  // ─── Chips de info (ubicación, objeto) ────────────────────────────────────
  infoGrid: {
    gap: 8,
    marginBottom: 14,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  infoChipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoChipContent: {
    flex: 1,
  },
  infoChipLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  infoChipText: {
    fontSize: 13,
    color: C.textPrimary,
    marginTop: 1,
    lineHeight: 17,
  },

  // ─── Fila de badges (estado + prioridad) ──────────────────────────────────
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ─── "Asignado a" ─────────────────────────────────────────────────────────
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    gap: 7,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  assigneeText: {
    color: C.textSecondary,
    fontSize: 13,
    flex: 1,
  },

  // ─── Comentario ──────────────────────────────────────────────────────────
  commentContainer: {
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: C.mint,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  commentLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.mint,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  commentText: {
    color: C.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },

  // ─── Botones de acción ────────────────────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.accentDim,
  },
  editButtonText: {
    color: C.accent,
    fontWeight: '600',
    fontSize: 13,
  },
  assignButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.mint,
  },
  assignButtonText: {
    color: C.bg,
    fontWeight: '700',
    fontSize: 13,
  },

  // ─── Formulario de edición ────────────────────────────────────────────────
  editFormContainer: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    marginTop: 4,
  },
  editForm: {
    gap: 12,
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  pickerOption: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: C.cardBorder,
    alignItems: 'center',
    backgroundColor: C.surfaceAlt,
  },
  pickerOptionSelected: {
    borderColor: C.accent,
    backgroundColor: 'rgba(29,205,254,0.12)',
  },
  pickerOptionText: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: C.accent,
    fontWeight: '700',
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: C.cardBorder,
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    backgroundColor: C.surfaceAlt,
    color: C.textPrimary,
    fontSize: 13,
    lineHeight: 19,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveButtonText: {
    color: C.bg,
    fontWeight: '700',
    fontSize: 14,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: C.surfaceAlt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  cancelButtonText: {
    color: C.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },

  // ─── Modal ────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '72%',
    borderTopWidth: 1,
    borderColor: C.cardBorder,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.surfaceAlt,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.white,
  },
  modalEmptyText: {
    textAlign: 'center',
    color: C.textSecondary,
    marginTop: 24,
    fontSize: 14,
  },

  // ─── Items colaborador en modal ───────────────────────────────────────────
  colaboradorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  colaboradorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.accentDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  colaboradorAvatarText: {
    color: C.white,
    fontWeight: '700',
    fontSize: 14,
  },
  colaboradorInfo: {
    flex: 1,
  },
  colaboradorNombre: {
    fontWeight: '600',
    color: C.textPrimary,
    fontSize: 14,
  },
  colaboradorCorreo: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 2,
  },

  // ─── Filtros futuros ──────────────────────────────────────────────────────
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: C.white,
    borderWidth: 1,
    borderColor: C.cardBorder,
    fontSize: 14,
  },
  searchInputPlaceholder: {
    color: C.textMuted,
  },

  // Estilos legacy (compatibilidad con FormularioEdicion si lo necesita)
  statusContainer: { gap: 8, marginBottom: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusLabel: { fontWeight: '600', color: C.textSecondary },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  locationContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, padding: 8, borderRadius: 8,
    marginBottom: 12, gap: 8, borderWidth: 1, borderColor: C.cardBorder,
  },
  locationInfo: { flex: 1 },
  locationLabel: { fontSize: 12, fontWeight: '600', color: C.textMuted },
  locationText: { color: C.textPrimary },
  objectContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  objectInfo: { flex: 1 },
  objectLabel: { fontSize: 12, fontWeight: '600', color: C.textMuted },
  objectText: { color: C.textPrimary },
  dateContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  dateText: { fontSize: 12, color: C.textMuted },
})

// Exportar paleta para colores dinámicos en la vista
export const colors = C