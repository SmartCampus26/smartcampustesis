// 📋 ReportesPendientes.tsx — solo orquestación, sin lógica de negocio.
// Lógica → useReportesPendientes | Estilos → reportesPendientesStyles

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as React from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import ImagenZoomModal from '../../src/components/reportes/ImagenZoomModal'
import ModalColaboradores from '../../src/components/reportes/ModalColaboradores'
import ReportePendienteCard from '../../src/components/reportes/ReportePendienteCard'
import ConfirmModal from '../../src/components/ui/ConfirmModal'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'
import { useReportesPendientes } from '../../src/hooks/reportes/useReportesPendientes'
import { colors, styles } from '../../src/styles/reportes/reportesPendientesStyles'

export default function ReportesPendientes() {
  const {
    esJefe,
    reportes, reportesAsignados, reportesMostrados, colaboradores,
    cargando, recargando, error,
    tabActivo, setTabActivo,
    onRefresh,
    modalVisible, setModalVisible,
    reporteSeleccionado, abrirModal,
    confirmarAsignacion,
    confirm, closeConfirm,
    editando,
    nuevoComentario, setNuevoComentario,
    nuevaPrioridad,  setNuevaPrioridad,
    nuevoEstado,     setNuevoEstado,
    estadosValidos, prioridadesValidas,
    getColorEstado, getColorPrioridad, getIniciales,
    iniciarEdicion, cancelarEdicion, guardarCambios,
    reintentar,
  } = useReportesPendientes()

  useAndroidBack(() => { if (router.canGoBack()) router.back() })

  const [imagenZoom, setImagenZoom] = React.useState<string | null>(null)

  if (cargando) return (
    <View style={[styles.container, styles.centerContent]}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.loadingText}>Cargando reportes...</Text>
    </View>
  )

  if (error) return (
    <View style={[styles.container, styles.centerContent]}>
      <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
      <Text style={styles.errorText}>Error: {error}</Text>
      <TouchableOpacity style={[styles.editButton, { marginTop: 20 }]} onPress={reintentar}>
        <Ionicons name="refresh-outline" size={17} color={colors.accent} />
        <Text style={styles.editButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={recargando} onRefresh={onRefresh} colors={[colors.accent]} tintColor={colors.accent} />}
      >
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>{esJefe ? 'Gestión de Reportes' : 'Mis Reportes'}</Text>

          {/* Tabs — solo jefes */}
          {esJefe && (
            <View style={styles.tabsContainer}>
              <TouchableOpacity onPress={() => setTabActivo('sinAsignar')} style={[styles.tab, tabActivo === 'sinAsignar' && styles.tabActivo]}>
                <Text style={[styles.tabTexto, tabActivo === 'sinAsignar' && styles.tabTextoActivo]}>Sin asignar ({reportes.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTabActivo('asignados')} style={[styles.tab, tabActivo === 'asignados' && styles.tabActivo]}>
                <Text style={[styles.tabTexto, tabActivo === 'asignados' && styles.tabTextoActivo]}>Asignados ({reportesAsignados.length})</Text>
              </TouchableOpacity>
            </View>
          )}

          {reportesMostrados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={72} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                {esJefe
                  ? tabActivo === 'sinAsignar' ? 'No hay reportes pendientes de asignación' : 'No hay reportes asignados en tu departamento'
                  : 'No tienes reportes asignados'}
              </Text>
            </View>
          ) : (
            <View style={styles.reportesGrid}>
              {reportesMostrados.map(reporte => (
                <ReportePendienteCard
                  key={reporte.idReporte}
                  reporte={reporte}
                  esJefe={esJefe}
                  permitirReasignar={tabActivo === 'asignados'}
                  enEdicion={editando === reporte.idReporte}
                  colorEstado={getColorEstado(reporte.estReporte)}
                  colorPrioridad={getColorPrioridad(reporte.prioReporte)}
                  iniciales={getIniciales(reporte.usuario?.nomUser, reporte.usuario?.apeUser)}
                  nuevoEstado={nuevoEstado}
                  nuevaPrioridad={nuevaPrioridad}
                  nuevoComentario={nuevoComentario}
                  estadosValidos={estadosValidos}
                  prioridadesValidas={prioridadesValidas}
                  onVerFoto={setImagenZoom}
                  onEditar={() => iniciarEdicion(reporte)}
                  onAsignar={() => abrirModal(reporte)}
                  onGuardar={() => guardarCambios(reporte.idReporte)}
                  onCancelar={cancelarEdicion}
                  onEstadoChange={setNuevoEstado}
                  onPrioridadChange={setNuevaPrioridad}
                  onComentarioChange={setNuevoComentario}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ImagenZoomModal uri={imagenZoom} onClose={() => setImagenZoom(null)} />

      <ModalColaboradores
        visible={modalVisible}
        reasignando={!!reporteSeleccionado?.idEmpl}
        colaboradores={colaboradores}
        getIniciales={getIniciales}
        onSeleccionar={confirmarAsignacion}
        onCerrar={() => setModalVisible(false)}
      />

      <ConfirmModal
        visible={confirm.visible}
        titulo={confirm.titulo}
        mensaje={confirm.mensaje}
        labelConfirmar={confirm.labelConfirmar}
        accentColor={confirm.accentColor}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />
    </View>
  )
}