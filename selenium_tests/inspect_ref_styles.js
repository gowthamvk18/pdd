const ExcelJS = require('exceljs');

async function inspectStyles() {
  const refPath = 'c:\\Users\\ADARS\\pdd\\ref_report\\Load_Performance_300_TestCases_Analysis_Report.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(refPath);

  workbook.worksheets.forEach((sheet) => {
    console.log(`\n========================================`);
    console.log(`SHEET: ${sheet.name}`);
    console.log(`========================================`);
    console.log('Columns count:', sheet.columnCount);

    // Columns width info
    const colWidths = sheet.columns.map(c => ({ header: c.header, key: c.key, width: c.width }));
    console.log('Col Widths:', colWidths);

    // Header cell styling
    const row1 = sheet.getRow(1);
    row1.eachCell((cell, colNum) => {
      console.log(`Cell (1,${colNum}) text: "${cell.text}", font:`, cell.font, 'fill:', cell.fill);
    });

    // Sample data cell styling (Row 2)
    const row2 = sheet.getRow(2);
    row2.eachCell((cell, colNum) => {
      console.log(`Cell (2,${colNum}) text: "${cell.text}", font:`, cell.font, 'fill:', cell.fill);
    });
  });
}

inspectStyles().catch(console.error);
