// Configuration & Environment Variables
import { useEffect } from 'react';
import {
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import './App.css';

// Configuration constants
const CONFIG = {
  apiKey: import.meta.env.VITE_ApiKey,
  token: import.meta.env.VITE_Token,
  userId: import.meta.env.VITE_UserId,
  callId: import.meta.env.VITE_CallId,
};

// User configuration
const USER_CONFIG = {
  id: CONFIG.userId,
  name: 'Jeevesh',
  image: 'https://getstream.io/random_svg/?id=oliver&name=Oliver',
};

// Initialize Stream client and call
const initializeStreamClient = () => {
  const client = new StreamVideoClient({ 
    apiKey: CONFIG.apiKey, 
    user: USER_CONFIG, 
    token: CONFIG.token 
  });
  return client;
};

// Video Call Layout Component
const VideoCallLayout = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return <div>Loading...</div>;
  }

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition='bottom' />
      <CallControls />
    </StreamTheme>
  );
};

// Main App Component
const App = () => {
  const client = initializeStreamClient();
  const call = client.call('default', CONFIG.callId);

  useEffect(() => {
    // Join the call when component mounts
    const joinCall = async () => {
      try {
        await call.join({ create: true });
      } catch (error) {
        console.error('Failed to join call:', error);
      }
    };

    joinCall();

    // Cleanup when component unmounts
    return () => {
      call.leave();
    };
  }, [call]);

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <VideoCallLayout />
      </StreamCall>
    </StreamVideo>
  );
};

export default App;