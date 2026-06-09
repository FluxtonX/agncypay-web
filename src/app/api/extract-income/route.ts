import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

// Check if API Key is configured
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
  console.warn("OPENAI_API_KEY is not set correctly in environment variables");
}

const IncomesResponseSchema = z.object({
  incomes: z.array(
    z.object({
      name: z.string().describe("The name of the vendor, client, or platform (e.g., 'Amazon', 'OnlyFans')"),
      amount: z.string().describe("The total amount paid or received, including the currency symbol if known (e.g., '+$200.00')"),
      date: z.string().describe("The date of the transaction formatted as 'DD MMM, YYYY' (e.g., '28 Feb, 2024')"),
      detail: z.string().describe("A short label or description of the status or transaction type (e.g., 'Paid', 'Pending', 'Subscription')"),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    // Support both "file" and "files" keys because frontend appends as "file"
    const files = [...(formData.getAll("file") as File[]), ...(formData.getAll("files") as File[])];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
    }

    // Initialize OpenAI inside the request
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    let allIncomes: any[] = [];

    // Process each file
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type;
      const fileName = file.name.toLowerCase();

      // We will build the userMessage content array based on the file type
      let userMessageContent: any[] = [];

      if (mimeType.startsWith("image/")) {
        // It's an image, pass the Base64 data to Vision model
        const base64Image = buffer.toString("base64");
        userMessageContent.push({
          type: "text",
          text: `Please extract all income and payout details from this image.`,
        });
        userMessageContent.push({
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`,
          },
        });
      } else if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
        // It's a PDF, extract text using pdf-parse dynamically to avoid build errors
        try {
          const pdfParse = require("pdf-parse");
          const pdfData = await pdfParse(buffer);
          userMessageContent.push({
            type: "text",
            text: `Here is the extracted text from a PDF document:\n\n${pdfData.text}\n\nPlease extract all income and payout details from this text.`,
          });
        } catch (err: any) {
          console.error("Failed to parse PDF text:", err);
          return NextResponse.json({ error: "Could not parse the PDF file." }, { status: 400 });
        }
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        // It's an Excel file, extract text using xlsx
        try {
          const xlsx = require("xlsx");
          const workbook = xlsx.read(buffer, { type: "buffer" });
          let excelText = "";
          for (const sheetName of workbook.SheetNames) {
             const sheet = workbook.Sheets[sheetName];
             excelText += xlsx.utils.sheet_to_csv(sheet) + "\n\n";
          }
          userMessageContent.push({
            type: "text",
            text: `Here is the extracted data from an Excel document (CSV format):\n\n${excelText}\n\nPlease extract all income and payout details from this text.`,
          });
        } catch (err: any) {
          console.error("Failed to parse Excel file:", err);
          return NextResponse.json({ error: "Could not parse the Excel file." }, { status: 400 });
        }
      } else {
        // It's a raw text or CSV file
        const textContent = buffer.toString("utf-8");
        userMessageContent.push({
          type: "text",
          text: `Here is raw text from a CSV/TXT document:\n\n${textContent}\n\nPlease extract all income and payout details from this text.`,
        });
      }

      // Call OpenAI with Structured Outputs
      const completion = await openai.chat.completions.parse({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert financial data extraction engine. You extract structured data from raw text, spreadsheets, and screenshots. Convert everything into a standardized JSON response matching the exact schema provided. Try to format the date correctly. Do not add conversational markdown.",
          },
          {
            role: "user",
            content: userMessageContent,
          },
        ],
        response_format: zodResponseFormat(IncomesResponseSchema, "incomes_response"),
      });

      const parsedData = completion.choices[0].message.parsed;
      
      if (parsedData && parsedData.incomes) {
        allIncomes = allIncomes.concat(parsedData.incomes);
      }
    }

    // Return the aggregated structured data back to the frontend
    return NextResponse.json({ success: true, data: allIncomes });

  } catch (error: any) {
    console.error("API Error during file extraction:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process the files" }, { status: 500 });
  }
}
