const ExcelJS = require('exceljs');

async function inspectCellStyles() {
  const refPath = 'c:\\Users\\ADARS\\pdd\\ref_report\\Load_Performance_300_TestCases_Analysis_Report.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(refPath);

  const sheet1 = workbook.getWorksheet('Performance Dashboard');
  console.log('=== SHEET 1 TITLE CELL (A1) ===');
  const a1 = sheet1.getCell('A1');
  console.log('Value:', a1.value);
  console.log('Font:', JSON.stringify(a1.font));
  console.log('Fill:', JSON.stringify(a1.fill));

  console.log('\n=== SHEET 1 SECTION HEADER (A14) ===');
  const a14 = sheet1.getCell('A14');
  console.log('Value:', a14.value);
  console.log('Font:', JSON.stringify(a14.font));
  console.log('Fill:', JSON.stringify(a14.fill));

  const sheet2 = workbook.getWorksheet('300 Load Test Scenarios');
  console.log('\n=== SHEET 2 HEADER ROW (Row 1) ===');
  const r1 = sheet2.getRow(1);
  console.log('Height:', r1.height);
  r1.eachCell((cell, colNum) => {
    console.log(`Col ${colNum} (${cell.text}): font=${JSON.stringify(cell.font)}, fill=${JSON.stringify(cell.fill)}`);
  });

  console.log('\n=== SHEET 2 DATA ROW (Row 2) ===');
  const r2 = sheet2.getRow(2);
  r2.eachCell((cell, colNum) => {
    console.log(`Col ${colNum} (${cell.text}): font=${JSON.stringify(cell.font)}, fill=${JSON.stringify(cell.fill)}`);
  });
}

inspectCellStyles().catch(console.error);
