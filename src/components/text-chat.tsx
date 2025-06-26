"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, AlertTriangle } from "lucide-react";
import { checkMessageForModeration } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Message = {
  sender: "You" | "Stranger";
  text: string;
};

type TextChatProps = {
  onViolation: () => void;
};

export function TextChat({ onViolation }: TextChatProps) {
  const [messages, setMessages] = useState<Message[]>([
      { sender: "Stranger", text: "Hey there! What do you want to talk about?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaViewportRef.current) {
        scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isPending) return;

    const currentMessage = inputValue;
    setInputValue("");
    
    const userMessage: Message = { sender: "You", text: currentMessage };
    setMessages((prev) => [...prev, userMessage]);

    startTransition(async () => {
      const moderationResult = await checkMessageForModeration(currentMessage);
      
      if (!moderationResult.isSafe) {
        toast({
            variant: "destructive",
            title: "Community Guideline Violation",
            description: `Reason: ${moderationResult.reason}. This chat will be disconnected.`,
        });
        setTimeout(() => {
            onViolation();
        }, 2000);
      } else {
        // Simulate stranger's reply for demonstration
        setTimeout(() => {
            const replies = ["Interesting.", "Tell me more.", "lol", "I see.", "Why is that?"];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            setMessages((prev) => [...prev, { sender: "Stranger", text: randomReply }]);
        }, 1500)
      }
    });
  };

  return (
    <Card className="w-full lg:w-96 flex flex-col h-full max-h-[85vh] md:max-h-[75vh]">
      <CardHeader>
        <CardTitle>Text Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" viewportRef={scrollAreaViewportRef}>
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-end gap-2",
                  msg.sender === "You" ? "justify-end" : "justify-start"
                )}
              >
                {msg.sender === 'Stranger' && <Avatar className="h-8 w-8"><AvatarFallback>S</AvatarFallback></Avatar>}
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg p-3 text-sm",
                    msg.sender === "You"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  <p>{msg.text}</p>
                </div>
                 {msg.sender === 'You' && <Avatar className="h-8 w-8"><AvatarFallback>Y</AvatarFallback></Avatar>}
              </div>
            ))}
             {isPending && (
                <div className="flex items-end gap-2 justify-start">
                    <Avatar className="h-8 w-8"><AvatarFallback>S</AvatarFallback></Avatar>
                    <div className="max-w-[75%] rounded-lg p-3 text-sm bg-secondary text-secondary-foreground">
                        <div className="flex items-center gap-2">
                           <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-0"></span>
                           <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-150"></span>
                           <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-300"></span>
                        </div>
                    </div>
                </div>
             )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-4">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            disabled={isPending}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isPending || !inputValue.trim()}>
            <Send />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
