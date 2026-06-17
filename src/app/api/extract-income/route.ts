import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

// Check if API Key is configured
if (!process.env.GROQ_API_KEY) {
  console.warn("GROQ_API_KEY is not set correctly in environment variables");
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
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // --- START GROQ ---
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY is not set correctly in environment variables");
    }
    const groqClient = new OpenAI({ 
      apiKey: process.env.GROQ_API_KEY || "dummy_key", 
      baseURL: "https://api.groq.com/openai/v1" 
    });
    // --- END GROQ ---

    let allIncomes: any[] = [];

    // Helper to chunk text to prevent context limit errors
    const chunkText = (text: string, size: number) => {
      const chunks = [];
      for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size));
      }
      return chunks;
    };

    // Process each file
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type;
      const fileName = file.name.toLowerCase();

      let hasImage = false;
      let textChunks: string[] = [];
      let base64Image = "";

      if (mimeType.startsWith("image/")) {
        hasImage = true;
        base64Image = buffer.toString("base64");
      } else if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
        try {
          const pdfParse = require("pdf-parse");
          const pdfData = await pdfParse(buffer);
          // 15,000 characters is ~3,500 tokens, perfectly safe for 8k limits
          textChunks = chunkText(pdfData.text, 15000); 
        } catch (err: any) {
          console.error("Failed to parse PDF text:", err);
          return NextResponse.json({ error: "Could not parse the PDF file." }, { status: 400 });
        }
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        try {
          const xlsx = require("xlsx");
          const workbook = xlsx.read(buffer, { type: "buffer" });
          let excelText = "";
          for (const sheetName of workbook.SheetNames) {
             const sheet = workbook.Sheets[sheetName];
             excelText += xlsx.utils.sheet_to_csv(sheet) + "\n\n";
          }
          textChunks = chunkText(excelText, 15000);
        } catch (err: any) {
          console.error("Failed to parse Excel file:", err);
          return NextResponse.json({ error: "Could not parse the Excel file." }, { status: 400 });
        }
      } else {
        const textContent = buffer.toString("utf-8");
        textChunks = chunkText(textContent, 15000);
      }

      // --- START OPENAI (COMMENTED OUT) ---
      // const completion = await openai.chat.completions.parse({
      //   model: "gpt-4o-mini",
      //   messages: [
      //     {
      //       role: "system",
      //       content: "You are an expert financial data extraction engine. You extract structured data from raw text, spreadsheets, and screenshots. Convert everything into a standardized JSON response matching the exact schema provided. Try to format the date correctly. Do not add conversational markdown.",
      //     },
      //     {
      //       role: "user",
      //       content: hasImage 
      //         ? [{ type: "text", text: "Extract details from this image." }, { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }]
      //         : [{ type: "text", text: `Extract details from this text:\n\n${textChunks.join("\n\n")}` }],
      //     },
      //   ],
      //   response_format: zodResponseFormat(IncomesResponseSchema, "incomes_response"),
      // });
      // const parsedData = completion.choices[0].message.parsed;
      // if (parsedData && parsedData.incomes) {
      //   allIncomes = allIncomes.concat(parsedData.incomes);
      // }
      // --- END OPENAI ---

      // --- START GROQ ---
      const groqModel = hasImage ? "llama-3.2-90b-vision-preview" : "llama-3.3-70b-versatile";
      const systemPrompt = "You are an expert financial data extraction engine. Extract structured data from the text or image. You MUST return ONLY valid JSON in this exact structure: {\"incomes\": [{\"name\": \"Vendor Name\", \"amount\": \"+$200.00\", \"date\": \"28 Feb, 2024\", \"detail\": \"Paid\"}]}. Try to format the date correctly. Do NOT add conversational text or markdown blocks. ONLY output the raw JSON object.";

      const processGroqChunk = async (messages: any[], isImage: boolean) => {
        const requestPayload: any = {
          model: groqModel,
          messages,
        };
        if (!isImage) {
          requestPayload.response_format = { type: "json_object" };
        }
        try {
          const completionGroq = await groqClient.chat.completions.create(requestPayload);
          let responseText = completionGroq.choices[0]?.message?.content || "{}";
          responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsedDataGroq = JSON.parse(responseText);
          if (parsedDataGroq && parsedDataGroq.incomes) {
            allIncomes = allIncomes.concat(parsedDataGroq.incomes);
          }
        } catch (err) {
          console.error("Groq extraction error:", err);
        }
      };

      if (hasImage) {
        // Groq vision processing
        await processGroqChunk([
          { role: "system", content: systemPrompt },
          { role: "user", content: [
            { type: "text", text: "Please extract all income and payout details from this image." },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
          ]}
        ], true);
      } else {
        // Groq text chunk processing to prevent token limit errors!
        for (let i = 0; i < textChunks.length; i++) {
          await processGroqChunk([
            { role: "system", content: systemPrompt },
            { role: "user", content: `Here is part ${i + 1} of the document text:\n\n${textChunks[i]}\n\nPlease extract all income and payout details from this text.` }
          ], false);
        }
      }
      // --- END GROQ ---
    }

    // Return the aggregated structured data back to the frontend
    return NextResponse.json({ success: true, data: allIncomes });

  } catch (error: any) {
    console.error("API Error during file extraction:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process the files" }, { status: 500 });
  }
}
