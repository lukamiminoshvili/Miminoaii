import React, { useState, useEffect, useRef } from 'react';
import { Chat } from "@google/genai";
import { startChatSession, handleMiminoMultimodalChat } from '../services/geminiService';
import { FileData } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | null;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Gamarjoba! I am Mimino. I can chat, generate photos, edit images, and even create videos! Just ask or upload a file.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<FileData | null>(null);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initSession();
  }, []);

  const initSession = () => {
    try {
      chatSessionRef.current = startChatSession();
    } catch (e) {
      console.error("Failed to start chat session", e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({
          file,
          previewUrl: URL.createObjectURL(file),
          base64: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachment) || !chatSessionRef.current || loading) return;

    const userMessage: Message = { 
      role: 'user', 
      text: input.trim(),
      mediaUrl: attachment?.previewUrl,
      mediaType: attachment ? 'image' : null
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const currentAttachment = attachment;
    setAttachment(null); // Clear attachment immediately
    setLoading(true);

    try {
      const result = await handleMiminoMultimodalChat(
        chatSessionRef.current,
        userMessage.text || (currentAttachment ? "What do you think of this?" : ""), // Default prompt if only image sent
        currentAttachment
      );

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: result.text || "", 
        mediaUrl: result.mediaUrl,
        mediaType: result.mediaType
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error processing your request." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([{ role: 'model', text: 'Fresh start! Send me a photo to edit, ask for a new image, or let\'s just talk!' }]);
    setAttachment(null);
    initSession();
  };

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Social Profile Card (Mimino's Profile) */}
      <div className="lg:col-span-1 bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden flex flex-col h-fit">
         {/* Cover Photo */}
         <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600 relative"></div>
         
         <div className="px-6 pb-6 -mt-10 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full border-4 border-gray-800 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-4xl text-white shadow-lg mb-3">
              M
            </div>
            
            <h2 className="text-2xl font-bold text-white">Mimino</h2>
            <p className="text-blue-400 font-medium text-sm mb-4">@mimino_ai_friend</p>
            
            {/* Bio */}
            <div className="bg-gray-900/50 rounded-xl p-4 w-full mb-4 border border-gray-700/50">
               <p className="text-gray-300 text-sm leading-relaxed text-left">
                 🚀 <b>Capabilities:</b><br/>
                 📸 Generate & Edit Photos<br/>
                 🎥 Create Animations (Veo)<br/>
                 💬 Chat in English/Georgian<br/>
                 🧠 Knows Everything
               </p>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mb-4">
               <div className="bg-gray-700/30 rounded-lg p-2">
                  <span className="block text-lg font-bold text-white">∞</span>
                  <span className="text-xs text-gray-400">Creativity</span>
               </div>
               <div className="bg-gray-700/30 rounded-lg p-2">
                  <span className="block text-lg font-bold text-green-400">24/7</span>
                  <span className="text-xs text-gray-400">Online</span>
               </div>
            </div>
         </div>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-2 flex flex-col h-[650px] bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden relative">
        {/* Header */}
        <div className="bg-gray-800/80 border-b border-gray-700 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white shadow-lg relative">
              M
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
            </div>
            <div>
               <h2 className="font-semibold text-white leading-tight">Mimino</h2>
               <p className="text-xs text-gray-400">Multimedia AI</p>
            </div>
          </div>
          <button 
            onClick={handleNewChat}
            className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            New Chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                 <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 select-none">M</div>
              )}
              
              <div className={`flex flex-col gap-2 max-w-[85%] sm:max-w-[75%]`}>
                {/* Text Bubble */}
                {msg.text && (
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none ml-auto' 
                      : 'bg-gray-700 text-gray-100 rounded-tl-none border border-gray-600'
                  }`}>
                    {msg.text}
                  </div>
                )}

                {/* Media Attachment (User uploaded or AI Generated) */}
                {msg.mediaUrl && (
                   <div className={`overflow-hidden rounded-xl border border-gray-700/50 shadow-lg ${msg.role === 'user' ? 'ml-auto' : ''}`}>
                      {msg.mediaType === 'video' ? (
                        <div className="relative">
                          <video src={msg.mediaUrl} controls className="max-w-full max-h-64 object-contain bg-black" />
                          <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">VIDEO</div>
                        </div>
                      ) : (
                        <div className="relative">
                          <img src={msg.mediaUrl} alt="attachment" className="max-w-full max-h-64 object-contain bg-black/20" />
                          {msg.role === 'model' && (
                             <a href={msg.mediaUrl} download="mimino_generated.png" className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-lg backdrop-blur-sm transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                             </a>
                          )}
                        </div>
                      )}
                   </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
               <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1">M</div>
               <div className="bg-gray-700 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-600 flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachment Preview Area */}
        {attachment && (
           <div className="px-4 py-2 bg-gray-900/80 border-t border-gray-700 flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-600">
                 <img src={attachment.previewUrl} className="w-full h-full object-cover" alt="preview" />
                 <button 
                    onClick={() => setAttachment(null)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-red-500/50 transition-colors"
                 >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <span className="text-xs text-gray-400">Image attached. Add a prompt to edit or animate it.</span>
           </div>
        )}

        {/* Input */}
        <div className="p-4 bg-gray-900/50 border-t border-gray-700">
          <form onSubmit={handleSend} className="relative flex gap-2">
            <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handleFileSelect} 
            />
            
            <button
               type="button"
               onClick={() => fileInputRef.current?.click()}
               className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full w-12 h-12 flex items-center justify-center transition-all border border-gray-600"
               title="Attach Photo"
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={attachment ? "Describe how to edit or animate this..." : "Message Mimino..."}
              className="flex-1 bg-gray-950/50 border border-gray-700 rounded-full px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              disabled={loading}
            />
            
            <button
              type="submit"
              disabled={(!input.trim() && !attachment) || loading}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};