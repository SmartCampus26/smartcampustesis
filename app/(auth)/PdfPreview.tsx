/**
 * PdfPreview.tsx
 *
 * Pantalla de previsualización y descarga del PDF General Departamental.
 * Solo accesible para empleados con cargEmpl === 'jefe'.
 *
 * Se navega con router.push('/PdfPreview') desde HomeEmpleado.
 * Ubicación: app/(auth)/ (capa de vista)
 */

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { pdfPreviewStyles as styles } from '../../src/components/pdfPreviewStyles'
import { useToast } from '../../src/components/ToastContext'
import { useSesion } from '../../src/context/SesionContext'
import {
  cargarDatosPdfGeneral,
  DatosPdfGeneral,
} from '../../src/services/pdf/PdfDepartamentalService'
import { generarYDescargarPdfGeneral } from '../../src/services/pdf/PdfGeneralService'

export default function PdfPreview() {
  const { showToast } = useToast()
  const { sesion } = useSesion()  

  const [cargando, setCargando]           = useState(true)
  const [generando, setGenerando]         = useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [datos, setDatos]                 = useState<DatosPdfGeneral | null>(null)
  const [error, setError]                 = useState<string | null>(null)

  useEffect(() => {
    if (sesion) cargarDatos()  // ← solo si hay sesión
  }, [sesion])  // ← depende de sesion

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      if (!sesion) return 
      const resultado = await cargarDatosPdfGeneral(sesion) 
      setDatos(resultado)
    } catch (err: any) {
      const msg = err?.message || 'No se pudieron cargar los datos del informe'
      console.error('[PdfPreview] Error al cargar datos:', msg)
  
      if (
        msg.includes('permisos') ||
        msg.includes('jefe') ||
        msg.includes('sesión') ||
        msg.includes('Sesión') ||
        msg.includes('válida')
      ) {
        router.back()
        return
      }
      setError(msg)
    } finally {
      setCargando(false)
    }
  
  }, [sesion])  

  const handleDescargar = async () => {
    if (!datos) return
    try {
      setGenerando(true)
      await generarYDescargarPdfGeneral(datos)
      showToast('PDF listo en el dispositivo', 'success')
    } catch (err: any) {
      const msg = err?.message ?? 'No se pudo generar el PDF'
      if (!msg.includes('proceso')) showToast(msg, 'error')
      else showToast(msg, 'info')
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setGenerando(false)
    }
  }

  /** Cancela la generación si se queda cargando */
  const cancelarGeneracion = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setGenerando(false)
    showToast('Generación cancelada', 'info')
  }

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.cargandoText}>Preparando informe…</Text>
      </View>
    )
  }

  if (error || !datos) {
    return (
      <View style={styles.centrado}>
        <Ionicons name="alert-circle-outline" size={56} color="#EF4444" />
        <Text style={styles.errorText}>{error || 'Error al cargar datos'}</Text>
        <TouchableOpacity style={styles.btnVolver} onPress={() => router.replace('/HomeAutoridad')}>
          <Ionicons name="arrow-back-outline" size={18} color="#6b7280" />
          <Text style={styles.btnVolverText}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const { tituloPdf, nombreGenerador, puestoGenerador, statsGlobales, grupos, todosLosEmpleados, departamento } = datos

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Encabezado */}
        <View style={styles.header}>
          <Ionicons name="document-text" size={40} color="#1e40af" />
          <Text style={styles.headerTitulo}>{tituloPdf}</Text>
          <Text style={styles.headerSub}>
            {nombreGenerador}{puestoGenerador ? ` (${puestoGenerador})` : ''}
          </Text>
          <Text style={styles.headerFecha}>
            {new Date().toLocaleDateString('es-ES', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </Text>
          <View style={styles.deptBadge}>
            <Ionicons
              name={departamento === 'sistemas' ? 'desktop-outline' : 'construct-outline'}
              size={14} color="#1e40af"
            />
            <Text style={styles.deptText}>
              {departamento.charAt(0).toUpperCase() + departamento.slice(1)}
            </Text>
          </View>
        </View>

        {/* Estadísticas globales */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Resumen del departamento</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: '#1e40af' }]}>
              <Text style={[styles.statNum, { color: '#1e40af' }]}>{statsGlobales.total}</Text>
              <Text style={styles.statLbl}>Total</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
              <Text style={[styles.statNum, { color: '#F59E0B' }]}>{statsGlobales.pendientes}</Text>
              <Text style={styles.statLbl}>Pendientes</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
              <Text style={[styles.statNum, { color: '#3B82F6' }]}>{statsGlobales.enProceso}</Text>
              <Text style={styles.statLbl}>En Proceso</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#22C55E' }]}>
              <Text style={[styles.statNum, { color: '#22C55E' }]}>{statsGlobales.resueltos}</Text>
              <Text style={styles.statLbl}>Resueltos</Text>
            </View>
          </View>
          <View style={styles.statEmpleados}>
            <Ionicons name="people-outline" size={18} color="#8B5CF6" />
            <Text style={styles.statEmpleadosText}>
              {statsGlobales.totalEmpleados} colaborador{statsGlobales.totalEmpleados !== 1 ? 'es' : ''} en el informe
            </Text>
          </View>
        </View>

        {/* Lista de colaboradores */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Todos los colaboradores del departamento</Text>
          {todosLosEmpleados.length === 0 ? (
            <View style={styles.sinDatos}>
              <Ionicons name="people-outline" size={40} color="#d1d5db" />
              <Text style={styles.sinDatosText}>Sin colaboradores en este departamento</Text>
            </View>
          ) : (
            todosLosEmpleados.map(grupo => {
              const pct = grupo.stats.total > 0
                ? Math.round((grupo.stats.resueltos / grupo.stats.total) * 100)
                : 0
              return (
                <View key={grupo.idEmpl} style={styles.filaEmpleado}>
                  <View style={styles.empleadoLeft}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {grupo.nombreCompleto.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.empleadoInfo}>
                      <Text style={styles.empleadoNombre}>{grupo.nombreCompleto}</Text>
                      <Text style={styles.empleadoCargo}>{grupo.cargo}</Text>
                    </View>
                    <View style={styles.empleadoTotal}>
                      <Text style={styles.empleadoTotalNum}>{grupo.stats.total}</Text>
                      <Text style={styles.empleadoTotalLbl}>reportes</Text>
                    </View>
                  </View>
                  <View style={styles.empleadoStatsRow}>
                    <View style={[styles.miniStat, { borderLeftColor: '#F59E0B' }]}>
                      <Text style={[styles.miniStatNum, { color: '#F59E0B' }]}>{grupo.stats.pendientes}</Text>
                      <Text style={styles.miniStatLbl}>Pend.</Text>
                    </View>
                    <View style={[styles.miniStat, { borderLeftColor: '#3B82F6' }]}>
                      <Text style={[styles.miniStatNum, { color: '#3B82F6' }]}>{grupo.stats.enProceso}</Text>
                      <Text style={styles.miniStatLbl}>Proc.</Text>
                    </View>
                    <View style={[styles.miniStat, { borderLeftColor: '#22C55E' }]}>
                      <Text style={[styles.miniStatNum, { color: '#22C55E' }]}>{grupo.stats.resueltos}</Text>
                      <Text style={styles.miniStatLbl}>Res.</Text>
                    </View>
                    <View style={styles.progresoWrap}>
                      <View style={styles.progresoBar}>
                        <View style={[styles.progresoFill, { width: `${pct}%` as any }]} />
                      </View>
                      <Text style={styles.progresoLbl}>{pct}% resuelto</Text>
                    </View>
                  </View>
                </View>
              )
            })
          )}
        </View>

        {/* Botón descargar */}
        <TouchableOpacity
          style={[styles.btnDescargar, generando && styles.btnDescargarDisabled]}
          onPress={handleDescargar}
          disabled={generando}
          activeOpacity={0.8}
        >
          {generando ? (
            <TouchableOpacity
              onPress={cancelarGeneracion}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.btnDescargarText}>Generando…</Text>
              <Text style={{ color: '#fca5a5', fontSize: 12 }}>  Cancelar ✕</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Ionicons name="download-outline" size={22} color="#fff" />
              <Text style={styles.btnDescargarText}>Descargar PDF General</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnVolver} onPress={() => router.replace('/HomeEmpleado')}>
          <Ionicons name="arrow-back-outline" size={18} color="#6b7280" />
          <Text style={styles.btnVolverText}>Volver</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}