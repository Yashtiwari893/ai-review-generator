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

        // Mapping 11za form fields to readable variables based on the provided JSON structure
        const name = body.Your_Name_4b003f || "Valued Customer";
        const company = body.Company_Name_ecbff6 || "N/A";
        const city = body.City_5a70fd || "N/A";
        const initialStandout = cleanLabel(body.What_stood_out_you_539226);

        // Checkbox groups are arrays of strings like ["0_Product_Quality", "1_Performance"]
        const purchases = Array.isArray(body.What_did_you_purchase_9093e3)
            ? body.What_did_you_purchase_9093e3.map(cleanLabel).join(", ")
            : cleanLabel(body.What_did_you_purchase_9093e3);

        const finalStandouts = Array.isArray(body.What_stood_out_to_you_8fc4ff)
            ? body.What_stood_out_to_you_8fc4ff.map(cleanLabel).join(", ")
            : cleanLabel(body.What_stood_out_to_you_8fc4ff);

        // Rating titles from the ID
        const ratingsSummary = Array.isArray(body.purchase_rating)
            ? body.purchase_rating.map((id: string) => {
                const map: Record<string, string> = {
                    "6": "Product Quality & Build",
                    "5": "Performance & Reliability",
                    "4": "Sales Team Support",
                    "3": "Delivery & Installation",
                    "2": "Value for Money",
                    "1": "After-Sales Service"
                };
                return map[id] || id;
            }).join(", ")
            : "";

        // Building the context for AI
        const userContext = `
      Customer Name: ${name}
      Company: ${company}
      City: ${city}
      Purchased Items: ${purchases}
      Primary Highlight: ${initialStandout}
      Other Highlights: ${finalStandouts}
      Specifically Praised: ${ratingsSummary}
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
            review: result.review,
            sentiment: result.sentiment || "positive"
        });

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate review. Check server logs." },
            { status: 500 }
        );
    }
}
