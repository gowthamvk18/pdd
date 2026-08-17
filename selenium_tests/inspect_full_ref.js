const ExcelJS = require('exceljs');

async function inspectFull() {
  const refPath = 'c:\\Users\\ADARS\\pdd\\ref_report\\Load_Performance_300_TestCases_Analysis_Report.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(refPath);

  console.log(`Total sheets: ${workbook.worksheets.length}`);
  workbook.worksheets.forEach((sheet, idx) => {
    console.log(`\n--- Sheet ${idx + 1}: "${sheet.name}" ---`);
    console.log(`Row count: ${sheet.rowCount}, Col count: ${sheet.columnCount}`);
    
    for (let r = 1; r <= Math.min(30, sheet.rowCount); r++) {
      const row = sheet.getRow(r);
      const rowVals = [];
      row.eachCell({ includeEmpty: true }, (cell, colNum) => {
        rowVals[colNum] = cell.text || cell.value;
      });
      if (rowVals.filter(Boolean).length > 0) {
        console.log(`Row ${r}:`, rowVals.slice(1));
      }
    }
  });
}

inspectFull().catch(console.error);
