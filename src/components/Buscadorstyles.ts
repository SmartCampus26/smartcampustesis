import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
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
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
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
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#8B9BA8',
    marginTop: 40,
  },
})