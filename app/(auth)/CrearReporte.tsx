// 📝 CrearReporte.tsx — solo orquestación, cero lógica, cero estilos propios.
// Toda la lógica (validación, inserción, notificación, navegación) vive en useCrearReporte.
//
// Orden de secciones:
//   1. Header  2. Fotos  3. Título  4. Descripción
//   5. Objeto (nombre + categorías lista)
//   6. Ubicación (lugares lista + piso + tipo aula dropdown + num aula condicional)
//   7. Departamento  8. Aviso  9. Botones

import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import * as React from 'react'
import { ActivityIndicator, Image, ScrollView, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { styles } from '../../src/styles/reportes/CrearReporteStyles'
import { CATEGORIAS_OBJETOS, LUGARES_PREDEFINIDOS, TIPOS_AULA } from '../../src/services/reportes/CrearReporteServices'
import { useCrearReporte } from '../../src/hooks/reportes/useCrearReporte'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'

export default function CrearReporte() {
  const { idUser, nombreUsuario } = useLocalSearchParams<{ idUser: string; nombreUsuario: string }>()

  const {
    titulo,            setTitulo,
    descripcion,       setDescripcion,
    departamento,      setDepartamento,
    lugarSeleccionado, setLugarSeleccionado,
    pisoLugar,         setPisoLugar,
    nombreObjeto,      setNombreObjeto,
    categoriaObjeto,   setCategoriaObjeto,
    aulaLugar,         setAulaLugar,
    aulaExpanded,      setAulaExpanded,
    numAula,           setNumAula,
    cargando,          savedPhotos,
    handleCrear,       handleCancelar, 
  } = useCrearReporte()
  
  useAndroidBack(handleCancelar)  

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>

        {/* 1. HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancelar}>
            <Ionicons name="arrow-back" size={24} color="#2F455C" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Crear Nuevo Reporte</Text>
            <Text style={styles.subtitle}>Creado por: {nombreUsuario}</Text>
          </View>
        </View>

        <View style={styles.formContainer}>

          {/* 2. FOTOS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera" size={20} color="#21D0B2" />
              <Text style={styles.sectionTitle}>Fotografías del Problema</Text>
            </View>
            <TouchableOpacity style={styles.cameraButton} onPress={() => require('expo-router').router.push('/Camera')}>
              <Ionicons name="camera" size={24} color="#FFFFFF" />
              <Text style={styles.cameraButtonText}>{savedPhotos.length > 0 ? 'Agregar más fotos' : 'Tomar Fotos'}</Text>
            </TouchableOpacity>
            {savedPhotos.length > 0 && (
              <View style={styles.photosPreview}>
                <Text style={styles.photosCount}>{savedPhotos.length} foto{savedPhotos.length !== 1 ? 's' : ''} lista{savedPhotos.length !== 1 ? 's' : ''} para subir</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {savedPhotos.map((photo) => (
                    <Image key={photo.id} source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* 3. TÍTULO */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Título del Reporte *</Text>
            <TextInput style={styles.input} placeholder="Ej: Problema con equipo en laboratorio" value={titulo} onChangeText={setTitulo} maxLength={100} />
          </View>

          {/* 4. DESCRIPCIÓN */}
          <SafeAreaView style={styles.inputContainer}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Describe el problema con detalle..." value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={4} textAlignVertical="top" maxLength={500} />
            <Text style={styles.charCount}>{descripcion.length}/500</Text>
          </SafeAreaView>

          {/* 5. OBJETO */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cube" size={20} color="#21D0B2" />
              <Text style={styles.sectionTitle}>Información del Objeto</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre del Objeto *</Text>
              <TextInput style={styles.input} placeholder="Ej: Computadora Dell, Lámpara LED, Silla, etc." value={nombreObjeto} onChangeText={setNombreObjeto} maxLength={100} />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Categoría del Objeto *</Text>
              <ScrollView style={styles.categoriasContainer} nestedScrollEnabled>
                {CATEGORIAS_OBJETOS.map((cat) => (
                  <TouchableOpacity key={cat.id} style={[styles.categoriaCard, categoriaObjeto === cat.id && styles.categoriaCardActive]} onPress={() => setCategoriaObjeto(cat.id)}>
                    <View style={styles.categoriaInfo}>
                      <Ionicons name={cat.icono as any} size={24} color={categoriaObjeto === cat.id ? '#21D0B2' : '#8B9BA8'} />
                      <Text style={[styles.categoriaNombre, categoriaObjeto === cat.id && styles.categoriaNombreActive]}>{cat.nombre}</Text>
                    </View>
                    {categoriaObjeto === cat.id && <Ionicons name="checkmark-circle" size={24} color="#21D0B2" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* 6. UBICACIÓN */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="#21D0B2" />
              <Text style={styles.sectionTitle}>Ubicación</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Lugar *</Text>
              <ScrollView style={styles.lugaresContainer} nestedScrollEnabled>
                {LUGARES_PREDEFINIDOS.map((lugar) => (
                  <TouchableOpacity key={lugar} style={[styles.lugarCard, lugarSeleccionado === lugar && styles.lugarCardActive]} onPress={() => setLugarSeleccionado(lugar)}>
                    <View style={styles.lugarInfo}>
                      <Ionicons name="business" size={20} color={lugarSeleccionado === lugar ? '#21D0B2' : '#8B9BA8'} />
                      <Text style={[styles.lugarNombre, lugarSeleccionado === lugar && styles.lugarNombreActive]}>{lugar}</Text>
                    </View>
                    {lugarSeleccionado === lugar && <Ionicons name="checkmark-circle" size={24} color="#21D0B2" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Piso *</Text>
              <TextInput style={styles.input} placeholder="Ej: 1, 2, 3..." value={pisoLugar} onChangeText={setPisoLugar} keyboardType="numeric" maxLength={2} />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tipo de Aula *</Text>
              <TouchableOpacity style={[styles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]} onPress={() => setAulaExpanded(!aulaExpanded)}>
                <Text style={{ color: aulaLugar ? '#2F455C' : '#A0ADB4', fontSize: 16 }}>{aulaLugar || 'Selecciona el tipo de aula...'}</Text>
                <Ionicons name={aulaExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#8B9BA8" />
              </TouchableOpacity>
              {aulaExpanded && (
                <View style={{ borderWidth: 1, borderColor: '#E1E8ED', borderRadius: 12, marginTop: 4, overflow: 'hidden' }}>
                  {TIPOS_AULA.map((tipo, index) => (
                    <TouchableOpacity key={tipo} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: aulaLugar === tipo ? '#F0FFFE' : '#FFFFFF', borderBottomWidth: index < TIPOS_AULA.length - 1 ? 1 : 0, borderBottomColor: '#F5F7FA' }} onPress={() => { setAulaLugar(tipo); setAulaExpanded(false) }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name={tipo === 'Ambiente Educativo' ? 'school-outline' : tipo === 'Laboratorio' ? 'flask-outline' : 'ellipsis-horizontal-outline'} size={20} color={aulaLugar === tipo ? '#21D0B2' : '#8B9BA8'} />
                        <Text style={{ fontSize: 15, color: aulaLugar === tipo ? '#21D0B2' : '#2F455C', fontWeight: aulaLugar === tipo ? '600' : '400' }}>{tipo}</Text>
                      </View>
                      {aulaLugar === tipo && <Ionicons name="checkmark-circle" size={20} color="#21D0B2" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {(aulaLugar === 'Ambiente Educativo' || aulaLugar === 'Laboratorio') && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.label}>Número de {aulaLugar === 'Laboratorio' ? 'Laboratorio' : 'Aula'} <Text style={{ color: '#8B9BA8', fontWeight: '400' }}>(opcional)</Text></Text>
                  <TextInput style={styles.input} placeholder={`Ej: ${aulaLugar === 'Laboratorio' ? 'Lab-01, Lab-202...' : 'Aula-101, A-05...'}`} value={numAula} onChangeText={setNumAula} maxLength={20} />
                </View>
              )}
            </View>
          </View>

          {/* 7. DEPARTAMENTO */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Departamento Responsable *</Text>
            <View style={styles.departmentContainer}>
              {(['mantenimiento', 'sistemas'] as const).map((dep) => (
                <TouchableOpacity key={dep} style={[styles.departmentButton, departamento === dep && styles.departmentButtonActive]} onPress={() => setDepartamento(dep)}>
                  <Ionicons name={dep === 'mantenimiento' ? 'construct' : 'laptop'} size={20} color={departamento === dep ? '#FFFFFF' : '#2F455C'} />
                  <Text style={[styles.departmentText, departamento === dep && styles.departmentTextActive]}>{dep === 'mantenimiento' ? 'Mantenimiento' : 'Sistemas'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 8. AVISO */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#21D0B2" />
            <Text style={styles.infoText}>El reporte se creará con estado "Pendiente" y será asignado por el jefe al colaborador correspondiente.</Text>
          </View>

          {/* 9. BOTONES */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelar}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={() => handleCrear(idUser!, nombreUsuario!)} disabled={cargando}>
              {cargando ? <ActivityIndicator color="#FFFFFF" /> : (
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