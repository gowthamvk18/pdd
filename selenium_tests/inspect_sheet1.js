const ExcelJS = require('exceljs');

async function inspectSheet1() {
  const refPath = 'c:\\Users\\ADARS\\pdd\\ref_report\\Load_Performance_300_TestCases_Analysis_Report.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(refPath);

  const sheet = workbook.getWorksheet('Performance Dashboard');
  console.log(`=== SHEET 1: ${sheet.name} ===`);
  for (let r = 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const rowVals = [];
    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      rowVals[colNum] = cell.text || cell.value;
    });
    console.log(`Row ${r}:`, rowVals.slice(1));
  }
}

inspectSheet1().catch(console.error);
