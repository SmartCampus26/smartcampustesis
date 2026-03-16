// app/(auth)/HomeEmpleado.tsx
import { useEffect, useState } from 'react'
import {
  ActivityIndicator, Alert, RefreshControl,
  ScrollView, Text, TouchableOpacity, View,
} from 'react-native'
import { Reporte } from '../../src/types/Database'
import { generarPDF } from '../../src/components/PdfService'
import { cargarDatosEmpleado, getStatusColor, getPriorityColor } from '../../src/services/Homeempleadoservice'
import { homeEmpleadoStyles as styles } from '../../src/components/homeEmpleadoStyles'
// ── NUEVO ──
import ReporteDetalleModal from '../../src/components/Reportedetallemodal'

import * as React from 'react'

export default function HomeEmpleados() {
  const [empleado, setEmpleado]         = useState<any>(null)
  const [reportes, setReportes]         = useState<Reporte[]>([])
  const [cargando, setCargando]         = useState(true)
  const [refrescando, setRefrescando]   = useState(false)
  // ── NUEVO ──
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null)
  const [modalVisible, setModalVisible]               = useState(false)

  useEffect(() => { cargarDatos() }, [])

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

  const onRefresh = () => { setRefrescando(true); cargarDatos() }

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

  // ── NUEVO ──
  const abrirDetalle = (reporte: Reporte) => {
    setReporteSeleccionado(reporte)
    setModalVisible(true)
  }

  if (cargando) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={['#1DCDFE']} />
        }
      >
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, {empleado?.nomEmpl || 'Colaborador'}</Text>
          <Text style={styles.role}>Tareas Asignadas</Text>
        </View>

        {/* Botón PDF */}
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
              // ── CAMBIO: View → TouchableOpacity ──
              <TouchableOpacity
                key={reporte.idReporte}
                style={styles.reportCard}
                onPress={() => abrirDetalle(reporte)}
                activeOpacity={0.75}
              >
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
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── NUEVO: Modal de detalle ── */}
      <ReporteDetalleModal
        visible={modalVisible}
        reporte={reporteSeleccionado}
        onClose={() => setModalVisible(false)}
      />
    </View>
  )
}