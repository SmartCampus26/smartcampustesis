// Importa React y hooks para manejar estado y efectos
import { useEffect, useState } from 'react'
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
// Tipo de datos Reporte
import { Reporte } from '../../src/types/Database'
// Servicio PDF
import { generarPDF } from '../../src/components/PdfService'
// Lógica de carga de datos y funciones auxiliares
import { cargarDatosEmpleado, getStatusColor, getPriorityColor } from '../../src/services/Homeempleadoservice'
// Estilos
import { homeEmpleadoStyles as styles } from '../../src/components/homeEmpleadoStyles'

import * as React from 'react';

// COMPONENTE PRINCIPAL
export default function HomeEmpleados() {
  // ===== ESTADOS PRINCIPALES =====

  // Información del empleado en sesión
  const [empleado, setEmpleado] = useState<any>(null)
  // Lista de reportes asignados al empleado
  const [reportes, setReportes] = useState<Reporte[]>([])
  // Estados de carga
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)

  // Se ejecuta al cargar la pantalla
  useEffect(() => {
    cargarDatos()
  }, [])

  // CARGA DE DATOS
  const cargarDatos = async () => {
    try {
      const datos = await cargarDatosEmpleado()
      setEmpleado(datos.empleado)
      setReportes(datos.reportes)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }

  // Refrescar con gesto de deslizamiento
  const onRefresh = () => {
    setRefrescando(true)
    cargarDatos()
  }

  // ===== Función para imprimir PDF =====
  const imprimirPDF = async () => {
    try {
      await generarPDF(reportes, {
        titulo: 'Mis Tareas Asignadas',
        incluirEmpleado: false,
        incluirUsuario: true,
      })
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudo generar el PDF')
    }
  }

  // PANTALLA DE CARGA
  if (cargando) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={['#1DCDFE']} />
      }
    >
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {empleado?.nomEmpl || 'Empleado'}</Text>
        <Text style={styles.role}>Tareas Asignadas</Text>
      </View>

      {/* ===== Botón Imprimir PDF ===== */}
      <TouchableOpacity style={styles.pdfButton} onPress={imprimirPDF}>
        <Text style={styles.pdfButtonText}>Imprimir PDF</Text>
      </TouchableOpacity>

      {/* LISTA DE REPORTES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis Tareas</Text>
        {reportes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tienes tareas asignadas</Text>
            <Text style={styles.emptySubtext}>Las nuevas tareas aparecerán aquí</Text>
          </View>
        ) : (
          reportes.map((reporte) => (
            <View key={reporte.idReporte} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportId}>#{reporte.idReporte}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reporte.estReporte) }]}>
                  <Text style={styles.statusText}>{reporte.estReporte}</Text>
                </View>
              </View>

              <Text style={styles.reportDesc} numberOfLines={2}>
                {reporte.descriReporte}
              </Text>

              <View style={styles.reportFooter}>
                <Text style={styles.reportDate}>
                  {new Date(reporte.fecReporte).toLocaleDateString()}
                </Text>
                <Text style={[styles.reportPriority, { color: getPriorityColor(reporte.prioReporte) }]}>
                  {reporte.prioReporte || 'Sin prioridad'}
                </Text>
              </View>

              {reporte.usuario && (
                <View style={styles.requesterInfo}>
                  <Text style={styles.requesterLabel}>
                    Solicitado por: {reporte.usuario.nomUser} {reporte.usuario.apeUser}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}