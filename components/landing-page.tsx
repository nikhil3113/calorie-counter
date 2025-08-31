"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Target,
  Search,
  Calendar,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export function LandingPage() {
  const features = [
    {
      icon: Search,
      title: "Smart Food Search",
      description:
        "Search thousands of foods with comprehensive nutrition data",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Recognition",
      description:
        "Can't find a food? Our AI will generate nutrition info instantly",
    },
    {
      icon: Calendar,
      title: "Daily Tracking",
      description: "Log meals by type and track your daily nutrition intake",
    },
    {
      icon: Target,
      title: "Personalized Goals",
      description: "Set calorie goals based on your BMR and activity level",
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Monitor your progress with detailed nutrition insights",
    },
    {
      icon: CheckCircle,
      title: "Easy Logging",
      description: "Quick and intuitive food logging for busy lifestyles",
    },
  ];

  const benefits = [
    "Track macronutrients automatically",
    "AI-powered food recognition",
    "Personalized calorie goals",
    "Progress tracking & analytics",
    "Comprehensive food database",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 md:px-10">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-Powered Nutrition Tracking
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Track Your <span className="text-emerald-600">Nutrition</span>{" "}
                with <span className="text-teal-600">AI</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Achieve your health goals with intelligent food tracking,
                personalized calorie targets, and AI-powered nutrition insights.
              </p>
            </div>

            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => signIn("google")}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span>Login To Get Started</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-sm text-gray-500">
              Sign in with Google to start tracking your nutrition journey
            </p>
          </div>

          {/* Right Column - Feature Card */}
          <div className="lg:pl-8">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">
                  AI Calorie Counter
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Your intelligent nutrition companion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {features.slice(0, 3).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <feature.icon className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16 bg-white/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features designed to make nutrition tracking effortless
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-white/80 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to transform your nutrition?
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of users who are already achieving their health goals
          </p>
          <Button
            onClick={() => signIn("google")}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start Your Journey Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
