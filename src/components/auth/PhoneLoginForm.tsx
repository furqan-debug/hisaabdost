import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Phone, Loader2 } from "lucide-react";
import { CountryCodeSelector } from "./CountryCodeSelector";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const phoneSchema = z.object({
  countryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number must be less than 15 digits"),
});

interface PhoneLoginFormProps {
  onOtpSent: (phone: string) => void;
  onEmailClick: () => void;
}

const inputVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const PhoneLoginForm = ({ onOtpSent, onEmailClick }: PhoneLoginFormProps) => {
  const [loading, setLoading] = useState(false);
  const { signInWithPhone } = useAuth();

  const form = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      countryCode: "+1",
      phoneNumber: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof phoneSchema>) => {
    try {
      setLoading(true);
      const fullPhoneNumber = values.countryCode + values.phoneNumber.replace(/\D/g, '');
      await signInWithPhone(fullPhoneNumber);
      onOtpSent(fullPhoneNumber);
      toast.success("OTP sent to your phone!");
    } catch (error: any) {
      console.error("Phone sign in error:", error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return cleaned;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex space-x-2">
          <FormField
            control={form.control}
            name="countryCode"
            render={({ field }) => (
              <FormItem className="w-24">
                <FormLabel className="text-foreground">Code</FormLabel>
                <FormControl>
                  <CountryCodeSelector value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-foreground">Phone Number</FormLabel>
                <FormControl>
                  <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        {...field}
                        type="tel"
                        placeholder="123-456-7890"
                        className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </div>
                  </motion.div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </motion.div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/30" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onEmailClick}
          >
            Sign in with Email
          </Button>
        </motion.div>
      </form>
    </Form>
  );
};