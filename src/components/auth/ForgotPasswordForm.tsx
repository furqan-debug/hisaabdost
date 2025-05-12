
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Platform } from '@capacitor/core';

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // Determine if running in mobile app or web browser
      const isNativeMobile = await Platform.is('android') || await Platform.is('ios');
      
      // Choose appropriate redirect URL based on platform
      let redirectTo;
      
      if (isNativeMobile) {
        // Use custom scheme for mobile apps
        redirectTo = "hisaabdost://reset-password";
      } else {
        // Use web URL for browsers
        redirectTo = window.location.origin + "/auth/reset-password";
      }

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: redirectTo
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast.success("Password reset instructions sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Error sending reset email");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex flex-col space-y-4 text-center">
        <div className="p-4 rounded-md bg-primary/10 mb-2">
          <p className="text-center text-primary font-medium">Check your inbox</p>
        </div>
        <p>
          We've sent password reset instructions to your email. Please check your inbox and follow the instructions to reset your password.
        </p>
        <p className="text-sm text-muted-foreground">
          If you don't see the email, check your spam folder.
        </p>
        <Button onClick={onBackToLogin} className="mt-4">
          Return to login
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col space-y-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Instructions"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex items-center justify-center gap-2"
            onClick={onBackToLogin}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Button>
        </div>
      </form>
    </Form>
  );
};
