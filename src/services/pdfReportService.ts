import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DocItem, FolderCategory, PdfReportOptions } from '../types';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatLetterDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Builds a vector PDF document using jsPDF & autoTable
 */
export function buildPdfReportDocument(
  docs: DocItem[],
  categories: FolderCategory[],
  options: PdfReportOptions
): jsPDF {
  // Create jsPDF in landscape or portrait based on columns
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36; // 0.5 inch margin

  const categoryMap = new Map<string, string>();
  categories.forEach((c) => categoryMap.set(c.id, c.name));

  // --- HEADER SECTION ---
  // Official Corporate Sage-Platinum top bar
  doc.setFillColor(235, 243, 241); // #EBF3F1 Soft Corporate Sage-Platinum
  doc.rect(0, 0, pageWidth, 54, 'F');

  // Corporate Teal & Gold accent rule
  doc.setFillColor(15, 76, 92); // #0F4C5C Corporate Deep Teal
  doc.rect(0, 51, pageWidth, 3, 'F');

  // Title in header
  doc.setTextColor(15, 76, 92); // #0F4C5C Corporate Deep Teal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(options.title || 'Official Corporate Documents Catalog', margin, 32);

  // Subtitle / Org
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  const orgText = options.organization
    ? `${options.organization} • Official Corporate Disclosure Registry`
    : 'DocuHub Enterprise • Official Corporate Disclosure Registry';
  doc.text(orgText, margin, 45);

  // Right-aligned report metadata in header
  const reportRef = `RPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Ref: ${reportRef}`, pageWidth - margin, 26, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 39, { align: 'right' });

  // --- SUMMARY / METADATA BANNER ---
  let currentY = 70;

  if (options.includeStats) {
    // Summary info box
    doc.setFillColor(244, 247, 246); // #F4F7F6 Corporate Alabaster
    doc.setDrawColor(184, 216, 208); // #B8D8D0 Corporate Sage border
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 42, 4, 4, 'FD');

    // Metrics inside box
    const totalDocs = docs.length;
    const totalSize = docs.reduce((acc, d) => acc + (d.fileSize || 0), 0);

    // Find date range
    const sortedDates = [...docs]
      .map((d) => d.letterDate)
      .filter(Boolean)
      .sort();
    const dateRange = sortedDates.length > 0
      ? `${formatLetterDate(sortedDates[0])} to ${formatLetterDate(sortedDates[sortedDates.length - 1])}`
      : 'N/A';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 76, 92); // #0F4C5C

    // Column 1
    doc.text('Division Scope:', margin + 12, currentY + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(options.folderName || 'All Corporate Divisions', margin + 85, currentY + 16);

    // Column 2
    doc.setFont('helvetica', 'bold');
    doc.text('Total Records:', margin + 12, currentY + 31);
    doc.setFont('helvetica', 'normal');
    doc.text(`${totalDocs} documents (${formatBytes(totalSize)})`, margin + 85, currentY + 31);

    // Column 3
    doc.setFont('helvetica', 'bold');
    doc.text('Date Coverage:', margin + 300, currentY + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(dateRange, margin + 380, currentY + 16);

    // Column 4
    doc.setFont('helvetica', 'bold');
    doc.text('Access Policy:', margin + 300, currentY + 31);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('Official Open Access (Zero Login Required)', margin + 380, currentY + 31);

    currentY += 52;
  }

  // --- DATA TABLE ---
  const headers = [
    'Ref / Letter No.',
    'Issuance Date',
    'Subject & Issuing Authority',
    'Division',
    'Executive Summary',
    'File & Size',
  ];

  const rows = docs.map((docItem) => {
    const catName = categoryMap.get(docItem.category) || docItem.category || 'General';
    const deptInfo = docItem.senderDept ? `\nAuthority: ${docItem.senderDept}` : '';

    return [
      docItem.refNo || 'N/A',
      formatLetterDate(docItem.letterDate),
      `${docItem.subject}${deptInfo}`,
      catName,
      docItem.description || 'No description provided.',
      `${docItem.fileName}\n(${formatBytes(docItem.fileSize)})`,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [headers],
    body: rows,
    theme: 'striped',
    margin: { left: margin, right: margin, bottom: 45 },
    styles: {
      fontSize: 8,
      cellPadding: 5,
      textColor: [30, 41, 59],
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [254, 242, 242], // bg-red-50 (#FEF2F2)
      textColor: [239, 68, 68],   // text-[#EF4444]
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      lineColor: [254, 202, 202], // soft red border
      lineWidth: 0.75,
    },
    columnStyles: {
      0: { cellWidth: 95, fontStyle: 'bold' }, // Ref No
      1: { cellWidth: 70 },                    // Date
      2: { cellWidth: 160 },                   // Subject
      3: { cellWidth: 85 },                    // Category
      4: { cellWidth: 'auto' },                // Description
      5: { cellWidth: 90, fontStyle: 'italic' },// File & Size
    },
    alternateRowStyles: {
      fillColor: [250, 253, 252], // #FAFDFC
    },
    didDrawPage: (data) => {
      // Page Footer on every page
      const pageNumber = (doc.internal as any).getNumberOfPages
        ? (doc.internal as any).getNumberOfPages()
        : doc.getNumberOfPages();
      const currentPage = data.pageNumber;

      doc.setDrawColor(214, 211, 209); // stone-300
      doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 113, 108); // stone-500

      // Left footer
      doc.text(
        'DocuHub Public Document Archive • Verified Digital Record Index • Available for Public Download',
        margin,
        pageHeight - 18
      );

      // Right footer
      doc.text(
        `Page ${currentPage} of ${pageNumber}`,
        pageWidth - margin,
        pageHeight - 18,
        { align: 'right' }
      );
    },
  });

  return doc;
}

/**
 * Generates and triggers automatic download of the PDF report
 */
export function downloadFolderPdfReport(
  docs: DocItem[],
  categories: FolderCategory[],
  options: PdfReportOptions
): void {
  const doc = buildPdfReportDocument(docs, categories, options);
  const cleanTitle = (options.folderName || 'folder_report')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`${cleanTitle}_report_${dateStr}.pdf`);
}

/**
 * Returns a Blob URL for instant in-browser PDF preview in iframe
 */
export function generatePdfPreviewBlobUrl(
  docs: DocItem[],
  categories: FolderCategory[],
  options: PdfReportOptions
): string {
  const doc = buildPdfReportDocument(docs, categories, options);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}

/**
 * Builds an official single-document corporate PDF for inline PDF viewer & download
 */
export function buildSingleDocumentPdf(
  docItem: DocItem,
  categoryName: string
): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 42;

  // Top Header Band
  pdf.setFillColor(235, 243, 241); // #EBF3F1
  pdf.rect(0, 0, pageWidth, 68, 'F');
  pdf.setFillColor(15, 76, 92); // #0F4C5C
  pdf.rect(0, 65, pageWidth, 3, 'F');

  // Organization & Division
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(15, 76, 92);
  pdf.text(
    docItem.senderDept || 'DocuHub Enterprise • Corporate Secretariat',
    margin,
    30
  );

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Corporate Division: ${categoryName}`, margin, 47);

  // Ref No & Date on right
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 76, 92);
  pdf.text(`Ref No: ${docItem.refNo}`, pageWidth - margin, 30, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Date: ${formatLetterDate(docItem.letterDate)}`, pageWidth - margin, 47, {
    align: 'right',
  });

  let y = 95;

  // Recipient & Status
  if (docItem.recipient || docItem.status) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    const metaLine = [
      docItem.recipient ? `To: ${docItem.recipient}` : '',
      docItem.status ? `Classification: ${docItem.status}` : '',
    ]
      .filter(Boolean)
      .join('   |   ');
    pdf.text(metaLine, margin, y);
    y += 22;
  }

  // Subject Box
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  const subjectLines = pdf.splitTextToSize(
    `SUBJECT: ${docItem.subject}`,
    pageWidth - margin * 2 - 20
  );
  const subjectBoxHeight = subjectLines.length * 15 + 16;
  pdf.roundedRect(margin, y, pageWidth - margin * 2, subjectBoxHeight, 4, 4, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text(subjectLines, margin + 10, y + 18);
  y += subjectBoxHeight + 20;

  // Executive Summary
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(15, 76, 92);
  pdf.text('EXECUTIVE SUMMARY', margin, y);
  y += 14;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(51, 65, 85);
  const descLines = pdf.splitTextToSize(
    docItem.description || 'No executive summary provided.',
    pageWidth - margin * 2
  );
  pdf.text(descLines, margin, y);
  y += descLines.length * 14 + 18;

  // Divider
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 20;

  // Memorandum Body
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(15, 76, 92);
  pdf.text('OFFICIAL RECORD TRANSCRIPT & DISCLOSURES', margin, y);
  y += 16;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(30, 41, 59);
  const bodyText =
    docItem.contentPreview ||
    `1. Purpose & Scope\nThis official corporate document (${docItem.refNo}), dated ${formatLetterDate(
      docItem.letterDate
    )}, has been registered under ${categoryName}.\n\n2. Summary of Directive\n${
      docItem.description
    }\n\n3. Verification & Public Access\nIssued by ${
      docItem.senderDept || 'Corporate Secretariat'
    }. This record is archived in DocuHub Enterprise (${docItem.fileName}, ${formatBytes(
      docItem.fileSize
    )}).`;

  const bodyLines = pdf.splitTextToSize(bodyText, pageWidth - margin * 2);
  for (let i = 0; i < bodyLines.length; i++) {
    if (y > pageHeight - 90) {
      pdf.addPage();
      y = 50;
    }
    pdf.text(bodyLines[i], margin, y);
    y += 14;
  }

  // Footer Verification Stamp
  pdf.setDrawColor(203, 213, 225);
  pdf.line(margin, pageHeight - 55, pageWidth - margin, pageHeight - 55);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text(
    `File: ${docItem.fileName} (${formatBytes(docItem.fileSize)}) • Verified Corporate Registry`,
    margin,
    pageHeight - 40
  );
  if (docItem.sha256) {
    pdf.text(`SHA-256: ${docItem.sha256}`, margin, pageHeight - 27);
  }

  return pdf;
}

export function generateSingleDocumentPdfBlobUrl(
  docItem: DocItem,
  categoryName: string
): string {
  const pdf = buildSingleDocumentPdf(docItem, categoryName);
  const blob = pdf.output('blob');
  return URL.createObjectURL(blob);
}

/**
 * Exports a list of documents to an Excel-compatible CSV file
 */
export function exportDocsToCsv(
  docs: DocItem[],
  categories: FolderCategory[],
  fileNamePrefix = 'docuhub_records'
): void {
  const categoryMap = new Map<string, string>();
  categories.forEach((c) => categoryMap.set(c.id, c.name));

  const headers = [
    'Ref No.',
    'Issuance Date',
    'Format',
    'Subject',
    'Issuing Authority',
    'Category',
    'Description',
    'File Name',
    'File Size (Bytes)',
    'File Size',
    'Tags',
  ];

  const escapeCsvCell = (val: string | number | undefined) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = docs.map((d) => [
    escapeCsvCell(d.refNo),
    escapeCsvCell(d.letterDate),
    escapeCsvCell((d.fileType || '').toUpperCase()),
    escapeCsvCell(d.subject),
    escapeCsvCell(d.senderDept || ''),
    escapeCsvCell(categoryMap.get(d.category) || d.category),
    escapeCsvCell(d.description),
    escapeCsvCell(d.fileName),
    escapeCsvCell(d.fileSize),
    escapeCsvCell(formatBytes(d.fileSize)),
    escapeCsvCell(d.tags ? d.tags.join('; ') : ''),
  ]);

  const csvContent =
    '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `${fileNamePrefix}_${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

