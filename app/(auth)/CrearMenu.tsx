// app/(auth)/CrearMenu.tsx
// Menú con dos tarjetas: Crear Usuario / Crear Colaborador.
// Lógica: useAndroidBack | Estilos: CrearMenuStyles (ya existente)

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { styles } from '../../src/styles/usuario/CrearMenuStyles'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'

const TARJETAS = [
  {
    icon: 'school' as const,
    iconColor: '#1DCDFE',
    cardStyle: 'cardUsuario' as const,
    title: 'Crear Usuario',
    description: 'Docentes y coordinadores del sistema educativo',
    features: ['Rol: Docente o Coordinador', 'Acceso al sistema', 'Gestión de reportes'],
    featureColor: '#21D0B2',
    buttonLabel: 'Crear Usuario',
    ruta: '/UsuarioNuevo' as const,
  },
  {
    icon: 'construct' as const,
    iconColor: '#2F455C',
    cardStyle: 'cardEmpleado' as const,
    title: 'Crear Colaborador',
    description: 'Personal de mantenimiento y sistemas',
    features: ['Departamento especializado', 'Asignación de tareas', 'Seguimiento de reportes'],
    featureColor: '#1DCDFE',
    buttonLabel: 'Crear Colaborador',
    ruta: '/EmpleadoNuevo' as const,
  },
]

export default function CrearMenu() {
  useAndroidBack(() => { if (router.canGoBack()) router.back() })

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Accesos</Text>
        <Text style={styles.headerSubtitle}>Selecciona el tipo de cuenta que deseas crear</Text>
      </View>

      <View style={styles.cardsContainer}>
        {TARJETAS.map((t) => (
          <TouchableOpacity key={t.ruta} style={[styles.card, styles[t.cardStyle]]} onPress={() => router.push(t.ruta)} activeOpacity={0.8}>
            <View style={styles.iconContainer}>
              <Ionicons name={t.icon} size={40} color={t.iconColor} />
            </View>
            <Text style={styles.cardTitle}>{t.title}</Text>
            <Text style={styles.cardDescription}>{t.description}</Text>
            <View style={styles.cardFeatures}>
              {t.features.map((feat) => (
                <View key={feat} style={styles.feature}>
                  <Ionicons name="checkmark-circle" size={18} color={t.featureColor} />
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}
            </View>
            <View style={styles.cardButton}>
              <Text style={styles.cardButtonText}>{t.buttonLabel}</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}