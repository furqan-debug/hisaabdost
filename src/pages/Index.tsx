
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useTheme } from "next-themes";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 md:px-6">
          <h2 className="text-xl font-semibold flex-1 whitespace-nowrap overflow-hidden text-ellipsis bg-gradient-to-r from-[#9b87f5] to-primary bg-clip-text text-transparent">
            Expense AI
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground">
              Get Started
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 grid place-items-center px-4 py-8 md:py-12 md:px-6 lg:py-16">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#9b87f5] to-primary bg-clip-text text-transparent">
              Track Your Expenses with Intelligence
            </h1>
            <p className="text-xl text-muted-foreground max-w-[700px]">
              Simplify your financial life with our AI-powered expense tracking app. 
              Get insights, set budgets, and reach your financial goals.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="text-md px-8 py-6" 
              size="lg" 
              onClick={() => navigate("/auth")}
            >
              Get Started for Free
            </Button>
            <Button 
              variant="outline" 
              className="text-md px-8 py-6" 
              size="lg"
              onClick={() => navigate("/auth")}
            >
              Learn More
            </Button>
          </div>
          <div className="relative w-full max-w-4xl mt-8 aspect-video rounded-lg overflow-hidden border border-border/40 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-muted/30"></div>
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <p className="text-lg font-medium">App Dashboard Preview</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
            {[
              {
                title: "Smart Tracking",
                description: "Automatically categorize and track your expenses with AI"
              },
              {
                title: "Budget Planning",
                description: "Set realistic budgets and receive alerts when you're close to limits"
              },
              {
                title: "Visual Insights",
                description: "Get beautiful charts and analytics to understand your spending habits"
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-border/40 bg-card">
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="border-t border-border/40 bg-background">
        <div className="container flex flex-col sm:flex-row items-center justify-between py-8 px-4 md:px-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Expense AI. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Privacy
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Terms
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Contact
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
