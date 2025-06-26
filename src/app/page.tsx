"use client";

import { useState, useEffect } from "react";
import { LandingPage } from "@/components/landing-page";
import { WaitingScreen } from "@/components/waiting-screen";
import { ChatInterface } from "@/components/chat-interface";
import { Logo } from "@/components/logo";

type AppState = "landing" | "waiting" | "chatting";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing");

  const startChat = () => {
    setAppState("waiting");
  };

  const cancelSearch = () => {
    setAppState("landing");
  };

  const endChat = () => {
    setAppState("waiting");
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (appState === "waiting") {
      // Simulate finding a match
      timer = setTimeout(() => {
        setAppState("chatting");
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [appState]);

  const renderState = () => {
    switch (appState) {
      case "waiting":
        return <WaitingScreen onCancel={cancelSearch} />;
      case "chatting":
        return <ChatInterface onEndChat={endChat} />;
      case "landing":
      default:
        return <LandingPage onStartChat={startChat} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
       <header className="absolute top-0 left-0 w-full p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary-foreground fill-primary" />
          <h1 className="text-2xl font-bold text-foreground">AnonChat</h1>
        </div>
      </header>
      <main className="flex flex-1 w-full items-center justify-center p-4">
        {renderState()}
      </main>
    </div>
  );
}
