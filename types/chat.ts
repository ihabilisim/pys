
import { User } from './core';

export interface ChatConversation {
    id: string;
    participant1Id: string;
    participant2Id: string;
    lastMessageAt: string;
    // Helper fields for UI (joined data)
    otherUser?: User; 
    lastMessagePreview?: string;
    unreadCount?: number;
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    isRead: boolean;
}
