// 🔄 ReasignarEmpleado.tsx — sin lógica de negocio, solo orquestación.
// Lógica → useReasignarEmpleado | Estilos → reasignarEmpleadoStyles

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { styles } from '../../src/styles/usuario/reasignarEmpleadoStyles'
import ModalColaboradores  from '../../src/components/reportes/ModalColaboradores'
import ReporteDetalleModal from '../../src/components/reportes/ReporteDetalleModal'
import ConfirmModal        from '../../src/components/ui/ConfirmModal'
import EmptyState          from '../../src/components/ui/EmptyState'
import LoadingScreen       from '../../src/components/ui/LoadingScreen'
import StatCard            from '../../src/components/dashboard/StatCard'
import StatsContainer      from '../../src/components/dashboard/StatsContainer'
import { useReasignarEmpleado } from '../../src/hooks/usuarios/useReasignarEmpleado'
import { Empleado, Reporte } from '../../src/types/Database'

export default function ReasignarEmpleado() {
  const {
    empleados, reportes, empleadosFiltrados,
    cargando, error,
    modalVisible, setModalVisible,
    reporteSeleccionado, abrirModal, reasignar,
    filtroDepto, setFiltroDepto,
    filtroCargo, setFiltroCargo,
    getNombreAsignado,
  } = useReasignarEmpleado()

  const [detalleVisible, setDetalleVisible] = React.useState(false)
  const [reporteDetalle, setReporteDetalle] = React.useState<Reporte | null>(null)
  const [confirm, setConfirm] = React.useState({
    visible: false, titulo: '', mensaje: '', onConfirm: () => {},
  })

  const openConfirm = (titulo: string, mensaje: string, onConfirm: () => void) =>
    setConfirm({ visible: true, titulo, mensaje, onConfirm })
  const closeConfirm = () => setConfirm(p => ({ ...p, visible: false }))

  const confirmarReasignacion = (empleado: Empleado) =>
    openConfirm(
      'Confirmar Reasignación',
      `¿Reasignar reporte a ${empleado.nomEmpl} ${empleado.apeEmpl}?`,
      () => { closeConfirm(); reasignar(empleado.idEmpl) },
    )

  if (cargando) return <LoadingScreen />
  if (error)    return <EmptyState icon="alert-circle-outline" title="Error al cargar" subtitle={error} />

  const filtros = (
    <View style={styles.filterWrap}>
      <Text style={styles.filterLabel}>Filtrar por:</Text>
      <View style={styles.filterRow}>
        {(['todos', 'mantenimiento', 'sistemas'] as const).map(dep => (
          <TouchableOpacity key={dep} style={[styles.chip, filtroDepto === dep && styles.chipActive]} onPress={() => setFiltroDepto(dep)}>
            <Text style={[styles.chipText, filtroDepto === dep && styles.chipTextActive]}>
              {dep === 'todos' ? 'Todos' : dep === 'mantenimiento' ? 'Mantenimiento' : 'Sistemas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.filterRow}>
        {(['todos', 'colaborador', 'jefe'] as const).map(cargo => (
          <TouchableOpacity key={cargo} style={[styles.chip, filtroCargo === cargo && styles.chipActive]} onPress={() => setFiltroCargo(cargo)}>
            <Text style={[styles.chipText, filtroCargo === cargo && styles.chipTextActive]}>
              {cargo === 'todos' ? 'Todos' : cargo === 'colaborador' ? 'Colaborador' : 'Jefe'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <ScrollView>
        <StatsContainer>
          <StatCard value={empleados.length} label="Colaboradores" color="#1DCDFE" iconName="people" />
          <StatCard value={reportes.length}  label="Reportes"      color="#21D0B2" iconName="document-text" />
        </StatsContainer>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reportes Activos</Text>
          <Text style={styles.sectionSub}>Selecciona un reporte para reasignar</Text>

          {reportes.length === 0
            ? <EmptyState icon="folder-open-outline" title="No hay reportes disponibles" />
            : reportes.map((reporte: Reporte) => (
                <View key={reporte.idReporte} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>#{String(reporte.idReporte).slice(0, 8)}</Text>
                    </View>
                    <Ionicons name="document-text-outline" size={24} color="#2F455C" />
                  </View>
                  <Text style={styles.desc} numberOfLines={2}>{reporte.descriReporte || 'Sin descripción'}</Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.pill, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={styles.pillText}>{reporte.estReporte}</Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={styles.pillText}>{reporte.prioReporte}</Text>
                    </View>
                  </View>
                  <View style={styles.assigned}>
                    <Ionicons name="person-outline" size={16} color="#6B7280" />
                    <Text style={styles.assignedText}>Asignado a: {getNombreAsignado(reporte.idEmpl)}</Text>
                  </View>
                  <TouchableOpacity style={styles.btnDetail} onPress={() => { setReporteDetalle(reporte); setDetalleVisible(true) }}>
                    <Ionicons name="eye-outline" size={18} color="#1DCDFE" />
                    <Text style={styles.btnDetailText}>Ver detalle completo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnReassign} onPress={() => abrirModal(reporte)}>
                    <Ionicons name="swap-horizontal" size={20} color="#FFF" />
                    <Text style={styles.btnReassignTxt}>Reasignar Colaborador</Text>
                  </TouchableOpacity>
                </View>
              ))
          }
        </View>
      </ScrollView>

      <ModalColaboradores
        visible={modalVisible}
        reasignando
        colaboradores={empleadosFiltrados}
        getIniciales={(nom, ape) => `${nom?.[0] ?? ''}${ape?.[0] ?? ''}`.toUpperCase()}
        onSeleccionar={confirmarReasignacion}
        onCerrar={() => setModalVisible(false)}
        filtros={filtros}
      />

      <ReporteDetalleModal visible={detalleVisible} reporte={reporteDetalle} onClose={() => setDetalleVisible(false)} />

      <ConfirmModal
        visible={confirm.visible}
        titulo={confirm.titulo}
        mensaje={confirm.mensaje}
        labelConfirmar="Confirmar"
        accentColor="#4895ef"
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />
    </View>
  )
}