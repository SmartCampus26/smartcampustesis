// ===============================
// IMPORTACIONES
// ===============================

// Importa React
import React from 'react'

// Componentes visuales de React Native
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

// Librería de íconos Ionicons
import { Ionicons } from '@expo/vector-icons'

// Router de expo-router para navegación entre pantallas
import { router } from 'expo-router'

// Estilos personalizados del componente
import { styles } from '../../src/components/CrearMenuStyles'


// ===============================
// COMPONENTE PRINCIPAL
// ===============================

export default function CrearMenu() {

  // Este componente muestra un menú con dos opciones:
  // 1. Crear Usuario (Docente o Autoridad)
  // 2. Crear Empleado (Mantenimiento o Sistemas)

  return (

    // ScrollView permite desplazamiento vertical si el contenido es grande
    <ScrollView style={styles.container}>

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <View style={styles.header}>

        {/* Título principal */}
        <Text style={styles.headerTitle}>
          Gestión de Accesos
        </Text>

        {/* Subtítulo descriptivo */}
        <Text style={styles.headerSubtitle}>
          Selecciona el tipo de cuenta que deseas crear
        </Text>

      </View>


      {/* ========================= */}
      {/* CONTENEDOR DE TARJETAS */}
      {/* ========================= */}

      <View style={styles.cardsContainer}>


        {/* ================================== */}
        {/* TARJETA 1: CREAR USUARIO */}
        {/* ================================== */}

        <TouchableOpacity
          // Se aplican dos estilos: estilo base + estilo específico de usuario
          style={[styles.card, styles.cardUsuario]}

          // Cuando se presiona navega a la pantalla UsuarioNuevo
          onPress={() => router.push('/UsuarioNuevo')}

          // Reduce opacidad al presionar
          activeOpacity={0.8}
        >

          {/* ÍCONO SUPERIOR */}
          <View style={styles.iconContainer}>
            <Ionicons name="school" size={40} color="#1DCDFE" />
          </View>

          {/* TÍTULO DE LA TARJETA */}
          <Text style={styles.cardTitle}>
            Crear Usuario
          </Text>

          {/* DESCRIPCIÓN */}
          <Text style={styles.cardDescription}>
            Docentes y autoridades del sistema educativo
          </Text>


          {/* LISTA DE CARACTERÍSTICAS */}
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


          {/* BOTÓN INFERIOR VISUAL */}
          <View style={styles.cardButton}>
            <Text style={styles.cardButtonText}>
              Crear Usuario
            </Text>

            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </View>

        </TouchableOpacity>


        {/* ================================== */}
        {/* TARJETA 2: CREAR EMPLEADO */}
        {/* ================================== */}

        <TouchableOpacity
          // Aplica estilo base + estilo específico de empleado
          style={[styles.card, styles.cardEmpleado]}

          // Navega a la pantalla EmpleadoNuevo
          onPress={() => router.push('/EmpleadoNuevo')}

          activeOpacity={0.8}
        >

          {/* ÍCONO SUPERIOR */}
          <View style={styles.iconContainer}>
            <Ionicons name="construct" size={40} color="#2F455C" />
          </View>

          {/* TÍTULO */}
          <Text style={styles.cardTitle}>
            Crear Empleado
          </Text>

          {/* DESCRIPCIÓN */}
          <Text style={styles.cardDescription}>
            Personal de mantenimiento y sistemas
          </Text>


          {/* LISTA DE CARACTERÍSTICAS */}
          <View style={styles.cardFeatures}>

            {/* Característica 1 */}
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={18} color="#1DCDFE" />
              <Text style={styles.featureText}>
                Departamento especializado
              </Text>
            </View>

            {/* Característica 2 */}
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={18} color="#1DCDFE" />
              <Text style={styles.featureText}>
                Asignación de tareas
              </Text>
            </View>

            {/* Característica 3 */}
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={18} color="#1DCDFE" />
              <Text style={styles.featureText}>
                Seguimiento de reportes
              </Text>
            </View>

          </View>


          {/* BOTÓN VISUAL INFERIOR */}
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