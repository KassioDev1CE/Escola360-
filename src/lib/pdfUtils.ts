import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (title: string, data: any[], columns: { header: string, key: string, render?: (item: any) => string }[]) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header background
    doc.setFillColor(63, 81, 181); // Indigo 600
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // App Title / Brand
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('EducaConnect', 14, 18);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestão Escolar Inteligente', 14, 25);

    // Report Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 14, 34);

    // Info Section below header
    doc.setTextColor(100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date().toLocaleString('pt-BR');
    doc.text(`Relatório Extraído em: ${dateStr}`, 14, 48);
    doc.text(`Total de registros: ${data?.length || 0}`, pageWidth - 14, 48, { align: 'right' });

    // Decorative line
    doc.setDrawColor(230);
    doc.line(14, 52, pageWidth - 14, 52);

    // Prepare table data
    const tableRows = (data || []).map(item => {
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
          return '-';
        }
      });
    });

    const tableColumnNames = columns.map(col => col.header);

    // Add Table
    autoTable(doc, {
      startY: 58,
      head: [tableColumnNames],
      body: tableRows,
      theme: 'striped',
      headStyles: { 
        fillColor: [63, 81, 181], 
        textColor: [255, 255, 255], 
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 4,
        valign: 'middle',
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      },
      alternateRowStyles: { 
        fillColor: [245, 247, 250] 
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        const str = 'Página ' + doc.getNumberOfPages();
        const pageHeight = doc.internal.pageSize.height;
        doc.text(str, 14, pageHeight - 10);
        doc.text('EducaConnect - Gestão de Alta Performance', pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    });

    const fileName = `${title.toLowerCase().replace(/[^\w]/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    alert('Erro ao gerar o relatório detalhado.');
  }
};
