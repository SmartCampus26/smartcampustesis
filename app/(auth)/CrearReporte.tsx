// 📋 CrearReporte.tsx
// Pantalla para crear un nuevo reporte de problema o solicitud.
// Permite adjuntar fotos, describir el objeto dañado, seleccionar
// ubicación y departamento responsable, y enviar el reporte a Supabase.

import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import * as React from 'react'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { styles } from '../../src/components/crearReporteStyles'
import {
  CATEGORIAS_OBJETOS,
  insertarObjeto,
  insertarReporte,
  LUGARES_PREDEFINIDOS,
  TIPOS_AULA,
  notificarJefeNuevoReporte,
  obtenerOCrearLugar,
  validarFormularioReporte,
  vincularReporteUsuario,
} from '../../src/services/CrearReporteServices'
import { useSaved } from '../Camera/context/SavedContext'
import { useToast } from '../../src/components/ToastContext'

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Props del componente (recibidas como params de navegación) */
interface CrearReporteProps {
  idUser: number       // ID del usuario que crea el reporte
  nombreUsuario: string // Nombre del usuario para mostrar en el header
}

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Pantalla de creación de reporte.
 * Recibe idUser y nombreUsuario como params de expo-router.
 * Al enviar, sube fotos a Supabase, inserta el reporte y notifica al jefe.
 */
export default function CrearReporte({ }: CrearReporteProps) {
  const params = useLocalSearchParams()
  const idUser = params.idUser as string
  const nombreUsuario = params.nombreUsuario as string

  const { savedPhotos, uploadPhotosToSupabase, clearSavedPhotos } = useSaved()
  const { showToast } = useToast()

  // ── Estado del formulario ─────────────────────────────────────────────────
  const [aulaLugar, setAulaLugar]           = useState('')
  const [aulaExpanded, setAulaExpanded]     = useState(false)
  const [numAula, setNumAula]               = useState('')
  const [titulo, setTitulo]                 = useState('')
  const [descripcion, setDescripcion]       = useState('')
  const [departamento, setDepartamento]     = useState<'mantenimiento' | 'sistemas'>('mantenimiento')
  const [lugarSeleccionado, setLugarSeleccionado] = useState('')
  const [pisoLugar, setPisoLugar]           = useState('')
  const [nombreObjeto, setNombreObjeto]     = useState('')
  const [categoriaObjeto, setCategoriaObjeto] = useState('')
  const [cargando, setCargando]             = useState(false)

  // ── Navegación ─────────────────────────────────────────────────────────────

  /** Navega a la pantalla de cámara para adjuntar fotos al reporte */
  const handleGoToCamera = () => router.push('/Camera')

  // ── Crear reporte ──────────────────────────────────────────────────────────

  /**
   * Valida el formulario y crea el reporte en Supabase.
   * Flujo:
   *   1. Valida campos requeridos
   *   2. Obtiene o crea el lugar en BD
   *   3. Inserta el reporte
   *   4. Sube fotos si hay (no bloquea si falla)
   *   5. Vincula reporte con usuario
   *   6. Inserta objeto reportado
   *   7. Notifica al jefe (no bloquea si falla)
   *   8. Limpia el formulario y vuelve atrás
   */
  const crearReporte = async () => {
    const error = validarFormularioReporte({
      titulo, descripcion, nombreObjeto, categoriaObjeto, lugarSeleccionado, pisoLugar, aulaLugar,
    })
    if (error) {
      showToast(error, 'error')
      return
    }

    setCargando(true)
    try {
      const pisoNumero = parseInt(pisoLugar)

      const idLugarDB = await obtenerOCrearLugar(lugarSeleccionado, pisoNumero, aulaLugar, numAula || undefined)
      const idReporte = await insertarReporte(descripcion, null, idUser)

      // Subida de fotos — no bloquea la creación si falla
      if (savedPhotos.length > 0) {
        try {
          await uploadPhotosToSupabase(idReporte)
        } catch {
          showToast('El reporte se creó pero hubo un problema al subir las fotos', 'info')
        }
      }

      await vincularReporteUsuario(idReporte, idUser)
      await insertarObjeto(nombreObjeto, categoriaObjeto, idLugarDB, idReporte)

      // Notificación al jefe — no bloquea si falla
      try {
        await notificarJefeNuevoReporte({
          idReporte,
          nombreUsuario,
          descripcion,
          nombreObjeto,
          categoriaObjeto,
          lugar: lugarSeleccionado,
          piso: pisoNumero,
          aulaLugar,
          numAula: numAula || undefined,
        })
      } catch (notifError) {
        console.error('Error al notificar al jefe:', notifError)
      }

      clearSavedPhotos()

      showToast(
        `Reporte creado${savedPhotos.length > 0 ? ` con ${savedPhotos.length} foto(s)` : ''}. El jefe asignará un colaborador.`,
        'success',
        3000
      )

      // Limpiar formulario y volver después de que el toast sea visible
      setTimeout(() => {
        setTitulo('')
        setDescripcion('')
        setDepartamento('mantenimiento')
        setLugarSeleccionado('')
        setPisoLugar('')
        setNombreObjeto('')
        setCategoriaObjeto('')
        setAulaLugar('')
        setNumAula('')
        router.back()
      }, 3000)

    } catch (err: any) {
      console.error('Error al crear reporte:', err)
      showToast(err.message || 'No se pudo crear el reporte', 'error')
    } finally {
      setCargando(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1 }}>
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

          {/* ── SECCIÓN: FOTOS ── */}
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
            {/* Previsualización de fotos guardadas */}
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

          {/* ── SECCIÓN: TÍTULO ── */}
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

          {/* ── SECCIÓN: DESCRIPCIÓN ── */}
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

          {/* ── SECCIÓN: OBJETO REPORTADO ── */}
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
            {/* Selector de categoría del objeto */}
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

          {/* ── SECCIÓN: UBICACIÓN ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="#21D0B2" />
              <Text style={styles.sectionTitle}>Ubicación</Text>
            </View>

            {/* Selector de lugar predefinido */}
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

            {/* Número de piso */}
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

            {/* Selector de tipo de aula con dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tipo de Aula *</Text>
              <TouchableOpacity
                style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                onPress={() => setAulaExpanded(!aulaExpanded)}
              >
                <Text style={{ color: aulaLugar ? '#2F455C' : '#A0ADB4', fontSize: 16 }}>
                  {aulaLugar || 'Selecciona el tipo de aula...'}
                </Text>
                <Ionicons name={aulaExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#8B9BA8" />
              </TouchableOpacity>

              {/* Opciones del dropdown de tipo de aula */}
              {aulaExpanded && (
                <View style={{ borderWidth: 1, borderColor: '#E1E8ED', borderRadius: 12, marginTop: 4, overflow: 'hidden' }}>
                  {TIPOS_AULA.map((tipo, index) => (
                    <TouchableOpacity
                      key={tipo}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 14,
                        backgroundColor: aulaLugar === tipo ? '#F0FFFE' : '#FFFFFF',
                        borderBottomWidth: index < TIPOS_AULA.length - 1 ? 1 : 0,
                        borderBottomColor: '#F5F7FA',
                      }}
                      onPress={() => { setAulaLugar(tipo); setAulaExpanded(false) }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons
                          name={
                            tipo === 'Ambiente Educativo' ? 'school-outline' :
                            tipo === 'Laboratorio' ? 'flask-outline' : 'ellipsis-horizontal-outline'
                          }
                          size={20}
                          color={aulaLugar === tipo ? '#21D0B2' : '#8B9BA8'}
                        />
                        <Text style={{ fontSize: 15, color: aulaLugar === tipo ? '#21D0B2' : '#2F455C', fontWeight: aulaLugar === tipo ? '600' : '400' }}>
                          {tipo}
                        </Text>
                      </View>
                      {aulaLugar === tipo && <Ionicons name="checkmark-circle" size={20} color="#21D0B2" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Campo opcional de número de aula — solo para aulas y laboratorios */}
              {(aulaLugar === 'Ambiente Educativo' || aulaLugar === 'Laboratorio') && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.label}>
                    Número de {aulaLugar === 'Laboratorio' ? 'Laboratorio' : 'Aula'}{' '}
                    <Text style={{ color: '#8B9BA8', fontWeight: '400' }}>(opcional)</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={`Ej: ${aulaLugar === 'Laboratorio' ? 'Lab-01, Lab-202...' : 'Aula-101, A-05...'}`}
                    value={numAula}
                    onChangeText={setNumAula}
                    maxLength={20}
                  />
                </View>
              )}
            </View>
          </View>

          {/* ── SECCIÓN: DEPARTAMENTO RESPONSABLE ── */}
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

          {/* ── NOTA INFORMATIVA ── */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#21D0B2" />
            <Text style={styles.infoText}>
              El reporte se creará con estado "Pendiente" y será asignado por el jefe al colaborador correspondiente.
            </Text>
          </View>

          {/* ── BOTONES DE ACCIÓN ── */}
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
    </View>
  )
}