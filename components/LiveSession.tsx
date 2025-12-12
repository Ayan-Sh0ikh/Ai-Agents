import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, PhoneOff, Activity } from 'lucide-react';

interface LiveSessionProps {
  onClose: () => void;
}

// Audio Utils for PCM conversion
function createBlob(data: Float32Array): { data: string; mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    return {
        data: base64,
        mimeType: 'audio/pcm;rate=16000',
    };
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

const LiveSession: React.FC<LiveSessionProps> = ({ onClose }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [status, setStatus] = useState('Connecting...');
    const [volume, setVolume] = useState(0);

    const inputContextRef = useRef<AudioContext | null>(null);
    const outputContextRef = useRef<AudioContext | null>(null);
    const sessionRef = useRef<any>(null); // Store active session
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        const startSession = async () => {
            if (!process.env.API_KEY) {
                setStatus('Error: Missing API Key');
                return;
            }

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                // Initialize Audio Contexts
                inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

                // Microphone Stream
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;

                if (!mountedRef.current) return;

                // Connect to Gemini Live
                // We await the connection here to catch immediate Network Errors
                const session = await ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    callbacks: {
                        onopen: () => {
                            if (!mountedRef.current) return;
                            setStatus('Connected');
                            
                            // Setup Audio Input Processing
                            if (inputContextRef.current && streamRef.current) {
                                const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
                                const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
                                processorRef.current = processor;
                                
                                processor.onaudioprocess = (e) => {
                                    if (isMuted || !sessionRef.current) return; // Only send if session is ready
                                    
                                    const inputData = e.inputBuffer.getChannelData(0);
                                    
                                    // Visualizer calculation (RMS)
                                    let sum = 0;
                                    for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                                    const rms = Math.sqrt(sum / inputData.length);
                                    setVolume(Math.min(100, rms * 500));

                                    const pcmBlob = createBlob(inputData);
                                    // Send directly using the ref
                                    sessionRef.current.sendRealtimeInput({ media: pcmBlob });
                                };
                                
                                source.connect(processor);
                                processor.connect(inputContextRef.current.destination);
                            }
                        },
                        onmessage: async (message: LiveServerMessage) => {
                            if (!mountedRef.current) return;

                            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                            if (base64Audio && outputContextRef.current) {
                                const ctx = outputContextRef.current;
                                const audioBuffer = await decodeAudioData(
                                    decode(base64Audio),
                                    ctx,
                                    24000,
                                    1
                                );
                                
                                const source = ctx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(ctx.destination);
                                
                                // Schedule
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                
                                sourcesRef.current.add(source);
                                source.onended = () => sourcesRef.current.delete(source);
                            }

                            const interrupted = message.serverContent?.interrupted;
                            if (interrupted) {
                                sourcesRef.current.forEach(s => s.stop());
                                sourcesRef.current.clear();
                                nextStartTimeRef.current = 0;
                            }
                        },
                        onclose: () => {
                            if (mountedRef.current) setStatus('Disconnected');
                        },
                        onerror: (err) => {
                            console.error("Gemini Live Error:", err);
                            if (mountedRef.current) setStatus('Connection Error');
                        }
                    },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: {
                            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
                        },
                        systemInstruction: "You are C5 NextGen-AI, a helpful and knowledgeable research assistant. Keep your answers concise and conversational."
                    }
                });

                // Store session in ref
                sessionRef.current = session;

            } catch (err) {
                console.error("Failed to start live session", err);
                if (mountedRef.current) setStatus('Network Error');
            }
        };

        startSession();

        return () => {
            mountedRef.current = false;
            
            // Cleanup Session
            if (sessionRef.current) {
                // There isn't a synchronous close method exposed easily on the session object in all SDK versions,
                // but usually the stream stopping handles it. 
                // If the SDK supports it: sessionRef.current.close();
            }

            // Cleanup Audio
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            if (processorRef.current) processorRef.current.disconnect();
            if (inputContextRef.current) inputContextRef.current.close();
            if (outputContextRef.current) outputContextRef.current.close();
            
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
        };
    }, []); 

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Visualizer Circle */}
            <div className="relative mb-12">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[60px] animate-pulse" />
                <div 
                    className="w-48 h-48 rounded-full border-2 border-zinc-800 bg-zinc-900 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.1)] transition-all duration-100 ease-out"
                    style={{ 
                        transform: `scale(${1 + volume/200})`,
                        borderColor: status === 'Connected' ? '#10b981' : 
                                     status === 'Network Error' ? '#ef4444' : '#27272a'
                    }}
                >
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                         <span className="font-bold text-2xl text-zinc-200">C5</span>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-zinc-100 mb-2">C5 Live</h2>
            <p className={`text-sm mb-12 ${status === 'Network Error' ? 'text-red-500 font-bold' : 'text-zinc-500 animate-pulse'}`}>
                {status}
            </p>

            <div className="flex items-center gap-6">
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-5 rounded-full transition-all ${isMuted ? 'bg-zinc-800 text-red-500' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}`}
                >
                    {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>

                <button 
                    onClick={onClose}
                    className="p-5 rounded-full bg-red-500/90 hover:bg-red-600 text-white shadow-lg shadow-red-900/40 transition-all transform hover:scale-105"
                >
                    <PhoneOff className="w-7 h-7" />
                </button>
            </div>
            
            <p className="mt-8 text-xs text-zinc-600">Voice: Fenrir (Male)</p>
        </div>
    );
};

export default LiveSession;