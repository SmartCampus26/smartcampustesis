// src/components/ReporteDetalleModal.tsx
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { Reporte } from '../../types/Database'

const getStatusColor  = (e: string) => {
  switch ((e||'').toLowerCase()) {
    case 'pendiente':  return { bg: '#FFF3E0', text: '#E65100' }
    case 'en proceso': return { bg: '#E3F2FD', text: '#0D47A1' }
    case 'resuelto':
    case 'completado': return { bg: '#E8F5E9', text: '#1B5E20' }
    default:           return { bg: '#F5F5F5', text: '#424242' }
  }
}

const getPriorityColor = (p: string) => {
  switch ((p||'').toLowerCase()) {
    case 'alta':    return { bg: '#FCE4EC', text: '#880E4F' }
    case 'media':   return { bg: '#FFF8E1', text: '#F57F17' }
    case 'baja':    return { bg: '#E8F5E9', text: '#1B5E20' }
    case 'urgente': return { bg: '#FCE4EC', text: '#B71C1C' }
    default:        return { bg: '#F5F5F5', text: '#424242' }
  }
}

const formatId = (id: string): string => {
  if (!id) return ''
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}…${id.slice(-5)}`
}

interface Props {
  visible: boolean
  reporte: Reporte | null
  onClose: () => void
}

const { height } = Dimensions.get('window')

const ReporteDetalleModal: React.FC<Props> = ({ visible, reporte, onClose }) => {
  if (!reporte) return null

  const r        = reporte as any
  const usuario  = r.usuario  ?? null
  const empleado = r.empleado ?? null
  const objetoArr = Array.isArray(r.objeto) ? r.objeto : (r.objeto ? [r.objeto] : [])
  const objeto   = objetoArr[0] ?? null
  const lugar    = r.lugar ?? null
  const tieneImagenes = Array.isArray(r.imgReporte) && r.imgReporte.length > 0
  const tieneComent   = !!(r.comentReporte && String(r.comentReporte).trim())

  const stColor = getStatusColor(r.estReporte)
  const prColor = r.prioReporte && r.prioReporte !== 'no asignada'
    ? getPriorityColor(r.prioReporte) : null

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>

          {/* Pill */}
          <View style={s.pillWrap}>
            <View style={s.pill} />
          </View>

          {/* Header */}
          <View style={s.header}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={s.headerLabel}>Reporte</Text>
              <Text style={s.headerId} numberOfLines={1}>
                #{formatId(String(r.idReporte))}
              </Text>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color="#5F6368" />
            </TouchableOpacity>
          </View>

          {/* Badges */}
          <View style={s.badgesRow}>
            <View style={[s.badge, { backgroundColor: stColor.bg }]}>
              <Text style={[s.badgeText, { color: stColor.text }]}>{r.estReporte || 'Sin estado'}</Text>
            </View>
            {prColor && (
              <View style={[s.badge, { backgroundColor: prColor.bg }]}>
                <Ionicons name="flag" size={11} color={prColor.text} style={{ marginRight: 4 }} />
                <Text style={[s.badgeText, { color: prColor.text }]}>{r.prioReporte}</Text>
              </View>
            )}
          </View>

          <View style={s.divider} />

          {/* Scroll */}
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Imágenes */}
            {tieneImagenes && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {r.imgReporte.map((uri: string, i: number) => (
                  <Image key={i} source={{ uri }} style={s.img} resizeMode="cover" />
                ))}
              </ScrollView>
            )}

            {/* Descripción */}
            <Card icon="document-text-outline" title="Descripción">
              <Text style={s.bodyText}>{r.descriReporte || 'Sin descripción'}</Text>
            </Card>

            {/* Fecha */}
            <Card icon="calendar-outline" title="Fecha de reporte">
              <Text style={s.bodyText}>
                {r.fecReporte
                  ? new Date(r.fecReporte).toLocaleDateString('es-ES', {
                      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                    })
                  : 'Sin fecha'}
              </Text>
            </Card>

            {/* Comentario */}
            {tieneComent && (
              <Card icon="chatbox-ellipses-outline" title="Comentario">
                <Text style={s.bodyText}>{r.comentReporte}</Text>
              </Card>
            )}

            {/* Solicitante */}
            {usuario && (
              <Card icon="person-outline" title="Solicitado por">
                <Row label="Nombre"
                  value={`${usuario.nomUser ?? ''} ${usuario.apeUser ?? ''}`.trim()} />
                {usuario.correoUser ? <Row label="Correo" value={usuario.correoUser} /> : null}
                {usuario.rolUser    ? <Row label="Rol"    value={usuario.rolUser}    /> : null}
              </Card>
            )}

            {/* Asignado */}
            {empleado && (
              <Card icon="construct-outline" title="Asignado a">
                <Row label="Nombre"
                  value={`${empleado.nomEmpl ?? ''} ${empleado.apeEmpl ?? ''}`.trim()} />
                {empleado.correoEmpl ? <Row label="Correo"       value={empleado.correoEmpl} /> : null}
                {empleado.deptEmpl   ? <Row label="Departamento" value={empleado.deptEmpl}   /> : null}
                {empleado.cargEmpl   ? <Row label="Cargo"        value={empleado.cargEmpl}   /> : null}
              </Card>
            )}

            {/* Objeto + Lugar en grid horizontal */}
            {(objeto || lugar) && (
              <View style={s.gridRow}>
                {objeto && (
                  <View style={[s.gridCard, { flex: 1 }]}>
                    <View style={s.gridCardHeader}>
                      <Ionicons name="desktop-outline" size={13} color="#1A73E8" />
                      <Text style={s.gridCardTitle}>Objeto</Text>
                    </View>
                    <View style={s.gridCardBody}>
                      {objeto.nomObj ? <GridRow label="Nombre"    value={objeto.nomObj} /> : null}
                      {objeto.ctgobj ? <GridRow label="Categoría" value={objeto.ctgobj} /> : null}
                    </View>
                  </View>
                )}
                {lugar && (
                  <View style={[s.gridCard, { flex: 1 }]}>
                    <View style={s.gridCardHeader}>
                      <Ionicons name="location-outline" size={13} color="#1A73E8" />
                      <Text style={s.gridCardTitle}>Ubicación</Text>
                    </View>
                    <View style={s.gridCardBody}>
                      {lugar.nomLugar  ? <GridRow label="Lugar"  value={lugar.nomLugar}            /> : null}
                      {lugar.pisoLugar ? <GridRow label="Piso"   value={`Piso ${lugar.pisoLugar}`} /> : null}
                      {lugar.aulaLugar ? <GridRow label="Aula"   value={lugar.aulaLugar}            /> : null}
                      {lugar.numAula   ? <GridRow label="Núm."   value={lugar.numAula}              /> : null}
                    </View>
                  </View>
                )}
              </View>
            )}

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const Card: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({
  icon, title, children,
}) => (
  <View style={s.card}>
    <View style={s.cardHeader}>
      <Ionicons name={icon as any} size={14} color="#1A73E8" />
      <Text style={s.cardTitle}>{title}</Text>
    </View>
    <View style={s.cardBody}>{children}</View>
  </View>
)

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={s.row}>
    <Text style={s.rowLabel}>{label}:</Text>
    <Text style={s.rowValue}>{value}</Text>
  </View>
)

const GridRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={{ marginBottom: 5 }}>
    <Text style={{ fontSize: 11, color: '#757575', marginBottom: 1 }}>{label}</Text>
    <Text style={{ fontSize: 13, color: '#202124', fontWeight: '500' }} numberOfLines={2}>{value}</Text>
  </View>
)

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.86,
    flexDirection: 'column',
  },
  pillWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 2,
  },
  pill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 2,
  },
  headerLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  headerId: {
    fontSize: 19,
    fontWeight: '500',
    color: '#202124',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
    marginBottom: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 10,
  },
  img: {
    width: 200,
    height: 140,
    borderRadius: 12,
    marginRight: 10,
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F1F3F4',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#5F6368',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardBody: {
    padding: 14,
  },
  bodyText: {
    fontSize: 14,
    color: '#202124',
    lineHeight: 21,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 7,
    flexWrap: 'wrap',
  },
  rowLabel: {
    fontSize: 13,
    color: '#757575',
    width: 106,
    flexShrink: 0,
  },
  rowValue: {
    fontSize: 13,
    color: '#202124',
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  gridCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F1F3F4',
  },
  gridCardTitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#5F6368',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  gridCardBody: {
    padding: 12,
  },
})

export default ReporteDetalleModal