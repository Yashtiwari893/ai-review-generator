import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/lib/ai";
import { REVIEW_GENERATION_PROMPT } from "@/lib/prompts";

const cleanLabel = (str: any) => {
  if (!str) return "";
  if (typeof str !== "string") return String(str);
  return str.replace(/^\d+_/, "").replace(/_/g, " ");
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mapping 11za form fields
    const name = body.Your_Name_4b003f || "Valued Customer";
    const company = body.Company_Name_ecbff6 || "N/A";
    const city = body.City_5a70fd || "N/A";
    const initialStandout = cleanLabel(body.What_stood_out_you_539226);

    // Extract all ratings
    const ratings = {
      quality: parseInt(body.purchase_rating) || 0,
      performance: parseInt(body["Performance&_Reliability"]) || 0,
      sales: parseInt(body.Sales_Team_Support) || 0,
      delivery: parseInt(body.Delivery_Installation) || 0,
      value: parseInt(body.Valuefor_Money) || 0,
      service: parseInt(body["After-Sales_Service"]) || 0,
    };

    // Calculate Average Rating
    const validRatings = Object.values(ratings).filter((r) => r > 0);
    const avgRating =
      validRatings.length > 0
        ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length
        : 0;

    // Logic: If average rating is less than 3, do not generate review
    if (avgRating > 0 && avgRating < 3) {
      return NextResponse.json({
        success: true,
        canGenerate: false,
        review: "Thank you for your feedback. We sincerely apologize for not meeting your expectations. Your comments are valuable to us, and we will work hard to improve our services and equipment. We hope to serve you better next time.",
        sentiment: "negative",
      });
    }

    // Otherwise, generate AI Review
    const purchases = Array.isArray(body.What_did_you_purchase_9093e3)
      ? body.What_did_you_purchase_9093e3.map(cleanLabel).join(", ")
      : cleanLabel(body.What_did_you_purchase_9093e3);

    const finalStandouts = Array.isArray(body.What_stood_out_to_you_8fc4ff)
      ? body.What_stood_out_to_you_8fc4ff.map(cleanLabel).join(", ")
      : cleanLabel(body.What_stood_out_to_you_8fc4ff);

    const userContext = `
      Customer Name: ${name}
      Company: ${company}
      City: ${city}
      Purchased Items: ${purchases}
      Primary Highlight: ${initialStandout}
      Other Highlights: ${finalStandouts}
      Ratings Average: ${avgRating.toFixed(1)} Stars
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: REVIEW_GENERATION_PROMPT },
        { role: "user", content: userContext },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    const result = JSON.parse(content || "{}");

    return NextResponse.json({
      success: true,
      canGenerate: true,
      review: result.review,
      sentiment: result.sentiment || "positive",
    });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request." },
      { status: 500 }
    );
  }
}
