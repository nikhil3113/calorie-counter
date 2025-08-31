"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";

interface UserDiet {
  id: string;
  quantity: number;
  mealType: string;
  consumedAt: string;
  food: {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs?: number | null;
    fat?: number | null;
  };
}

interface DailyLogProps {
  refresh: boolean;
  onRefresh: () => void;
}

export function DailyLog({ refresh, onRefresh }: DailyLogProps) {
  const [dailyEntries, setDailyEntries] = useState<UserDiet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingEntries, setDeletingEntries] = useState<Set<string>>(
    new Set()
  );

  const fetchDailyEntries = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/user-diets?date=${today}`);
      if (response.ok) {
        const entries = await response.json();
        setDailyEntries(entries);
      }
    } catch (error) {
      console.error("Error fetching daily entries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (loading) {
      fetchDailyEntries(false);
    } else {
      fetchDailyEntries(true);
    }
  }, [refresh, loading]);

  const deleteEntry = async (entryId: string) => {
    try {
      setDeletingEntries((prev) => new Set(prev).add(entryId));
      const response = await fetch(`/api/user-diets?id=${entryId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDailyEntries(dailyEntries.filter((entry) => entry.id !== entryId));
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    } finally {
      setDeletingEntries((prev) => {
        const newSet = new Set(prev);
        newSet.delete(entryId);
        return newSet;
      });
    }
  };

  const groupedEntries = dailyEntries.reduce((acc, entry) => {
    if (!acc[entry.mealType]) {
      acc[entry.mealType] = [];
    }
    acc[entry.mealType].push(entry);
    return acc;
  }, {} as Record<string, UserDiet[]>);

  const calculateTotalCalories = (entries: UserDiet[]) => {
    return entries.reduce((total, entry) => {
      return total + (entry.food.calories * entry.quantity) / 100;
    }, 0);
  };

  const totalDailyCalories = calculateTotalCalories(dailyEntries);

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
      {[1, 2, 3].map((index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[1, 2].map((entryIndex) => (
              <div
                key={entryIndex}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daily Summary</CardTitle>
              <CardDescription>Today&apos;s nutritional intake</CardDescription>
            </div>
            {refreshing && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {Math.round(totalDailyCalories)} calories
          </div>
          <p className="text-sm text-muted-foreground">
            {dailyEntries.length} food entries
          </p>
        </CardContent>
      </Card>

      {["breakfast", "lunch", "dinner", "snack"].map((mealType) => {
        const entries = groupedEntries[mealType] || [];
        if (entries.length === 0) return null;

        return (
          <Card key={mealType}>
            <CardHeader>
              <CardTitle className="capitalize">{mealType}</CardTitle>
              <CardDescription>
                {Math.round(calculateTotalCalories(entries))} calories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium">{entry.food.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.quantity}g |{" "}
                      {Math.round((entry.food.calories * entry.quantity) / 100)}{" "}
                      cal |
                      {Math.round((entry.food.protein * entry.quantity) / 100)}g
                      protein
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEntry(entry.id)}
                    disabled={deletingEntries.has(entry.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    {deletingEntries.has(entry.id) ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {dailyEntries.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No food entries for today</p>
            <p className="text-sm text-muted-foreground">
              Start by searching and adding foods above
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
