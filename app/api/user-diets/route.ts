import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
interface SessionUser {
  email?: string;
  name?: string;
  image?: string;
}

interface Session {
  user?: SessionUser;
  expires?: string;
}

export async function POST(request: Request) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { foodId, quantity, mealType } = body;
    if (!quantity || !mealType || !foodId) {
      return NextResponse.json(
        { message: "Food ,Quantity and Meal Type are required" },
        { status: 400 }
      );
    }

    const food = await prisma.food.findUnique({
      where: {
        id: foodId,
      },
    });
    if (!food) {
      return NextResponse.json({ message: "Food not found" }, { status: 404 });
    }

    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || "",
        image: session.user.image || "",
      },
    });

    const userDiet = await prisma.userDiet.create({
      data: {
        foodId,
        quantity,
        mealType,
        userId: user.id,
      },
      include: {
        food: true,
      },
    });

    return NextResponse.json(
      { message: "Food added to diet", userDiet },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error in POST request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || "",
        image: session.user.image || "",
      },
    });

    const whereClause: {
      userId: string;
      consumedAt?: {
        gte: Date;
        lte: Date;
      };
    } = {
      userId: user.id,
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.consumedAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const userDiets = await prisma.userDiet.findMany({
      where: whereClause,
      include: {
        food: true,
      },
      orderBy: {
        consumedAt: "desc",
      },
    });

    return NextResponse.json(userDiets, { status: 200 });
  } catch (error) {
    console.log("Error in GET request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Diet entry ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || "",
        image: session.user.image || "",
      },
    });

    // Verify the diet entry belongs to the user
    const userDiet = await prisma.userDiet.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!userDiet) {
      return NextResponse.json(
        { message: "Diet entry not found" },
        { status: 404 }
      );
    }

    await prisma.userDiet.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Diet entry deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in DELETE request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
