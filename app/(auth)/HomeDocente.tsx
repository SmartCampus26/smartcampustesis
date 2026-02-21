// Importa React y hooks para manejar estado y efectos
import React, { useEffect, useState } from 'react'
// Componentes visuales de React Native
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
// Iconos
import { Ionicons } from '@expo/vector-icons'
// Navegación entre pantallas
import { router } from 'expo-router'
// Tipo de dato Reporte
import { Reporte } from '../../src/types/Database'
// Manejo seguro del área superior (notch, barra de estado)
import { SafeAreaView } from 'react-native-safe-area-context'
// Lógica de carga de datos y estadísticas
import { cargarDatosDocente, HomeDocenteStats } from '../../src/services/HomeDocenteService'
// Estilos
import { homeDocenteStyles as styles } from '../../src/components/homeDocenteStyles'

export default function HomeUsuario() {
  // ESTADOS (variables reactivas)

  // Información del usuario logueado
  const [usuario, setUsuario] = useState<any>(null)
  // Lista de reportes creados por el usuario
  const [reportes, setReportes] = useState<Reporte[]>([])
  // Controla si los datos están cargando
  const [cargando, setCargando] = useState(true)
  // Controla la animación de refrescar
  const [refrescando, setRefrescando] = useState(false)
  // Estadísticas de los reportes del usuario
  const [stats, setStats] = useState<HomeDocenteStats>({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    resueltos: 0,
  })

  // EFECTO: se ejecuta al abrir la pantalla
  useEffect(() => {
    cargarDatos()
  }, [])

  // FUNCIÓN: Cargar datos del usuario y reportes
  const cargarDatos = async () => {
    try {
      const datos = await cargarDatosDocente()
      setUsuario(datos.usuario)
      setReportes(datos.reportes)
      setStats(datos.stats)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      // Finaliza estados de carga
      setCargando(false)
      setRefrescando(false)
    }
  }

  // FUNCIÓN: Refrescar datos manualmente
  const onRefresh = () => {
    setRefrescando(true)
    cargarDatos()
  }

  const handleCrearReporte = () => {
    if (!usuario?.idUser) {
      Alert.alert('Error', 'No se pudo identificar al usuario')
      return
    }

    router.push({
      pathname: '/CrearReporte',
      params: {
        idUser: usuario.idUser,
        nombreUsuario: usuario.nomUser || 'Usuario'
      }
    })
  }

  // PANTALLA DE CARGA
  if (cargando) {
    return (
      <SafeAreaView style={styles.centeredContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#21D0B2" />
      </SafeAreaView>
    )
  }

  // INTERFAZ PRINCIPAL
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={['#21D0B2']} />
        }
      >
        {/* ===== ENCABEZADO ===== */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola!</Text>
            <Text style={styles.username}>{usuario?.nomUser || 'Usuario'}</Text>
          </View>
        </View>

        {/* ===== TARJETAS DE ESTADÍSTICAS ====== */}
        <View style={styles.statsContainer}>

          {/* Total */}
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#13947F' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'todos' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Totales</Text>
          </TouchableOpacity>

          {/* Pendientes */}
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#FFA726' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'pendiente' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.pendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </TouchableOpacity>

          {/* En proceso */}
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#42A5F5' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'en proceso' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.enProceso}</Text>
            <Text style={styles.statLabel}>En Proceso</Text>
          </TouchableOpacity>

          {/* Resueltos */}
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#66BB6A' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'resuelto' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.resueltos}</Text>
            <Text style={styles.statLabel}>Resueltos</Text>
          </TouchableOpacity>

        </View>

        {/* ==== BOTÓN CREAR REPORTE ===== */}
        {/* Permite al docente acceder al formulario de creación de reportes */}
        <View style={styles.createSection}>
          <TouchableOpacity style={styles.createButton} onPress={handleCrearReporte}>
            <View style={styles.createButtonContent}>
              {/* Ícono visual del botón */}
              <View style={styles.createIcon}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </View>
              {/* Texto descriptivo del botón */}
              <View style={styles.createTextContainer}>
                <Text style={styles.createTitle}>Crear Nuevo Reporte</Text>
                <Text style={styles.createSubtitle}>Reporta un problema o solicitud</Text>
              </View>
              {/* Flecha que indica navegación */}
              <Ionicons name="chevron-forward" size={24} color="#21D0B2" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Espacio inferior para evitar que el contenido quede cortado */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  )
}