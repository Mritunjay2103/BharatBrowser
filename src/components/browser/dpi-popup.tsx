"use client";

import {
  Bot,
  ToggleRight,
  UserSquare2,
  IndianRupee,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AiCopilot from "./ai-copilot";
import ConsentManager, { Consent } from "./consent-manager";
import DigitalIdentity from "./digital-identity";
import UpiPayments from "./upi-payments";
import { ScrollArea } from "../ui/scroll-area";
import { useState } from "react";

type DpiPopupProps = {
  open: boolean;
  pageContent: string;
  pageVersion: number;
};

export default function DpiPopup({ open, pageContent, pageVersion }: DpiPopupProps) {
  const [consents, setConsents] = useState<Consent>({
    kyc: true,
    payments: true,
    telemetry: false,
  });

  const handleConsentChange = (key: keyof Consent) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      data-state={open ? "open" : "closed"}
      className="absolute right-4 top-4 z-50 w-[380px] origin-top-right transition-all duration-300 ease-in-out data-[state=closed]:pointer-events-none data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100"
    >
      <Card className="h-[600px] w-full overflow-hidden rounded-2xl border-white/20 bg-black/30 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <Tabs defaultValue="copilot" className="flex h-full flex-col">
          <TabsList className="grid h-auto w-full grid-cols-4 rounded-none bg-black/30 p-1">
            <TabsTrigger value="copilot" className="flex-col gap-1 rounded-lg py-2 text-xs data-[state=active]:bg-blue-600/50 data-[state=active]:text-white">
              <Bot className="h-5 w-5" />
              Copilot
            </TabsTrigger>
            <TabsTrigger value="consent" className="flex-col gap-1 rounded-lg py-2 text-xs data-[state=active]:bg-blue-600/50 data-[state=active]:text-white">
              <ToggleRight className="h-5 w-5" />
              Consent
            </TabsTrigger>
            <TabsTrigger value="identity" className="flex-col gap-1 rounded-lg py-2 text-xs data-[state=active]:bg-blue-600/50 data-[state=active]:text-white">
              <UserSquare2 className="h-5 w-5" />
              Identity
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex-col gap-1 rounded-lg py-2 text-xs data-[state=active]:bg-blue-600/50 data-[state=active]:text-white">
              <IndianRupee className="h-5 w-5" />
              Payments
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1">
              <TabsContent value="copilot" className="m-0 p-4">
                <AiCopilot pageContent={pageContent} pageVersion={pageVersion} />
              </TabsContent>
              <TabsContent value="consent" className="m-0 p-4">
                <ConsentManager consents={consents} onConsentChange={handleConsentChange}/>
              </TabsContent>
              <TabsContent value="identity" className="m-0 p-4">
                <DigitalIdentity consents={consents} />
              </TabsContent>
              <TabsContent value="payments" className="m-0 p-4">
                <UpiPayments consents={consents} />
              </TabsContent>
          </ScrollArea>
        </Tabs>
      </Card>
    </div>
  );
}
