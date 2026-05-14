import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (title: string, data: any[], columns: { header: string, key: string, render?: (item: any) => string }[]) => {
  try {
    console.log(`Starting PDF Export: ${title}`, { rowCount: data?.length });
    
    if (!data || data.length === 0) {
      console.warn('No data to export to PDF');
      return;
    }

    const doc = new jsPDF();
    
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
        try {
          if (col.render) {
            const rendered = col.render(item);
            if (typeof rendered === 'string') return rendered;
            if (typeof rendered === 'number') return String(rendered);
            return String(item[col.key] || '-');
          }
          const val = item[col.key];
          return val !== undefined && val !== null ? String(val) : '-';
        } catch (e) {
          console.error('Error rendering column', col.key, e);
          return '-';
        }
      });
    });

    const tableColumnNames = columns.map(col => col.header);

    // Add Table using the functional approach which is safer in Vite
    autoTable(doc, {
      startY: 35,
      head: [tableColumnNames],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { top: 35 },
      didDrawPage: (data) => {
        // Footer
        const str = 'Página ' + doc.getNumberOfPages();
        doc.setFontSize(8);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      }
    });

    // Save the PDF
    const fileName = `${title.toLowerCase().replace(/[^\w]/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
    console.log(`PDF Saved: ${fileName}`);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
  }
};
