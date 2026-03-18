import { jsPDF } from 'jspdf';
import { Audit } from './db';
import { CHECKLIST_CATEGORIES } from './checklist';
import { getCategoryScore, getOverallScore } from './score';

export function generatePDF(audit: Audit) {
  // 9:16 aspect ratio (e.g., 108mm x 192mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [108, 192]
  });

  const margin = 8;
  const width = 108 - margin * 2;
  let y = 20;

  const checkPageBreak = (needed: number) => {
    if (y + needed > 185) {
      doc.addPage();
      y = 15;
    }
  };

  // Header Bar
  doc.setFillColor(224, 0, 0); // Brand red
  doc.rect(0, 0, 108, 14, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('RESET FITNESS BRAND AUDIT', 108 / 2, 9, { align: 'center' });

  // Metadata
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  doc.text(`Date: ${audit.date} (${audit.quarter})`, margin, y); y += 5;
  doc.text(`Facility: ${audit.facilityLocation}`, margin, y); y += 5;
  doc.text(`Auditor: ${audit.auditorName || 'N/A'}`, margin, y); y += 5;
  
  const overallScore = getOverallScore(audit);
  doc.setFont('helvetica', 'bold');
  doc.text(`Overall Score: ${overallScore}%`, margin, y); y += 10;

  // Categories
  CHECKLIST_CATEGORIES.forEach(cat => {
    checkPageBreak(15);
    const score = getCategoryScore(audit, cat.id);
    
    // Category Header
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 4, width, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(224, 0, 0);
    doc.text(cat.title, margin + 2, y + 1.5);
    
    doc.setTextColor(0, 0, 0);
    doc.text(`${score.valid > 0 ? score.percentage + '%' : 'N/A'}`, margin + width - 2, y + 1.5, { align: 'right' });
    y += 8;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    cat.items.forEach(item => {
      const itemScore = audit.items[item.id];
      let scoreText = 'Unanswered';
      if (itemScore === 'PASS') scoreText = 'PASS';
      if (itemScore === 'FAIL') scoreText = 'FAIL';
      if (itemScore === 'NA') scoreText = 'N/A';

      const splitText = doc.splitTextToSize(item.text, width - 22);
      
      // Calculate needed height including potential comment
      let neededHeight = splitText.length * 4 + 2;
      let splitComment: string[] = [];
      const hasComment = itemScore === 'FAIL' && audit.itemComments?.[item.id];
      
      if (hasComment) {
        splitComment = doc.splitTextToSize(`Reason: ${audit.itemComments![item.id]}`, width - 26);
        neededHeight += splitComment.length * 3.5 + 1;
      }

      checkPageBreak(neededHeight);
      
      doc.setTextColor(50, 50, 50);
      doc.text(splitText, margin + 2, y);

      if (itemScore === 'PASS') doc.setTextColor(16, 185, 129); // Emerald
      else if (itemScore === 'FAIL') doc.setTextColor(224, 0, 0); // Brand Red
      else doc.setTextColor(156, 163, 175); // Gray

      doc.setFont('helvetica', 'bold');
      doc.text(scoreText, margin + width - 2, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      y += (splitText.length * 4) + 1;

      if (hasComment) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(224, 0, 0);
        doc.text(splitComment, margin + 6, y);
        y += (splitComment.length * 3.5) + 1;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
      } else {
        y += 1;
      }

      // Render images if any
      const images = audit.itemImages?.[item.id] || [];
      if (images.length > 0) {
        const imgSize = 40;
        const imgGap = 4;
        
        for (let i = 0; i < images.length; i += 2) {
          checkPageBreak(imgSize + 4);
          
          // Image 1
          doc.addImage(images[i], 'JPEG', margin + 6, y, imgSize, imgSize);
          
          // Image 2 (if exists)
          if (i + 1 < images.length) {
            doc.addImage(images[i + 1], 'JPEG', margin + 6 + imgSize + imgGap, y, imgSize, imgSize);
          }
          
          y += imgSize + 4;
        }
      }
    });
    y += 4;
  });

  // Comments
  if (audit.comments) {
    checkPageBreak(20);
    
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 4, width, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(224, 0, 0);
    doc.text('Additional Comments', margin + 2, y + 1.5);
    y += 8;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const splitComments = doc.splitTextToSize(audit.comments, width - 4);
    
    splitComments.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin + 2, y);
      y += 4;
    });
  }

  doc.save(`ResetFitness_Audit_${audit.date}_${audit.facilityLocation.replace(/\s+/g, '_')}.pdf`);
}
