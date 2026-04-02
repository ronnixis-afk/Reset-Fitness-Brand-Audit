import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Audit } from './db';
import { CHECKLIST_CATEGORIES } from './checklist';
import { getOverallScore, getCategoryScore } from './score';

export function generatePDF(audit: Audit) {
  const doc = new jsPDF();
  const overallScore = getOverallScore(audit);
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(224, 0, 0); // Brand red
  doc.text('RESET AUDIT REPORT', 105, 20, { align: 'center' });
  
  // Audit Info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Location: ${audit.facilityLocation}`, 20, 40);
  doc.text(`Auditor: ${audit.auditorName}`, 20, 48);
  doc.text(`Date: ${audit.date}`, 20, 56);
  doc.text(`Quarter: ${audit.quarter}`, 20, 64);
  
  // Overall Score Circle/Box
  doc.setDrawColor(224, 0, 0);
  doc.setLineWidth(1);
  doc.rect(140, 35, 50, 35);
  doc.setFontSize(10);
  doc.text('OVERALL SCORE', 165, 45, { align: 'center' });
  doc.setFontSize(24);
  doc.text(`${overallScore}%`, 165, 60, { align: 'center' });
  
  let yPos = 80;
  
  // Category Summary
  doc.setFontSize(14);
  doc.text('CATEGORY SUMMARY', 20, yPos);
  yPos += 10;
  
  const summaryData = CHECKLIST_CATEGORIES.map(cat => {
    const score = getCategoryScore(audit, cat.id);
    return [cat.title, `${score.percentage}%`];
  });
  
  autoTable(doc, {
    startY: yPos,
    head: [['Category', 'Score']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [224, 0, 0] },
    margin: { left: 20, right: 20 }
  });
  
  // Detailed Results
  doc.addPage();
  doc.setFontSize(16);
  doc.text('DETAILED RESULTS', 20, 20);
  
  let currentY = 30;
  
  CHECKLIST_CATEGORIES.forEach((category) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    const categoryItems: any[] = [];
    
    category.items.forEach(item => {
      const rawScore = audit.items[item.id];
      let scoreText = rawScore || 'N/A';
      if (rawScore === 'FAIL') {
        scoreText = 'Requires Urgent Attention';
      }
      const comment = audit.itemComments?.[item.id] || '';
      
      categoryItems.push([item.text, scoreText, comment]);
      
      const images = audit.itemImages?.[item.id];
      if (images && images.length > 0) {
        const imgHeight = 37.5;
        const padding = 5;
        const rowsOfImages = Math.ceil(images.length / 3);
        const rowHeight = rowsOfImages * (imgHeight + padding) + padding;

        categoryItems.push([
          { 
            content: '', 
            colSpan: 3, 
            styles: { minCellHeight: rowHeight },
            images: images 
          }
        ]);
      }
    });
    
    autoTable(doc, {
      startY: currentY,
      head: [[category.title, 'Result', 'Comments']],
      body: categoryItems,
      theme: 'grid',
      headStyles: { fillColor: [60, 60, 60] },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40 },
        2: { cellWidth: 50 }
      },
      margin: { left: 20, right: 20 },
      didDrawCell: (data) => {
        const raw = data.row.raw as any[];
        if (raw && raw.length === 1 && raw[0] && typeof raw[0] === 'object' && raw[0].images && data.column.index === 0) {
          const images = raw[0].images;
          let startX = data.cell.x + 5;
          let startY = data.cell.y + 5;
          const imgWidth = 50;
          const imgHeight = 37.5;
          
          images.forEach((imgData: string) => {
            try {
              const formatMatch = imgData.match(/^data:image\/([a-zA-Z]*);base64,/);
              const format = formatMatch ? formatMatch[1].toUpperCase() : 'JPEG';
              
              if (startX + imgWidth > data.cell.x + data.cell.width) {
                startX = data.cell.x + 5;
                startY += imgHeight + 5;
              }
              
              doc.addImage(imgData, format, startX, startY, imgWidth, imgHeight);
              startX += imgWidth + 5;
            } catch (e) {
              console.error('Failed to draw image', e);
              doc.setFontSize(8);
              doc.setTextColor(255, 0, 0);
              doc.text('Image error', startX, startY + 10);
              doc.setTextColor(0, 0, 0);
              startX += imgWidth + 5;
            }
          });
        }
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
  });
  
  // Final Comments
  if (audit.comments) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(14);
    doc.text('GENERAL COMMENTS', 20, currentY);
    doc.setFontSize(10);
    doc.text(audit.comments, 20, currentY + 10, { maxWidth: 170 });
  }
  
  // Save the PDF
  const fileName = `Audit_${audit.facilityLocation.replace(/\s+/g, '_')}_${audit.date}.pdf`;
  doc.save(fileName);
}
