"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

type Consent = {
  kyc: boolean;
  payments: boolean;
  telemetry: boolean;
};

export default function ConsentManager() {
  const [consents, setConsents] = useState<Consent>({
    kyc: true,
    payments: true,
    telemetry: false,
  });

  const handleConsentChange = (key: keyof Consent) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  
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
                        onCheckedChange={() => handleConsentChange(item.key)}
                    />
                </div>
            ))}
        </div>
       </Card>
    </div>
  );
}
