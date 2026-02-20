// Importamos React porque estamos creando un componente funcional
import React from 'react'

// Importamos componentes básicos de React Native
import {
  ScrollView,        // Permite que la pantalla tenga scroll vertical
  StyleSheet,        // Permite crear los estilos (NO lo documentaremos abajo)
  Text,              // Componente para mostrar texto
  TouchableOpacity,  // Botón presionable con efecto de opacidad
  View,              // Contenedor similar a un <div>
} from 'react-native'

// Importamos Ionicons para usar íconos en la interfaz
import { Ionicons } from '@expo/vector-icons'

// Importamos el router de expo-router para navegar entre pantallas
import { router } from 'expo-router'


// Exportamos el componente principal llamado CrearMenu
// Este componente muestra dos tarjetas:
// 1. Crear Usuario
// 2. Crear Empleado
export default function CrearMenu() {

  // Retornamos la interfaz visual del componente
  return (

    // ScrollView permite que el contenido sea desplazable
    <ScrollView style={styles.container}>

      {/* ===================== HEADER ===================== */}
      <View style={styles.header}>

        {/* Título principal */}
        <Text style={styles.headerTitle}>
          Gestión de Accesos
        </Text>

        {/* Subtítulo explicativo */}
        <Text style={styles.headerSubtitle}>
          Selecciona el tipo de cuenta que deseas crear
        </Text>

      </View>


      {/* ===================== CONTENEDOR DE TARJETAS ===================== */}
      <View style={styles.cardsContainer}>


        {/* =======================================================
           TARJETA 1: CREAR USUARIO
           ======================================================= */}
        <TouchableOpacity
          // Se combinan dos estilos: el estilo general de card
          // y el estilo específico para usuario
          style={[styles.card, styles.cardUsuario]}

          // Cuando se presiona, navega a la pantalla UsuarioNuevo
          onPress={() => router.push('/autoridad/UsuarioNuevo')}

          // Define el nivel de transparencia al presionar
          activeOpacity={0.8}
        >

          {/* Contenedor del ícono */}
          <View style={styles.iconContainer}>
            <Ionicons 
              name="school"   // Ícono tipo escuela
              size={40}       // Tamaño del ícono
              color="#1DCDFE" // Color del ícono
            />
          </View>
          
          {/* Título de la tarjeta */}
          <Text style={styles.cardTitle}>
            Crear Usuario
          </Text>

          {/* Descripción */}
          <Text style={styles.cardDescription}>
            Docentes y autoridades del sistema educativo
          </Text>

          {/* Lista de características */}
          <View style={styles.cardFeatures}>

            {/* Característica 1 */}
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={18} color="#21D0B2" />
              <Text style={styles.featureText}>
                Rol: Docente o Autoridad
              </Text>
            </View>

            {/* Característica 2 */}
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={18} color="#21D0B2" />
              <Text style={styles.featureText}>
                Acceso al sistema
              </Text>
            </View>

            {/* Característica 3 */}
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={18} color="#21D0B2" />
              <Text style={styles.featureText}>
                Gestión de reportes
              </Text>
            </View>

          </View>

          {/* Botón visual inferior de la tarjeta */}
          <View style={styles.cardButton}>
            <Text style={styles.cardButtonText}>
              Crear Usuario
            </Text>

            {/* Ícono de flecha */}
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </View>

        </TouchableOpacity>



        {/* =======================================================
           TARJETA 2: CREAR EMPLEADO
           ======================================================= */}
        <TouchableOpacity
          style={[styles.card, styles.cardEmpleado]}

          // Navega a la pantalla EmpleadoNuevo
          onPress={() => router.push('/autoridad/EmpleadoNuevo')}

          activeOpacity={0.8}
        >

          {/* Contenedor del ícono */}
          <View style={styles.iconContainer}>
            <Ionicons 
              name="construct" // Ícono tipo herramienta
              size={40}
              color="#2F455C"
            />
          </View>
          
          {/* Título */}
          <Text style={styles.cardTitle}>
            Crear Empleado
          </Text>

          {/* Descripción */}
          <Text style={styles.cardDescription}>
            Personal de mantenimiento y sistemas
          </Text>

          {/* Características */}
          <View style={styles.cardFeatures}>

            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={18} color="#1DCDFE" />
              <Text style={styles.featureText}>
                Departamento especializado
              </Text>
            </View>

            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={18} color="#1DCDFE" />
              <Text style={styles.featureText}>
                Asignación de tareas
              </Text>
            </View>

            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={18} color="#1DCDFE" />
              <Text style={styles.featureText}>
                Seguimiento de reportes
              </Text>
            </View>

          </View>

          {/* Botón visual */}
          <View style={styles.cardButton}>
            <Text style={styles.cardButtonText}>
              Crear Empleado
            </Text>

            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </View>

        </TouchableOpacity>

      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
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