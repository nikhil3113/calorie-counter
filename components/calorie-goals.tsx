"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculateBMR, calculateTDEE } from "@/lib/utils";

interface CalorieGoalsProps {
  dailyCalories: number;
}

interface UserProfile {
  age: number;
  weight: number;
  height: number;
  gender: "male" | "female";
  activityLevel: string;
  goal: "lose" | "maintain" | "gain";
}

export function CalorieGoals({ dailyCalories }: CalorieGoalsProps) {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 25,
    weight: 70,
    height: 170,
    gender: "male",
    activityLevel: "moderately_active",
    goal: "maintain",
  });

  const [showCalculator, setShowCalculator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/user-profile");
        if (response.ok) {
          const userData = await response.json();
          setUserProfile((prev) => ({
            ...prev,
            age: userData.age || prev.age,
            weight: userData.weight || prev.weight,
            height: userData.height || prev.height,
            gender: userData.Gender || prev.gender,
          }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [session]);

  const saveUserProfile = async () => {
    if (!session) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/user-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age: userProfile.age,
          weight: userProfile.weight,
          height: userProfile.height,
          gender: userProfile.gender,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Profile updated successfully:", result.message);
        setShowCalculator(false);
      } else {
        const error = await response.json();
        console.error("Failed to update profile:", error.message);
        alert("Failed to update profile: " + error.message);
      }
    } catch (error) {
      console.error("Error saving user profile:", error);
      alert("Error saving profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const bmr = calculateBMR(
    userProfile.weight,
    userProfile.height,
    userProfile.age,
    userProfile.gender
  );
  const tdee = calculateTDEE(bmr, userProfile.activityLevel);

  let targetCalories = tdee;
  if (userProfile.goal === "lose") {
    targetCalories = tdee - 500;
  } else if (userProfile.goal === "gain") {
    targetCalories = tdee + 500;
  }

  const remainingCalories = targetCalories - dailyCalories;
  const progressPercentage = Math.min(
    (dailyCalories / targetCalories) * 100,
    100
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Calorie Goals</CardTitle>
          <CardDescription>
            Track your daily calorie intake vs your goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{Math.round(dailyCalories)} consumed</span>
              <span>{Math.round(targetCalories)} target</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {Math.round(Math.abs(remainingCalories))}
              </p>
              <p className="text-xs text-muted-foreground">
                {remainingCalories >= 0 ? "Remaining" : "Over limit"}
              </p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{Math.round(bmr)}</p>
              <p className="text-xs text-muted-foreground">BMR</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowCalculator(!showCalculator)}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : showCalculator ? "Hide" : "Update"}{" "}
            Profile & Goals
          </Button>
        </CardContent>
      </Card>

      {showCalculator && (
        <Card>
          <CardHeader>
            <CardTitle>Profile & Goals</CardTitle>
            <CardDescription>
              Update your information to get accurate calorie targets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Age</label>
                <Input
                  type="number"
                  value={userProfile.age}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      age: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Weight (kg)</label>
                <Input
                  type="number"
                  value={userProfile.weight}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      weight: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Height (cm)</label>
                <Input
                  type="number"
                  value={userProfile.height}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      height: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Gender</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={userProfile.gender}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      gender: e.target.value as "male" | "female",
                    })
                  }
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Activity Level</label>
              <select
                className="w-full p-2 border rounded-md"
                value={userProfile.activityLevel}
                onChange={(e) =>
                  setUserProfile({
                    ...userProfile,
                    activityLevel: e.target.value,
                  })
                }
              >
                <option value="sedentary">
                  Sedentary (little/no exercise)
                </option>
                <option value="lightly_active">
                  Lightly Active (light exercise 1-3 days/week)
                </option>
                <option value="moderately_active">
                  Moderately Active (moderate exercise 3-5 days/week)
                </option>
                <option value="very_active">
                  Very Active (hard exercise 6-7 days/week)
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Goal</label>
              <select
                className="w-full p-2 border rounded-md"
                value={userProfile.goal}
                onChange={(e) =>
                  setUserProfile({
                    ...userProfile,
                    goal: e.target.value as "lose" | "maintain" | "gain",
                  })
                }
              >
                <option value="lose">Lose Weight (-500 cal/day)</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Weight (+500 cal/day)</option>
              </select>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Calculated Targets:</p>
              <p className="text-xs text-muted-foreground">
                BMR: {Math.round(bmr)} cal | TDEE: {Math.round(tdee)} cal |
                Target: {Math.round(targetCalories)} cal
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={saveUserProfile}
                disabled={isSaving || !session}
                className="flex-1"
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCalculator(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
