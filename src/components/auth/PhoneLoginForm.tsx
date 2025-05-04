
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

const phoneSchema = z.object({
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .refine((val) => /^\+[1-9]\d{1,14}$/.test(val), {
      message: "Phone must include country code (e.g., +1xxxxxxxxxx)",
    }),
});

type PhoneLoginFormProps = {
  onLoginClick: () => void;
  onPhoneLoginSuccess: (phone: string) => void;
};

export const PhoneLoginForm = ({ onLoginClick, onPhoneLoginSuccess }: PhoneLoginFormProps) => {
  const { signInWithPhone } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof phoneSchema>) => {
    setLoading(true);
    setError(null);
    
    try {
      const phone = await signInWithPhone(values.phone);
      onPhoneLoginSuccess(phone);
    } catch (err: any) {
      console.error("Phone login error:", err);
      setError(err.message || "An error occurred during phone login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-md bg-destructive/10 text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="+1xxxxxxxxxx"
                      {...field}
                    />
                  </FormControl>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Include country code (e.g., +1 for US)
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col space-y-4 mt-6">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                <span>Sending code...</span>
              </div>
            ) : (
              "Send verification code"
            )}
          </Button>
          
          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={onLoginClick}
          >
            Use email instead
          </Button>
        </div>
      </form>
    </Form>
  );
};
