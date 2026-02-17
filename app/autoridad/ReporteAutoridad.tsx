// Importa React y el hook useState para manejar estados
import React, { useState } from 'react'
// Componentes básicos de React Native para construir la interfaz
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native'
// Router de Expo para navegación entre pantallas
import { router, useLocalSearchParams } from 'expo-router'
// Cliente de Supabase para interactuar con la base de datos
import { supabase } from '../../src/lib/Supabase'
// Iconos de Ionicons para mejorar la interfaz visual
import { Ionicons } from '@expo/vector-icons'
// 🔥 Importar el contexto de fotos
import { useSaved } from '../Camera/context/SavedContext'

// INTERFAZ DE PROPIEDADES
interface CrearReporteProps {
  idUser: number
  nombreUsuario: string
}

// Lugares predefinidos del colegio
const LUGARES_PREDEFINIDOS = [
  'Polideportivo',
  'Piscina',
  'Música',
  'Cancha Cubierta',
  'Patio Central',
  'Aula de Danza',
  'Edificio Miguel Rua',
  'Edificio Carlos Crespi',
  'Secretaria',
  'Tecniclub',
  'Coliseo',
]

const CATEGORIAS_OBJETOS = [
  { id: 'electricidad', nombre: 'Electricidad', icono: 'flash-outline' },
  { id: 'plomeria', nombre: 'Plomería', icono: 'water-outline' },
  { id: 'equipo_computo', nombre: 'Equipo de Cómputo', icono: 'desktop-outline' },
  { id: 'proyectores', nombre: 'Proyectores/Pantallas', icono: 'tv-outline' },
  { id: 'herramientas', nombre: 'Herramientas', icono: 'hammer-outline' },
  { id: 'laboratorio', nombre: 'Equipo de Laboratorio', icono: 'flask-outline' },
  { id: 'puertas_ventanas', nombre: 'Puertas/Ventanas', icono: 'resize-outline' },
  { id: 'otros', nombre: 'Otros', icono: 'ellipsis-horizontal-outline' },
]

export default function CrearReporte({ }: CrearReporteProps) {
  const params = useLocalSearchParams()
  const idUser = params.idUser as string 
  const nombreUsuario = params.nombreUsuario as string
  
  // 🔥 Obtener fotos del contexto
  const { savedPhotos, uploadPhotosToSupabase, clearSavedPhotos } = useSaved()
  
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [departamento, setDepartamento] = useState<'mantenimiento' | 'sistemas'>('mantenimiento')
  const [lugarSeleccionado, setLugarSeleccionado] = useState<string>('')
  const [pisoLugar, setPisoLugar] = useState('')
  const [nombreObjeto, setNombreObjeto] = useState('')
  const [categoriaObjeto, setCategoriaObjeto] = useState<string>('')
  const [cargando, setCargando] = useState(false)

  const validarFormulario = () => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título')
      return false
    }
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción')
      return false
    }
    if (!nombreObjeto.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del objeto')
      return false
    }
    if (!categoriaObjeto) {
      Alert.alert('Error', 'Por favor selecciona una categoría de objeto')
      return false
    }
    if (!lugarSeleccionado) {
      Alert.alert('Error', 'Por favor selecciona un lugar')
      return false
    }
    if (!pisoLugar.trim()) {
      Alert.alert('Error', 'Por favor ingresa el piso')
      return false
    }
    const pisoNumero = parseInt(pisoLugar)
    if (isNaN(pisoNumero) || pisoNumero < 1) {
      Alert.alert('Error', 'El piso debe ser un número válido mayor a 0')
      return false
    }
    return true
  }

  // 🔥 NUEVA FUNCIÓN: Ir a la cámara
  const handleGoToCamera = () => {
    router.push('/Camera') // O la ruta donde está tu cámara (index.tsx)
  }

  const crearReporte = async () => {
    console.log('=== DEBUGGER CREAR REPORTE ===')
    console.log('idUser recibido:', idUser)
    console.log('Fotos guardadas:', savedPhotos.length)
  
    if (!validarFormulario()) return
  
    setCargando(true)
    try {
      const pisoNumero = parseInt(pisoLugar)
  
      // 1. Obtener empleado aleatorio del departamento
      const { data: empleados, error: errorEmpleados } = await supabase
        .from('empleado')
        .select('idEmpl')
        .eq('deptEmpl', departamento)
  
      if (errorEmpleados) throw errorEmpleados
  
      let idEmplAleatorio = null
      if (empleados && empleados.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * empleados.length)
        idEmplAleatorio = empleados[indiceAleatorio].idEmpl
        console.log(`Empleado asignado: ${idEmplAleatorio} del departamento ${departamento}`)
      }
  
      // 2. Verificar/crear lugar
      let { data: lugarExistente, error: errorBuscarLugar } = await supabase
        .from('lugar')
        .select('idLugar')
        .eq('nomLugar', lugarSeleccionado)
        .eq('pisoLugar', pisoNumero)
        .single()
  
      let idLugarDB: number
  
      if (errorBuscarLugar || !lugarExistente) {
        const { data: nuevoLugar, error: errorCrearLugar } = await supabase
          .from('lugar')
          .insert([
            {
              nomLugar: lugarSeleccionado,
              pisoLugar: pisoNumero,
            }
          ])
          .select()
          .single()
  
        if (errorCrearLugar) throw errorCrearLugar
        idLugarDB = nuevoLugar.idLugar
      } else {
        idLugarDB = lugarExistente.idLugar
      }
  
      // 3. Crear el reporte
      const { data, error } = await supabase
        .from('reporte')
        .insert([
          {
            fecReporte: new Date().toISOString(),
            descriReporte: descripcion,
            estReporte: 'pendiente',
            prioReporte: 'no asignada',
            comentReporte: '',
            imgReporte: [], // 🔥 INICIALIZAR COMO ARRAY VACÍO
            idEmpl: idEmplAleatorio,
            idUser: idUser,
          }
        ])
        .select('idReporte')
  
      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('No se devolvió el reporte')
      }
  
      const idReporte = data[0].idReporte
      console.log('✅ Reporte creado con ID:', idReporte) 

      // 🔥 NUEVO: Notificar al empleado asignado
if (idEmplAleatorio) {
  try {
    console.log('📧 Enviando notificación al empleado...')
    
    const { error: notifError } = await supabase.functions.invoke('notificar-nuevo-reporte', {
      body: {
        idReporte: idReporte,
        idEmpleado: idEmplAleatorio,
        nombreUsuario: nombreUsuario,
        descripcion: descripcion,
        nombreObjeto: nombreObjeto,
        categoriaObjeto: categoriaObjeto,
        lugar: lugarSeleccionado,
        piso: pisoNumero,
        fotos: savedPhotos.map(p => p.uri) // URLs de las fotos subidas
      }
    })

    if (notifError) {
      console.error('Error al enviar notificación:', notifError)
      // No fallar todo el reporte si la notificación falla
    } else {
      console.log('✅ Notificación enviada al empleado')
    }
  } catch (notifError) {
    console.error('Error al enviar notificación:', notifError)
  }
}

      // 🔥 4. SUBIR FOTOS A SUPABASE (SI HAY)
      if (savedPhotos.length > 0) {
        console.log(`📤 Subiendo ${savedPhotos.length} fotos...`)
        try {
          await uploadPhotosToSupabase(idReporte)
          console.log('✅ Fotos subidas correctamente')
        } catch (photoError) {
          console.error('❌ Error al subir fotos:', photoError)
          // No fallar todo el reporte si las fotos fallan
          Alert.alert(
            'Advertencia',
            'El reporte se creó pero hubo un problema al subir las fotos'
          )
        }
      }
  
      // 5. Vincular reporte con usuario
      const { error: errorReporteUsuario } = await supabase
        .from('reporte_usuario')
        .insert([
          {
            idReporte,
            idUser,
          }
        ])
  
      if (errorReporteUsuario) {
        console.error('Error al vincular usuario:', errorReporteUsuario)
        throw errorReporteUsuario
      }
  
      // 6. Crear el objeto
      const { error: objetoError } = await supabase
        .from('objeto')
        .insert([
          {
            nomObj: nombreObjeto,
            ctgobj: categoriaObjeto,
            idLugar: idLugarDB,
            idReporte,
          }
        ])
  
      if (objetoError) throw objetoError
  
      // 🔥 7. LIMPIAR FOTOS DEL CONTEXTO
      clearSavedPhotos()
      
      Alert.alert(
        'Éxito',
        `Reporte creado${savedPhotos.length > 0 ? ` con ${savedPhotos.length} foto(s)` : ''} y asignado a empleado ${idEmplAleatorio || 'sin asignar'}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setTitulo('')
              setDescripcion('')
              setDepartamento('mantenimiento')
              setLugarSeleccionado('')
              setPisoLugar('')
              setNombreObjeto('')
              setCategoriaObjeto('')
              router.back()
            }
          }
        ]
      )
    } catch (error: any) {
      console.error('Error al crear reporte:', error)
      Alert.alert('Error', error.message || 'No se pudo crear el reporte')
    } finally {
      setCargando(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2F455C" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Crear Nuevo Reporte</Text>
          <Text style={styles.subtitle}>Creado por: {nombreUsuario}</Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        {/* 🔥 SECCIÓN DE FOTOS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="camera" size={20} color="#21D0B2" />
            <Text style={styles.sectionTitle}>Fotografías del Problema</Text>
          </View>

          {/* Botón para ir a la cámara */}
          <TouchableOpacity 
            style={styles.cameraButton}
            onPress={handleGoToCamera}
          >
            <Ionicons name="camera" size={24} color="#FFFFFF" />
            <Text style={styles.cameraButtonText}>
              {savedPhotos.length > 0 ? 'Agregar más fotos' : 'Tomar Fotos'}
            </Text>
          </TouchableOpacity>

          {/* Preview de fotos guardadas */}
          {savedPhotos.length > 0 && (
            <View style={styles.photosPreview}>
              <Text style={styles.photosCount}>
                {savedPhotos.length} foto{savedPhotos.length !== 1 ? 's' : ''} lista{savedPhotos.length !== 1 ? 's' : ''} para subir
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {savedPhotos.map((photo) => (
                  <Image
                    key={photo.id}
                    source={{ uri: photo.uri }}
                    style={styles.photoThumbnail}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Título */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Título del Reporte *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Problema con equipo en laboratorio"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={100}
          />
        </View>

        {/* Descripción */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe el problema con detalle..."
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{descripcion.length}/500</Text>
        </View>

        {/* Separador */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube" size={20} color="#21D0B2" />
            <Text style={styles.sectionTitle}>Información del Objeto</Text>
          </View>

          {/* Nombre del Objeto */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre del Objeto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Computadora Dell, Lámpara LED, Silla, etc."
              value={nombreObjeto}
              onChangeText={setNombreObjeto}
              maxLength={100}
            />
          </View>

          {/* Categoría del Objeto */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Categoría del Objeto *</Text>
            <ScrollView 
              style={styles.categoriasContainer}
              nestedScrollEnabled={true}
            >
              {CATEGORIAS_OBJETOS.map((categoria) => (
                <TouchableOpacity
                  key={categoria.id}
                  style={[
                    styles.categoriaCard,
                    categoriaObjeto === categoria.id && styles.categoriaCardActive
                  ]}
                  onPress={() => setCategoriaObjeto(categoria.id)}
                >
                  <View style={styles.categoriaInfo}>
                    <Ionicons 
                      name={categoria.icono as any}
                      size={24} 
                      color={categoriaObjeto === categoria.id ? '#21D0B2' : '#8B9BA8'} 
                    />
                    <Text style={[
                      styles.categoriaNombre,
                      categoriaObjeto === categoria.id && styles.categoriaNombreActive
                    ]}>
                      {categoria.nombre}
                    </Text>
                  </View>
                  {categoriaObjeto === categoria.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#21D0B2" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Separador */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#21D0B2" />
            <Text style={styles.sectionTitle}>Ubicación</Text>
          </View>

          {/* Lugar */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Lugar *</Text>
            <ScrollView 
              style={styles.lugaresContainer}
              nestedScrollEnabled={true}
            >
              {LUGARES_PREDEFINIDOS.map((lugar) => (
                <TouchableOpacity
                  key={lugar}
                  style={[
                    styles.lugarCard,
                    lugarSeleccionado === lugar && styles.lugarCardActive
                  ]}
                  onPress={() => setLugarSeleccionado(lugar)}
                >
                  <View style={styles.lugarInfo}>
                    <Ionicons 
                      name="business" 
                      size={20} 
                      color={lugarSeleccionado === lugar ? '#21D0B2' : '#8B9BA8'} 
                    />
                    <Text style={[
                      styles.lugarNombre,
                      lugarSeleccionado === lugar && styles.lugarNombreActive
                    ]}>
                      {lugar}
                    </Text>
                  </View>
                  {lugarSeleccionado === lugar && (
                    <Ionicons name="checkmark-circle" size={24} color="#21D0B2" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Piso */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Piso *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 1, 2, 3..."
              value={pisoLugar}
              onChangeText={setPisoLugar}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
        </View>

        {/* Departamento */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Departamento Responsable *</Text>
          <View style={styles.departmentContainer}>
            <TouchableOpacity
              style={[
                styles.departmentButton,
                departamento === 'mantenimiento' && styles.departmentButtonActive
              ]}
              onPress={() => setDepartamento('mantenimiento')}
            >
              <Ionicons 
                name="construct" 
                size={20} 
                color={departamento === 'mantenimiento' ? '#FFFFFF' : '#2F455C'} 
              />
              <Text style={[
                styles.departmentText,
                departamento === 'mantenimiento' && styles.departmentTextActive
              ]}>
                Mantenimiento
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.departmentButton,
                departamento === 'sistemas' && styles.departmentButtonActive
              ]}
              onPress={() => setDepartamento('sistemas')}
            >
              <Ionicons 
                name="laptop" 
                size={20} 
                color={departamento === 'sistemas' ? '#FFFFFF' : '#2F455C'} 
              />
              <Text style={[
                styles.departmentText,
                departamento === 'sistemas' && styles.departmentTextActive
              ]}>
                Sistemas
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información de estado */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#21D0B2" />
          <Text style={styles.infoText}>
            El reporte se creará con estado "Pendiente" y la prioridad será asignada por el personal correspondiente.
          </Text>
        </View>

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={crearReporte}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Crear Reporte</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F455C',
  },
  subtitle: {
    fontSize: 14,
    color: '#8B9BA8',
    marginTop: 4,
  },
  formContainer: {
    padding: 20,
  },
  // 🔥 Estilos para la sección de fotos
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1DCDFE',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
    marginBottom: 16,
    shadowColor: '#1DCDFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  photosPreview: {
    marginTop: 8,
  },
  photosCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#21D0B2',
    marginBottom: 12,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#21D0B2',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#F5F7FA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F455C',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F455C',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2F455C',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#8B9BA8',
    textAlign: 'right',
    marginTop: 4,
  },
  departmentContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  departmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#E1E8ED',
    gap: 8,
  },
  departmentButtonActive: {
    backgroundColor: '#21D0B2',
    borderColor: '#21D0B2',
  },
  departmentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F455C',
  },
  departmentTextActive: {
    color: '#FFFFFF',
  },
  categoriasContainer: {
    maxHeight: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  categoriaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
  },
  categoriaCardActive: {
    backgroundColor: '#F0FFFE',
  },
  categoriaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoriaNombre: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2F455C',
  },
  categoriaNombreActive: {
    color: '#21D0B2',
    fontWeight: '600',
  },
  lugaresContainer: {
    maxHeight: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  lugarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
  },
  lugarCardActive: {
    backgroundColor: '#F0FFFE',
  },
  lugarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  lugarNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F455C',
  },
  lugarNombreActive: {
    color: '#21D0B2',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F9F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2F455C',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E1E8ED',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F455C',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#21D0B2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#21D0B2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
})