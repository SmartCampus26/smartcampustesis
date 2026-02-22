import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSaved } from '../Camera/context/SavedContext'
import { styles } from '../../src/components/crearReporteStyles'
import {
  LUGARES_PREDEFINIDOS,
  CATEGORIAS_OBJETOS,
  validarFormularioReporte,
  fetchEmpleadoAleatorio,
  obtenerOCrearLugar,
  insertarReporte,
  vincularReporteUsuario,
  insertarObjeto,
  notificarEmpleado,
} from '../../src/services/CrearReporteServices'
import * as React from 'react';

interface CrearReporteProps {
  idUser: number
  nombreUsuario: string
}

export default function CrearReporte({ }: CrearReporteProps) {
  const params = useLocalSearchParams()
  const idUser = params.idUser as string
  const nombreUsuario = params.nombreUsuario as string

  const { savedPhotos, uploadPhotosToSupabase, clearSavedPhotos } = useSaved()

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [departamento, setDepartamento] = useState<'mantenimiento' | 'sistemas'>('mantenimiento')
  const [lugarSeleccionado, setLugarSeleccionado] = useState('')
  const [pisoLugar, setPisoLugar] = useState('')
  const [nombreObjeto, setNombreObjeto] = useState('')
  const [categoriaObjeto, setCategoriaObjeto] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleGoToCamera = () => router.push('/Camera')

  const crearReporte = async () => {
    const error = validarFormularioReporte({
      titulo, descripcion, nombreObjeto, categoriaObjeto, lugarSeleccionado, pisoLugar,
    })
    if (error) { Alert.alert('Error', error); return }

    setCargando(true)
    try {
      const pisoNumero = parseInt(pisoLugar)

      const idEmplAleatorio = await fetchEmpleadoAleatorio(departamento)
      const idLugarDB = await obtenerOCrearLugar(lugarSeleccionado, pisoNumero)
      const idReporte = await insertarReporte(descripcion, idEmplAleatorio, idUser)

      // Notificar al empleado
      if (idEmplAleatorio) {
        try {
          await notificarEmpleado({
            idReporte,
            idEmpleado: idEmplAleatorio,
            nombreUsuario,
            descripcion,
            nombreObjeto,
            categoriaObjeto,
            lugar: lugarSeleccionado,
            piso: pisoNumero,
            fotosUris: savedPhotos.map(p => p.uri),
          })
        } catch (e) {
          console.error('Error al enviar notificación:', e)
        }
      }

      // Subir fotos
      if (savedPhotos.length > 0) {
        try {
          await uploadPhotosToSupabase(idReporte)
        } catch {
          Alert.alert('Advertencia', 'El reporte se creó pero hubo un problema al subir las fotos')
        }
      }

      await vincularReporteUsuario(idReporte, idUser)
      await insertarObjeto(nombreObjeto, categoriaObjeto, idLugarDB, idReporte)

      clearSavedPhotos()

      Alert.alert(
        'Éxito',
        `Reporte creado${savedPhotos.length > 0 ? ` con ${savedPhotos.length} foto(s)` : ''} y asignado a empleado ${idEmplAleatorio || 'sin asignar'}`,
        [{
          text: 'OK',
          onPress: () => {
            setTitulo(''); setDescripcion(''); setDepartamento('mantenimiento')
            setLugarSeleccionado(''); setPisoLugar(''); setNombreObjeto(''); setCategoriaObjeto('')
            router.back()
          }
        }]
      )
    } catch (err: any) {
      console.error('Error al crear reporte:', err)
      Alert.alert('Error', err.message || 'No se pudo crear el reporte')
    } finally {
      setCargando(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2F455C" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Crear Nuevo Reporte</Text>
          <Text style={styles.subtitle}>Creado por: {nombreUsuario}</Text>
        </View>
      </View>

      <View style={styles.formContainer}>

        {/* FOTOS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="camera" size={20} color="#21D0B2" />
            <Text style={styles.sectionTitle}>Fotografías del Problema</Text>
          </View>
          <TouchableOpacity style={styles.cameraButton} onPress={handleGoToCamera}>
            <Ionicons name="camera" size={24} color="#FFFFFF" />
            <Text style={styles.cameraButtonText}>
              {savedPhotos.length > 0 ? 'Agregar más fotos' : 'Tomar Fotos'}
            </Text>
          </TouchableOpacity>
          {savedPhotos.length > 0 && (
            <View style={styles.photosPreview}>
              <Text style={styles.photosCount}>
                {savedPhotos.length} foto{savedPhotos.length !== 1 ? 's' : ''} lista{savedPhotos.length !== 1 ? 's' : ''} para subir
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {savedPhotos.map((photo) => (
                  <Image key={photo.id} source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* TÍTULO */}
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

        {/* DESCRIPCIÓN */}
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

        {/* OBJETO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube" size={20} color="#21D0B2" />
            <Text style={styles.sectionTitle}>Información del Objeto</Text>
          </View>
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
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Categoría del Objeto *</Text>
            <ScrollView style={styles.categoriasContainer} nestedScrollEnabled>
              {CATEGORIAS_OBJETOS.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoriaCard, categoriaObjeto === cat.id && styles.categoriaCardActive]}
                  onPress={() => setCategoriaObjeto(cat.id)}
                >
                  <View style={styles.categoriaInfo}>
                    <Ionicons name={cat.icono as any} size={24} color={categoriaObjeto === cat.id ? '#21D0B2' : '#8B9BA8'} />
                    <Text style={[styles.categoriaNombre, categoriaObjeto === cat.id && styles.categoriaNombreActive]}>
                      {cat.nombre}
                    </Text>
                  </View>
                  {categoriaObjeto === cat.id && <Ionicons name="checkmark-circle" size={24} color="#21D0B2" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* UBICACIÓN */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#21D0B2" />
            <Text style={styles.sectionTitle}>Ubicación</Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Lugar *</Text>
            <ScrollView style={styles.lugaresContainer} nestedScrollEnabled>
              {LUGARES_PREDEFINIDOS.map((lugar) => (
                <TouchableOpacity
                  key={lugar}
                  style={[styles.lugarCard, lugarSeleccionado === lugar && styles.lugarCardActive]}
                  onPress={() => setLugarSeleccionado(lugar)}
                >
                  <View style={styles.lugarInfo}>
                    <Ionicons name="business" size={20} color={lugarSeleccionado === lugar ? '#21D0B2' : '#8B9BA8'} />
                    <Text style={[styles.lugarNombre, lugarSeleccionado === lugar && styles.lugarNombreActive]}>
                      {lugar}
                    </Text>
                  </View>
                  {lugarSeleccionado === lugar && <Ionicons name="checkmark-circle" size={24} color="#21D0B2" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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

        {/* DEPARTAMENTO */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Departamento Responsable *</Text>
          <View style={styles.departmentContainer}>
            {(['mantenimiento', 'sistemas'] as const).map((dep) => (
              <TouchableOpacity
                key={dep}
                style={[styles.departmentButton, departamento === dep && styles.departmentButtonActive]}
                onPress={() => setDepartamento(dep)}
              >
                <Ionicons
                  name={dep === 'mantenimiento' ? 'construct' : 'laptop'}
                  size={20}
                  color={departamento === dep ? '#FFFFFF' : '#2F455C'}
                />
                <Text style={[styles.departmentText, departamento === dep && styles.departmentTextActive]}>
                  {dep === 'mantenimiento' ? 'Mantenimiento' : 'Sistemas'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* INFO */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#21D0B2" />
          <Text style={styles.infoText}>
            El reporte se creará con estado "Pendiente" y la prioridad será asignada por el personal correspondiente.
          </Text>
        </View>

        {/* BOTONES */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={crearReporte} disabled={cargando}>
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