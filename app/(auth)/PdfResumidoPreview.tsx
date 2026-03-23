/**
 * PdfResumidoPreview.tsx
 *
 * Pantalla de previsualización del PDF Resumido para la autoridad.
 * Incluye selector de filtro por departamento.
 *
 * Se navega con router.push('/PdfResumidoPreview') desde HomeAutoridad.
 * Ubicación: app/(auth)/ (capa de vista)
 */

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import {
  cargarDatosPdfResumido,
  DatosPdfResumido,
  FiltroDepartamento,
} from '../../src/services/PdfDepartamentalService'
import { generarYDescargarPdfResumido } from '../../src/services/PdfResumidoService'
import { pdfResumidoPreviewStyles as styles } from '../../src/components/pdfResumidoPreviewStyles'
import { useToast } from '../../src/components/ToastContext'

// ─── Opciones del selector de filtro ─────────────────────────────────────────

const OPCIONES_FILTRO: { valor: FiltroDepartamento; label: string; icono: string }[] = [
  { valor: 'todos',         label: 'Todos',         icono: 'layers-outline'    },
  { valor: 'sistemas',      label: 'Sistemas',      icono: 'desktop-outline'   },
  { valor: 'mantenimiento', label: 'Mantenimiento', icono: 'construct-outline' },
]

export default function PdfResumidoPreview() {
  const { showToast } = useToast()
  const [filtro, setFiltro]               = useState<FiltroDepartamento>('todos')
  const [datos, setDatos]                 = useState<DatosPdfResumido | null>(null)
  const [cargando, setCargando]           = useState(true)
  const [generando, setGenerando]         = useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [error, setError]                 = useState<string | null>(null)

  useEffect(() => { cargarDatos(filtro) }, [filtro])

  const cargarDatos = useCallback(async (f: FiltroDepartamento) => {
    try {
      setCargando(true)
      setError(null)
      const resultado = await cargarDatosPdfResumido(f)
      setDatos(resultado)
    } catch (err: any) {
      const msg = err?.message || 'No se pudieron cargar los datos'
      setError(msg)
      if (msg.includes('permisos') || msg.includes('sesión')) {
        Alert.alert('Acceso denegado', msg, [
          { text: 'Aceptar', onPress: () => router.back() }
        ])
      }
    } finally {
      setCargando(false)
    }
  }, [])

  const handleDescargar = async () => {
    if (!datos) return
    try {
      setGenerando(true)
      await generarYDescargarPdfResumido(datos)
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
        <TouchableOpacity style={styles.btnVolver} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={18} color="#6b7280" />
          <Text style={styles.btnVolverText}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const { tituloPdf, nombreGenerador, puestoGenerador, statsGlobales, filas } = datos

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Encabezado */}
        <View style={styles.header}>
          <Ionicons name="bar-chart" size={38} color="#1e40af" />
          <Text style={styles.headerTitulo}>{tituloPdf}</Text>
          <Text style={styles.headerGen}>
            {nombreGenerador}{puestoGenerador ? ` (${puestoGenerador})` : ''}
          </Text>
          <Text style={styles.headerFecha}>
            {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* Selector de departamento */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Filtrar por departamento</Text>
          <View style={styles.filtroRow}>
            {OPCIONES_FILTRO.map(op => (
              <TouchableOpacity
                key={op.valor}
                style={[styles.filtroBtn, filtro === op.valor && styles.filtroBtnActivo]}
                onPress={() => setFiltro(op.valor)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={op.icono as any}
                  size={16}
                  color={filtro === op.valor ? '#ffffff' : '#1e40af'}
                />
                <Text style={[styles.filtroLabel, filtro === op.valor && styles.filtroLabelActivo]}>
                  {op.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estadísticas globales */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Resumen global</Text>
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
              {statsGlobales.totalEmpleados} colaborador{statsGlobales.totalEmpleados !== 1 ? 'es' : ''}
            </Text>
          </View>
        </View>

        {/* Vista previa de empleados */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Vista previa — Colaboradores</Text>
          {filas.length === 0 ? (
            <View style={styles.sinDatos}>
              <Ionicons name="people-outline" size={40} color="#d1d5db" />
              <Text style={styles.sinDatosText}>Sin colaboradores para este filtro</Text>
            </View>
          ) : (
            filas.map(fila => {
              const pct = fila.stats.total > 0
                ? Math.round((fila.stats.resueltos / fila.stats.total) * 100)
                : 0
              return (
                <View key={fila.idEmpl} style={styles.filaEmpleado}>
                  <View style={styles.empleadoLeft}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {fila.nombreCompleto.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.empleadoInfo}>
                      <Text style={styles.empleadoNombre}>{fila.nombreCompleto}</Text>
                      <Text style={styles.empleadoCargo}>
                        {fila.cargo} · <Text style={{ textTransform: 'capitalize' }}>{fila.departamento}</Text>
                      </Text>
                    </View>
                  </View>
                  <View style={styles.empleadoStats}>
                    <View style={styles.statMini}>
                      <Text style={[styles.statMiniNum, { color: '#1e40af' }]}>{fila.stats.total}</Text>
                      <Text style={styles.statMiniLbl}>Total</Text>
                    </View>
                    <View style={styles.statMini}>
                      <Text style={[styles.statMiniNum, { color: '#F59E0B' }]}>{fila.stats.pendientes}</Text>
                      <Text style={styles.statMiniLbl}>Pend.</Text>
                    </View>
                    <View style={styles.statMini}>
                      <Text style={[styles.statMiniNum, { color: '#3B82F6' }]}>{fila.stats.enProceso}</Text>
                      <Text style={styles.statMiniLbl}>Proc.</Text>
                    </View>
                    <View style={styles.statMini}>
                      <Text style={[styles.statMiniNum, { color: '#22C55E' }]}>{fila.stats.resueltos}</Text>
                      <Text style={styles.statMiniLbl}>Res.</Text>
                    </View>
                  </View>
                  <View style={styles.progreso}>
                    <View style={styles.progresoBar}>
                      <View style={[styles.progresoFill, { width: `${pct}%` as any }]} />
                    </View>
                    <Text style={styles.progresoLbl}>{pct}%</Text>
                  </View>
                </View>
              )
            })
          )}
        </View>

        {/* Botón descargar */}
        <TouchableOpacity
          style={[styles.btnDescargar, (generando || filas.length === 0) && styles.btnDescargarDisabled]}
          onPress={handleDescargar}
          disabled={generando || filas.length === 0}
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
              <Text style={styles.btnDescargarText}>Descargar PDF Resumido</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnVolver} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={18} color="#6b7280" />
          <Text style={styles.btnVolverText}>Volver</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}