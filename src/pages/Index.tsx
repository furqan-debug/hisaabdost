import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ArrowRight, PieChart, TrendingUp, ShieldCheck } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="/lovable-uploads/12aae181-1a03-4067-a879-2f29d4213837.png"
              alt="Hisaab Dost logo"
              className="h-8 w-8 bg-white rounded shadow"
            />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#6E59A5] to-[#9b87f5] bg-clip-text text-transparent drop-shadow">
              Hisaab Dost
            </h1>
          </div>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="hover:border-primary/50"
            >
              Log in
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="group"
            >
              Sign up
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto text-center max-w-3xl">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/lovable-uploads/12aae181-1a03-4067-a879-2f29d4213837.png"
                alt="Hisaab Dost mascot"
                className="h-16 w-16 rounded bg-white shadow mx-auto"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-[#6E59A5] to-[#9b87f5] bg-clip-text text-transparent">
              स्मार्ट खर्च प्रबंधन के लिए आपका दोस्त
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Track your expenses and budgets with a friendly, easy-to-use app designed for you—now smarter, better, and more fun than ever!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-[#6E59A5] hover:bg-[#533ea8] text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all elastic-hover"
                onClick={() => navigate('/auth')}
              >
                Get Started - It's Free
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="bg-card/80 backdrop-blur-sm border rounded-xl shadow-xl overflow-hidden">
              <div className="aspect-video relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 bg-gradient-to-tr from-background/80 via-background/40 to-background/10">
                  <img 
                    src="/og-image.png" 
                    alt="Hisab Dost Dashboard Preview" 
                    className="object-cover rounded-lg shadow-2xl max-w-full max-h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#6E59A5]">Key Features</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Designed for simplicity and efficiency to help you take control of your finances
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 border rounded-xl bg-card hover:shadow-md transition-all duration-300 card-hover">
                <div className="bg-[#9b87f5]/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <PieChart className="h-6 w-6 text-[#6E59A5]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Expense Tracking</h3>
                <p className="text-muted-foreground">Track every rupee easily, categorize smartly, and get instant insights!</p>
              </div>
              <div className="p-6 border rounded-xl bg-card hover:shadow-md transition-all duration-300 card-hover">
                <div className="bg-[#9b87f5]/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-[#6E59A5]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Monthly Insights</h3>
                <p className="text-muted-foreground">See your spends and savings for any month—clear, simple, visual.</p>
              </div>
              <div className="p-6 border rounded-xl bg-card hover:shadow-md transition-all duration-300 card-hover">
                <div className="bg-[#9b87f5]/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-[#6E59A5]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Budget Management</h3>
                <p className="text-muted-foreground">Set goals, track your progress, and control spending with confidence.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Hisaab Dost. All rights reserved.</p>
          <p className="text-sm mt-2">Created for simplified financial management</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
