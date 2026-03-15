import { StyleSheet } from 'react-native'

// Paleta consistente con la app existente
const COLORS = {
  primary: '#21D0B2',
  primaryDark: '#1AB99D',
  primaryLight: '#E8F9F7',
  navy: '#2F455C',
  navyLight: '#4A6080',
  gray: '#8B9BA8',
  grayLight: '#F5F7FA',
  grayBorder: '#E1E8ED',
  white: '#FFFFFF',
  error: '#FF4444',
  errorLight: '#FFF0F0',
  success: '#32CD32',
  successLight: '#F0FFF0',
  warning: '#FFD700',
  warningLight: '#FFF9E6',
}

export const recuperarStyles = StyleSheet.create({
  // ── Contenedor raíz ──────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  // ── Header con botón back ────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,
    marginTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.navy,
  },

  // ── Ilustración / ícono central ──────────────────────────
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 28,
    // Sombra suave
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  // ── Textos principales ───────────────────────────────────
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.navy,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
    paddingHorizontal: 8,
  },

  // ── Formulario ───────────────────────────────────────────
  formContainer: {
    gap: 20,
    marginBottom: 8,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayLight,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.navy,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 4,
  },

  // ── Mensaje de error inline ──────────────────────────────
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 4,
  },

  // ── Banners de feedback ──────────────────────────────────
  bannerError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.errorLight,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    padding: 14,
    gap: 10,
    marginBottom: 8,
  },
  bannerSuccess: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.successLight,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    padding: 14,
    gap: 10,
    marginBottom: 8,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.navy,
  },

  // ── Botón principal ──────────────────────────────────────
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.grayBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
    marginRight: 8,
  },

  // ── Botón secundario (outlined) ──────────────────────────
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.grayBorder,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: COLORS.navyLight,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },

  // ── Card de éxito (estado correo enviado) ────────────────
  successCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#C0F0EA',
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 8,
    textAlign: 'center',
  },
  successCardSubtitle: {
    fontSize: 14,
    color: COLORS.navyLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  successCardEmail: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 6,
    textAlign: 'center',
  },

  // ── Indicador de fuerza de contraseña ───────────────────
  strengthContainer: {
    marginTop: 8,
    gap: 6,
  },
  strengthBarRow: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.grayBorder,
  },
  strengthBarActive: {
    backgroundColor: COLORS.primary,
  },
  strengthBarWeak: {
    backgroundColor: COLORS.error,
  },
  strengthBarMedium: {
    backgroundColor: COLORS.warning,
  },
  strengthLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },

  // ── Separador ────────────────────────────────────────────
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.grayBorder,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.gray,
  },

  // ── Texto de ayuda al pie ────────────────────────────────
  footerText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
})

export { COLORS }