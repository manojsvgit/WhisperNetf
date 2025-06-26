"use client";

import { VideoPlayer } from "./video-player";
import { TextChat } from "./text-chat";
import { ChatControls } from "./chat-controls";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type ChatInterfaceProps = {
  onEndChat: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
};

export function ChatInterface({ onEndChat, localStream, remoteStream }: ChatInterfaceProps) {
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
  };

  const toggleMute = () => {
      if (localStream) {
          localStream.getAudioTracks().forEach(track => {
              track.enabled = !track.enabled;
          });
          setIsMuted(prev => !prev);
      }
  };
  
  const toggleVideo = () => {
      if (localStream) {
          localStream.getVideoTracks().forEach(track => {
              track.enabled = !track.enabled;
          });
          setIsVideoOff(prev => !prev);
      }
  };

  return (
    <div className="w-full max-w-7xl h-[85vh] md:h-[75vh] flex flex-col lg:flex-row gap-4">
      <div className="flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 h-full">
          <VideoPlayer name="You" stream={localStream ?? undefined} isMuted={true} isVideoOff={isVideoOff} />
          <VideoPlayer name="Stranger" stream={remoteStream ?? undefined} />
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
