// Librerías base de React y hooks para manejar estado y ciclo de vida
import React, { useState, useEffect } from 'react'
// Componentes visuales de React Native
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native'
// Almacenamiento local para recuperar la sesión guardada
import AsyncStorage from '@react-native-async-storage/async-storage'
// Cliente de Supabase configurado previamente
import { supabase } from '../../src/lib/Supabase'
// Tipos TypeScript que representan las tablas de la base de datos
import { Reporte, Empleado, Usuario, Objeto, Lugar, Sesion } from '../../src/types/Database'
// Iconos de Expo
import { Ionicons } from '@expo/vector-icons'


/**
 * ================================
 * INTERFAZ EXTENDIDA
 * ================================
 * Representa un reporte con todas sus relaciones cargadas
 */
interface ReporteCompleto extends Reporte {
  empleado: Empleado
  usuario: Usuario
  objeto: Objeto | null
  lugar: Lugar | null
}

//COMPONENTE PRINCIPAL
const ReportesPendientes: React.FC = () => {
  //ESTADOS DEL COMPONENTE
  // Lista de reportes asignados al empleado
  const [reportes, setReportes] = useState<ReporteCompleto[]>([])
  // Control de carga y errores
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // ID del empleado autenticado
  const [empleadoActual, setEmpleadoActual] = useState<number | null>(null)

  // Estados para edición de reportes
  const [editando, setEditando] = useState<number | null>(null)
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [nuevaPrioridad, setNuevaPrioridad] = useState('')
  const [nuevoEstado, setNuevoEstado] = useState('')

  //EFECTOS
  // Obtener el empleado autenticado al iniciar el componente
  useEffect(() => {
    obtenerEmpleadoActual()
  }, [])

  // Cargar reportes cuando se obtiene el ID del empleado
  useEffect(() => {
    if (empleadoActual) {
      cargarReportes()
    }
  }, [empleadoActual])

  //FUNCIONES
  //Obtiene la sesión almacenada y valida que sea un empleado
  const obtenerEmpleadoActual = async (): Promise<void> => {
    try {
      const sesionGuardada = await AsyncStorage.getItem('sesion')
      if (sesionGuardada) {
        const sesion: Sesion = JSON.parse(sesionGuardada)
        // Verificar directamente si es tipo empleado
        if (sesion.tipo === 'empleado') {
          setEmpleadoActual(sesion.id)
        } else {
          setError('Solo empleados pueden ver esta sección')
        }
      } else {
        setError('No hay sesión activa')
      }
    } catch (err) {
      setError('Error al obtener la sesión')
      console.error(err)
    }
  }

  // Carga los reportes asignados al empleado desde Supabase
  const cargarReportes = async (): Promise<void> => {
    try {
      setLoading(true)

      // Consulta principal de reportes con relaciones
      const { data, error: supabaseError } = await supabase
        .from('reporte')
        .select(`
          *,
          empleado:idEmpl (
            idEmpl,
            nomEmpl,
            apeEmpl,
            correoEmpl,
            deptEmpl,
            cargEmpl,
            tlfEmpl
          ),
          usuario:idUser (
            idUser,
            nomUser,
            apeUser,
            correoUser,
            tlfUser
          )
        `)
        .eq('idEmpl', empleadoActual)
        .order('fecReporte', { ascending: false })

      if (supabaseError) throw supabaseError

      // Cargar objeto y lugar asociados a cada reporte
      const reportesConDatos = await Promise.all(
        (data || []).map(async (reporte: any) => {
          // Obtener el objeto asociado al reporte
          const { data: objeto } = await supabase
            .from('objeto')
            .select('*')
            .eq('idReporte', reporte.idReporte)
            .single()

          // Si hay objeto, obtener su lugar
          let lugar = null
          if (objeto) {
            const { data: lugarData } = await supabase
              .from('lugar')
              .select('*')
              .eq('idLugar', objeto.idLugar)
              .single()
            lugar = lugarData
          }

          return {
            ...reporte,
            objeto: objeto || null,
            lugar: lugar || null
          } as ReporteCompleto
        })
      )

      setReportes(reportesConDatos)
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
  const guardarCambios = async (idReporte: number): Promise<void> => {
    try {
      const { error: updateError } = await supabase
        .from('reporte')
        .update({
          comentReporte: nuevoComentario,
          prioReporte: nuevaPrioridad,
          estReporte: nuevoEstado
        })
        .eq('idReporte', idReporte)

      if (updateError) throw updateError

      await cargarReportes()
      cancelarEdicion()
    } catch (err: any) {
      alert('Error al guardar: ' + err.message)
    }
  }

  // Devuelve un color según el estado del reporte
  const getColorEstado = (estado: string): string => {
    switch (estado) {
      case 'Pendiente':
        return '#FFA500'
      case 'En Proceso':
        return '#1E90FF'
      case 'Resuelto':
        return '#32CD32'
      default:
        return '#999999'
    }
  }

  // Devuelve un color según la prioridad del reporte
  const getColorPrioridad = (prioridad: string): string => {
    switch (prioridad) {
      case 'Alta':
        return '#DC143C'
      case 'Media':
        return '#FFD700'
      case 'Baja':
        return '#90EE90'
      default:
        return '#999999'
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

                  {/* Información de ubicación*/}
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
                  
                  {/* Vista normal*/}
                  {editando !== reporte.idReporte ? (
                    <>
                      {/* Estado y prioridad del reporte */}
                      <View style={styles.statusContainer}>
                        <View style={styles.statusRow}>
                          <Text style={styles.statusLabel}>Estado:</Text>
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: getColorEstado(reporte.estReporte) }
                            ]}
                          >
                            <Text style={styles.badgeText}>{reporte.estReporte}</Text>
                          </View>
                        </View>
                        <View style={styles.statusRow}>
                          <Text style={styles.statusLabel}>Prioridad:</Text>
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: getColorPrioridad(reporte.prioReporte) }
                            ]}
                          >
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
                          <TouchableOpacity
                            style={[
                              styles.pickerOption,
                              nuevoEstado === 'Pendiente' && styles.pickerOptionSelected
                            ]}
                            onPress={() => setNuevoEstado('Pendiente')}
                          >
                            <Text
                              style={[
                                styles.pickerOptionText,
                                nuevoEstado === 'Pendiente' && styles.pickerOptionTextSelected
                              ]}
                            >
                              Pendiente
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.pickerOption,
                              nuevoEstado === 'En Proceso' && styles.pickerOptionSelected
                            ]}
                            onPress={() => setNuevoEstado('En Proceso')}
                          >
                            <Text
                              style={[
                                styles.pickerOptionText,
                                nuevoEstado === 'En Proceso' && styles.pickerOptionTextSelected
                              ]}
                            >
                              En Proceso
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.pickerOption,
                              nuevoEstado === 'Resuelto' && styles.pickerOptionSelected
                            ]}
                            onPress={() => setNuevoEstado('Resuelto')}
                          >
                            <Text
                              style={[
                                styles.pickerOptionText,
                                nuevoEstado === 'Resuelto' && styles.pickerOptionTextSelected
                              ]}
                            >
                              Resuelto
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      {/* Selector de prioridad */}
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Prioridad:</Text>
                        <View style={styles.pickerContainer}>
                          <TouchableOpacity
                            style={[
                              styles.pickerOption,
                              nuevaPrioridad === 'Baja' && styles.pickerOptionSelected
                            ]}
                            onPress={() => setNuevaPrioridad('Baja')}
                          >
                            <Text
                              style={[
                                styles.pickerOptionText,
                                nuevaPrioridad === 'Baja' && styles.pickerOptionTextSelected
                              ]}
                            >
                              Baja
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.pickerOption,
                              nuevaPrioridad === 'Media' && styles.pickerOptionSelected
                            ]}
                            onPress={() => setNuevaPrioridad('Media')}
                          >
                            <Text
                              style={[
                                styles.pickerOptionText,
                                nuevaPrioridad === 'Media' && styles.pickerOptionTextSelected
                              ]}
                            >
                              Media
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.pickerOption,
                              nuevaPrioridad === 'Alta' && styles.pickerOptionSelected
                            ]}
                            onPress={() => setNuevaPrioridad('Alta')}
                          >
                            <Text
                              style={[
                                styles.pickerOptionText,
                                nuevaPrioridad === 'Alta' && styles.pickerOptionTextSelected
                              ]}
                            >
                              Alta
                            </Text>
                          </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F455C',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    padding: 24,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 32,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
  },
  errorText: {
    color: '#DC143C',
    fontSize: 18,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#D1D5DB',
    fontSize: 18,
    marginTop: 16,
  },
  reportesGrid: {
    gap: 24,
  },
  card: {
    backgroundColor: '#1DCDFE',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 192,
  },
  cardContent: {
    padding: 20,
  },
  userSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#34F5C5',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F455C',
  },
  userName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userEmail: {
    fontSize: 12,
    color: '#1a1a1a',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#1a1a1a',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21D0B2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F455C',
  },
  locationText: {
    color: 'white',
  },
  objectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  objectInfo: {
    flex: 1,
  },
  objectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F455C',
  },
  objectText: {
    color: 'white',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#1a1a1a',
  },
  statusContainer: {
    gap: 8,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontWeight: '600',
    color: '#2F455C',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  commentContainer: {
    backgroundColor: '#34F5C5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F455C',
  },
  commentText: {
    color: '#1a1a1a',
  },
  editButton: {
    backgroundColor: '#21D0B2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editForm: {
    gap: 12,
  },
  formGroup: {
    gap: 4,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F455C',
    marginBottom: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerOption: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#34F5C5',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  pickerOptionSelected: {
    backgroundColor: '#34F5C5',
  },
  pickerOptionText: {
    color: '#2F455C',
  },
  pickerOptionTextSelected: {
    fontWeight: 'bold',
  },
  textArea: {
    borderWidth: 2,
    borderColor: '#34F5C5',
    borderRadius: 8,
    padding: 8,
    minHeight: 80,
    backgroundColor: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#34F5C5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#2F455C',
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2F455C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})

export default ReportesPendientes