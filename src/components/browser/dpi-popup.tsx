"use client";

import {
  Bot,
  ToggleRight,
  UserSquare2,
  IndianRupee,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AiCopilot from "./ai-copilot";
import ConsentManager from "./consent-manager";
import DigitalIdentity from "./digital-identity";
import UpiPayments from "./upi-payments";
import { ScrollArea } from "../ui/scroll-area";

type DpiPopupProps = {
  open: boolean;
  pageContent: string;
  pageVersion: number;
};

export default function DpiPopup({ open, pageContent, pageVersion }: DpiPopupProps) {
  return (
    <div
      data-state={open ? "open" : "closed"}
      className="absolute right-4 top-4 z-50 w-[350px] origin-top-right transition-all duration-300 ease-in-out data-[state=closed]:pointer-events-none data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100"
    >
      <Card className="h-[500px] w-full overflow-hidden border-primary/20 shadow-2xl shadow-primary/10">
        <Tabs defaultValue="copilot" className="flex h-full flex-col">
          <CardHeader className="p-0">
            <TabsList className="grid w-full grid-cols-4 rounded-none bg-secondary/50 p-0">
              <TabsTrigger value="copilot" className="rounded-none py-3 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
                <Bot className="mb-1 h-5 w-5" />
                Copilot
              </TabsTrigger>
              <TabsTrigger value="consent" className="rounded-none py-3 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
                <ToggleRight className="mb-1 h-5 w-5" />
                Consent
              </TabsTrigger>
              <TabsTrigger value="identity" className="rounded-none py-3 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
                <UserSquare2 className="mb-1 h-5 w-5" />
                Identity
              </TabsTrigger>
              <TabsTrigger value="payments" className="rounded-none py-3 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
                <IndianRupee className="mb-1 h-5 w-5" />
                Payments
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[calc(500px-58px)]">
              <TabsContent value="copilot" className="m-0 p-4">
                <AiCopilot pageContent={pageContent} pageVersion={pageVersion} />
              </TabsContent>
              <TabsContent value="consent" className="m-0 p-4">
                <ConsentManager />
              </TabsContent>
              <TabsContent value="identity" className="m-0 p-4">
                <DigitalIdentity />
              </TabsContent>
              <TabsContent value="payments" className="m-0 p-4">
                <UpiPayments />
              </TabsContent>
            </ScrollArea>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
