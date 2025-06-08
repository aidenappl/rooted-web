import OpenAI from "openai";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";

dotenv.config();

const openai = new OpenAI();

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("location");
    if (!query) {
      return NextResponse.json({
        success: false,
        message: "Location query parameter is required",
      });
    }
    const gpt4Completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You only return in JSON a coordinates key with a value in this format [43.8323, -79.3871], then a title of the location with a title key. Use only the city or location in the user's message.",
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
      if (jsonResponse.coordinates && jsonResponse.title) {
        return NextResponse.json({
          success: true,
          message: "Coordinates and title retrieved successfully",
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
