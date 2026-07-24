import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PdfExportOptions {
  title: string;
  columns: string[];
  rows: (string | number)[][];
  fileName: string;
}

export function exportToPdf({ title, columns, rows, fileName }: PdfExportOptions) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 27);

  autoTable(doc, {
    startY: 35,
    head: [columns],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save(fileName);
}