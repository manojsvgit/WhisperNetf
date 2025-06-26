"use client";

import { VideoPlayer } from "./video-player";
import { TextChat } from "./text-chat";
import { ChatControls } from "./chat-controls";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ChatInterfaceProps = {
  onEndChat: () => void;
};

export function ChatInterface({ onEndChat }: ChatInterfaceProps) {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let stream: MediaStream | undefined;
    const getCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();

    return () => {
      // Clean up stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [toast]);

  const handleReport = () => {
    toast({
      title: "User Reported",
      description: "Thank you for your feedback. We will review the report.",
    });
  };

  const handleDisconnect = () => {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    onEndChat();
    toast({
      title: "Chat Ended",
      description: "You have been disconnected. Searching for a new partner...",
    });
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
        {hasCameraPermission === false && (
            <Alert variant="destructive">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use this feature. Refresh the page after granting permissions.
              </AlertDescription>
            </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 h-full">
          <VideoPlayer name="You" stream={localStream ?? undefined} isMuted={true} isVideoOff={isVideoOff} />
          <VideoPlayer name="Stranger" />
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
