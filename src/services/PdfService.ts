import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'

export async function generarPDF(reportes: any[], stats: any) {
  const html = `
    <h1>Informe de Reportes</h1>

    <h2>Resumen</h2>
    <ul>
      <li>Total: ${stats.total}</li>
      <li>Pendientes: ${stats.pendientes}</li>
      <li>En proceso: ${stats.enProceso}</li>
      <li>Resueltos: ${stats.resueltos}</li>
    </ul>

    <h2>Detalle</h2>
    <table border="1" cellspacing="0" cellpadding="5">
      <tr>
        <th>ID</th>
        <th>Estado</th>
        <th>Prioridad</th>
        <th>Fecha</th>
      </tr>
      ${reportes.map(r => `
        <tr>
          <td>${r.idReporte}</td>
          <td>${r.estReporte}</td>
          <td>${r.prioReporte}</td>
          <td>${new Date(r.fecReporte).toLocaleDateString()}</td>
        </tr>
      `).join('')}
    </table>
  `

  const { uri } = await Print.printToFileAsync({ html })
  await Sharing.shareAsync(uri)
}
