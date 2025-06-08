import OpenAI from "openai";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";

dotenv.config();

const openai = new OpenAI();

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("message");
    if (!query) {
      return NextResponse.json({
        success: false,
        message: "Message query parameter is required",
      });
    }
    const gpt4Completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You only return in JSON a intent key with a value of either ['search', or 'location']. You will look at the message and determine if it is a search intent or a location intent. ",
        },
        {
          role: "user",
          content: `${query}`,
        },
      ],
    });

    const responseText = gpt4Completion.choices[0]?.message?.content;

    if (responseText && responseText[0] === "{") {
      const jsonResponse = JSON.parse(responseText);
      console.log("Response from GPT-4:", jsonResponse);
      if (jsonResponse.intent) {
        return NextResponse.json({
          success: true,
          message: "Intent retrieved successfully",
          data: jsonResponse,
        });
      } else {
        return NextResponse.json({
          success: false,
          message: "Invalid response format",
        });
      }
    }
  } catch (error) {
    console.error("Error occurred while fetching coordinates:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    });
  }
};
