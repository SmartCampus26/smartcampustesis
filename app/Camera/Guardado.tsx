//SavedScreen: Pantalla de galería de fotos guardadas
// Importación de React
import React from 'react';
// Componentes básicos de React Native
import { StyleSheet, View, Text, FlatList, Image } from 'react-native';
// Evita que el contenido se superponga con el notch o barras del sistema
import { SafeAreaView } from 'react-native-safe-area-context';
// Ícono de cámara para el estado vacío
import { Camera } from 'lucide-react-native';
// Hook y tipo desde el contexto de fotos guardadas
import { useSaved, SavedPhoto } from '../Camera/context/SavedContext';


/**
 * PANTALLA DE FOTOS GUARDADAS
 * 
 * Función:
 * - Muestra las fotos guardadas en forma de galería (2 columnas).
 * - Obtiene la información desde un contexto global.
 * - Si no existen fotos, muestra un mensaje informativo.
 */
export default function SavedScreen() {
  // Accede a las fotos guardadas desde el contexto
  const { savedPhotos } = useSaved();

  // Renderiza cada imagen dentro del grid
  const renderItem = ({ item }: { item: SavedPhoto }) => {
    return (
      <View style={styles.card}>
        <Image 
          source={{ uri: item.uri }} // URI local de la imagen
          style={styles.photo}
          resizeMode="cover"  // Ajusta la imagen sin deformarla
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ===== ENCABEZADO ====== */}
      {/* título y contador */}
      <View style={styles.header}>
        <Text style={styles.title}>Ftos guardadas</Text>
        <Text style={styles.subtitle}>{savedPhotos.length} fotos guardadas</Text>
      </View>

      {/* ==== CONTENIDO PRINCIPAL ====== */}
      {/* Estado vacío o grid de fotos */}
      {savedPhotos.length === 0 ? (
        /* Estado vacío: no hay fotos guardadas */
        <View style={styles.emptyContainer}>
          <Camera size={80} color="#93C5FD" strokeWidth={1} />
          <Text style={styles.emptyText}>Hora de empezar no?</Text>
          <Text style={styles.emptySubtext}>
            Toma una foto y desliza a la izquierda para guardarla
          </Text>
        </View>
      ) : (
        /* Galería de fotos en formato grid (2 columnas) */
        <FlatList
          data={savedPhotos} // Lista de fotos
          renderItem={renderItem} // Cómo se muestra cada foto
          keyExtractor={(item) => item.id.toString()} // Identificador único
          numColumns={2} // Dos columnas
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.08)',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '500',
  },
  
  // Estilos para pantalla vacía
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6366F1',
    marginTop: 24,
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#CBD5E1',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Estilos para el grid de fotos
  grid: {
    padding: 20,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    aspectRatio: 0.75,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});