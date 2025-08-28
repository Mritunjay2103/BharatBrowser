"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { IndianRupee, Send, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

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
import { Consent } from "./consent-manager";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  recipient: z.string().min(3, { message: "Must be at least 3 characters."}).regex(/@/, "Please enter a valid UPI ID (e.g., name@bank)."),
  amount: z.coerce
    .number({ invalid_type_error: "Please enter a valid amount." })
    .min(1, "Amount must be at least ₹1."),
  notes: z.string().optional(),
});

type UpiPaymentsProps = {
  consents: Consent;
};

type Transaction = {
  id: string;
  recipient: string;
  amount: number;
}

export default function UpiPayments({ consents }: UpiPaymentsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [saveUpiId, setSaveUpiId] = useState(true);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: "",
      amount: undefined,
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setLastTransaction(null);
    setTimeout(() => {
      const transactionId = `T${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
      const newTransaction = { id: transactionId, ...values };

      console.log("Processing Payment:", newTransaction);
      
      toast({
        title: "✅ Payment Successful",
        description: `₹${values.amount} has been sent to ${values.recipient}.`,
      });
      
      setLastTransaction(newTransaction);
      setIsLoading(false);
      form.reset();
    }, 2000); // Simulate network delay
  }

  if (!consents.payments) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">UPI Payments</h3>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payments Disabled</AlertTitle>
          <AlertDescription>
            Enable "One-Click Payments" in the Consent Manager to use this feature.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (lastTransaction) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">UPI Payments</h3>
        <Card className="bg-accent/20 text-center">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-accent">
                    <CheckCircle className="h-6 w-6" />
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-lg font-bold">Payment Successful!</p>
                <p className="text-2xl font-bold text-foreground">₹{lastTransaction.amount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                    Sent to <span className="font-medium text-foreground">{lastTransaction.recipient}</span>
                </p>
                <p className="text-xs text-muted-foreground pt-2">
                    Transaction ID: {lastTransaction.id}
                </p>
            </CardContent>
            <CardFooter>
                <Button onClick={() => setLastTransaction(null)} className="w-full">
                    Make Another Payment
                </Button>
            </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">UPI Payments</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
           <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., For dinner last night" {...field} className="bg-background resize-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="save-id" className="text-sm font-medium">Save this UPI ID</Label>
              <Switch id="save-id" checked={saveUpiId} onCheckedChange={setSaveUpiId}/>
          </div>
          
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Pay Now
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
