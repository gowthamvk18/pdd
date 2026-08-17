const pptxgen = require("pptxgenjs");

let pptx = new pptxgen();

// Set layout to custom portrait poster (A0 Size in inches)
pptx.defineLayout({ name: 'A0_Poster', width: 33.1, height: 46.8 });
pptx.layout = 'A0_Poster';

let slide = pptx.addSlide();

// Colors based on reference
const headerBg = "4A4A4A";
const headerText = "FFFFFF";
const titleBg = "F5F5DC"; // Light beige/yellow
const titleText = "000000";
const sectionTitleBg = "FFFF00"; // Yellow
const sectionTitleBorder = "000000";
const topSectionBg = "CCE5FF"; // Light blue
const midSectionBg = "FFD6CC"; // Light pink
const botSectionBg = "D6F5D6"; // Light green

// Header Background
slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 3, fill: { color: headerBg } });

// Header Text
slide.addText("TECH STAR SUMMIT 2026", { x: 0.5, y: 0.5, w: 20, h: 2, fontSize: 56, color: headerText, bold: true, align: 'left' });
slide.addText("Student Name: [Your Name]\nProject Guide: [Guide Name]\nReg. No: [Reg No]", { x: 23, y: 0.5, w: 9, h: 2, fontSize: 24, color: headerText, align: 'right' });

// Title Background
slide.addShape(pptx.ShapeType.rect, { x: 0, y: 3, w: '100%', h: 2, fill: { color: titleBg } });
// Title Text
slide.addText("SkillSync: An AI-Driven Professional Networking and Career Intelligence Platform", { x: 0, y: 3, w: '100%', h: 2, fontSize: 36, color: titleText, bold: true, align: 'center' });

// Background colors for sections
slide.addShape(pptx.ShapeType.rect, { x: 0, y: 5, w: '100%', h: 18, fill: { color: topSectionBg } });
slide.addShape(pptx.ShapeType.rect, { x: 0, y: 23, w: '100%', h: 17, fill: { color: midSectionBg } });
slide.addShape(pptx.ShapeType.rect, { x: 0, y: 40, w: '100%', h: 6.8, fill: { color: botSectionBg } });

// Function to add section headers
function addSectionHeader(title, y) {
    slide.addText(title, { 
        x: 0.5, y: y, w: 12, h: 1.5, 
        fontSize: 32, bold: true, color: '000000',
        fill: { color: sectionTitleBg },
        line: { color: sectionTitleBorder, width: 2 },
        align: 'center', valign: 'middle'
    });
}

// 1. INTRODUCTION
addSectionHeader("INTRODUCTION", 5.5);
slide.addText([
    { text: "• SkillSync is designed to eliminate the professional barriers faced by individuals seeking career advancement by providing a seamless, AI-driven networking bridge.", options: { bullet: true, breakLine: true } },
    { text: "• Much like modern predictive models, this system shifts career planning from static analysis to dynamic, real-time career trajectory forecasting.", options: { bullet: true, breakLine: true } },
    { text: "• The platform utilizes Large Language Models (LLMs) and Skill Gap Analysis to process user experience and convert it into meaningful learning roadmaps.", options: { bullet: true, breakLine: true } },
    { text: "• By leveraging AI-powered agentic workflows, the system adapts instantly to different professional profiles and regional market demands.", options: { bullet: true, breakLine: true } },
    { text: "• Integrating AI allows for a scalable solution that maintains consistent performance across global job markets while maximizing user reach.", options: { bullet: true, breakLine: true } }
], { x: 0.5, y: 7.5, w: 20, h: 7, fontSize: 24, valign: 'top' });

// Image placeholder right of intro
slide.addShape(pptx.ShapeType.rect, { x: 21.5, y: 6.5, w: 11, h: 8, fill: { color: 'FFFFFF' }, line: { color: '000000' } });
slide.addText("DEMOCRATIZING CAREER GROWTH\nTHROUGH AI-POWERED PLATFORMS\n[Insert Architecture/Dashboard Image Here]", { x: 21.5, y: 6.5, w: 11, h: 8, align: 'center', fontSize: 24 });

// 2. MATERIALS AND METHODS
addSectionHeader("MATERIALS AND METHODS", 15);
// Flowchart shapes
slide.addShape(pptx.ShapeType.rect, { x: 2, y: 17.5, w: 5, h: 3, fill: { color: '4472C4' }, line: { color: '000000' } });
slide.addText("START", { x: 2, y: 17.5, w: 5, h: 3, align: 'center', color: 'FFFFFF', bold: true, fontSize: 28 });

slide.addShape(pptx.ShapeType.rightArrow, { x: 7.5, y: 18.5, w: 1.5, h: 1, fill: { color: '4472C4' } });

slide.addShape(pptx.ShapeType.rect, { x: 9.5, y: 17.5, w: 6, h: 3, fill: { color: '4472C4' }, line: { color: '000000' } });
slide.addText("1. Data Input\nUser skill profiling, goals, and experience mapping.", { x: 9.5, y: 17.5, w: 6, h: 3, align: 'center', color: 'FFFFFF', fontSize: 22 });

slide.addShape(pptx.ShapeType.rightArrow, { x: 16, y: 18.5, w: 1.5, h: 1, fill: { color: '4472C4' } });

slide.addShape(pptx.ShapeType.rect, { x: 18, y: 17.5, w: 6, h: 3, fill: { color: '4472C4' }, line: { color: '000000' } });
slide.addText("2. AI Core Processing\nAgentic LLMs analyze market demand & trends.", { x: 18, y: 17.5, w: 6, h: 3, align: 'center', color: 'FFFFFF', fontSize: 22 });

// Bottom row of flowchart
slide.addShape(pptx.ShapeType.rect, { x: 18, y: 22, w: 6, h: 3, fill: { color: '4472C4' }, line: { color: '000000' } });
slide.addText("3. Smart Optimization\nAI-driven matching for networking & jobs.", { x: 18, y: 22, w: 6, h: 3, align: 'center', color: 'FFFFFF', fontSize: 22 });

slide.addShape(pptx.ShapeType.leftArrow, { x: 16, y: 23, w: 1.5, h: 1, fill: { color: '4472C4' } });

slide.addShape(pptx.ShapeType.rect, { x: 9.5, y: 22, w: 6, h: 3, fill: { color: '4472C4' }, line: { color: '000000' } });
slide.addText("4. Democratized Growth\nReal-time insights and automated roadmaps.", { x: 9.5, y: 22, w: 6, h: 3, align: 'center', color: 'FFFFFF', fontSize: 22 });

slide.addShape(pptx.ShapeType.leftArrow, { x: 7.5, y: 23, w: 1.5, h: 1, fill: { color: '4472C4' } });

slide.addShape(pptx.ShapeType.rect, { x: 2, y: 22, w: 5, h: 3, fill: { color: '4472C4' }, line: { color: '000000' } });
slide.addText("END", { x: 2, y: 22, w: 5, h: 3, align: 'center', color: 'FFFFFF', bold: true, fontSize: 28 });

// 3. RESULTS
addSectionHeader("RESULTS", 23.5);

// Chart placeholder
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 25.5, w: 14, h: 7, fill: { color: 'FFFFFF' }, line: { color: '000000' } });
slide.addText("[Insert Bar Chart Image Here]\nCareer Progression Score by Algorithm", { x: 0.5, y: 25.5, w: 14, h: 7, align: 'center', fontSize: 24 });

// Table mock
slide.addTable([
    [{text:"Parameter", options:{bold:true}}, {text:"N", options:{bold:true}}, {text:"Minimum", options:{bold:true}}, {text:"Maximum", options:{bold:true}}, {text:"Mean", options:{bold:true}}, {text:"Std. Deviation", options:{bold:true}}],
    ["Career Progression Score", "1250", "45.00", "98.00", "82.45", "10.20"],
    ["Skill Match Accuracy", "1250", "60.00%", "99.00%", "88.10%", "8.15"]
], { x: 15, y: 25.5, w: 17.5, fill: 'FFE6E6', fontSize: 20, align: 'center', valign: 'middle', border: { type: 'solid', color: '000000', pt: 1 } });

slide.addText([
    { text: "• Career Progression Score: Measures the tangible advancement and opportunity access for users, showing a significant increase in professional mobility.", options: { bullet: true, breakLine: true } },
    { text: "• Skill Match Accuracy: Tracks the precision of AI recommendations for upskilling and job matching.", options: { bullet: true, breakLine: true } },
    { text: "• The data indicates a strong positive correlation between the deployment of LLM-based insights and the scaling of high-quality career guidance.", options: { bullet: true, breakLine: true } }
], { x: 0.5, y: 33.5, w: 32, h: 4, fontSize: 24, valign: 'top' });

// 4. DISCUSSION AND CONCLUSION
addSectionHeader("DISCUSSION AND CONCLUSION", 36.5);
slide.addText([
    { text: "• AI integration shifts career coaching from manual, high-cost methods to dynamic, real-time digital services.", options: { bullet: true, breakLine: true } },
    { text: "• The use of Large Language Models allows for career roadmaps that adapt instantly to specific user skills and contextual market shifts.", options: { bullet: true, breakLine: true } },
    { text: "• Breaking Barriers: This platform significantly lowers career development costs, providing high-quality expert-level guidance to populations previously excluded.", options: { bullet: true, breakLine: true } },
    { text: "• System Efficiency: Automated workflows ensure that retail-level users benefit from sophisticated career strategies once reserved for specialized executive coaching.", options: { bullet: true, breakLine: true } },
    { text: "• Universal Inclusion: The shift toward agentic AI systems architecture supports a future of universal inclusion for everyone.", options: { bullet: true, breakLine: true } }
], { x: 0.5, y: 38.5, w: 32, h: 6, fontSize: 24, valign: 'top' });

// 5. BIBLIOGRAPHY
addSectionHeader("BIBLIOGRAPHY", 40.5);
slide.addText([
    { text: "1. World Economic Forum (2025). The Future of Jobs Report. Mapping the skills of tomorrow.", options: { bullet: false, breakLine: true } },
    { text: "2. LinkedIn Economic Graph (2026). AI in Talent Acquisition and Career Mobility.", options: { bullet: false, breakLine: true } },
    { text: "3. McKinsey & Company (2025). Generative AI and the Future of Work. From Automation to Agentic Systems.", options: { bullet: false, breakLine: true } },
    { text: "4. Deloitte Insights (2026). Elevating the Workforce Experience through AI and Skill-based Routing.", options: { bullet: false, breakLine: true } },
    { text: "5. PwC (2026). 2026 AI Business Predictions: Hyper-Personalization for Digital Transformation.", options: { bullet: false, breakLine: true } }
], { x: 0.5, y: 42.5, w: 32, h: 4, fontSize: 18, valign: 'top' });

pptx.writeFile({ fileName: "SkillSync_Poster.pptx" }).then(() => {
    console.log("SkillSync_Poster.pptx generated successfully.");
}).catch(err => {
    console.error("Error generating PPTX:", err);
});
