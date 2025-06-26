"use client";

import { VideoPlayer } from "./video-player";
import { TextChat } from "./text-chat";
import { ChatControls } from "./chat-controls";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type ChatInterfaceProps = {
  onEndChat: () => void;
};

export function ChatInterface({ onEndChat }: ChatInterfaceProps) {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleReport = () => {
    toast({
      title: "User Reported",
      description: "Thank you for your feedback. We will review the report.",
    });
  };

  const handleDisconnect = () => {
    onEndChat();
    toast({
      title: "Chat Ended",
      description: "You have been disconnected. Searching for a new partner...",
    });
  };

  const toggleMute = () => setIsMuted(prev => !prev);
  const toggleVideo = () => setIsVideoOff(prev => !prev);


  return (
    <div className="w-full max-w-7xl h-[85vh] md:h-[75vh] flex flex-col lg:flex-row gap-4">
      <div className="flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 h-full">
          <VideoPlayer name="You" isMuted={true} isVideoOff={isVideoOff} />
          <VideoPlayer name="Stranger" isMuted={isMuted} />
        </div>
        <ChatControls
          onDisconnect={handleDisconnect}
          onReport={handleReport}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
        />
      </div>
      <TextChat onViolation={handleDisconnect} />
    </div>
  );
}
