import { chatSession } from "@/configs/AIModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  try {
    const result = await chatSession.sendMessage(prompt);
    const AiResponse = result.response.text();

    return NextResponse.json({
      result: AiResponse,
    });
  } catch (err: unknown) {
    console.error("Error processing request:", err);

    let message = "Internal Server Error";
    if (err instanceof Error) {
      message = err.message;
    }

    return NextResponse.json({
      error: message,
    });
  }
}
