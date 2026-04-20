import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2F455C',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B9BA8',
    textAlign: 'center',
    marginBottom: 32,
  },
  tipoUsuarioContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 4,
  },
  tipoBoton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tipoBotonActivo: {
    backgroundColor: '#21D0B2',
    shadowColor: '#21D0B2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tipoTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F455C',
  },
  tipoTextoActivo: {
    color: '#FFFFFF',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F455C',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2F455C',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 20,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  forgotText: {
    fontSize: 14,
    color: '#21D0B2',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#21D0B2',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#21D0B2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#8B9BA8',
    textAlign: 'center',
  },
})