
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
/* Import useUI to access language, active tab and global chat state */
import { useUI } from '../context/UIContext';
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isThinking?: boolean;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// --- GEMINI TOOLS DEFINITION ---
const navigationTool: FunctionDeclaration = {
    name: 'navigate_ui',
    description: 'Change the visible tab or screen of the application.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            tabId: {
                type: Type.STRING,
                description: 'The ID of the tab to switch to. Options: dashboard, timeloc, layout, topo, materials, machinery, infra, pvla, drone.',
            },
        },
        required: ['tabId'],
    },
};

const locationTool: FunctionDeclaration = {
    name: 'find_location',
    description: 'Find a specific polygon point or structure on the map.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            pointName: {
                type: Type.STRING,
                description: 'The exact name of the point or structure (e.g., P-500, C1, P1000).',
            },
        },
        required: ['pointName'],
    },
};

export const ChatWidget: React.FC = () => {
  // Access global chat state from UI Context
  const { isChatOpen, toggleChat, t } = useUI();
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Speech States
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const { data, setSelectedPolyId, weather } = useData();
  const { language, setActiveTab } = useUI();

  // --- GEMINI INITIALIZATION ---
  // API Key process.env.API_KEY üzerinden gelir.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  // Set initial welcome message based on current language
  useEffect(() => {
      setMessages([
        {
          id: '1',
          text: t('chat.welcome'),
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
  }, [language, t]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        setIsSpeechSupported(true);
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.lang = language === 'en' ? 'en-US' : language === 'ro' ? 'ro-RO' : 'tr-TR';

        recognition.onstart = () => { setIsListening(true); setMicError(null); };
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
                setInput(transcript);
                setTimeout(() => { handleSend(null, transcript); }, 800);
            }
            setIsListening(false);
        };
        recognition.onerror = (event: any) => {
            setIsListening(false);
            if (event.error === 'not-allowed') setMicError('Mikrofon izni reddedildi.');
            else if (event.error === 'no-speech') setMicError('Ses algılanamadı.');
            else setMicError('Hata oluştu.');
            setTimeout(() => setMicError(null), 3000);
        };
        recognition.onend = () => { setIsListening(false); };
        recognitionRef.current = recognition;
    } else {
        setIsSpeechSupported(false);
    }
    return () => { if (recognitionRef.current) try { recognitionRef.current.abort(); } catch(e) {} };
  }, [language]);

  const toggleListening = () => {
      if (!recognitionRef.current) return;
      if (isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
      } else {
          try { recognitionRef.current.start(); setMicError(null); } 
          catch (error) { recognitionRef.current.stop(); setIsListening(false); }
      }
  };

  const handleSend = async (e: React.FormEvent | null, manualInput?: string) => {
    if (e) e.preventDefault();
    const textToSend = manualInput || input;
    if (!textToSend.trim()) return;

    // 1. Kullanıcı mesajını ekle
    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
        // 2. Proje Verilerini Özetle (Context Injection)
        const projectContext = {
            progress: data.dashboardWidgets.progress,
            hse: data.dashboardWidgets.hse,
            weather: weather,
            production: data.dashboardWidgets.production,
            machinery: data.dashboardWidgets.machinery.map(m => `${m.name[language]}: ${m.active}/${m.total}`),
            lastPvlaFiles: data.pvlaFiles.slice(0, 5).map(f => `${f.name} (${f.structureName})`),
            availablePolygonsSample: data.polygonPoints.slice(0, 10).map(p => p.polygonNo), // Sample to show format
            activeTab: window.location.hash // Simulation
        };

        const systemPrompt = `
            You are "IHA AI", a helpful, professional, and friendly construction project assistant for the Sibiu-Fagaras Motorway Project.
            
            CURRENT PROJECT DATA (Real-time):
            ${JSON.stringify(projectContext)}

            INSTRUCTIONS:
            1. Use the provided tools to navigate the UI or find locations on the map if the user asks.
            2. Answer questions about progress, safety (HSE), machinery, weather, and files based on the data above.
            3. If the user asks for a location (e.g. "Where is P-500"), use the 'find_location' tool.
            4. If the user wants to see a screen (e.g. "Go to map", "Open dashboard"), use the 'navigate_ui' tool.
            5. Keep answers concise (max 2-3 sentences).
            6. Respond in the language: ${language === 'tr' ? 'Turkish' : language === 'ro' ? 'Romanian' : 'English'}.
        `;

        // 3. Gemini'yi Çağır
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-latest',
            contents: textToSend,
            config: {
                systemInstruction: systemPrompt,
                tools: [{ functionDeclarations: [navigationTool, locationTool] }],
                temperature: 0.7,
            }
        });

        // 4. Yanıtı İşle (Tool Calls & Text)
        let responseText = response.text || '';
        const toolCalls = response.functionCalls;

        if (toolCalls && toolCalls.length > 0) {
            for (const call of toolCalls) {
                if (call.name === 'navigate_ui') {
                    const tabId = (call.args as any).tabId;
                    setActiveTab(tabId);
                    responseText = t('chat.navigating').replace('{tab}', tabId);
                } else if (call.name === 'find_location') {
                    const pointName = (call.args as any).pointName;
                    // Basit bir arama yapalım
                    const found = data.polygonPoints.find(p => p.polygonNo.toLowerCase() === pointName.toLowerCase());
                    if (found) {
                        setActiveTab('topo');
                        setSelectedPolyId(found.id);
                        responseText = t('chat.found').replace('{point}', found.polygonNo);
                    } else {
                        responseText = t('chat.notFound').replace('{point}', pointName);
                    }
                }
            }
        } else if (!responseText) {
            // Eğer tool call yoksa ve text boşsa fallback
            responseText = t('chat.fallback');
        }

        // 5. Bot Mesajını Ekle
        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: responseText,
            sender: 'bot',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);

    } catch (error) {
        console.error("Gemini Error:", error);
        const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: t('chat.error'),
            sender: 'bot',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsTyping(false);
    }
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 md:left-76 z-[60] flex flex-col items-start transition-all duration-300">
      {/* Error Toast specific to Chat */}
      {micError && (
          <div className="mb-2 bg-red-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2">
              {micError}
          </div>
      )}

      {/* Chat Window */}
      <div className="w-80 md:w-96 bg-iha-800/95 backdrop-blur-xl border border-iha-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-left-10 fade-in duration-300 ring-1 ring-white/10">
          {/* Header */}
          <div className="bg-iha-900/80 p-4 border-b border-iha-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-iha-blue to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">IHA AI <span className="text-[9px] text-blue-300 bg-blue-900/30 px-1 rounded border border-blue-500/20">GEMINI 2.5</span></h3>
                <p className="text-emerald-400 text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button onClick={toggleChat} className="text-slate-400 hover:text-white">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-iha-blue text-white rounded-br-none' 
                    : 'bg-iha-700 text-slate-200 rounded-bl-none border border-iha-600'
                }`}>
                  {msg.text}
                  <p className={`text-[9px] mt-1 opacity-60 text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-iha-700 px-4 py-3 rounded-2xl rounded-bl-none border border-iha-600 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                  <span className="ml-2 text-[10px] text-slate-400 animate-pulse">Gemini düşünüyor...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={(e) => handleSend(e)} className="p-3 bg-iha-900 border-t border-iha-700 flex gap-2 items-center">
            {/* Mic Button - Visible only if supported */}
            {isSpeechSupported && (
                <button 
                    type="button" 
                    onClick={toggleListening}
                    className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 'bg-iha-800 text-slate-400 hover:text-white hover:bg-iha-700'}`}
                    title={isListening ? "Dinlemeyi Durdur" : "Sesli Komut"}
                >
                    <span className="material-symbols-outlined text-lg">{isListening ? 'mic_off' : 'mic'}</span>
                </button>
            )}
            
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Dinleniyor..." : "AI Asistana sorun..."} 
              className="flex-1 bg-iha-800 text-white text-sm rounded-xl px-4 py-2 border border-iha-700 focus:outline-none focus:border-iha-blue focus:ring-1 focus:ring-iha-blue transition-all disabled:opacity-50"
              disabled={isListening || isTyping}
            />
            <button type="submit" disabled={(!input.trim() && !isListening) || isTyping} className="bg-iha-blue hover:bg-blue-600 text-white p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </form>
      </div>
    </div>
  );
};
