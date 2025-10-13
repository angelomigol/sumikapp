import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { jsPDF } from "jspdf";

import { safeFormatDate } from "@/utils/shared";

import { WeeklyReportEntry } from "@/schemas/weekly-report/weekly-report.schema";

interface AttendanceReportData {
  internName: string;
  companyName: string;
  entries: WeeklyReportEntry[];
  previousTotal: number;
  periodTotal: number;
  startDate: string;
  endDate: string;
}

/**
 * Export attendance report to PDF
 */
export async function exportAttendanceReportToPDF(data: AttendanceReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("DAILY ATTENDANCE REPORT", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("ACO-CI-F-017", pageWidth / 2, 26, { align: "center" });
  doc.text("Page 1 of 1", pageWidth / 2, 30, { align: "center" });

  // Name and Company
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Name:", 14, 40);
  doc.setFont("helvetica", "normal");
  doc.text(data.internName, 35, 40);

  doc.setFont("helvetica", "bold");
  doc.text("Company:", 14, 46);
  doc.setFont("helvetica", "normal");
  doc.text(data.companyName, 35, 46);

  // Note
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const noteText =
    "NOTE: To be filled-up by the intern and signed by the Internship Supervisor/immediate supervisor on a daily basis.";
  const noteText2 =
    "This must be submitted to the Internship Coordinator along with the weekly activity report.";
  doc.text(noteText, 14, 52);
  doc.text(noteText2, 14, 56);

  // Table
  const startY = 65;
  const colWidths = [30, 30, 30, 30, 50];
  const headers = ["Date", "Time-In", "Time-Out", "Total Hours", "Signature"];

  // Table header
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  let currentX = 14;
  headers.forEach((header, i) => {
    doc.rect(currentX, startY, colWidths[i], 8);
    doc.text(header, currentX + colWidths[i] / 2, startY + 5, {
      align: "center",
    });
    currentX += colWidths[i];
  });

  // Table rows
  doc.setFont("helvetica", "normal");
  let currentY = startY + 8;

  const confirmedEntries = data.entries.filter((entry) => entry.is_confirmed);

  confirmedEntries.forEach((entry) => {
    currentX = 14;
    const rowData = [
      safeFormatDate(entry.entry_date, "MM/dd/yyyy"),
      entry.time_in || "",
      entry.time_out || "",
      entry.total_hours?.toFixed(2) || "",
      "", // Signature field left blank
    ];

    rowData.forEach((cell, i) => {
      doc.rect(currentX, currentY, colWidths[i], 8);
      doc.text(cell, currentX + 2, currentY + 5);
      currentX += colWidths[i];
    });

    currentY += 8;
  });

  // Add empty rows to fill the page (minimum 20 rows total)
  const emptyRowsNeeded = Math.max(0, 20 - confirmedEntries.length);
  for (let i = 0; i < emptyRowsNeeded; i++) {
    currentX = 14;
    headers.forEach((_, idx) => {
      doc.rect(currentX, currentY, colWidths[idx], 8);
      currentX += colWidths[idx];
    });
    currentY += 8;
  }

  // Totals row
  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Previous Total:", 14, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(data.previousTotal.toFixed(2), 45, currentY);

  doc.setFont("helvetica", "bold");
  doc.text("Total this Period:", 80, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(data.periodTotal.toFixed(2), 115, currentY);

  currentY += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Total Hours Served:", 14, currentY);
  doc.setFont("helvetica", "normal");
  const totalHours = data.previousTotal + data.periodTotal;
  doc.text(
    `${totalHours.toFixed(2)} (Previous Total + Total this Period)`,
    50,
    currentY
  );

  // Signatures
  currentY += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Intern Signature", 14, currentY);
  doc.line(14, currentY + 8, 80, currentY + 8);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Date", 90, currentY + 8);
  doc.line(100, currentY + 8, 130, currentY + 8);

  currentY += 15;
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  const verifyText =
    "I verify that the above information is correct and that the intern was in attendance on the above days at the";
  doc.text(verifyText, 14, currentY);
  doc.text("times indicated.", 14, currentY + 4);

  currentY += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Supervisor Signature", 14, currentY);
  doc.line(14, currentY + 8, 80, currentY + 8);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Date", 90, currentY + 8);
  doc.line(100, currentY + 8, 130, currentY + 8);

  // Save the PDF
  const fileName = `Attendance_Report_${safeFormatDate(data.startDate, "yyyy-MM-dd")}_to_${safeFormatDate(data.endDate, "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}

/**
 * Export attendance report to DOCX
 */
export async function exportAttendanceReportToDOCX(data: AttendanceReportData) {
  const confirmedEntries = data.entries.filter((entry) => entry.is_confirmed);

  // Create table rows
  const tableRows = [
    // Header row
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Date",
                  bold: true,
                }),
              ],
            }),
          ],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Time-In",
                  bold: true,
                }),
              ],
            }),
          ],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Time-Out",
                  bold: true,
                }),
              ],
            }),
          ],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Total Hours",
                  bold: true,
                }),
              ],
            }),
          ],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Signature",
                  bold: true,
                }),
              ],
            }),
          ],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
    // Data rows
    ...confirmedEntries.map(
      (entry) =>
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph(safeFormatDate(entry.entry_date, "MM/dd/yyyy")),
              ],
            }),
            new TableCell({
              children: [new Paragraph(entry.time_in || "")],
            }),
            new TableCell({
              children: [new Paragraph(entry.time_out || "")],
            }),
            new TableCell({
              children: [new Paragraph(entry.total_hours?.toFixed(2) || "")],
            }),
            new TableCell({
              children: [new Paragraph("")],
            }),
          ],
        })
    ),
  ];

  // Add empty rows (minimum 20 total)
  const emptyRowsNeeded = Math.max(0, 20 - confirmedEntries.length);
  for (let i = 0; i < emptyRowsNeeded; i++) {
    tableRows.push(
      new TableRow({
        children: Array(5)
          .fill(null)
          .map(
            () =>
              new TableCell({
                children: [new Paragraph("")],
              })
          ),
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        children: [
          // Header
          new Paragraph({
            text: "DAILY ATTENDANCE REPORT",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            style: "Heading1",
          }),
          new Paragraph({
            text: "ACO-CI-F-017                                                                Page 1 of 1",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Name and Company
          new Paragraph({
            children: [
              new TextRun({ text: "Name: ", bold: true }),
              new TextRun(data.internName),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Company: ", bold: true }),
              new TextRun(data.companyName),
            ],
            spacing: { after: 200 },
          }),

          // Note
          new Paragraph({
            children: [
              new TextRun({
                text: "NOTE: To be filled-up by the intern and signed by the Internship Supervisor/immediate supervisor on a daily basis. This must be submitted to the Internship Coordinator along with the weekly activity report.",
                italics: true,
              }),
            ],
            spacing: { after: 300 },
          }),

          // Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          }),

          // Totals
          new Paragraph({
            children: [
              new TextRun({ text: "Previous Total: ", bold: true }),
              new TextRun(data.previousTotal.toFixed(2)),
              new TextRun({
                text: "          Total this Period: ",
                bold: true,
              }),
              new TextRun(data.periodTotal.toFixed(2)),
            ],
            spacing: { before: 300, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Total Hours Served: ", bold: true }),
              new TextRun(
                `${(data.previousTotal + data.periodTotal).toFixed(2)} (Previous Total + Total this Period)`
              ),
            ],
            spacing: { after: 300 },
          }),

          // Intern Signature
          new Paragraph({
            children: [
              new TextRun({ text: "Intern Signature", bold: true }),
              new TextRun({
                text: " _________________________          Date _____________",
              }),
            ],
            spacing: { after: 200 },
          }),

          // Verification text
          new Paragraph({
            children: [
              new TextRun({
                text: "I verify that the above information is correct and that the intern was in attendance on the above days at the times indicated.",
                italics: true,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Supervisor Signature
          new Paragraph({
            children: [
              new TextRun({ text: "Supervisor Signature", bold: true }),
              new TextRun({
                text: " _________________________          Date _____________",
              }),
            ],
          }),
        ],
      },
    ],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Attendance_Report_${safeFormatDate(data.startDate, "yyyy-MM-dd")}_to_${safeFormatDate(data.endDate, "yyyy-MM-dd")}.docx`;
  link.click();
  window.URL.revokeObjectURL(url);
}
