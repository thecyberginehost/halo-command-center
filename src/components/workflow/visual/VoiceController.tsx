import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceControllerProps {
  onModeToggle: () => void;
  onCanvasCommand: (command: string) => void;
}

export function VoiceController({ onModeToggle, onCanvasCommand }: VoiceControllerProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: "Voice Control Active",
          description: "Listening for commands...",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            setTranscript(transcript);
          }
        }

        if (finalTranscript) {
          processVoiceCommand(finalTranscript.toLowerCase().trim());
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Control Error",
          description: "Speech recognition failed. Please try again.",
          variant: "destructive"
        });
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const processVoiceCommand = (command: string) => {
    console.log('Voice command:', command);
    
    // Canvas navigation commands
    if (command.includes('zoom in')) {
      onCanvasCommand('zoom-in');
      speak('Zooming in');
    } else if (command.includes('zoom out')) {
      onCanvasCommand('zoom-out');
      speak('Zooming out');
    } else if (command.includes('fit view') || command.includes('fit to screen')) {
      onCanvasCommand('fit-view');
      speak('Fitting view to screen');
    }
    
    // Organization commands
    else if (command.includes('arrange') || command.includes('organize')) {
      onCanvasCommand('arrange');
      speak('Arranging workflow cards');
    } else if (command.includes('save')) {
      onCanvasCommand('save');
      speak('Saving workflow');
    } else if (command.includes('execute') || command.includes('run')) {
      onCanvasCommand('execute');
      speak('Executing workflow');
    }
    
    // Mode switching
    else if (command.includes('toggle mode') || command.includes('switch mode')) {
      onModeToggle();
      speak('Switching workflow mode');
    } else if (command.includes('developer mode') || command.includes('code mode')) {
      onModeToggle();
      speak('Switching to developer mode');
    } else if (command.includes('visual mode') || command.includes('design mode')) {
      onModeToggle();
      speak('Switching to visual mode');
    }
    
    // Help command
    else if (command.includes('help') || command.includes('commands')) {
      speak('Available commands: arrange, save, execute, zoom in, zoom out, fit view, toggle mode, and help');
    }
    
    // Unknown command
    else {
      speak('Command not recognized. Say help for available commands.');
    }
    
    setTranscript('');
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={toggleListening}
        variant={isListening ? "default" : "outline"}
        size="sm"
        className={`
          backdrop-blur-md transition-all duration-200
          ${isListening 
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 animate-pulse' 
            : 'bg-background/80 hover:bg-background/90'
          }
        `}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {isListening && (
        <Badge 
          variant="outline" 
          className="backdrop-blur-md bg-background/80 text-xs animate-fade-in"
        >
          {transcript || 'Listening...'}
        </Badge>
      )}

      {!isListening && (
        <Badge 
          variant="outline" 
          className="backdrop-blur-md bg-background/80 text-xs cursor-help"
          title="Click the microphone to start voice control"
        >
          <Volume2 className="h-3 w-3 mr-1" />
          Voice Control
        </Badge>
      )}
    </div>
  );
}

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}