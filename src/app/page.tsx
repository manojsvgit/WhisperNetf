"use client";

import { useState, useEffect, useRef } from "react";
import { LandingPage } from "@/components/landing-page";
import { WaitingScreen } from "@/components/waiting-screen";
import { ChatInterface } from "@/components/chat-interface";
import { Logo } from "@/components/logo";
import { db } from "@/lib/firebase";
import { collection, doc, addDoc, getDoc, updateDoc, onSnapshot, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type AppState = "landing" | "waiting" | "chatting";

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const pc = useRef<RTCPeerConnection | null>(null);
  const unsubscribeRoom = useRef<(() => void) | null>(null);
  const { toast } = useToast();

  const startChat = async () => {
    setAppState("waiting");
    if (!localStream) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setAppState("landing");
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    }
  };
  
  const endChat = async (notify = true) => {
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    setRemoteStream(null);
    
    if (unsubscribeRoom.current) {
        unsubscribeRoom.current();
        unsubscribeRoom.current = null;
    }

    if (roomId) {
      if (notify) {
         try {
            const roomRef = doc(db, 'rooms', roomId);
            const roomDoc = await getDoc(roomRef);
            if (roomDoc.exists()) {
                const callerCandidates = collection(roomRef, 'callerCandidates');
                const calleeCandidates = collection(roomRef, 'calleeCandidates');
                
                const callerSnapshot = await getDocs(callerCandidates);
                callerSnapshot.forEach(async (d) => await deleteDoc(d.ref));
                
                const calleeSnapshot = await getDocs(calleeCandidates);
                calleeSnapshot.forEach(async (d) => await deleteDoc(d.ref));

                await deleteDoc(roomRef);
            }
         } catch(e) {
            console.error("Error deleting room", e);
         }
      }
      setRoomId(null);
    }

    if (notify) {
        toast({
            title: "Chat Ended",
            description: "Searching for a new partner...",
        });
    }

    setAppState("waiting");
  };

  const cancelSearch = () => {
    if(pc.current) {
      pc.current.close();
      pc.current = null;
    }
    if (unsubscribeRoom.current) {
        unsubscribeRoom.current();
        unsubscribeRoom.current = null;
    }
    localStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setHasCameraPermission(null);
    setAppState("landing");
  };

  useEffect(() => {
    if (appState === "waiting" && localStream) {
      const setupPeerConnection = async () => {
        pc.current = new RTCPeerConnection(servers);
  
        const newRemoteStream = new MediaStream();
        pc.current.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => {
            newRemoteStream.addTrack(track);
          });
        };
        setRemoteStream(newRemoteStream);
  
        localStream.getTracks().forEach((track) => {
          pc.current!.addTrack(track, localStream);
        });
  
        const roomsCollection = collection(db, 'rooms');
        const q = query(roomsCollection, where("waiting", "==", true));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          // Create room
          const roomRef = await addDoc(roomsCollection, { waiting: true });
          setRoomId(roomRef.id);
  
          const callerCandidatesCollection = collection(roomRef, 'callerCandidates');
          pc.current.onicecandidate = (event) => {
            event.candidate && addDoc(callerCandidatesCollection, event.candidate.toJSON());
          };
  
          const offerDescription = await pc.current.createOffer();
          await pc.current.setLocalDescription(offerDescription);
          await updateDoc(roomRef, { offer: { sdp: offerDescription.sdp, type: offerDescription.type } });
  
          unsubscribeRoom.current = onSnapshot(roomRef, (snapshot) => {
            const data = snapshot.data();
            if (!pc.current?.currentRemoteDescription && data?.answer) {
              pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
              setAppState('chatting');
            }
             if (!snapshot.exists()) {
                toast({ title: 'Stranger disconnected.', description: 'Finding new partner...' });
                endChat(false);
            }
          });
  
          const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');
          onSnapshot(calleeCandidatesCollection, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                pc.current?.addIceCandidate(new RTCIceCandidate(change.doc.data()));
              }
            });
          });
  
        } else {
          // Join room
          const roomDoc = querySnapshot.docs[0];
          const roomRef = roomDoc.ref;
          setRoomId(roomRef.id);
  
          const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');
          pc.current.onicecandidate = (event) => {
            event.candidate && addDoc(calleeCandidatesCollection, event.candidate.toJSON());
          };
  
          await pc.current.setRemoteDescription(new RTCSessionDescription(roomDoc.data().offer));
          const answerDescription = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answerDescription);
          await updateDoc(roomRef, { answer: { sdp: answerDescription.sdp, type: answerDescription.type }, waiting: false });
          setAppState('chatting');
  
           unsubscribeRoom.current = onSnapshot(roomRef, (snapshot) => {
            if (!snapshot.exists()) {
                toast({ title: 'Stranger disconnected.', description: 'Finding new partner...' });
                endChat(false);
            }
          });

          const callerCandidatesCollection = collection(roomRef, 'callerCandidates');
          onSnapshot(callerCandidatesCollection, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                pc.current?.addIceCandidate(new RTCIceCandidate(change.doc.data()));
              }
            });
          });
        }
      };
  
      setupPeerConnection();
    }
  
    return () => {
      if (unsubscribeRoom.current) {
        unsubscribeRoom.current();
      }
    };
  }, [appState, localStream]);

  const renderState = () => {
    switch (appState) {
      case "waiting":
        return <WaitingScreen onCancel={cancelSearch} />;
      case "chatting":
        return <ChatInterface 
          onEndChat={endChat} 
          localStream={localStream}
          remoteStream={remoteStream}
        />;
      case "landing":
      default:
        return <>
            {hasCameraPermission === false && (
                <Alert variant="destructive" className="max-w-md mb-4">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Please allow camera access to use this feature. Refresh the page after granting permissions.
                </AlertDescription>
                </Alert>
            )}
            <LandingPage onStartChat={startChat} />
        </>;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
       <header className="absolute top-0 left-0 w-full p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary-foreground fill-primary" />
          <h1 className="text-2xl font-bold text-foreground">WhisperNet</h1>
        </div>
      </header>
      <main className="flex flex-1 w-full items-center justify-center p-4">
        {renderState()}
      </main>
    </div>
  );
}
