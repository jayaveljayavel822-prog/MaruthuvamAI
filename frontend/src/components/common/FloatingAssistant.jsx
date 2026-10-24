import React, { useState, useEffect, useRef } from 'react';
import { Bot, Volume2, VolumeX, Mic, MicOff, Send, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { createConversationApi, sendMessageApi } from '../../api/chat';

export default function FloatingAssistant() {
  const { isAuthenticated, user } = useAuth();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your Maruthuvam Voice Assistant. How can I assist your health journey today?',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const chips = [
    'Explain my reports',
    'Log water and sleep',
    'Check symptom urgency',
    'What questions should I ask my doctor?',
  ];

  useEffect(() => {
    if (isOpen && !conversationId && isAuthenticated) {
      createConversationApi('Floating Assistant Consultation')
        .then((c) => setConversationId(c.id))
        .catch(() => {});
    }
  }, [isOpen, conversationId, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const handleSend = async (textToSend = null) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      let convId = conversationId;
      if (!convId) {
        const c = await createConversationApi('Assistant Session');
        convId = c.id;
        setConversationId(c.id);
      }

      const reply = await sendMessageApi(convId, text, language);
      const asstMsg = { role: 'assistant', content: reply.content };
      setMessages((prev) => [...prev, asstMsg]);
      speak(reply.content);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I could not connect right now. Please try again or check connection.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all animate-bounce"
          title="Open AI Health Copilot Assistant"
        >
          <Bot className="w-7 h-7" />
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-pink-100 flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <div>
                <h4 className="font-bold text-sm">Maruthuvam Voice Assistant</h4>
                <p className="text-[10px] text-pink-100">Live Clinical Copilot</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                }}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-pink-50/40 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-auto bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-tr-none'
                    : 'bg-white text-slate-700 shadow-sm border border-pink-100 rounded-tl-none'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="p-3 bg-white text-slate-400 text-xs rounded-2xl rounded-tl-none shadow-sm inline-block">
                Copilot is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips */}
          <div className="px-3 py-2 bg-white flex flex-wrap gap-1.5 border-t border-pink-50">
            {chips.map((c, i) => (
              <button
                key={i}
                onClick={() => handleSend(c)}
                className="text-[11px] bg-pink-50 hover:bg-pink-100 text-pink-700 font-medium px-2.5 py-1 rounded-full transition-colors"
              >
                {c}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-pink-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything or use mic..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-pink-400 focus:ring-1 focus:ring-pink-400 rounded-full px-4 py-2 text-xs outline-none"
            />
            <button
              onClick={toggleMic}
              className={`p-2 rounded-full transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Speak via Microphone"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleSend()}
              disabled={loading}
              className="p-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
