/**
 * Zero-dependency client-side PDF report generator (PDF 1.4, Helvetica built-in).
 * Menghasilkan file .pdf biner yang langsung terunduh tanpa memblokir tab lewat window.print().
 */
function sanitizePdfText(input: unknown): string {
  return String(input ?? "")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function downloadReportPdf(options: {
  filename: string;
  title: string;
  subtitle?: string;
  summaryLines: string[];
  columns: { header: string; width: number }[];
  rows: string[][];
}) {
  const { filename, title, subtitle, summaryLines, columns, rows } = options;

  const pageWidth = 595;
  const pageHeight = 842;
  const marginX = 40;
  const maxLinesPerPage = 38;

  const rowStrings = rows.map((row) =>
    row
      .map((cell, i) => {
        const w = columns[i]?.width || 16;
        const txt = sanitizePdfText(cell);
        return txt.length > w ? txt.slice(0, Math.max(1, w - 2)) + ".." : txt.padEnd(w, " ");
      })
      .join(" | ")
  );

  const headerLine = columns
    .map((c) => sanitizePdfText(c.header).slice(0, c.width).padEnd(c.width, " "))
    .join(" | ");
  const separator = "-".repeat(Math.min(96, headerLine.length));

  const contentLines: Array<{ text: string; bold?: boolean; size?: number; gap?: number }> = [
    { text: sanitizePdfText(title), bold: true, size: 15, gap: 20 },
    ...(subtitle ? [{ text: sanitizePdfText(subtitle), size: 9, gap: 16 }] : []),
    ...summaryLines.map((line) => ({ text: sanitizePdfText(line), size: 10, gap: 14 })),
    { text: " ", size: 10, gap: 10 },
    { text: headerLine, bold: true, size: 8, gap: 13 },
    { text: separator, size: 8, gap: 11 },
    ...(rowStrings.length > 0
      ? rowStrings.map((r) => ({ text: r, size: 8, gap: 13 }))
      : [{ text: "Belum ada data transaksi.", size: 9, gap: 14 }]),
  ];

  // Chunk into pages
  const pages: typeof contentLines[] = [];
  for (let i = 0; i < contentLines.length; i += maxLinesPerPage) {
    pages.push(contentLines.slice(i, i + maxLinesPerPage));
  }
  if (pages.length === 0) pages.push([]);

  // Build PDF objects:
  // 1: Catalog, 2: Pages, 3: Font Regular (Helvetica), 4: Font Bold (Helvetica-Bold),
  // 5: Font Mono (Courier), then per page: Page obj + Content stream obj
  const objects: string[] = [];
  const pageObjIds: number[] = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push(""); // placeholder for 2 0 obj (Pages)
  objects.push("3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
  objects.push("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n");
  objects.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n");

  let nextId = 6;
  for (const pageLines of pages) {
    const pageObjId = nextId++;
    const streamObjId = nextId++;
    pageObjIds.push(pageObjId);

    let y = pageHeight - 48;
    const ops: string[] = ["BT"];
    for (const line of pageLines) {
      const size = line.size ?? 10;
      const font = size === 8 ? "/F3" : line.bold ? "/F2" : "/F1";
      ops.push(`${font} ${size} Tf`);
      ops.push(`1 0 0 1 ${marginX} ${y} Tm`);
      ops.push(`(${line.text}) Tj`);
      y -= line.gap ?? 14;
    }
    ops.push("ET");
    const streamBody = ops.join("\n");

    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${streamObjId} 0 R >>\nendobj\n`
    );
    objects.push(
      `${streamObjId} 0 obj\n<< /Length ${streamBody.length} >>\nstream\n${streamBody}\nendstream\nendobj\n`
    );
  }

  objects[1] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjIds.length} >>\nendobj\n`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
