"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { IndianRupee, Send } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  recipient: z.string().min(3, "Please enter a valid UPI ID.").email("Please enter a valid UPI ID in format: name@bank"),
  amount: z.coerce
    .number({ invalid_type_error: "Please enter a valid amount." })
    .min(1, "Amount must be at least ₹1."),
});

export default function UpiPayments() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: "",
      amount: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values); // In a real app, you'd process the payment here
    toast({
      title: "✅ Payment Successful",
      description: `₹${values.amount} has been sent to ${values.recipient}.`,
      variant: "default",
    });
    form.reset();
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">UPI Payments</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="recipient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient UPI ID</FormLabel>
                <FormControl>
                  <Input placeholder="name@bank" {...field} className="bg-background"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="number" placeholder="0.00" {...field} className="pl-9 bg-background" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <Send className="mr-2 h-4 w-4" />
            Send Payment
          </Button>
        </form>
      </Form>
    </div>
  );
}
