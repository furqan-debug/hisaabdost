
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
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#9b87f5] to-primary bg-clip-text text-transparent">
            Expense AI
          </h1>
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
        {/* Hero section with improved visual appeal */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight gradient-text animation-slide-up">
              Smart Expense Tracking for Modern Life
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed animation-slide-up animation-delay-100">
              Take control of your finances with AI-powered insights, easy tracking, and beautiful visualizations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animation-slide-up animation-delay-200">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all elastic-hover"
                onClick={() => navigate('/auth')}
              >
                Get Started for Free
              </Button>
            </div>
          </div>
        </section>

        {/* App preview */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="bg-card/80 backdrop-blur-sm border rounded-xl shadow-xl overflow-hidden">
              <div className="aspect-video relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 bg-gradient-to-tr from-background/80 via-background/40 to-background/10">
                  <img 
                    src="/og-image.png" 
                    alt="Expense AI Dashboard" 
                    className="object-cover rounded-lg shadow-2xl max-w-full max-h-full animation-scale-in"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features with improved layout and icons */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Key Features</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Designed for simplicity and efficiency to help you take control of your finances
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 border rounded-xl bg-card hover:shadow-md transition-all duration-300 card-hover">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <PieChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Expense Tracking</h3>
                <p className="text-muted-foreground">Effortlessly track your expenses with AI-powered receipt scanning and categorization.</p>
              </div>
              <div className="p-6 border rounded-xl bg-card hover:shadow-md transition-all duration-300 card-hover">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Monthly Insights</h3>
                <p className="text-muted-foreground">View and compare financial data across different months with our powerful time selector.</p>
              </div>
              <div className="p-6 border rounded-xl bg-card hover:shadow-md transition-all duration-300 card-hover">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Budget Management</h3>
                <p className="text-muted-foreground">Set and track budgets for different categories to stay on top of your spending goals.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2023 Expense AI. All rights reserved.</p>
          <p className="text-sm mt-2">Made with ❤️ for simplified financial management</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
