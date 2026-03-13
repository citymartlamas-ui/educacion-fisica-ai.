import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const apiKey = "AIzaSyCP6_ODxrSG74OJRH6hxEKTkNecsOqu-r4";
const genAI = new GoogleGenerativeAI(apiKey);

async function test(modelName) {
    console.log(`Testing ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hola");
        const response = await result.response;
        return `SUCCESS ${modelName}: ${response.text()}`;
    } catch (e) {
        return `FAILED ${modelName}: ${e.message}`;
    }
}

async function run() {
    const results = [];
    results.push(await test("gemini-2.0-flash-lite"));
    results.push(await test("gemini-2.5-flash"));
    results.push(await test("gemini-2.5-pro"));
    fs.writeFileSync("test_results_2.txt", results.join("\n"), "utf8");
}

run();
