import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  try {
    const foods = await prisma.food.findMany({
      where: query
        ? {
            name: {
              contains: query,
              mode: "insensitive",
            },
          }
        : {},
      orderBy: {
        name: "desc",
      },
    });
    return NextResponse.json(foods);
  } catch (error) {
    console.log("Error in GET request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, calories, carbs, protein, fat, fiber, sugar, sodium } = body;
    if (!name || !calories || !carbs) {
      return NextResponse.json(
        { message: "Name, Calories, Cards are required" },
        { status: 400 }
      );
    }
    await prisma.food.create({
      data: {
        name,
        calories,
        carbs,
        protein: protein,
        fat: fat,
        fiber: fiber,
        sugar: sugar,
        sodium: sodium,
      },
    });
  } catch (error) {
    console.log("Error in POST request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { message: "Food id is required" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { name, calories, carbs, protein, fat, fiber, sugar, sodium } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Food id is required" },
        { status: 400 }
      );
    }

    const existingFood = await prisma.food.findUnique({
      where: { id },
    });

    if (!existingFood) {
      return NextResponse.json({ message: "Food not found" }, { status: 404 });
    }

    const updatedFood = await prisma.food.update({
      where: { id },
      data: {
        name: name ?? existingFood.name,
        calories: calories ?? existingFood.calories,
        carbs: carbs ?? existingFood.carbs,
        protein: protein ?? existingFood.protein,
        fat: fat ?? existingFood.fat,
        fiber: fiber ?? existingFood.fiber,
        sugar: sugar ?? existingFood.sugar,
        sodium: sodium ?? existingFood.sodium,
      },
    });

    return NextResponse.json(updatedFood);
  } catch (error) {
    console.log("Error in PUT request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
