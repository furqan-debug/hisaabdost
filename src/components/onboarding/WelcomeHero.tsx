import { Wallet, TrendingUp, PieChart } from "lucide-react";

export function WelcomeHero() {
  return (
    <div className="relative w-full h-40 mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-around px-8">
          {/* Icon 1 - Wallet */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          {/* Icon 2 - Trending Up */}
          <div className="absolute right-8 top-1/4 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>
            <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-7 h-7 text-success" />
            </div>
          </div>
          
          {/* Icon 3 - Pie Chart */}
          <div className="absolute right-12 bottom-6 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3s' }}>
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center backdrop-blur-sm">
              <PieChart className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <h2 className="text-3xl font-bold text-primary mb-2">Hisaab Dost</h2>
              <p className="text-sm text-muted-foreground">Your Smart Money Manager</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
    </div>
  );
}
