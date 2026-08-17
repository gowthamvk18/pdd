/**
 * SkillSync Excel Report Generator
 * Outputs:
 *  - Load_Performance_300_TestCases_Analysis_Report.xlsx
 *  - SkillSync_E2E_Test_Report.xlsx
 *  - SkillSync_Security_Vulnerability_Audit_Report.xlsx
 */

const { buildReferenceMatchedReport } = require('./generate_reference_matched_report');
const { buildSecurityVulnerabilityReport } = require('./generate_security_vulnerability_report');

async function buildExcelReport(executionResults = [], loadTestResults = null) {
  const refReport = await buildReferenceMatchedReport(executionResults, loadTestResults);
  await buildSecurityVulnerabilityReport();
  return refReport;
}

if (require.main === module) {
  buildExcelReport().catch(console.error);
}

module.exports = {
  buildExcelReport
};
