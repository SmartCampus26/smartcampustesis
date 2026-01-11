import { PieChart } from 'react-native-chart-kit'
import React from 'react'

export default function GraficoEstados({ stats }: any) {
  const data = [
    { name: 'Pendientes', population: stats.pendientes, color: '#FFA726' },
    { name: 'En Proceso', population: stats.enProceso, color: '#21D0B2' },
    { name: 'Resueltos', population: stats.resueltos, color: '#34F5C5' },
  ]

  return (
    <PieChart
      data={data}
      width={320}
      height={220}
      chartConfig={{
        color: () => '#000',
      }}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="15"
    />
  )
}
