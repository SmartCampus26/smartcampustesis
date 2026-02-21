import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F455C',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    padding: 24,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 32,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
  },
  errorText: {
    color: '#DC143C',
    fontSize: 18,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#D1D5DB',
    fontSize: 18,
    marginTop: 16,
  },
  reportesGrid: {
    gap: 24,
  },
  card: {
    backgroundColor: '#1DCDFE',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 192,
  },
  cardContent: {
    padding: 20,
  },
  userSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#34F5C5',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F455C',
  },
  userName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userEmail: {
    fontSize: 12,
    color: '#1a1a1a',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#1a1a1a',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21D0B2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F455C',
  },
  locationText: {
    color: 'white',
  },
  objectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  objectInfo: {
    flex: 1,
  },
  objectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F455C',
  },
  objectText: {
    color: 'white',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#1a1a1a',
  },
  statusContainer: {
    gap: 8,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontWeight: '600',
    color: '#2F455C',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  commentContainer: {
    backgroundColor: '#34F5C5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F455C',
  },
  commentText: {
    color: '#1a1a1a',
  },
  editButton: {
    backgroundColor: '#21D0B2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editForm: {
    gap: 12,
  },
  formGroup: {
    gap: 4,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F455C',
    marginBottom: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerOption: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#34F5C5',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  pickerOptionSelected: {
    backgroundColor: '#34F5C5',
  },
  pickerOptionText: {
    color: '#2F455C',
  },
  pickerOptionTextSelected: {
    fontWeight: 'bold',
  },
  textArea: {
    borderWidth: 2,
    borderColor: '#34F5C5',
    borderRadius: 8,
    padding: 8,
    minHeight: 80,
    backgroundColor: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#34F5C5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#2F455C',
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2F455C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})
