// 📋 ReportePendienteCard.tsx
// Tarjeta presentacional para ReportesPendientes.
// Todo el diseño viene de reportesPendientesStyles — sin estilos propios.
// Todo por props — sin async, sin services, sin useEffect.

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { ReporteCompleto } from '../../services/empleado/ReportesPendientesService'
import { colors, styles } from '../../styles/reportes/reportesPendientesStyles'
import FormularioEdicion from './FormularioEdicion'

interface Props {
  reporte:            ReporteCompleto
  esJefe:             boolean
  permitirReasignar:  boolean
  enEdicion:          boolean
  colorEstado:        string
  colorPrioridad:     string
  iniciales:          string
  nuevoEstado:        string
  nuevaPrioridad:     string
  nuevoComentario:    string
  estadosValidos:     string[]
  prioridadesValidas: string[]
  onVerFoto:          (uri: string) => void
  onEditar:           () => void
  onAsignar:          () => void
  onGuardar:          () => void
  onCancelar:         () => void
  onEstadoChange:     (v: string) => void
  onPrioridadChange:  (v: string) => void
  onComentarioChange: (v: string) => void
}

export default function ReportePendienteCard(p: Props) {
  const { reporte, esJefe, permitirReasignar, enEdicion, colorEstado, colorPrioridad, iniciales } = p

  const renderFoto = () => reporte.imgReporte?.length > 0 && (
    <TouchableOpacity activeOpacity={0.85} onPress={() => p.onVerFoto(reporte.imgReporte[0])}>
      <Image source={{ uri: reporte.imgReporte[0] }} style={styles.cardImage} resizeMode="cover" />
      <View style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 6, padding: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons name="expand-outline" size={14} color="#FFF" />
        <Text style={{ color: '#FFF', fontSize: 11 }}>Ver foto</Text>
      </View>
    </TouchableOpacity>
  )

  const renderUsuario = () => (
    <View style={styles.userSection}>
      <View style={styles.userAvatar}><Text style={styles.userAvatarText}>{iniciales}</Text></View>
      <View style={styles.userInfo}>
        <Text style={styles.sectionLabel}>Reportado por</Text>
        <Text style={styles.userName}>{reporte.usuario?.nomUser} {reporte.usuario?.apeUser}</Text>
        <Text style={styles.userEmail}>{reporte.usuario?.correoUser}</Text>
      </View>
    </View>
  )

  const renderInfo = () => (
    <View style={styles.infoGrid}>
      {reporte.lugar && (
        <View style={styles.infoChip}>
          <View style={styles.infoChipIconWrap}><Ionicons name="location" size={15} color={colors.accent} /></View>
          <View style={styles.infoChipContent}>
            <Text style={styles.infoChipLabel}>Ubicación</Text>
            <Text style={styles.infoChipText}>
              {reporte.lugar.nomLugar} · Piso {reporte.lugar.pisoLugar} · {reporte.lugar.aulaLugar}
              {reporte.lugar.numAula ? ` ${reporte.lugar.numAula}` : ''}
            </Text>
          </View>
        </View>
      )}
      {reporte.objeto && (
        <View style={styles.infoChip}>
          <View style={styles.infoChipIconWrap}><Ionicons name="cube-outline" size={15} color={colors.mint} /></View>
          <View style={styles.infoChipContent}>
            <Text style={styles.infoChipLabel}>Objeto</Text>
            <Text style={styles.infoChipText}>{reporte.objeto.nomObj}{reporte.objeto.ctgobj ? ` · ${reporte.objeto.ctgobj}` : ''}</Text>
          </View>
        </View>
      )}
    </View>
  )

  const renderAcciones = () => (
    <View style={styles.actionRow}>
      <TouchableOpacity style={styles.editButton} onPress={p.onEditar}>
        <Ionicons name="create-outline" size={17} color={colors.accent} />
        <Text style={styles.editButtonText}>Editar</Text>
      </TouchableOpacity>
      {esJefe && (
        <TouchableOpacity style={styles.assignButton} onPress={p.onAsignar}>
          <Ionicons name="person-add-outline" size={17} color={colors.bg} />
          <Text style={styles.assignButtonText}>{permitirReasignar ? 'Reasignar' : 'Asignar'}</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <View style={styles.card}>
      <View style={[styles.cardAccentBar, { backgroundColor: colorEstado }]} />
      {renderFoto()}
      <View style={styles.cardContent}>
        {renderUsuario()}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{reporte.objeto?.nomObj || 'Sin título'}</Text>
          <Text style={styles.cardDate}>{new Date(reporte.fecReporte).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
        </View>
        <Text style={styles.cardDescription}>{reporte.descriReporte}</Text>
        {renderInfo()}
        <View style={styles.badgeRow}>
          <View style={[styles.badgeWrap, { borderColor: colorEstado, backgroundColor: `${colorEstado}18` }]}>
            <View style={[styles.badgeDot, { backgroundColor: colorEstado }]} />
            <Text style={[styles.badgeText, { color: colorEstado }]}>{reporte.estReporte}</Text>
          </View>
          <View style={[styles.badgeWrap, { borderColor: colorPrioridad, backgroundColor: `${colorPrioridad}18` }]}>
            <View style={[styles.badgeDot, { backgroundColor: colorPrioridad }]} />
            <Text style={[styles.badgeText, { color: colorPrioridad }]}>{reporte.prioReporte}</Text>
          </View>
        </View>
        {reporte.empleado && (
          <View style={styles.assigneeContainer}>
            <Ionicons name="person-circle-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.assigneeText}>
              Asignado a <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{reporte.empleado.nomEmpl} {reporte.empleado.apeEmpl}</Text>
            </Text>
          </View>
        )}
        {!enEdicion && reporte.comentReporte && (
          <View style={styles.commentContainer}>
            <View style={styles.commentHeader}>
              <Ionicons name="chatbox-ellipses-outline" size={15} color={colors.mint} />
              <Text style={styles.commentLabel}>Comentario</Text>
            </View>
            <Text style={styles.commentText}>{reporte.comentReporte}</Text>
          </View>
        )}
        {enEdicion ? (
          <FormularioEdicion
            nuevoEstado={p.nuevoEstado} nuevaPrioridad={p.nuevaPrioridad} nuevoComentario={p.nuevoComentario}
            estados={p.estadosValidos} prioridades={p.prioridadesValidas}
            onEstadoChange={p.onEstadoChange} onPrioridadChange={p.onPrioridadChange} onComentarioChange={p.onComentarioChange}
            onGuardar={p.onGuardar} onCancelar={p.onCancelar}
          />
        ) : renderAcciones()}
      </View>
    </View>
  )
}