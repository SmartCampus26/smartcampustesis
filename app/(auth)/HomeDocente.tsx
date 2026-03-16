// app/(auth)/HomeDocente.tsx
import { useEffect, useState } from 'react'
import {
  ActivityIndicator, Alert, RefreshControl,
  ScrollView, Text, TouchableOpacity, View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Reporte } from '../../src/types/Database'
import { SafeAreaView } from 'react-native-safe-area-context'
import { cargarDatosDocente, HomeDocenteStats } from '../../src/services/HomeDocenteService'
import { homeDocenteStyles as styles } from '../../src/components/homeDocenteStyles'
// ── NUEVO ──
import ReporteDetalleModal from '../../src/components/Reportedetallemodal'

import * as React from 'react'

export default function HomeUsuario() {
  const [usuario, setUsuario]       = useState<any>(null)
  const [reportes, setReportes]     = useState<Reporte[]>([])
  const [cargando, setCargando]     = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [stats, setStats] = useState<HomeDocenteStats>({
    total: 0, pendientes: 0, enProceso: 0, resueltos: 0,
  })
  // ── NUEVO: estado del modal ──
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    try {
      const datos = await cargarDatosDocente()
      setUsuario(datos.usuario)
      setReportes(datos.reportes)
      setStats(datos.stats)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }

  const onRefresh = () => { setRefrescando(true); cargarDatos() }

  const handleCrearReporte = () => {
    if (!usuario?.idUser) {
      Alert.alert('Error', 'No se pudo identificar al usuario')
      return
    }
    router.push({
      pathname: '/CrearReporte',
      params: { idUser: usuario.idUser, nombreUsuario: usuario.nomUser || 'Usuario' }
    })
  }

  // ── NUEVO ──
  const abrirDetalle = (reporte: Reporte) => {
    setReporteSeleccionado(reporte)
    setModalVisible(true)
  }

  if (cargando) {
    return (
      <SafeAreaView style={styles.centeredContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#21D0B2" />
      </SafeAreaView>
    )
  }

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

        {/* ===== ESTADÍSTICAS ===== */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#13947F' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'todos' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Totales</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#FFA726' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'pendiente' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.pendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#42A5F5' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'en proceso' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.enProceso}</Text>
            <Text style={styles.statLabel}>En Proceso</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#66BB6A' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'resuelto' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.resueltos}</Text>
            <Text style={styles.statLabel}>Resueltos</Text>
          </TouchableOpacity>
        </View>

        {/* ===== REPORTES RECIENTES ===== */}
        {/* Si el HomeDocente muestra reportes, renderizarlos como cards tocables */}
        {reportes.length > 0 && (
          <View style={styles.createSection}>
            {reportes.slice(0, 3).map((reporte) => (
              <TouchableOpacity
                key={reporte.idReporte}
                onPress={() => abrirDetalle(reporte)}
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: '#21D0B2',
                }}
              >
                <Text style={{ fontWeight: '700', color: '#2F455C' }}>
                  #{reporte.idReporte}
                </Text>
                <Text style={{ color: '#6B7280', marginTop: 4 }} numberOfLines={2}>
                  {reporte.descriReporte}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ===== BOTÓN CREAR REPORTE ===== */}
        <View style={styles.createSection}>
          <TouchableOpacity style={styles.createButton} onPress={handleCrearReporte}>
            <View style={styles.createButtonContent}>
              <View style={styles.createIcon}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.createTextContainer}>
                <Text style={styles.createTitle}>Crear Nuevo Reporte</Text>
                <Text style={styles.createSubtitle}>Reporta un problema o solicitud</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#21D0B2" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── NUEVO: Modal de detalle ── */}
      <ReporteDetalleModal
        visible={modalVisible}
        reporte={reporteSeleccionado}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  )
}