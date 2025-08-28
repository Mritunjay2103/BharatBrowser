"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info } from "lucide-react";

export type Consent = {
  kyc: boolean;
  payments: boolean;
  telemetry: boolean;
};

type ConsentManagerProps = {
  consents: Consent;
  onConsentChange: (key: keyof Consent) => void;
};

export default function ConsentManager({ consents, onConsentChange }: ConsentManagerProps) {
  
  const consentItems = [
    {
      key: 'kyc' as keyof Consent,
      label: 'KYC Data Sharing',
      description: 'Allow sharing of your Know Your Customer (KYC) details with verified services.',
    },
    {
      key: 'payments' as keyof Consent,
      label: 'One-Click Payments',
      description: 'Enable seamless payments by saving your UPI details for future transactions.',
    },
    {
        key: 'telemetry' as keyof Consent,
        label: 'Anonymous Telemetry',
        description: 'Help improve our services by sharing anonymous usage data.',
      },
  ];

  return (
    <div className="space-y-4">
       <h3 className="font-semibold text-foreground">Consent Manager</h3>
       <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Your Data, Your Control</AlertTitle>
        <AlertDescription>
          These settings allow you to manage how your data is shared with websites and services through the browser.
        </AlertDescription>
       </Alert>
       <Card className="p-4 bg-background">
        <div className="space-y-4">
            {consentItems.map((item) => (
                <div key={item.key} className="flex items-start justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5 pr-4">
                        <Label htmlFor={item.key} className="text-base font-medium">
                            {item.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                        id={item.key}
                        checked={consents[item.key]}
                        onCheckedChange={() => onConsentChange(item.key)}
                    />
                </div>
            ))}
        </div>
       </Card>
    </div>
  );
}
