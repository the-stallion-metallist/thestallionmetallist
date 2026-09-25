// "Download everything as Excel": one .xls file (Excel XML) with a sheet per table. Runs in the browser.
type Cell = string | number | boolean | null | undefined;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cell = (v: Cell) => (typeof v === "number" && isFinite(v) ? `<Cell><Data ss:Type="Number">${v}</Data></Cell>` : `<Cell><Data ss:Type="String">${esc(v == null ? "" : String(v))}</Data></Cell>`);

export function downloadWorkbook(name: string, sheets: { name: string; head: string[]; rows: Cell[][] }[]) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles><Style ss:ID="h"><Font ss:Bold="1"/></Style></Styles>
${sheets.map((s) => `<Worksheet ss:Name="${esc(s.name.slice(0, 31))}"><Table>
<Row ss:StyleID="h">${s.head.map((h) => cell(h)).join("")}</Row>
${s.rows.map((r) => `<Row>${r.map(cell).join("")}</Row>`).join("\n")}
</Table></Worksheet>`).join("\n")}
</Workbook>`;
  const url = URL.createObjectURL(new Blob([xml], { type: "application/vnd.ms-excel" }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
