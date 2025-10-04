
import { useState } from "react";
import { useEmailAuth } from "@/hooks/auth/useEmailAuth";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Mail, Key, User, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";


const signUpSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpFormProps = {
  onLoginClick: () => void;
  onSignUpSuccess: (email: string) => void;
};

export const SignUpForm = ({ onLoginClick, onSignUpSuccess }: SignUpFormProps) => {
  const { signUp } = useEmailAuth();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof signUpSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signUp(values.email, values.password, values.fullName);
      if (result?.email) {
        onSignUpSuccess(result.email);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is handled in the signInWithGoogle function
    } finally {
      setGoogleLoading(false);
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}
          
          <motion.div variants={inputVariants} custom={0}>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Full Name</FormLabel>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        autoComplete="name"
                        autoCorrect="on"
                        autoCapitalize="words"
                        spellCheck={true}
                        className="pl-12 h-12 border-border/50 bg-background/50 focus:bg-background transition-colors"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="pl-12 h-12 border-border/50 bg-background/50 focus:bg-background transition-colors"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
          
          <motion.div variants={inputVariants} custom={2}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Password</FormLabel>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="pl-12 pr-12 h-12 border-border/50 bg-background/50 focus:bg-background transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        </div>

        <div className="flex flex-col space-y-4 pt-2">
          <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading || googleLoading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              "Sign up"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base border-border/50 hover:bg-muted/50 flex items-center justify-center gap-3"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base border-border/50 hover:bg-muted/50"
            onClick={onLoginClick}
            disabled={loading || googleLoading}
          >
            Already have an account? Sign in
          </Button>
        </div>
      </form>
    </Form>
  );
};
