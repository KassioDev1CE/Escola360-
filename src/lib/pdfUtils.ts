import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Type definition for jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const exportToPDF = (title: string, data: any[], columns: { header: string, key: string, render?: (item: any) => string }[]) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  // Add Title
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(title, 14, 22);
  
  // Add Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

  // Prepare table data
  const tableRows = data.map(item => {
    return columns.map(col => {
      if (col.render) {
        // Handle React node return if render is used for JSX
        const rendered = col.render(item);
        if (typeof rendered === 'string') return rendered;
        // If it's a JSX element (like <span>), try to get text or fallback to key
        return item[col.key] || '-';
      }
      return item[col.key] || '-';
    });
  });

  const tableColumnNames = columns.map(col => col.header);

  // Add Table
  doc.autoTable({
    startY: 35,
    head: [tableColumnNames],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  });

  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
};
