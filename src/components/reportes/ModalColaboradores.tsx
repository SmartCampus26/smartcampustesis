// 🧩 ModalColaboradores.tsx
// Modal presentacional para seleccionar o reasignar un colaborador.
// Usado en ReportesPendientes y ReasignarEmpleado.
// Sin lógica de negocio — todo por props.

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { colors, styles } from '../../styles/reportes/reportesPendientesStyles'
import { Empleado } from '../../types/Database'

interface Props {
  visible:       boolean
  reasignando:   boolean
  colaboradores: Empleado[]
  getIniciales:  (nom?: string, ape?: string) => string
  onSeleccionar: (colaborador: Empleado) => void
  onCerrar:      () => void
  /** Contenido opcional renderizado antes de la lista — usado para filtros */
  filtros?:      React.ReactNode
}

export default function ModalColaboradores({ visible, reasignando, colaboradores, getIniciales, onSeleccionar, onCerrar, filtros }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCerrar}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {reasignando ? 'Reasignar Colaborador' : 'Asignar Colaborador'}
            </Text>
            <TouchableOpacity onPress={onCerrar}>
              <Ionicons name="close-circle" size={28} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {filtros}

          <ScrollView showsVerticalScrollIndicator={false}>
            {colaboradores.length === 0
              ? <Text style={styles.modalEmptyText}>No hay colaboradores disponibles</Text>
              : colaboradores.map(colab => (
                  <TouchableOpacity key={colab.idEmpl} style={styles.colaboradorItem} onPress={() => onSeleccionar(colab)}>
                    <View style={styles.colaboradorAvatar}>
                      <Text style={styles.colaboradorAvatarText}>{getIniciales(colab.nomEmpl, colab.apeEmpl)}</Text>
                    </View>
                    <View style={styles.colaboradorInfo}>
                      <Text style={styles.colaboradorNombre}>{colab.nomEmpl} {colab.apeEmpl}</Text>
                      <Text style={styles.colaboradorCorreo}>{colab.correoEmpl}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ))
            }
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}