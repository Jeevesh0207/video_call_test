import { useEffect, useState } from "react";
import {
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "./App.css";

const CONFIG = {
  apiKey: import.meta.env.VITE_ApiKey,
  token: import.meta.env.VITE_Token,
  userId: import.meta.env.VITE_UserId,
};

const VideoCallLayout = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return <div className="loading-state">Loading...</div>;
  }

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="bottom" />
      <CallControls />
    </StreamTheme>
  );
};

const App = () => {
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState("");
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);

  useEffect(() => {
    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [client]);

  const handleJoinRoom = async () => {
    if (!userName.trim() || !roomId.trim()) {
      setError("Please enter both your name and room ID");
      return;
    }

    try {
      if (client) {
        await client.disconnectUser();
      }

      const newClient = new StreamVideoClient({
        apiKey: CONFIG.apiKey,
        user: {
          id: CONFIG.userId,
          name: userName.trim(),
          image: "https://getstream.io/random_svg/?id=oliver&name=Oliver",
        },
        token: CONFIG.token,
      });

      setClient(newClient);
      const newCall = newClient.call("default", roomId.trim());
      setCall(newCall);
      setIsJoining(false);
      setError("");
    } catch (error) {
      console.error("Error creating call:", error);
      setError("Failed to create room. Please try again.");
    }
  };

  useEffect(() => {
    if (!isJoining && call && client) {
      const joinCall = async () => {
        try {
          setError("");
          await call.join({ create: true });
        } catch (error) {
          console.error("Failed to join call:", error);
          setError("Failed to join the room. Please try again.");
          setIsJoining(true);

          if (client) {
            await client.disconnectUser();
            setClient(null);
          }
          setCall(null);
        }
      };

      joinCall();

      return () => {
        if (call) {
          call.leave();
        }
      };
    }
  }, [call, client, isJoining]);


  if (isJoining) {
    return (
      <div className="join-form">
        <h2>Join Video Call</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
          <button
            onClick={handleJoinRoom}
            disabled={!userName.trim() || !roomId.trim()}
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  if (!call || !client) {
    return <div className="loading-state">Initializing call...</div>;
  }

  return (
    <div className="video-call-container">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <VideoCallLayout />
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

export default App;
