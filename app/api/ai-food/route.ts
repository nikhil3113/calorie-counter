import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

interface SessionUser {
  email?: string;
  name?: string;
  image?: string;
}

interface Session {
  user?: SessionUser;
  expires?: string;
}

interface AINutritionData {
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export async function POST(request: Request) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { foodName } = body;

    if (!foodName) {
      return NextResponse.json(
        { message: "Food name is required" },
        { status: 400 }
      );
    }

    // Call Gemini AI to get nutritional information
    const nutritionData = await getAINutritionData(foodName);

    if (!nutritionData) {
      return NextResponse.json(
        { message: "Could not get nutrition data from AI" },
        { status: 404 }
      );
    }

    return NextResponse.json(nutritionData, { status: 200 });
  } catch (error) {
    console.error("Error in AI food search:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function getAINutritionData(
  foodName: string
): Promise<AINutritionData | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Please provide nutritional information for "${foodName}" per 100 grams. Return ONLY a valid JSON object with the following structure (no additional text or formatting):
{
  "name": "exact food name",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "sodium": number
}

All values should be in grams except calories (kcal) and sodium (mg). Use realistic nutritional values based on standard food databases. If a nutrient is not applicable or unknown, use 0.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      console.error("Unexpected Gemini API response structure:", data);
      return null;
    }

    const content = data.candidates[0].content.parts[0].text;

    // Remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // Try to parse the JSON response
    try {
      const nutritionData = JSON.parse(cleanContent.trim());

      // Validate the response structure
      if (
        typeof nutritionData.name === "string" &&
        typeof nutritionData.calories === "number" &&
        typeof nutritionData.protein === "number"
      ) {
        return {
          name: nutritionData.name,
          calories: Number(nutritionData.calories),
          protein: Number(nutritionData.protein),
          carbs: Number(nutritionData.carbs) || 0,
          fat: Number(nutritionData.fat) || 0,
          fiber: Number(nutritionData.fiber) || 0,
          sugar: Number(nutritionData.sugar) || 0,
          sodium: Number(nutritionData.sodium) || 0,
        };
      } else {
        console.error("Invalid nutrition data structure:", nutritionData);
        return null;
      }
    } catch (parseError) {
      console.error(
        "Error parsing AI response:",
        parseError,
        "Original content:",
        content,
        "Cleaned content:",
        cleanContent
      );
      return null;
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}

// Endpoint to add AI-generated food to database
export async function PUT(request: Request) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nutritionData, quantity, mealType } = body;

    if (!nutritionData || !quantity || !mealType) {
      return NextResponse.json(
        { message: "Nutrition data, quantity, and meal type are required" },
        { status: 400 }
      );
    }

    // Create the food in the database
    const food = await prisma.food.create({
      data: {
        name: nutritionData.name,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs || null,
        fat: nutritionData.fat || null,
        fiber: nutritionData.fiber || null,
        sugar: nutritionData.sugar || null,
        sodium: nutritionData.sodium || null,
      },
    });

    // Get or create user
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || "",
        image: session.user.image || "",
      },
    });

    // Add to user's diet
    const userDiet = await prisma.userDiet.create({
      data: {
        foodId: food.id,
        quantity,
        mealType,
        userId: user.id,
      },
      include: {
        food: true,
      },
    });

    return NextResponse.json(
      { message: "AI food added successfully", food, userDiet },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding AI food:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
