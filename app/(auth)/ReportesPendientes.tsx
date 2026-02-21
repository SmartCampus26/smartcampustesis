// Librerías base de React y hooks para manejar estado y ciclo de vida
import React, { useEffect, useState } from 'react'
// Componentes visuales de React Native
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
// Iconos de Expo
import { Ionicons } from '@expo/vector-icons'
// Estilos separados
import { styles } from '../../src/components/reportesPendientesStyles'
// Lógica de negocio separada
import {
  ReporteCompleto,
  obtenerEmpleadoActual,
  cargarReportesEmpleado,
  guardarCambiosReporte,
  getColorEstado,
  getColorPrioridad,
} from '../../src/services/ReportesPendientesService'

//COMPONENTE PRINCIPAL
const ReportesPendientes: React.FC = () => {

  //ESTADOS DEL COMPONENTE
  // Lista de reportes asignados al empleado
  const [reportes, setReportes] = useState<ReporteCompleto[]>([])
  // Control de carga y errores
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // ID del empleado autenticado
  const [empleadoActual, setEmpleadoActual] = useState<string | null>(null)

  // Estados para edición de reportes
  const [editando, setEditando] = useState<string | null>(null)
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [nuevaPrioridad, setNuevaPrioridad] = useState('')
  const [nuevoEstado, setNuevoEstado] = useState('')

  //EFECTOS
  // Obtener el empleado autenticado al iniciar el componente
  useEffect(() => {
    iniciarSesion()
  }, [])

  // Cargar reportes cuando se obtiene el ID del empleado
  useEffect(() => {
    if (empleadoActual) {
      cargarReportes()
    }
  }, [empleadoActual])

  //FUNCIONES
  // Obtiene la sesión almacenada y valida que sea un empleado
  const iniciarSesion = async (): Promise<void> => {
    try {
      const id = await obtenerEmpleadoActual()
      setEmpleadoActual(id)
    } catch (err: any) {
      setError(err.message)
      console.error(err)
    }
  }

  // Carga los reportes asignados al empleado desde Supabase
  const cargarReportes = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await cargarReportesEmpleado(empleadoActual!)
      setReportes(data)
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  // Activa el modo edición para un reporte
  const iniciarEdicion = (reporte: ReporteCompleto): void => {
    setEditando(reporte.idReporte)
    setNuevoComentario(reporte.comentReporte || '')
    setNuevaPrioridad(reporte.prioReporte)
    setNuevoEstado(reporte.estReporte)
  }

  // Cancela la edición
  const cancelarEdicion = (): void => {
    setEditando(null)
    setNuevoComentario('')
    setNuevaPrioridad('')
    setNuevoEstado('')
  }

  // Guarda los cambios del reporte en la base de datos
  const guardarCambios = async (idReporte: string): Promise<void> => {
    try {
      // Obtener el reporte actual para comparar cambios
      const reporteActual = reportes.find(r => r.idReporte === idReporte)
      if (!reporteActual) return

      await guardarCambiosReporte(idReporte, reporteActual, nuevoComentario, nuevaPrioridad, nuevoEstado)
      await cargarReportes()
      cancelarEdicion()
    } catch (err: any) {
      alert('Error al guardar: ' + err.message)
    }
  }

  //RENDER CONDICIONAL
  // Pantalla de carga
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1DCDFE" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    )
  }

  // Pantalla de error
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={60} color="#DC143C" />
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    )
  }

  //RENDER PRINCIPAL
  return (
    //// Contenedor principal con scroll vertical
    <ScrollView style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Mis Reportes Asignados</Text>

        {/* Si no existen reportes asignados */}
        {reportes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={80} color="#1DCDFE" />
            <Text style={styles.emptyText}>No tienes reportes asignados</Text>
          </View>
        ) : (
          /* Contenedor tipo grid para los reportes */
          <View style={styles.reportesGrid}>
            {reportes.map((reporte) => (
              // Tarjeta individual del reporte
              <View key={reporte.idReporte} style={styles.card}>

                {/* Imagen del reporte */}
                {reporte.imgReporte?.length > 0 && (
                  <Image
                    source={{ uri: reporte.imgReporte[0] }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                )}

                <View style={styles.cardContent}>
                  {/* Información del usuario que reportó */}
                  <View style={styles.userSection}>
                    <Text style={styles.sectionLabel}>Reportado por:</Text>
                    <Text style={styles.userName}>
                      {reporte.usuario?.nomUser} {reporte.usuario?.apeUser}
                    </Text>
                    <Text style={styles.userEmail}>{reporte.usuario?.correoUser}</Text>
                  </View>

                  {/* Título y descripción del reporte */}
                  <Text style={styles.cardTitle}>
                    {reporte.objeto?.nomObj || 'Sin título'}
                  </Text>
                  <Text style={styles.cardDescription}>{reporte.descriReporte}</Text>

                  {/* Información de ubicación */}
                  {reporte.lugar && (
                    <View style={styles.locationContainer}>
                      <Ionicons name="location" size={18} color="#2F455C" />
                      <View style={styles.locationInfo}>
                        <Text style={styles.locationLabel}>Ubicación:</Text>
                        <Text style={styles.locationText}>
                          {reporte.lugar.nomLugar} - Piso {reporte.lugar.pisoLugar}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Información del objeto relacionado */}
                  {reporte.objeto && (
                    <View style={styles.objectContainer}>
                      <Ionicons name="cube-outline" size={18} color="#2F455C" />
                      <View style={styles.objectInfo}>
                        <Text style={styles.objectLabel}>Objeto:</Text>
                        <Text style={styles.objectText}>
                          {reporte.objeto.nomObj} ({reporte.objeto.ctgobj})
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Fecha de creación del reporte */}
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={16} color="#1a1a1a" />
                    <Text style={styles.dateText}>
                      {new Date(reporte.fecReporte).toLocaleDateString()}
                    </Text>
                  </View>

                  {/* Vista normal */}
                  {editando !== reporte.idReporte ? (
                    <>
                      {/* Estado y prioridad del reporte */}
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

                      {/* Comentario del empleado */}
                      {reporte.comentReporte && (
                        <View style={styles.commentContainer}>
                          <View style={styles.commentHeader}>
                            <Ionicons name="chatbox-ellipses-outline" size={18} color="#2F455C" />
                            <Text style={styles.commentLabel}>Comentario:</Text>
                          </View>
                          <Text style={styles.commentText}>{reporte.comentReporte}</Text>
                        </View>
                      )}

                      {/* Botón para activar edición */}
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => iniciarEdicion(reporte)}
                      >
                        <Ionicons name="create-outline" size={20} color="white" />
                        <Text style={styles.editButtonText}>Editar Reporte</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    /* Formulario de edición del reporte */
                    <View style={styles.editForm}>

                      {/* Selector de estado */}
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

                      {/* Selector de prioridad */}
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

                      {/* Campo de comentario */}
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Comentario:</Text>
                        <TextInput
                          value={nuevoComentario}
                          onChangeText={setNuevoComentario}
                          style={styles.textArea}
                          placeholder="Agrega un comentario sobre el reporte..."
                          multiline
                          numberOfLines={4}
                          textAlignVertical="top"
                        />
                      </View>

                      {/* Botones de acción */}
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.saveButton}
                          onPress={() => guardarCambios(reporte.idReporte)}
                        >
                          <Ionicons name="checkmark-circle-outline" size={20} color="#2F455C" />
                          <Text style={styles.saveButtonText}>Guardar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={cancelarEdicion}
                        >
                          <Ionicons name="close-circle-outline" size={20} color="white" />
                          <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default ReportesPendientes