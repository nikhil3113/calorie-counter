import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "generated";

const prisma = new PrismaClient();

async function addFoods() {
  const foods: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs?: number | null;
    fat?: number | null;
    fiber?: number | null;
    sugar?: number | null;
    sodium?: number | null;
  }> = [];

  const csvFilePath = "script/foods.csv";

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on("data", (row: any) => {
        foods.push({
          name: row.name,
          calories: parseFloat(row.calories),
          protein: parseFloat(row.protein),
          carbs: row.carbs ? parseFloat(row.carbs) : null,
          fat: row.fat ? parseFloat(row.fat) : null,
          fiber: row.fiber ? parseFloat(row.fiber) : null,
          sugar: row.sugar ? parseFloat(row.sugar) : null,
          sodium: row.sodium ? parseFloat(row.sodium) : null,
        });
      })
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`Found ${foods.length} foods in CSV`);

  for (const food of foods) {
    try {
      const exists = await prisma.food.findUnique({
        where: { name: food.name },
      });

      if (!exists) {
        await prisma.food.create({ data: food });
        console.log(`✅ Inserted: ${food.name}`);
      } else {
        console.log(`⏭️  Skipped (duplicate): ${food.name}`);
      }
    } catch (error) {
      console.error(`❌ Error inserting ${food.name}:`, error);
    }
  }

  await prisma.$disconnect();
  console.log("✅ Done!");
}

addFoods().catch((e) => {
  console.error("❌ Script failed:", e);
  prisma.$disconnect();
});
