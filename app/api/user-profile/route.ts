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

export async function GET() {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        weight: true,
        height: true,
        Gender: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = (await getServerSession(authOptions)) as Session;
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { age, weight, height, gender } = body;

    // Validate input data
    if (age && (age < 1 || age > 150)) {
      return NextResponse.json(
        { message: "Age must be between 1 and 150" },
        { status: 400 }
      );
    }

    if (weight && (weight < 1 || weight > 1000)) {
      return NextResponse.json(
        { message: "Weight must be between 1 and 1000 kg" },
        { status: 400 }
      );
    }

    if (height && (height < 50 || height > 300)) {
      return NextResponse.json(
        { message: "Height must be between 50 and 300 cm" },
        { status: 400 }
      );
    }

    if (gender && !["male", "female"].includes(gender.toLowerCase())) {
      return NextResponse.json(
        { message: "Gender must be either 'male' or 'female'" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: {
      age?: number;
      weight?: number;
      height?: number;
      Gender?: string;
    } = {};

    if (age !== undefined) updateData.age = Number(age);
    if (weight !== undefined) updateData.weight = Number(weight);
    if (height !== undefined) updateData.height = Number(height);
    if (gender !== undefined) updateData.Gender = gender.toLowerCase();

    const updatedUser = await prisma.user.upsert({
      where: { email: session.user.email },
      update: updateData,
      create: {
        email: session.user.email,
        name: session.user.name || "",
        image: session.user.image || "",
        ...updateData,
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        weight: true,
        height: true,
        Gender: true,
        image: true,
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
