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
    doc.text('Escola360', 14, 18);
    
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
    doc.setDrawColor(220, 231, 241);
    doc.setLineWidth(0.5);
    doc.line(14, 52, pageWidth - 14, 52);

    // Prepare table data
    const tableRows = (data || []).map((item, index) => {
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
      theme: 'grid',
      headStyles: { 
        fillColor: [47, 54, 133], // Darker Indigo
        textColor: [255, 255, 255], 
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 5
      },
      styles: { 
        fontSize: 8, 
        cellPadding: 4,
        valign: 'middle',
        overflow: 'linebreak',
        lineColor: [230, 235, 245],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 'auto' }
      },
      alternateRowStyles: { 
        fillColor: [250, 252, 255] 
      },
      margin: { left: 14, right: 14, bottom: 20 },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(7);
        doc.setTextColor(160);
        const str = 'Página ' + doc.getNumberOfPages();
        const pageHeight = doc.internal.pageSize.height;
        
        // Line above footer
        doc.setDrawColor(240);
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
        
        doc.text(str, 14, pageHeight - 8);
        doc.text('© 2026 Escola360 - Inteligência em Gestão Educacional', pageWidth / 2, pageHeight - 8, { align: 'center' });
        doc.text('Documento oficial gerado pelo sistema', pageWidth - 14, pageHeight - 8, { align: 'right' });
      }
    });

    const fileName = `${title.toLowerCase().replace(/[^\w]/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    alert('Erro ao gerar o relatório detalhado.');
  }
};
