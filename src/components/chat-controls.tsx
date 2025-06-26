import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, SkipForward, Flag } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ChatControlsProps = {
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onDisconnect: () => void;
  onReport: () => void;
};

export function ChatControls({
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  onDisconnect,
  onReport,
}: ChatControlsProps) {
  return (
    <TooltipProvider>
      <div className="flex justify-center items-center gap-2 md:gap-4 p-2 rounded-lg bg-card border">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="lg" onClick={onToggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? <MicOff /> : <Mic />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMuted ? "Unmute" : "Mute"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="lg" onClick={onToggleVideo} aria-label={isVideoOff ? "Turn video on" : "Turn video off"}>
              {isVideoOff ? <VideoOff /> : <Video />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isVideoOff ? "Start video" : "Stop video"}</p>
          </TooltipContent>
        </Tooltip>
        
        <Button size="lg" onClick={onDisconnect} className="bg-primary text-primary-foreground font-bold">
          <SkipForward className="mr-2" />
          Next
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="destructive" size="lg" onClick={onReport} aria-label="Report user">
              <Flag />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Report User</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
