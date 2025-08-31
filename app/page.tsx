"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { FoodSearch } from "@/components/food-search";
import { DailyLog } from "@/components/daily-log";
import { CalorieGoals } from "@/components/calorie-goals";
import { LandingPage } from "@/components/landing-page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Target } from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [refreshLog, setRefreshLog] = useState(false);
  const [dailyCalories, setDailyCalories] = useState(0);

  const handleFoodAdded = () => {
    setRefreshLog(!refreshLog);
  };

  const handleLogRefresh = () => {
    // This will be called when log updates to recalculate calories
  };

  useEffect(() => {
    const fetchDailyCalories = async () => {
      if (!session) return;

      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(`/api/user-diets?date=${today}`);
        if (response.ok) {
          const entries = await response.json();
          const total = entries.reduce(
            (
              sum: number,
              entry: {
                food: { calories: number };
                quantity: number;
              }
            ) => {
              return sum + (entry.food.calories * entry.quantity) / 100;
            },
            0
          );
          setDailyCalories(total);
        }
      } catch (error) {
        console.error("Error fetching daily calories:", error);
      }
    };

    fetchDailyCalories();
  }, [session, refreshLog]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold">AI Calorie Counter</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium">{session.user?.name}</p>
                <p className="text-muted-foreground text-xs">
                  {session.user?.email}
                </p>
              </div>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="search">Add Food</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            <DailyLog refresh={refreshLog} onRefresh={handleLogRefresh} />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Food</CardTitle>
                <CardDescription>
                  Search for foods and add them to your daily log
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FoodSearch onFoodSelect={handleFoodAdded} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <CalorieGoals dailyCalories={dailyCalories} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
