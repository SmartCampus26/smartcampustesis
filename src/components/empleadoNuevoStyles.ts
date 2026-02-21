import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2F455C',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2F455C',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 12,
    fontSize: 16,
    color: '#2F455C',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  roleButtonActive: {
    backgroundColor: '#21D0B2',
    borderColor: '#21D0B2',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F455C',
    marginLeft: 8,
  },
  roleButtonTextActive: {
    color: '#FFF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#2F455C',
    marginLeft: 10,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#21D0B2',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
})