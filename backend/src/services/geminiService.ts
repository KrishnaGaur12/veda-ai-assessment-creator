import { GoogleGenAI } from "@google/genai";
import config from "../config";
import { IQuestionType } from "../models/Assignment";

interface GeneratedPaperResponse {
  title: string;
  subject: string;
  class: string;
  totalMarks: number;
  duration: string;
  sections: {
    name: string;
    instruction: string;
    questions: {
      id: number;
      text: string;
      difficulty: "Easy" | "Medium" | "Hard";
      marks: number;
      type: string;
    }[];
  }[];
  answerKey: {
    id: number;
    answer: string;
  }[];
}

const buildPrompt = (
  questionTypes: IQuestionType[],
  totalQuestions: number,
  totalMarks: number,
  additionalInstructions: string,
  title: string,
  subject: string,
  className: string,
  referenceText?: string
): string => {
  const questionTypesList = questionTypes
    .map(
      (qt) =>
        `- ${qt.type}: ${qt.count} questions, ${qt.marks} marks each`
    )
    .join("\n");

  return `Generate a question paper with the following specifications:

Title: ${title || "Question Paper"}
Subject: ${subject || "General"}
Class: ${className || "Not specified"}
Total Questions: ${totalQuestions}
Total Marks: ${totalMarks}

Question Types:
${questionTypesList}

Additional Instructions: ${additionalInstructions || "None"}

${referenceText ? `
CRITICAL INSTRUCTION FOR REFERENCE TEXT:
You MUST generate all questions based STRICTLY on the following reference text. Do not include outside knowledge. If the text does not contain enough information to generate the requested number of questions, only generate as many as the text logically supports.

=== START REFERENCE TEXT ===
${referenceText}
=== END REFERENCE TEXT ===
` : ""}

Requirements:
1. Distribute questions into sections by question type
2. Name sections as "Section A", "Section B", "Section C", etc.
3. Each section must have an instruction line describing the question type and marks
4. Assign difficulty levels: mix of Easy, Medium, and Hard per section
5. Questions should be academically rigorous and appropriate for the class level
6. Generate a comprehensive answer key for all questions
7. For MCQ questions, provide 4 options (a, b, c, d)
8. Duration should be appropriate for the number and type of questions

Return ONLY this exact JSON structure with no additional text, markdown, or backticks:
{
  "title": "string",
  "subject": "string",
  "class": "string",
  "totalMarks": number,
  "duration": "string (e.g. '3 Hours')",
  "sections": [
    {
      "name": "Section A",
      "instruction": "string describing question type and marks",
      "questions": [
        {
          "id": 1,
          "text": "question text here",
          "difficulty": "Easy" | "Medium" | "Hard",
          "marks": number,
          "type": "question type string"
        }
      ]
    }
  ],
  "answerKey": [
    {
      "id": 1,
      "answer": "answer text"
    }
  ]
}`;
};

export const generatePaper = async (
  questionTypes: IQuestionType[],
  totalQuestions: number,
  totalMarks: number,
  additionalInstructions: string,
  title: string,
  subject: string,
  className: string,
  referenceText?: string
): Promise<GeneratedPaperResponse> => {
  try {
    if (!config.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

    const userPrompt = buildPrompt(
      questionTypes,
      totalQuestions,
      totalMarks,
      additionalInstructions,
      title,
      subject,
      className,
      referenceText
    );

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction:
          "You are an exam paper generator for schools. Return ONLY valid JSON, no markdown, no explanation, no backticks. Your output must be parseable by JSON.parse() directly.",
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    // Clean the response - strip markdown code fences if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    const parsed: GeneratedPaperResponse = JSON.parse(cleanedText);

    // Validate the parsed response
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error("Invalid response structure: missing sections array");
    }

    if (!parsed.title || !parsed.subject) {
      throw new Error("Invalid response structure: missing title or subject");
    }

    // Ensure all questions have valid difficulty
    for (const section of parsed.sections) {
      for (const question of section.questions) {
        if (!["Easy", "Medium", "Hard"].includes(question.difficulty)) {
          question.difficulty = "Medium";
        }
        if (!question.marks || question.marks < 1) {
          question.marks = 1;
        }
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("❌ Failed to parse Gemini response as JSON");
      throw new Error("AI returned invalid JSON. Please try again.");
    }

    const err = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Gemini service error: ${err}`);
    throw new Error(`Paper generation failed: ${err}`);
  }
};

export default { generatePaper };
