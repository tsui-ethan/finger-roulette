import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GameBoard } from "@/components/GameBoard";
import { GameUI } from "@/components/GameUI";
import { useAudio } from "@/lib/stores/useAudio";
import "@fontsource/inter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
  },
});

// Audio component to load sounds
const AudioLoader = () => {
  const { setHitSound, setSuccessSound } = useAudio();
  
  useEffect(() => {
    // Load hit sound
    const hitAudio = new Audio('/sounds/hit.mp3');
    hitAudio.preload = 'auto';
    hitAudio.volume = 0.3;
    setHitSound(hitAudio);
    
    // Load success sound
    const successAudio = new Audio('/sounds/success.mp3');
    successAudio.preload = 'auto';
    successAudio.volume = 0.5;
    setSuccessSound(successAudio);
    
    // Attempt to load background music but don't auto-play
    const bgMusic = new Audio('/sounds/background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.2;
    bgMusic.preload = 'auto';
    
    console.log('Audio files loaded');
  }, [setHitSound, setSuccessSound]);
  
  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-full relative font-sans antialiased">
        <AudioLoader />
        <GameBoard />
        <GameUI />
      </div>
    </QueryClientProvider>
  );
}

export default App;
