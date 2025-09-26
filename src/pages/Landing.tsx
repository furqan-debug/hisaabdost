import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  BarChart3, 
  PiggyBank, 
  Target, 
  TrendingUp,
  Shield,
  Smartphone,
  Star,
  Check
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Get detailed insights into your spending patterns with beautiful charts and reports.'
    },
    {
      icon: PiggyBank,
      title: 'Budget Management',
      description: 'Set budgets and track your progress with intelligent notifications and alerts.'
    },
    {
      icon: Target,
      title: 'Goal Setting',
      description: 'Define financial goals and watch your progress with our motivating visual tracker.'
    },
    {
      icon: TrendingUp,
      title: 'Expense Tracking',
      description: 'Track every expense effortlessly with our intuitive and fast entry system.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and secure. We never share your personal information.'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Designed for mobile with offline support. Manage your finances anywhere, anytime.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Freelance Designer',
      content: 'Hisaab Dost transformed how I manage my finances. The insights are incredibly helpful!',
      rating: 5
    },
    {
      name: 'Raj Patel',
      role: 'Software Engineer',
      content: 'Simple, intuitive, and powerful. Finally, a budgeting app that actually works for me.',
      rating: 5
    },
    {
      name: 'Maria Rodriguez',
      role: 'Small Business Owner',
      content: 'The goal tracking feature helped me save for my business expansion. Highly recommended!',
      rating: 5
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <motion.div 
          className="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Hisaab Dost
            </span>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="hover-scale"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="btn-gradient hover-lift"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 py-20">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            variants={itemVariants}
          >
            Take Control of Your{' '}
            <span className="bg-gradient-to-r from-primary via-primary-hover to-accent bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Financial Future
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Hisaab Dost is your intelligent financial companion. Track expenses, manage budgets, 
            and achieve your financial goals with our beautifully designed, easy-to-use app.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={itemVariants}
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="btn-gradient hover-lift text-lg px-8 py-4"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4 hover-scale"
            >
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero Image/Animation */}
        <motion.div
          className="max-w-4xl mx-auto mt-16"
          style={{ y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
            <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 card-glass">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={i}
                    className="h-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 py-20 bg-muted/30">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to Manage Your Money
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive suite of tools helps you understand, control, and grow your finances.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="card-modern hover-lift h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 px-4 py-20">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-4">Loved by Thousands</h2>
            <p className="text-xl text-muted-foreground">
              See what our users have to say about their experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="card-modern hover-lift">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            variants={itemVariants}
          >
            Ready to Transform Your Finances?
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground mb-8"
            variants={itemVariants}
          >
            Join thousands of users who have taken control of their financial future with Hisaab Dost.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="btn-gradient hover-lift text-lg px-12 py-4"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-12 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Hisaab Dost</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Hisaab Dost. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;