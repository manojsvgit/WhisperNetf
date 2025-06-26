"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type LandingPageProps = {
  onStartChat: () => void;
};

export function LandingPage({ onStartChat }: LandingPageProps) {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Welcome to AnonChat</CardTitle>
        <CardDescription>Start a random video chat with a stranger.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-2">
            <Checkbox id="age" checked={ageConfirmed} onCheckedChange={(checked) => setAgeConfirmed(Boolean(checked))} />
            <div className="grid gap-1.5 leading-none">
                <Label htmlFor="age" className="cursor-pointer">
                    I confirm I am 18 years of age or older.
                </Label>
            </div>
        </div>
        <div className="flex items-start space-x-2">
            <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))} />
            <div className="grid gap-1.5 leading-none">
                <Label htmlFor="terms" className="cursor-pointer">
                    I have read and agree to the terms of service and community guidelines.
                </Label>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          size="lg"
          className="w-full text-lg font-semibold"
          onClick={onStartChat}
          disabled={!ageConfirmed || !termsAccepted}
          aria-label="Start a new chat"
        >
          Start Chat
        </Button>
      </CardFooter>
    </Card>
  );
}
