import * as XLSX from 'xlsx';

interface ExcelExportOptions {
  sheetName: string;
  columns: string[];
  rows: (string | number)[][];
  fileName: string;
}

export function exportToExcel({ sheetName, columns, rows, fileName }: ExcelExportOptions) {
  const worksheetData = [columns, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Ajuste la largeur des colonnes automatiquement
  const colWidths = columns.map((col, i) => {
    const maxLength = Math.max(
      col.length,
      ...rows.map((row) => String(row[i] ?? '').length)
    );
    return { wch: maxLength + 2 };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, fileName);
}