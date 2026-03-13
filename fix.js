import fs from 'fs';

let p = fs.readFileSync('src/PlanAnualPage.jsx', 'utf8');
p = p.replace("import { generateStructuredAnnualPlan } from './gemini';", "import { generateStructuredAnnualPlan, model } from './gemini';");
p = p.replaceAll("const { GoogleGenerativeAI } = await import('@google/generative-ai');", "");
p = p.replaceAll("const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);", "");
p = p.replaceAll('const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });', "");
fs.writeFileSync('src/PlanAnualPage.jsx', p);

let r = fs.readFileSync('src/RubricsPage.jsx', 'utf8');
r = r.replace("import { generateRubric } from './gemini';", "import { generateRubric, model } from './gemini';");
r = r.replaceAll("const { GoogleGenerativeAI } = await import('@google/generative-ai');", "");
r = r.replaceAll("const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);", "");
r = r.replaceAll('const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });', "");
fs.writeFileSync('src/RubricsPage.jsx', r);

console.log('Done replacements');
