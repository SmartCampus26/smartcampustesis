// Importa el componente PieChart desde la librería react-native-chart-kit
// Este componente permite mostrar gráficos de pastel
import { PieChart } from 'react-native-chart-kit'
// Importa React, necesario para definir componentes funcionales
import React from 'react'

// Componente funcional GraficoEstados
// Recibe como prop un objeto llamado "stats" que contiene los datos estadísticos
export default function GraficoEstados({ stats }: any) {
  // Definición del arreglo de datos que usará el gráfico
  // Cada objeto representa una sección del gráfico de pastel
  const data = [
    { name: 'Pendientes', // Etiqueta del estado
      population: stats.pendientes, // Valor numérico
      color: '#FFA726' // Color del segmento
    },
    { name: 'En Proceso', population: stats.enProceso, color: '#21D0B2' },
    { name: 'Resueltos', population: stats.resueltos, color: '#34F5C5' },
  ]

  // Retorno del componente visual
  return (
    <PieChart
      data={data} // Datos que se mostrarán en el gráfico
      width={320} // Ancho del gráfico en píxeles
      height={220}  // Altura del gráfico en píxeles
      // Configuración visual del gráfico
      chartConfig={{
        color: () => '#000', // Color del texto (negro)
      }}
      accessor="population" // Indica qué propiedad contiene el valor numérico
      backgroundColor="transparent" // Fondo transparente
      paddingLeft="15" // Espaciado a la izquierda
    />
  )
}
