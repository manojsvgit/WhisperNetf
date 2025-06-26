import { Card, CardContent } from "@/components/ui/card";
import { MicOff, VideoOff, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef } from "react";

type VideoPlayerProps = {
  name: string;
  stream?: MediaStream;
  isMuted?: boolean;
  isVideoOff?: boolean;
};

export function VideoPlayer({ name, stream, isMuted = false, isVideoOff = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.srcObject = stream || null;
    }
  }, [stream]);

  return (
    <Card className="relative w-full h-full overflow-hidden aspect-video bg-black border-2">
      <CardContent className="p-0 w-full h-full flex items-center justify-center">
        {/* Render video element but hide it if video is off. This is better for stream management. */}
        <video ref={videoRef} autoPlay muted={isMuted} className={`w-full h-full object-cover ${!isVideoOff ? 'block' : 'hidden'}`} />
        
        {/* Placeholder if video is off */}
        {isVideoOff && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground bg-black">
            <VideoOff size={64} />
            <p className="text-lg">Video is off</p>
          </div>
        )}
        
        {/* Placeholder if there's no stream yet */}
        {!stream && !isVideoOff && (
            <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                <User size={128} className="text-gray-600" />
            </div>
        )}

        <div className="absolute top-2 left-2 flex items-center gap-2">
            <Badge variant="secondary">{name}</Badge>
            {isMuted && name !== 'You' && <MicOff className="w-5 h-5 text-destructive" />}
        </div>
      </CardContent>
    </Card>
  );
}
