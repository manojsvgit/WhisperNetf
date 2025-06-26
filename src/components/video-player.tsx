import { Card, CardContent } from "@/components/ui/card";
import { MicOff, VideoOff, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type VideoPlayerProps = {
  name: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
};

export function VideoPlayer({ name, isMuted, isVideoOff }: VideoPlayerProps) {
  return (
    <Card className="relative w-full h-full overflow-hidden aspect-video bg-secondary border-2">
      <CardContent className="p-0 w-full h-full flex items-center justify-center">
        {isVideoOff ? (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <VideoOff size={64} />
            <p className="text-lg">Video is off</p>
          </div>
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            {/* Using a placeholder for video. In a real app this would be a <video> element */}
            <User size={128} className="text-gray-600" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-2">
            <Badge variant="secondary">{name}</Badge>
            {isMuted && <MicOff className="w-5 h-5 text-destructive" />}
        </div>
      </CardContent>
    </Card>
  );
}
