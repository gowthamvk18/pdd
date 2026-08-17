/**
 * SkillSync Excel Report Generator
 * Outputs:
 *  - Load_Performance_300_TestCases_Analysis_Report.xlsx
 *  - SkillSync_E2E_Test_Report.xlsx
 */

const { buildReferenceMatchedReport } = require('./generate_reference_matched_report');

async function buildExcelReport(executionResults = [], loadTestResults = null) {
  return await buildReferenceMatchedReport(executionResults, loadTestResults);
}

if (require.main === module) {
  buildExcelReport().catch(console.error);
}

module.exports = {
  buildExcelReport
};
