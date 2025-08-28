"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User } from "lucide-react";

export default function DigitalIdentity() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Digital Identity</h3>
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
            <p className="text-sm text-muted-foreground font-mono">1234 5678 9012</p>
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
                <p className="text-muted-foreground col-span-1">Address</p>
                <p className="font-medium col-span-2">123, Tech Park Road, Electronic City, Bangalore, 560100</p>
            </div>
            <div className="pt-4 flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Issued: 01/01/2020</p>
              <Image src="/qr-code.svg" alt="QR Code" width={50} height={50} data-ai-hint="qr code" onError={(e) => e.currentTarget.src = 'https://placehold.co/50x50/fed16a/386641?text=QR'}/>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
