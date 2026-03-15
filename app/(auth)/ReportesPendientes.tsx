import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { styles } from '../../src/components/reportesPendientesStyles'
import {
  ReporteCompleto,
  obtenerSesionEmpleado,
  cargarReportesSinAsignar,
  cargarReportesAsignadosDepto,
  cargarReportesEmpleado,
  cargarColaboradoresDepto,
  asignarColaboradorAReporte,
  guardarCambiosReporte,
  getColorEstado,
  getColorPrioridad,
} from '../../src/services/ReportesPendientesService'
import { Empleado } from '../../src/types/Database'
import * as React from 'react'

type TabJefe = 'sinAsignar' | 'asignados'

const ReportesPendientes: React.FC = () => {

  // ===== ESTADOS =====
  const [reportes, setReportes] = useState<ReporteCompleto[]>([])
  const [reportesAsignados, setReportesAsignados] = useState<ReporteCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [esJefe, setEsJefe] = useState(false)
  const [empleadoActual, setEmpleadoActual] = useState<string | null>(null)
  const [nombreJefe, setNombreJefe] = useState('')   // ← nombre completo del jefe
  const [depto, setDepto] = useState('')
  const [tabActivo, setTabActivo] = useState<TabJefe>('sinAsignar')

  // Edición (colaborador)
  const [editando, setEditando] = useState<string | null>(null)
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [nuevaPrioridad, setNuevaPrioridad] = useState('')
  const [nuevoEstado, setNuevoEstado] = useState('')

  // Asignación / reasignación (jefe)
  const [modalVisible, setModalVisible] = useState(false)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteCompleto | null>(null)
  const [colaboradores, setColaboradores] = useState<Empleado[]>([])

  // ===== INICIO =====
  useEffect(() => {
    iniciar()
  }, [])

  const iniciar = async () => {
    try {
      const sesion = await obtenerSesionEmpleado()
      const jefe = sesion.cargo === 'jefe'   // cargEmpl = 'jefe' (minúscula, confirmado en BD)
      setEsJefe(jefe)
      setEmpleadoActual(sesion.id)
      setNombreJefe(sesion.nombre)
      setDepto(sesion.depto)

      if (jefe) {
        const colab = await cargarColaboradoresDepto(sesion.depto)
        setColaboradores(colab)
        const sinAsignar = await cargarReportesSinAsignar()
        const asignados = await cargarReportesAsignadosDepto(sesion.depto)
        setReportes(sinAsignar)
        setReportesAsignados(asignados)
      } else {
        const data = await cargarReportesEmpleado(sesion.id)
        setReportes(data)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const recargar = async () => {
    if (esJefe) {
      const sinAsignar = await cargarReportesSinAsignar()
      const asignados = await cargarReportesAsignadosDepto(depto)
      setReportes(sinAsignar)
      setReportesAsignados(asignados)
    } else if (empleadoActual) {
      const data = await cargarReportesEmpleado(empleadoActual)
      setReportes(data)
    }
  }

  // ===== ASIGNACIÓN / REASIGNACIÓN =====
  const abrirModal = (reporte: ReporteCompleto) => {
    setReporteSeleccionado(reporte)
    setModalVisible(true)
  }

  const confirmarAsignacion = (colaborador: Empleado) => {
    const yaAsignado = !!reporteSeleccionado?.idEmpl
    Alert.alert(
      yaAsignado ? 'Confirmar reasignación' : 'Confirmar asignación',
      `¿${yaAsignado ? 'Reasignar' : 'Asignar'} este reporte a ${colaborador.nomEmpl} ${colaborador.apeEmpl}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              // ✅ Pasa el nombre del jefe para que el empleado lo reciba en el correo
              await asignarColaboradorAReporte(
                reporteSeleccionado!.idReporte,
                colaborador.idEmpl,
                nombreJefe
              )
              Alert.alert('✅ Éxito', `Reporte ${yaAsignado ? 'reasignado' : 'asignado'} correctamente`)
              setModalVisible(false)
              recargar()
            } catch (err: any) {
              Alert.alert('Error', err.message)
            }
          }
        }
      ]
    )
  }

  // ===== EDICIÓN (COLABORADOR) =====
  const iniciarEdicion = (reporte: ReporteCompleto) => {
    setEditando(reporte.idReporte)
    setNuevoComentario(reporte.comentReporte || '')
    setNuevaPrioridad(reporte.prioReporte)
    setNuevoEstado(reporte.estReporte)
  }

  const cancelarEdicion = () => {
    setEditando(null)
    setNuevoComentario('')
    setNuevaPrioridad('')
    setNuevoEstado('')
  }

  const guardarCambios = async (idReporte: string) => {
    try {
      const reporteActual = reportes.find(r => r.idReporte === idReporte)
      if (!reporteActual) return
      await guardarCambiosReporte(idReporte, reporteActual, nuevoComentario, nuevaPrioridad, nuevoEstado)
      await recargar()
      cancelarEdicion()
    } catch (err: any) {
      Alert.alert('Error al guardar', err.message)
    }
  }

  // ===== RENDER TARJETA =====
  const renderTarjeta = (reporte: ReporteCompleto, permitirReasignar = false) => (
    <View key={reporte.idReporte} style={styles.card}>
      {reporte.imgReporte?.length > 0 && (
        <Image source={{ uri: reporte.imgReporte[0] }} style={styles.cardImage} resizeMode="cover" />
      )}

      <View style={styles.cardContent}>
        <View style={styles.userSection}>
          <Text style={styles.sectionLabel}>Reportado por:</Text>
          <Text style={styles.userName}>{reporte.usuario?.nomUser} {reporte.usuario?.apeUser}</Text>
          <Text style={styles.userEmail}>{reporte.usuario?.correoUser}</Text>
        </View>

        <Text style={styles.cardTitle}>{reporte.objeto?.nomObj || 'Sin título'}</Text>
        <Text style={styles.cardDescription}>{reporte.descriReporte}</Text>

        {reporte.lugar && (
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={18} color="#2F455C" />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Ubicación:</Text>
              <Text style={styles.locationText}>
                {reporte.lugar.nomLugar} - Piso {reporte.lugar.pisoLugar} · {reporte.lugar.aulaLugar}
                {reporte.lugar.numAula ? ` · ${reporte.lugar.numAula}` : ''}
              </Text>
            </View>
          </View>
        )}

        {reporte.objeto && (
          <View style={styles.objectContainer}>
            <Ionicons name="cube-outline" size={18} color="#2F455C" />
            <View style={styles.objectInfo}>
              <Text style={styles.objectLabel}>Objeto:</Text>
              <Text style={styles.objectText}>{reporte.objeto.nomObj} ({reporte.objeto.ctgobj})</Text>
            </View>
          </View>
        )}

        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color="#1a1a1a" />
          <Text style={styles.dateText}>{new Date(reporte.fecReporte).toLocaleDateString()}</Text>
        </View>

        {reporte.empleado && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6 }}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text style={{ marginLeft: 6, color: '#6B7280', fontSize: 13 }}>
              Asignado a: {reporte.empleado.nomEmpl} {reporte.empleado.apeEmpl}
            </Text>
          </View>
        )}

        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Estado:</Text>
            <View style={[styles.badge, { backgroundColor: getColorEstado(reporte.estReporte) }]}>
              <Text style={styles.badgeText}>{reporte.estReporte}</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Prioridad:</Text>
            <View style={[styles.badge, { backgroundColor: getColorPrioridad(reporte.prioReporte) }]}>
              <Text style={styles.badgeText}>{reporte.prioReporte}</Text>
            </View>
          </View>
        </View>

        {/* BOTONES JEFE */}
        {esJefe && (
          editando !== reporte.idReporte ? (
            <>
              {reporte.comentReporte ? (
                <View style={styles.commentContainer}>
                  <View style={styles.commentHeader}>
                    <Ionicons name="chatbox-ellipses-outline" size={18} color="#2F455C" />
                    <Text style={styles.commentLabel}>Comentario:</Text>
                  </View>
                  <Text style={styles.commentText}>{reporte.comentReporte}</Text>
                </View>
              ) : null}

              <TouchableOpacity style={styles.editButton} onPress={() => iniciarEdicion(reporte)}>
                <Ionicons name="create-outline" size={20} color="white" />
                <Text style={styles.editButtonText}>Editar Reporte</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: '#21D0B2', marginTop: 8 }]}
                onPress={() => abrirModal(reporte)}
              >
                <Ionicons name="person-add-outline" size={20} color="white" />
                <Text style={styles.editButtonText}>
                  {permitirReasignar ? 'Reasignar Colaborador' : 'Asignar Colaborador'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.editForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Estado:</Text>
                <View style={styles.pickerContainer}>
                  {(['Pendiente', 'En Proceso', 'Resuelto'] as const).map((est) => (
                    <TouchableOpacity
                      key={est}
                      style={[styles.pickerOption, nuevoEstado === est && styles.pickerOptionSelected]}
                      onPress={() => setNuevoEstado(est)}
                    >
                      <Text style={[styles.pickerOptionText, nuevoEstado === est && styles.pickerOptionTextSelected]}>
                        {est}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Prioridad:</Text>
                <View style={styles.pickerContainer}>
                  {(['Baja', 'Media', 'Alta'] as const).map((prio) => (
                    <TouchableOpacity
                      key={prio}
                      style={[styles.pickerOption, nuevaPrioridad === prio && styles.pickerOptionSelected]}
                      onPress={() => setNuevaPrioridad(prio)}
                    >
                      <Text style={[styles.pickerOptionText, nuevaPrioridad === prio && styles.pickerOptionTextSelected]}>
                        {prio}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Comentario:</Text>
                <TextInput
                  value={nuevoComentario}
                  onChangeText={setNuevoComentario}
                  style={styles.textArea}
                  placeholder="Agrega un comentario..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={() => guardarCambios(reporte.idReporte)}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#2F455C" />
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={cancelarEdicion}>
                  <Ionicons name="close-circle-outline" size={20} color="white" />
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        )}

        {/* BOTONES COLABORADOR */}
        {!esJefe && (
          editando !== reporte.idReporte ? (
            <>
              {reporte.comentReporte ? (
                <View style={styles.commentContainer}>
                  <View style={styles.commentHeader}>
                    <Ionicons name="chatbox-ellipses-outline" size={18} color="#2F455C" />
                    <Text style={styles.commentLabel}>Comentario:</Text>
                  </View>
                  <Text style={styles.commentText}>{reporte.comentReporte}</Text>
                </View>
              ) : null}
              <TouchableOpacity style={styles.editButton} onPress={() => iniciarEdicion(reporte)}>
                <Ionicons name="create-outline" size={20} color="white" />
                <Text style={styles.editButtonText}>Editar Reporte</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.editForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Estado:</Text>
                <View style={styles.pickerContainer}>
                  {(['Pendiente', 'En Proceso', 'Resuelto'] as const).map((est) => (
                    <TouchableOpacity
                      key={est}
                      style={[styles.pickerOption, nuevoEstado === est && styles.pickerOptionSelected]}
                      onPress={() => setNuevoEstado(est)}
                    >
                      <Text style={[styles.pickerOptionText, nuevoEstado === est && styles.pickerOptionTextSelected]}>
                        {est}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Prioridad:</Text>
                <View style={styles.pickerContainer}>
                  {(['Baja', 'Media', 'Alta'] as const).map((prio) => (
                    <TouchableOpacity
                      key={prio}
                      style={[styles.pickerOption, nuevaPrioridad === prio && styles.pickerOptionSelected]}
                      onPress={() => setNuevaPrioridad(prio)}
                    >
                      <Text style={[styles.pickerOptionText, nuevaPrioridad === prio && styles.pickerOptionTextSelected]}>
                        {prio}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Comentario:</Text>
                <TextInput
                  value={nuevoComentario}
                  onChangeText={setNuevoComentario}
                  style={styles.textArea}
                  placeholder="Agrega un comentario..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={() => guardarCambios(reporte.idReporte)}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#2F455C" />
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={cancelarEdicion}>
                  <Ionicons name="close-circle-outline" size={20} color="white" />
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        )}
      </View>
    </View>
  )

  // ===== RENDER CONDICIONAL =====
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1DCDFE" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={60} color="#DC143C" />
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    )
  }

  const reportesMostrados = esJefe
    ? (tabActivo === 'sinAsignar' ? reportes : reportesAsignados)
    : reportes

  // ===== RENDER PRINCIPAL =====
  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>
          {esJefe ? 'Gestión de Reportes' : 'Mis Reportes Asignados'}
        </Text>

        {/* TABS SOLO PARA JEFE */}
        {esJefe && (
          <View style={{ flexDirection: 'row', marginBottom: 16, gap: 8 }}>
            <TouchableOpacity
              onPress={() => setTabActivo('sinAsignar')}
              style={{
                flex: 1, padding: 10, borderRadius: 8, alignItems: 'center',
                backgroundColor: tabActivo === 'sinAsignar' ? '#1DCDFE' : '#E5E7EB',
              }}
            >
              <Text style={{ color: tabActivo === 'sinAsignar' ? '#FFF' : '#2F455C', fontWeight: '600' }}>
                Sin asignar ({reportes.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTabActivo('asignados')}
              style={{
                flex: 1, padding: 10, borderRadius: 8, alignItems: 'center',
                backgroundColor: tabActivo === 'asignados' ? '#1DCDFE' : '#E5E7EB',
              }}
            >
              <Text style={{ color: tabActivo === 'asignados' ? '#FFF' : '#2F455C', fontWeight: '600' }}>
                Asignados ({reportesAsignados.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {reportesMostrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={80} color="#1DCDFE" />
            <Text style={styles.emptyText}>
              {esJefe
                ? tabActivo === 'sinAsignar'
                  ? 'No hay reportes pendientes de asignación'
                  : 'No hay reportes asignados en tu departamento'
                : 'No tienes reportes asignados'}
            </Text>
          </View>
        ) : (
          <View style={styles.reportesGrid}>
            {reportesMostrados.map((reporte) =>
              renderTarjeta(reporte, tabActivo === 'asignados')
            )}
          </View>
        )}
      </View>

      {/* MODAL SELECCIONAR COLABORADOR */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: '#FFF',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: '70%',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2F455C' }}>
                {reporteSeleccionado?.idEmpl ? 'Reasignar Colaborador' : 'Asignar Colaborador'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {colaboradores.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 20 }}>
                  No hay colaboradores disponibles en este departamento
                </Text>
              ) : (
                colaboradores.map((colab) => (
                  <TouchableOpacity
                    key={colab.idEmpl}
                    onPress={() => confirmarAsignacion(colab)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 14,
                      marginBottom: 8,
                      backgroundColor: '#F3F4F6',
                      borderRadius: 10,
                    }}
                  >
                    <View style={{
                      width: 44, height: 44, borderRadius: 22,
                      backgroundColor: '#1DCDFE',
                      justifyContent: 'center', alignItems: 'center', marginRight: 12,
                    }}>
                      <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                        {colab.nomEmpl?.[0]}{colab.apeEmpl?.[0]}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', color: '#2F455C' }}>
                        {colab.nomEmpl} {colab.apeEmpl}
                      </Text>
                      <Text style={{ color: '#6B7280', fontSize: 13 }}>{colab.correoEmpl}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

export default ReportesPendientes