// ─── PersonaCard.tsx ──────────────────────────────────────────────────────────
// Tarjeta para mostrar datos de un usuario o empleado en el Buscador.
// Muestra nombre, badges de rol/departamento/cargo, correo, teléfono e ID.
// Incluye botón de eliminación opcional.
//
// Reemplaza renderUsuario y renderEmpleado en Buscador.tsx.
//
// USO (usuario):
//   <PersonaCard
//     tipo="usuario"
//     nombre="Juan Pérez"
//     rol="docente"
//     correo="juan@ejemplo.com"
//     telefono="0987654321"
//     fechaRegistro="2024-01-15"
//     id="abc-123"
//     onEliminar={() => eliminarUsuario(id, nombre)}
//   />
//
// USO (empleado):
//   <PersonaCard
//     tipo="empleado"
//     nombre="María López"
//     departamento="sistemas"
//     cargo="jefe"
//     correo="maria@ejemplo.com"
//     id="def-456"
//     onEliminar={() => eliminarEmpleado(id, nombre)}
//   />

import * as React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {
  BriefcaseBusiness,
  BookOpen,
  Wrench,
  Monitor,
  UserCog,
  HardHat,
  Mail,
  Smartphone,
  CalendarDays,
  IdCard,
  Trash2,
} from 'lucide-react-native'
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PersonaCardBaseProps {
  /** Nombre completo */
  nombre: string
  /** Correo electrónico */
  correo: string
  /** Teléfono (opcional) */
  telefono?: string | number
  /** ID del registro */
  id: string
  /** Callback de eliminación (opcional) */
  onEliminar?: () => void
}

interface UsuarioCardProps extends PersonaCardBaseProps {
  tipo: 'usuario'
  /** Rol del usuario: 'docente' | 'autoridad' */
  rol: string
  /** Fecha de registro ISO */
  fechaRegistro?: string
}

interface EmpleadoCardProps extends PersonaCardBaseProps {
  tipo: 'empleado'
  /** Departamento: 'sistemas' | 'mantenimiento' */
  departamento: string
  /** Cargo: 'jefe' | 'colaborador' */
  cargo: string
}

type PersonaCardProps = UsuarioCardProps | EmpleadoCardProps

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PersonaCard(props: PersonaCardProps) {
  const { nombre, correo, telefono, id, onEliminar } = props

  // Badge principal (rol para usuario, departamento para empleado)
  const badgePrincipalLabel = props.tipo === 'usuario'
    ? props.rol === 'autoridad' ? 'Coordinador' : 'Docente'
    : props.departamento === 'mantenimiento' ? 'Mantenimiento' : 'Sistemas'

  const BadgePrincipalIcon = props.tipo === 'usuario'
    ? props.rol === 'autoridad' ? BriefcaseBusiness : BookOpen
    : props.departamento === 'mantenimiento' ? Wrench : Monitor

  // Badge secundario (solo para empleados: cargo)
  const badgeSecundarioLabel = props.tipo === 'empleado'
    ? props.cargo === 'jefe' ? 'Jefe' : 'Colaborador'
    : null

  const BadgeSecundarioIcon = props.tipo === 'empleado'
    ? props.cargo === 'jefe' ? UserCog : HardHat
    : null

  // Color del borde izquierdo según tipo
  const borderColor = props.tipo === 'usuario' ? '#4ECDC4' : '#FFD93D'

  return (
    <View style={[styles.card, { borderLeftColor: borderColor }]}>

      {/* Cabecera: nombre + badges + botón eliminar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.nombre}>{nombre}</Text>
          <View style={styles.badgesRow}>
            <View style={[
              styles.badge,
              props.tipo === 'usuario'
                ? (props.rol === 'autoridad' ? styles.badgeAutoridad : styles.badgeDocente)
                : styles.badgeDepartamento,
            ]}>
              <BadgePrincipalIcon size={13} color={COLORS.textPrimary} style={styles.badgeIcon} />
              <Text style={styles.badgeText}>{badgePrincipalLabel}</Text>
            </View>
            {!!badgeSecundarioLabel && !!BadgeSecundarioIcon && (
              <View style={[
                styles.badge,
                (props as EmpleadoCardProps).cargo === 'jefe'
                  ? styles.badgeJefe
                  : styles.badgeColaborador,
              ]}>
                <BadgeSecundarioIcon size={13} color={COLORS.textPrimary} style={styles.badgeIcon} />
                <Text style={styles.badgeText}>{badgeSecundarioLabel}</Text>
              </View>
            )}
          </View>
        </View>

        {!!onEliminar && (
          <TouchableOpacity style={styles.btnEliminar} onPress={onEliminar}>
            <Trash2 size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Cuerpo: datos de contacto */}
      <View style={styles.body}>
        <InfoRow Icon={Mail} label="Correo:" value={correo} />
        <InfoRow
          Icon={Smartphone}
          label="Teléfono:"
          value={telefono ? String(telefono) : 'No registrado'}
        />
        {props.tipo === 'usuario' && !!props.fechaRegistro && (
          <InfoRow
            Icon={CalendarDays}
            label="Registro:"
            value={new Date(props.fechaRegistro).toLocaleDateString()}
          />
        )}
        <InfoRow Icon={IdCard} label="ID:" value={id} />
      </View>
    </View>
  )
}

// ─── Subcomponente: fila de información ───────────────────────────────────────

function InfoRow({ Icon, label, value }: { Icon: React.ComponentType<{ size: number; color: string }>; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Icon size={15} color={COLORS.textSecondary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgPrimary,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
  },
  nombre: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    gap: SPACING.xs,
  },
  badgeIcon: {
    marginRight: 2,
  },
  badgeAutoridad:   { backgroundColor: 'rgba(255,107,107,0.12)' },
  badgeDocente:     { backgroundColor: 'rgba(78,205,196,0.12)' },
  badgeDepartamento:{ backgroundColor: 'rgba(255,217,61,0.12)' },
  badgeJefe:        { backgroundColor: 'rgba(155,89,182,0.12)' },
  badgeColaborador: { backgroundColor: 'rgba(149,165,166,0.12)' },
  badgeText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  btnEliminar: {
    padding: SPACING.sm,
  },
  body: {
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
    width: 100,
  },
  infoValue: {
    flex: 1,
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textPrimary,
  },
})