const ExcelJS = require('exceljs');
const path = require('path');

async function inspectRef() {
  const refPath = 'c:\\Users\\ADARS\\pdd\\ref_report\\Load_Performance_300_TestCases_Analysis_Report.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(refPath);

  console.log('=== WORKBOOK SHEETS ===');
  workbook.worksheets.forEach((sheet, idx) => {
    console.log(`Sheet ${idx + 1}: "${sheet.name}" (Rows: ${sheet.rowCount}, Cols: ${sheet.columnCount})`);
    
    // Print first 5 rows of each sheet
    for (let r = 1; r <= Math.min(10, sheet.rowCount); r++) {
      const row = sheet.getRow(r);
      const values = row.values.slice(1);
      console.log(`  Row ${r}:`, values);
    }
    console.log('---------------------------------------------------');
  });
}

inspectRef().catch(console.error);
