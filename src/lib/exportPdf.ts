import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { csvDate } from './exportCsv'

export function exportPdf(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string,
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  doc.setFontSize(13)
  doc.text(title, 40, 36)
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text(`Generated ${csvDate()}`, 40, 52)

  autoTable(doc, {
    head: [headers],
    body: rows as string[][],
    startY: 64,
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [21, 101, 192], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  })

  doc.save(filename)
}

export { csvDate }
