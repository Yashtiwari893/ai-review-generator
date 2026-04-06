import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/lib/ai";
import { REVIEW_GENERATION_PROMPT } from "@/lib/prompts";

// Helper to clean up technical IDs from form data (e.g. "0_Jib_Crane" -> "Jib Crane")
const cleanLabel = (str: any) => {
  if (!str) return "";
  if (typeof str !== 'string') return String(str);
  return str.replace(/^\d+_/, '').replace(/_/g, ' ');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mapping 11za form fields
    const name = body.Your_Name_4b003f || "Valued Customer";
    const company = body.Company_Name_ecbff6 || "N/A";
    const city = body.City_5a70fd || "N/A";
    const initialStandout = cleanLabel(body.What_stood_out_you_539226);
    
    const purchases = Array.isArray(body.What_did_you_purchase_9093e3) 
      ? body.What_did_you_purchase_9093e3.map(cleanLabel).join(", ")
      : cleanLabel(body.What_did_you_purchase_9093e3);

    const finalStandouts = Array.isArray(body.What_stood_out_to_you_8fc4ff)
      ? body.What_stood_out_to_you_8fc4ff.map(cleanLabel).join(", ")
      : cleanLabel(body.What_stood_out_to_you_8fc4ff);

    // Extracting all rating categories
    const r1 = parseInt(body.purchase_rating) || 0;
    const r2 = parseInt(body["Performance&_Reliability"]) || 0;
    const r3 = parseInt(body.Sales_Team_Support) || 0;
    const r4 = parseInt(body.Delivery_Installation) || 0;
    const r5 = parseInt(body.Valuefor_Money) || 0;
    const r6 = parseInt(body["After-Sales_Service"]) || 0;

    const ratings = [r1, r2, r3, r4, r5, r6].filter(r => r > 0);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    // --- NEW LOGIC: CONDITIONAL GENERATION ---
    // Agar Poor (2) ya usse kam hai, toh review generate nahi karenge.
    if (avgRating < 3 && ratings.length > 0) {
      return NextResponse.json({
        success: true,
        isLowRating: true,
        review: "Thank you for your feedback. We appreciate your time and will use your input to improve our services.",
        sentiment: "negative"
      });
    }

    // --- AI GENERATION Logic (For 3+ Rating) ---
    const ratingsSummary = `
      Product Quality: ${r1}/5, 
      Performance: ${r2}/5, 
      Sales Support: ${r3}/5, 
      Delivery: ${r4}/5, 
      Value: ${r5}/5, 
      Service: ${r6}/5
    `;

    const userContext = `
      Customer Name: ${name}
      Company: ${company}
      City: ${city}
      Purchased Items: ${purchases}
      Primary Highlight: ${initialStandout}
      Other Highlights: ${finalStandouts}
      Detailed Ratings: ${ratingsSummary}
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
      isLowRating: false,
      review: result.review,
      sentiment: result.sentiment || "positive"
    });

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request." },
      { status: 500 }
    );
  }
}
