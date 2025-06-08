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
            "You only return in JSON a categories key with a value of string[]. You will look at the message and determine the categories that it belongs to. The categories should be relevant to the content of the message. You will also return a title key with a value of the title of the search or location.",
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
      if (jsonResponse.categories) {
        return NextResponse.json({
          success: true,
          message: "Categories and title retrieved successfully",
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
    console.error("Error occurred while fetching categories:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    });
  }
};
