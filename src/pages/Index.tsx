
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

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
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#9b87f5] to-primary bg-clip-text text-transparent">
            Expense AI
          </h1>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
            >
              Log in
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
            >
              Sign up
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Smart Expense Tracking for Modern Life
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Take control of your finances with AI-powered insights, easy tracking, and beautiful visualizations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                className="animate-pulse"
                onClick={() => navigate('/auth')}
              >
                Get Started for Free
              </Button>
            </div>
          </div>
        </section>

        {/* App preview */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="bg-card border rounded-xl shadow-xl h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">App preview placeholder</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Smart Expense Tracking</h3>
                <p className="text-muted-foreground">Effortlessly track your expenses with AI-powered receipt scanning and categorization.</p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Monthly Insights</h3>
                <p className="text-muted-foreground">View and compare financial data across different months with our powerful time selector.</p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Budget Management</h3>
                <p className="text-muted-foreground">Set and track budgets for different categories to stay on top of your spending goals.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2023 Expense AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
