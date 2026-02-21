import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    padding: 24,
    backgroundColor: '#2F455C',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#34F5C5',
    opacity: 0.9,
  },
  cardsContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardUsuario: {
    borderLeftWidth: 5,
    borderLeftColor: '#1DCDFE',
  },
  cardEmpleado: {
    borderLeftWidth: 5,
    borderLeftColor: '#2F455C',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 22,
  },
  cardFeatures: {
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  cardButton: {
    backgroundColor: '#1DCDFE',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2F455C',
    marginLeft: 12,
    lineHeight: 20,
  },
})