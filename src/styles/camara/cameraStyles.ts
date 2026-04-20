// ─── cameraStyles.ts ──────────────────────────────────────────────────────────
// Estilos de Camera/index.tsx
// Ubicación: src/components/cameraStyles.ts

import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#F0F9FF' },
  header:               { alignItems: 'center', paddingVertical: 18, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(29,205,254,0.15)', backgroundColor: '#FFFFFF' },
  title:                { fontSize: 34, fontWeight: '800', color: '#1DCDFE', letterSpacing: -1, marginBottom: 6 },
  subtitle:             { fontSize: 13, color: '#2F455C', fontWeight: '500', textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },
  photoCount:           { fontSize: 12, color: '#2F455C', marginTop: 8, fontWeight: '600', backgroundColor: 'rgba(52,245,197,0.1)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(33,208,178,0.2)' },
  body:                 { flex: 1 },
  emptyState:           { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 48, gap: 12 },
  emptyTitle:           { fontSize: 22, fontWeight: '700', color: '#2F455C', letterSpacing: -0.5, marginTop: 12 },
  emptySubtext:         { fontSize: 14, color: '#21D0B2', textAlign: 'center', lineHeight: 20 },
  feedbackContainer:    { position: 'absolute', top: '50%', left: 40, right: 40, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.96)', paddingVertical: 18, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(52,245,197,0.3)' },
  feedbackText:         { fontSize: 18, fontWeight: '700', color: '#21D0B2', letterSpacing: -0.3 },
  footer:               { padding: 20, alignItems: 'center', gap: 12 },
  footerRow:            { flexDirection: 'row', gap: 10, alignItems: 'center' },
  cameraButton:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1DCDFE', paddingHorizontal: 36, paddingVertical: 16, borderRadius: 18, gap: 10, shadowColor: '#1DCDFE', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8, minWidth: 190, justifyContent: 'center' },
  cameraButtonDisabled: { backgroundColor: 'rgba(29,205,254,0.3)', shadowOpacity: 0, elevation: 0 },
  buttonText:           { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  buttonTextDisabled:   { color: 'rgba(255,255,255,0.45)' },
  backButton:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#21D0B2', paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, gap: 6 },
  backText:             { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  resetButton:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2F455C', paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, gap: 6 },
  resetText:            { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  cameraOverlay:        { flex: 1, backgroundColor: 'transparent' },
  flipButton:           { position: 'absolute', top: 50, right: 24, backgroundColor: 'rgba(29,205,254,0.9)', padding: 14, borderRadius: 50 },
  cameraControls:       { position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' },
  captureButton:        { width: 84, height: 84, borderRadius: 42, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 5, borderColor: '#34F5C5' },
  captureButtonInner:   { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1DCDFE' },
  closeButton:          { position: 'absolute', top: 50, left: 24, backgroundColor: 'rgba(47,69,92,0.9)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22 },
  closeButtonText:      { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
})