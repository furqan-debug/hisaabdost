
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Mail, Key } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormProps = {
  onForgotPassword: () => void;
  onSignUpClick: () => void;
  onPhoneLoginClick: () => void;
};

export const LoginForm = ({ onForgotPassword, onSignUpClick, onPhoneLoginClick }: LoginFormProps) => {
  const { signInWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      await signInWithEmail(values.email, values.password);
    } catch (error) {
      // Error is handled in the signInWithEmail function
    } finally {
      setLoading(false);
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.3
      }
    })
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4">
          <motion.div variants={inputVariants} custom={0}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
          
          <motion.div variants={inputVariants} custom={1}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <div className="text-right">
                    <Button 
                      type="button" 
                      variant="link" 
                      className="text-xs p-0 h-auto"
                      onClick={onForgotPassword}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        </div>

        <div className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign in with Email"
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="w-full relative overflow-hidden group"
            onClick={onPhoneLoginClick}
            disabled={loading}
          >
            <span className="absolute inset-0 w-0 bg-gradient-to-r from-primary/10 to-primary/5 transition-all duration-[400ms] ease-out group-hover:w-full"></span>
            <span className="relative flex items-center justify-center">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2H8C6.89543 2 6 2.89543 6 4V20C6 21.1046 6.89543 22 8 22H16C17.1046 22 18 21.1046 18 20V4C18 2.89543 17.1046 2 16 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Continue with Phone
            </span>
          </Button>
          
          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={onSignUpClick}
          >
            Don't have an account? Sign up
          </Button>
        </div>
      </form>
    </Form>
  );
};
