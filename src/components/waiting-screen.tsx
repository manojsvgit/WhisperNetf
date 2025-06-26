"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type WaitingScreenProps = {
  onCancel: () => void;
};

export function WaitingScreen({ onCancel }: WaitingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <div className="flex items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary-foreground fill-primary" />
        <h2 className="text-3xl font-semibold">Finding a match...</h2>
      </div>
      <p className="text-muted-foreground">Please wait while we connect you with a stranger.</p>
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
