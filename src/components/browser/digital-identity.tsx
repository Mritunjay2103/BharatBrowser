"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertCircle, User, ShieldCheck, Verified } from "lucide-react";
import { Consent } from "./consent-manager";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useState } from "react";

type DigitalIdentityProps = {
  consents: Consent;
};

export default function DigitalIdentity({ consents }: DigitalIdentityProps) {
  const { toast } = useToast();
  const [shareWithWebsite, setShareWithWebsite] = useState(false);

  const handleVerify = () => {
    toast({
      title: "✅ Identity Verified",
      description: "Your identity has been successfully verified via DigiLocker.",
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Digital Identity</h3>
      
      {!consents.kyc && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Identity sharing is disabled. Enable "KYC Data Sharing" in the Consent Manager to use this feature.
          </AlertDescription>
        </Alert>
      )}

      <fieldset disabled={!consents.kyc} className="disabled:opacity-50">
        <Card className="bg-gradient-to-br from-secondary/50 to-background">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/50">
              <AvatarImage src="https://picsum.photos/100/100" data-ai-hint="person portrait" alt="User Avatar" />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-lg text-foreground">Anika Sharma</p>
              <p className="text-sm text-muted-foreground font-mono">XXXX-XXXX-9012</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                  <p className="text-muted-foreground col-span-1">DOB</p>
                  <p className="font-medium col-span-2">15/08/1995</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                  <p className="text-muted-foreground col-span-1">Gender</p>
                  <p className="font-medium col-span-2">Female</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                  <p className="text-muted-foreground col-span-1">Valid Until</p>
                  <p className="font-medium col-span-2">31/12/2030</p>
              </div>
              <div className="pt-4 flex justify-between items-center">
                <Image src="/qr-code.svg" alt="QR Code" width={50} height={50} data-ai-hint="qr code" onError={(e) => e.currentTarget.src = 'https://placehold.co/50x50/fed16a/386641?text=QR'}/>
                <Button onClick={handleVerify} size="sm">
                  <ShieldCheck className="mr-2 h-4 w-4"/>
                   Verify Identity
                </Button>
              </div>
          </CardContent>
        </Card>

        <Card className="mt-4 p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="share-id" className="font-medium">
              Share with website
            </Label>
            <Switch
              id="share-id"
              checked={shareWithWebsite}
              onCheckedChange={setShareWithWebsite}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Allow the current website to securely access your verified identity.
          </p>
        </Card>
      </fieldset>
    </div>
  );
}
