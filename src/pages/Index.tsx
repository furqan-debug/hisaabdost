
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ArrowRight, ChartPie, Brain, Flag, ShieldCheck, Wallet, Star, CreditCard } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  // Use optional chaining to safely access auth properties
  const auth = useAuth?.() || {};
  const user = auth?.user || null;
  const loading = auth?.loading || false;

  useEffect(() => {
    if (user && !loading) {
      navigate('/app/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const features = [
    {
      icon: ChartPie,
      title: "Smart Expense Tracking",
      description: "Effortlessly track and categorize your spending with AI-powered automation"
    },
    {
      icon: Brain,
      title: "AI Financial Assistant",
      description: "Get personalized insights and recommendations to optimize your spending"
    },
    {
      icon: Flag,
      title: "Custom Goals & Milestones",
      description: "Set and achieve your financial goals with smart progress tracking"
    },
    {
      icon: CreditCard,
      title: "Budget Management",
      description: "Create flexible budgets and get real-time spending alerts"
    },
    {
      icon: Star,
      title: "Personalized Reports",
      description: "Detailed analytics and insights tailored to your spending patterns"
    },
    {
      icon: Wallet,
      title: "Smart Savings",
      description: "Discover opportunities to save more with AI-powered suggestions"
    }
  ];

  const steps = [
    { 
      number: "1️⃣", 
      title: "Create an account", 
      description: "Quick signup, no credit card needed" 
    },
    { 
      number: "2️⃣", 
      title: "Log your first expense", 
      description: "Simple and fast expense tracking" 
    },
    { 
      number: "3️⃣", 
      title: "Get instant insights", 
      description: "See where your money goes" 
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
        <div className="container px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/lovable-uploads/12aae181-1a03-4067-a879-2f29d4213837.png"
              alt="Hisaab Dost logo"
              className="h-8 w-8 bg-white rounded shadow-sm"
            />
            <span className="font-bold text-xl bg-gradient-to-r from-[#6E59A5] to-[#9b87f5] bg-clip-text text-transparent">
              Hisaab Dost
            </span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/auth')}>
            Log in →
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 container px-4">
          <div className="max-w-[980px] mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tighter mb-4">
              Your Smart Financial Companion
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-[700px] mx-auto">
              Experience smarter money management with AI-powered insights, automated tracking, and personalized guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-[#6E59A5] hover:bg-[#533ea8] text-white font-semibold"
              >
                Start Your Financial Journey <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Already have an account? <a href="/auth" className="text-primary hover:underline">Log in</a>
            </p>
          </div>
        </section>

        <section className="py-12 bg-muted/50">
          <div className="container px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-[980px] mx-auto">
              {features.slice(0, 3).map((feature, i) => (
                <div key={i} className="relative group rounded-lg border bg-background p-6 hover:shadow-md transition-all">
                  <div className="bg-[#6E59A5]/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-[#6E59A5]" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 container px-4">
          <div className="max-w-[980px] mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Get Started in Minutes</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl mb-4">{step.number}</div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/50">
          <div className="container px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-[980px] mx-auto">
              {features.slice(3).map((feature, i) => (
                <div key={i} className="relative group rounded-lg border bg-background p-6 hover:shadow-md transition-all">
                  <div className="bg-[#6E59A5]/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-[#6E59A5]" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/50">
          <div className="container px-4 text-center max-w-[980px] mx-auto">
            <div className="flex justify-center mb-8">
              <Wallet className="h-16 w-16 text-[#6E59A5]" />
            </div>
            <p className="text-lg sm:text-xl font-medium mb-4">
              Trusted by 10,000+ savvy savers worldwide!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              <p>Your data stays yours—bank-level encryption guaranteed.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 bg-background">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Hisaab Dost. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
