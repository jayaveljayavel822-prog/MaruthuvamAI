import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Mic, MicOff, Volume2, VolumeX, Plus, Trash2, Loader2, Sparkles } from 'lucide-react';
import {
  getConversationsApi,
  createConversationApi,
  getConversationApi,
  sendMessageApi,
  deleteConversationApi,
} from '../../api/chat';
import { useLanguage } from '../../context/LanguageContext';

export default function ChatWindow() {
  const { language } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'Explain my medical report in simple language',
    'Help me organize my health records',
    'Summarize my recent wellness trends',
    'What questions should I ask my doctor?',
    'Explain hypertension in Tamil / Tanglish',
  ];

  const fetchConversations = async () => {
    try {
      const list = await getConversationsApi();
      setConversations(list);
      if (list.length > 0 && !activeConvId) {
        setActiveConvId(list[0].id);
        setMessages(list[0].messages || []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      getConversationApi(activeConvId)
        .then((c) => setMessages(c.messages || []))
        .catch(() => {});
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.slice(0, 300));
      const speechLang = { English: 'en-IN', Tamil: 'ta-IN', Tanglish: 'ta-IN', Hindi: 'hi-IN', Telugu: 'te-IN' }[language] || 'en-IN';
      u.lang = speechLang;
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await createConversationApi('Health Consultation');
      setConversations([newConv, ...conversations]);
      setActiveConvId(newConv.id);
      setMessages(newConv.messages || []);
    } catch (err) {}
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      await deleteConversationApi(convId);
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);
      if (activeConvId === convId) {
        if (remaining.length > 0) {
          setActiveConvId(remaining[0].id);
        } else {
          setActiveConvId(null);
          setMessages([]);
        }
      }
    } catch (err) {}
  };

  const handleSend = async (textToSend = null) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    let convId = activeConvId;

    if (!convId) {
      const newConv = await createConversationApi(text.slice(0, 30));
      setConversations([newConv, ...conversations]);
      convId = newConv.id;
      setActiveConvId(newConv.id);
    }

    const optimisticUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setLoading(true);

    try {
      const asstReply = await sendMessageApi(convId, text, language);
      setMessages((prev) => [...prev, asstReply]);
      speak(asstReply.content);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Unable to reach the copilot service right now. Please try again.',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = { English: 'en-IN', Tamil: 'ta-IN', Tanglish: 'ta-IN', Hindi: 'hi-IN', Telugu: 'te-IN' }[language] || 'en-IN';
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

  return (
    <div className="glass-card overflow-hidden grid grid-cols-1 md:grid-cols-4 h-[650px] border border-pink-100 shadow-xl">
      {/* Sidebar: Conversation Threads */}
      <div className="hidden md:flex flex-col border-r border-pink-100 bg-pink-50/30 p-4">
        <button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all mb-4"
        >
          <Plus className="w-4 h-4" />
          <span>New Consultation</span>
        </button>

        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">History</h4>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveConvId(c.id)}
              className={`p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                activeConvId === c.id
                  ? 'bg-white text-pink-700 shadow-sm border border-pink-200'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
            >
              <span className="truncate max-w-[140px]">{c.title}</span>
              <button
                onClick={(e) => handleDeleteConversation(c.id, e)}
                className="text-slate-400 hover:text-rose-600 p-1"
                title="Delete thread"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="md:col-span-3 flex flex-col h-full bg-white/70">
        {/* Top Chat Bar */}
        <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-white/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-pink-100 text-pink-600 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Maruthuvam AI Copilot</h3>
              <p className="text-[11px] text-slate-400">Context-Aware Clinical Guidance & Records Organizer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-full border text-xs flex items-center gap-1.5 transition-colors ${
                voiceEnabled ? 'border-pink-200 bg-pink-50 text-pink-600' : 'border-slate-200 text-slate-400'
              }`}
              title={voiceEnabled ? 'Mute Speech' : 'Enable Speech Output'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Message Transcript */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <Sparkles className="w-8 h-8 text-pink-300" />
              <p className="text-xs max-w-sm">
                Ask about your prescriptions, explain laboratory values, or prepare questions for your doctor.
              </p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={m.id || i}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-4 rounded-3xl max-w-[85%] text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-tr-none shadow-sm'
                      : m.is_emergency
                      ? 'bg-rose-50 text-rose-900 border-2 border-rose-300 rounded-tl-none font-bold shadow-md'
                      : 'bg-white text-slate-700 border border-pink-100 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="p-3 bg-white border border-pink-100 rounded-3xl rounded-tl-none shadow-sm inline-block text-xs text-slate-400">
              Copilot is analyzing your health context...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="px-4 py-2 border-t border-pink-50 bg-white/50 flex flex-wrap gap-1.5 overflow-x-auto">
          {suggestedPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-[11px] bg-pink-50 hover:bg-pink-100 text-pink-700 font-medium px-3 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Controls */}
        <div className="p-4 bg-white border-t border-pink-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your health question (e.g. headache since morning, explain blood sugar)..."
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-pink-400 focus:ring-1 focus:ring-pink-400 rounded-full px-5 py-3 text-xs outline-none"
          />
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full transition-colors ${
              isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Dictate via microphone"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 text-white shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
