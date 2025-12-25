
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useData } from '../../context/DataContext';
import { ChatConversation, ChatMessage, User } from '../../types';
import { apiService } from '../../services/api';
import { supabase } from '../../services/supabase';

export const ChatContent: React.FC = () => {
    const { currentUser } = useAuth();
    const { data } = useData(); // to get user list for new chat
    const { t } = useUI();
    
    // States
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [isLoadingConvs, setIsLoadingConvs] = useState(false);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [searchUser, setSearchUser] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        if(currentUser) {
            loadConversations();
        }
    }, [currentUser]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Real-time Subscription for MESSAGES (Active Chat)
    useEffect(() => {
        if (!activeConvId || !supabase) return;

        // Load initial messages
        apiService.fetchMessages(activeConvId).then(msgs => {
            console.log(`[Chat] Loaded ${msgs.length} messages`);
            setMessages(msgs);
        });
        
        // Mark as read
        if(currentUser) apiService.markAsRead(activeConvId, currentUser.id);

        console.log(`[Chat] Subscribing to chat:${activeConvId}`);
        const channel = supabase
            .channel(`chat:${activeConvId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${activeConvId}` }, (payload) => {
                const newMsg = payload.new as any;
                console.log('[Chat] Realtime msg received:', newMsg);
                
                // Optimistic Deduplication: Check if we already have this ID
                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) {
                        console.log('[Chat] Duplicate msg skipped (already in state)');
                        return prev;
                    }
                    return [...prev, {
                        id: newMsg.id,
                        conversationId: newMsg.conversation_id,
                        senderId: newMsg.sender_id,
                        content: newMsg.content,
                        createdAt: newMsg.created_at,
                        isRead: newMsg.is_read
                    }];
                });

                // If it's not my message, mark read
                if(currentUser && newMsg.sender_id !== currentUser.id) {
                    apiService.markAsRead(activeConvId, currentUser.id);
                }
            })
            .subscribe((status) => {
                console.log(`[Chat] Subscription status: ${status}`);
                if (status === 'CHANNEL_ERROR') {
                    console.error('[Chat] Channel Error! Check console for Supabase errors.');
                }
            });

        return () => { supabase.removeChannel(channel); };
    }, [activeConvId, currentUser]);

    // Real-time Subscription for CONVERSATIONS List (New messages elsewhere)
    useEffect(() => {
        if (!currentUser || !supabase) return;

        const channel = supabase
            .channel('chat_list_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => {
                loadConversations(); // Reload list on any change
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => {
                loadConversations(); // Reload list to update preview/unread
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [currentUser]);

    const loadConversations = async () => {
        if(!currentUser) return;
        setIsLoadingConvs(true);
        const convs = await apiService.fetchConversations(currentUser.id);
        setConversations(convs);
        setIsLoadingConvs(false);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!activeConvId || !currentUser || !messageInput.trim()) return;
        
        const content = messageInput.trim();
        setMessageInput(''); // Clear Input

        // 1. Optimistic Update (Show immediately)
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: ChatMessage = {
            id: tempId,
            conversationId: activeConvId,
            senderId: currentUser.id,
            content: content,
            createdAt: new Date().toISOString(),
            isRead: false
        };
        setMessages(prev => [...prev, optimisticMsg]);

        // 2. Send to Backend
        try {
            console.log('[Chat] Sending message...', content);
            const sentMsg = await apiService.sendMessage(activeConvId, currentUser.id, content);
            
            if (sentMsg) {
                console.log('[Chat] Message sent success, replacing temp ID');
                setMessages(prev => {
                    // Check if realtime already added the real message
                    if (prev.some(m => m.id === sentMsg.id)) {
                        return prev.filter(m => m.id !== tempId);
                    }
                    // Replace temp with real
                    return prev.map(m => m.id === tempId ? sentMsg : m);
                });
            } else {
                throw new Error("Send failed");
            }
        } catch (error) {
            console.error('[Chat] Send Error:', error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert("Mesaj gönderilemedi. Bağlantınızı kontrol edin.");
        }
    };

    const startNewChat = async (targetUser: User) => {
        if(!currentUser) return;
        const convId = await apiService.getOrCreateConversation(currentUser.id, targetUser.id);
        if(convId) {
            setActiveConvId(convId);
            setIsNewChatModalOpen(false);
            loadConversations();
        }
    };

    const activeConversation = conversations.find(c => c.id === activeConvId);
    
    // Filter users list: exclude self
    const filteredUsers = data.users.filter(u => u.id !== currentUser?.id && u.fullName.toLowerCase().includes(searchUser.toLowerCase()));

    // Suggested users (max 5) for empty state
    const suggestedUsers = data.users.filter(u => u.id !== currentUser?.id).slice(0, 5);

    if (!currentUser) return <div className="p-8 text-center text-slate-500">Lütfen giriş yapın.</div>;

    return (
        <div className="flex h-[calc(100vh-140px)] bg-iha-800 rounded-2xl border border-iha-700 overflow-hidden shadow-2xl animate-in fade-in">
            {/* Custom Animation Style for the Grid */}
            <style>{`
                @keyframes grid-flow {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 50px; }
                }
            `}</style>
            
            {/* LEFT SIDEBAR: LIST */}
            <div className={`w-full md:w-80 border-r border-iha-700 flex flex-col bg-iha-900/50 ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-iha-700 flex justify-between items-center">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">forum</span> Mesajlar
                    </h3>
                    <button onClick={() => setIsNewChatModalOpen(true)} className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-colors shadow-lg">
                        <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isLoadingConvs ? (
                        <div className="p-4 text-center text-slate-500 text-xs">Yükleniyor...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-6 flex flex-col gap-4">
                            <div className="text-center text-slate-500 text-xs italic">
                                <span className="material-symbols-outlined text-3xl opacity-30 mb-2">chat_bubble_outline</span>
                                <p>Henüz mesajlaşma geçmişiniz yok.</p>
                                <p className="opacity-70 mt-1">Hızlıca sohbete başlamak için bir kişi seçin:</p>
                            </div>
                            <div className="space-y-2">
                                {suggestedUsers.map(u => (
                                    <div key={u.id} onClick={() => startNewChat(u)} className="flex items-center gap-3 p-3 bg-iha-800 rounded-xl cursor-pointer hover:bg-iha-700 transition-colors border border-iha-700 group">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs group-hover:bg-blue-600 transition-colors">
                                            {u.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">{u.fullName}</p>
                                            <p className="text-[10px] text-slate-500">{u.jobTitle || 'Personel'}</p>
                                        </div>
                                    </div>
                                ))}
                                {suggestedUsers.length === 0 && (
                                    <p className="text-center text-xs text-red-400">Sistemde başka kullanıcı bulunamadı.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div 
                                key={conv.id} 
                                onClick={() => setActiveConvId(conv.id)}
                                className={`p-4 border-b border-iha-700/50 cursor-pointer hover:bg-white/5 transition-colors group ${activeConvId === conv.id ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        {conv.otherUser?.avatarUrl ? (
                                            <img src={conv.otherUser.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold text-sm">
                                                {conv.otherUser?.fullName.charAt(0)}
                                            </div>
                                        )}
                                        {/* Online status indicator placeholder */}
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-iha-900"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h4 className={`text-sm font-bold truncate ${activeConvId === conv.id ? 'text-blue-400' : 'text-white'}`}>{conv.otherUser?.fullName || 'Bilinmeyen'}</h4>
                                            {conv.unreadCount! > 0 && (
                                                <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{conv.unreadCount}</span>
                                            )}
                                        </div>
                                        <p className={`text-xs truncate ${conv.unreadCount! > 0 ? 'text-white font-bold' : 'text-slate-500'}`}>
                                            {conv.lastMessagePreview || 'Mesaj yok'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT SIDEBAR: CHAT AREA */}
            <div className={`flex-1 flex flex-col bg-[#020617] relative ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
                {activeConvId && activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 border-b border-iha-700 flex items-center justify-between px-6 bg-iha-900/80 backdrop-blur-md z-20 relative">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setActiveConvId(null)} className="md:hidden text-slate-400 hover:text-white mr-2">
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                                    {activeConversation.otherUser?.fullName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{activeConversation.otherUser?.fullName}</h3>
                                    <p className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Çevrimiçi</p>
                                </div>
                            </div>
                            <button className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">more_vert</span></button>
                        </div>

                        {/* Messages Area - SPACE GRID SIMULATION */}
                        <div className="flex-1 relative overflow-hidden bg-[#020617]">
                            
                            {/* 1. The Space Grid Background (Perspective & Animated) */}
                            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none perspective-[500px]">
                                 <div className="absolute inset-0" 
                                      style={{
                                          backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.4) 1px, transparent 1px)',
                                          backgroundSize: '50px 50px',
                                          // 3D Transform to create the "Twin" floor effect
                                          transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px) scale(3)', 
                                          height: '200%',
                                          width: '100%',
                                          animation: 'grid-flow 20s linear infinite'
                                      }} 
                                 />
                            </div>
                            
                            {/* 2. Stars / Particles Texture */}
                            <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse pointer-events-none mix-blend-screen"></div>

                            {/* 3. Vignette Overlay (Focus & Depth) */}
                            <div className="absolute inset-0 z-0 bg-radial-gradient from-transparent via-[#020617]/40 to-[#020617] pointer-events-none"></div>

                            {/* 4. Scrollable Content (Z-10) */}
                            <div className="absolute inset-0 overflow-y-auto p-4 space-y-3 custom-scrollbar z-10 scroll-smooth">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === currentUser.id;
                                    const isTemp = msg.id.startsWith('temp-');
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-md relative group backdrop-blur-sm border ${isMe ? 'bg-blue-600/90 text-white rounded-br-none border-blue-500' : 'bg-iha-800/80 text-slate-200 rounded-bl-none border-iha-700'}`}>
                                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                <div className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    {isMe && (
                                                        <span className="material-symbols-outlined text-[10px] transition-all">
                                                            {isTemp ? 'schedule' : msg.isRead ? 'done_all' : 'check'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-iha-900/90 backdrop-blur border-t border-iha-700 flex gap-2 items-center z-20 relative">
                            <button type="button" className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-iha-800 transition-colors">
                                <span className="material-symbols-outlined">attach_file</span>
                            </button>
                            <input 
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                className="flex-1 bg-iha-800 text-white rounded-xl px-4 py-3 border border-iha-700 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Mesajınızı yazın..."
                            />
                            <button type="submit" disabled={!messageInput.trim()} className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:scale-100">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 relative bg-[#020617] overflow-hidden">
                        {/* Empty State Grid Animation */}
                        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                             <div className="absolute inset-0" 
                                  style={{
                                      backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.4) 1px, transparent 1px)',
                                      backgroundSize: '50px 50px',
                                      transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px) scale(3)', 
                                      height: '200%',
                                      width: '100%',
                                      animation: 'grid-flow 20s linear infinite'
                                  }} 
                             />
                        </div>
                        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#020617]/60 to-[#020617] pointer-events-none"></div>
                        
                        <div className="z-10 flex flex-col items-center opacity-60">
                            <span className="material-symbols-outlined text-7xl mb-4 text-blue-500/50">forum</span>
                            <p className="text-sm font-bold text-blue-200/50 uppercase tracking-widest">Sistem Hazır</p>
                            <p className="text-xs mt-2">Sol menüden bir sohbet seçiniz.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* NEW CHAT MODAL */}
            {isNewChatModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-iha-800 w-full max-w-md rounded-2xl border border-iha-700 shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-iha-700 flex justify-between items-center">
                            <h3 className="font-bold text-white">Yeni Sohbet Başlat</h3>
                            <button onClick={() => setIsNewChatModalOpen(false)} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-4">
                            <input 
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                                placeholder="Kullanıcı ara..." 
                                className="w-full bg-iha-900 border border-iha-700 rounded-xl px-4 py-2 text-white mb-4 focus:border-blue-500 outline-none"
                            />
                            <div className="space-y-2 overflow-y-auto max-h-60 custom-scrollbar">
                                {filteredUsers.map(u => (
                                    <div key={u.id} onClick={() => startNewChat(u)} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-iha-700">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                                            {u.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{u.fullName}</p>
                                            <p className="text-xs text-slate-500">{u.jobTitle || 'Ünvan yok'}</p>
                                        </div>
                                    </div>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <div className="text-center text-slate-500 text-xs py-4 flex flex-col gap-2">
                                        <p>Kullanıcı bulunamadı.</p>
                                        <p className="opacity-60 text-[10px]">Sohbet başlatmak için sistemde başka kullanıcılar olmalıdır.</p>
                                        {currentUser.role === 'admin' && (
                                            <p className="text-blue-400">Admin panelinden kullanıcı ekleyebilirsiniz.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
