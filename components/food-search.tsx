"use client";

import { useState } from "react";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  sugar?: number | null;
  sodium?: number | null;
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

interface FoodSearchProps {
  onFoodSelect: (food: Food, quantity: number, mealType: string) => void;
}

export function FoodSearch({ onFoodSelect }: FoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [mealType, setMealType] = useState("breakfast");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiNutritionData, setAiNutritionData] =
    useState<AINutritionData | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiSearch, setShowAiSearch] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const searchFoods = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowAiSearch(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/food?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const foods = await response.json();
        setSearchResults(foods);
        setShowAiSearch(foods.length === 0 && query.trim().length > 0);
      }
    } catch (error) {
      console.error("Error searching foods:", error);
      setShowAiSearch(true);
    } finally {
      setLoading(false);
    }
  };

  const searchWithAI = async () => {
    if (!searchQuery.trim()) return;

    setIsAiLoading(true);
    try {
      const response = await fetch("/api/ai-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          foodName: searchQuery,
        }),
      });

      if (response.ok) {
        const nutritionData = await response.json();
        setAiNutritionData(nutritionData);
        setIsDialogOpen(true);
      } else {
        console.error("AI search failed");
      }
    } catch (error) {
      console.error("Error with AI search:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddFood = async () => {
    if (selectedFood) {
      setIsAdding(true);
      try {
        const response = await fetch("/api/user-diets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            foodId: selectedFood.id,
            quantity,
            mealType,
          }),
        });

        if (response.ok) {
          onFoodSelect(selectedFood, quantity, mealType);
          setIsDialogOpen(false);
          setSelectedFood(null);
          setQuantity(100);
        }
      } catch (error) {
        console.error("Error adding food:", error);
      } finally {
        setIsAdding(false);
      }
    } else if (aiNutritionData) {
      setIsAdding(true);
      try {
        const response = await fetch("/api/ai-food", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nutritionData: aiNutritionData,
            quantity,
            mealType,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          onFoodSelect(result.food, quantity, mealType);
          setIsDialogOpen(false);
          setAiNutritionData(null);
          setQuantity(100);
        }
      } catch (error) {
        console.error("Error adding AI food:", error);
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for foods..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            searchFoods(e.target.value);
          }}
        />
      </div>

      {loading && (
        <p className="text-center text-muted-foreground">Searching...</p>
      )}

      {showAiSearch && !loading && (
        <Card className="border-dashed border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-sm flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Food not found?
            </CardTitle>
            <CardDescription className="text-xs">
              Try AI-powered search for &ldquo;{searchQuery}&rdquo;
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={searchWithAI}
              disabled={isAiLoading}
              className="w-full"
              variant="outline"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching with AI...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Search with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-2 max-h-60 overflow-y-auto">
        {searchResults.map((food) => (
          <Card
            key={food.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => {
              setSelectedFood(food);
              setIsDialogOpen(true);
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{food.name}</CardTitle>
              <CardDescription className="text-xs">
                {food.calories} cal, {food.protein}g protein per 100g
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {selectedFood?.name || aiNutritionData?.name}
            </DialogTitle>
            <DialogDescription>
              Specify the quantity and meal type
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Quantity (grams)</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Meal Type</label>
              <select
                className="w-full p-2 border rounded-md"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            {(selectedFood || aiNutritionData) && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">
                  Nutritional Info (for {quantity}g):
                </p>
                {selectedFood && (
                  <p className="text-xs text-muted-foreground">
                    Calories:{" "}
                    {Math.round((selectedFood.calories * quantity) / 100)} |
                    Protein:{" "}
                    {Math.round((selectedFood.protein * quantity) / 100)}g |
                    {selectedFood.carbs &&
                      ` Carbs: ${Math.round(
                        (selectedFood.carbs * quantity) / 100
                      )}g |`}
                    {selectedFood.fat &&
                      ` Fat: ${Math.round(
                        (selectedFood.fat * quantity) / 100
                      )}g`}
                  </p>
                )}
                {aiNutritionData && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Calories:{" "}
                      {Math.round((aiNutritionData.calories * quantity) / 100)}{" "}
                      | Protein:{" "}
                      {Math.round((aiNutritionData.protein * quantity) / 100)}g
                      | Carbs:{" "}
                      {Math.round(
                        ((aiNutritionData.carbs || 0) * quantity) / 100
                      )}
                      g | Fat:{" "}
                      {Math.round(
                        ((aiNutritionData.fat || 0) * quantity) / 100
                      )}
                      g
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      ⚡ AI-generated nutrition data
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedFood(null);
                setAiNutritionData(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddFood} disabled={isAdding}>
              {isAdding ? "Adding..." : "Add Food"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
