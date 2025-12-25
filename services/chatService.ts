
import { supabase } from './supabase';
import { ChatConversation, ChatMessage } from '../types/chat';
import { authService } from './auth';
import { logError } from './dbUtils';

const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const chatService = {
    // 1. Get or Create Conversation with a user
    async getOrCreateConversation(currentUserId: string, otherUserId: string): Promise<string | null> {
        if (!supabase) return null;

        // Validation to prevent 22P02 Postgres Error
        if (!isValidUUID(currentUserId) || !isValidUUID(otherUserId)) {
            console.warn("Chat skipped: Invalid User IDs (Non-UUID detected).");
            return null;
        }

        // Ensure distinct ID order for query consistency
        const [p1, p2] = [currentUserId, otherUserId].sort();

        try {
            // Check existing
            const { data: existing, error: fetchError } = await supabase
                .from('chat_conversations')
                .select('id')
                .eq('participant1_id', p1)
                .eq('participant2_id', p2)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = No rows found
                logError('Check existing chat', fetchError);
                // If table is missing, return null to avoid further errors
                if (fetchError.code === '42P01' || fetchError.message?.includes('Could not find the table')) return null;
            }

            if (existing) return existing.id;

            // Create new
            const { data: newConv, error: createError } = await supabase
                .from('chat_conversations')
                .insert({ participant1_id: p1, participant2_id: p2 })
                .select('id')
                .single();

            if (createError) {
                logError('Chat creation', createError);
                return null;
            }
            return newConv.id;
        } catch (e: any) {
            logError('Chat service exception', e);
            return null;
        }
    },

    // 2. Fetch User's Conversations (with last message preview)
    async fetchConversations(userId: string): Promise<ChatConversation[]> {
        if (!supabase) return [];
        if (!isValidUUID(userId)) return [];

        try {
            const { data, error } = await supabase
                .from('chat_conversations')
                .select(`
                    id, participant1_id, participant2_id, last_message_at
                `)
                .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
                .order('last_message_at', { ascending: false });

            if (error) {
                logError('Fetch conversations', error);
                return [];
            }

            if (!data) return [];

            // Enrich with User Details and Last Message
            const enriched = await Promise.all(data.map(async (conv: any) => {
                const otherId = conv.participant1_id === userId ? conv.participant2_id : conv.participant1_id;
                const otherUser = await authService.getUser(otherId);
                
                // Fetch last message content
                const { data: msg } = await supabase
                    .from('chat_messages')
                    .select('content, is_read, sender_id')
                    .eq('conversation_id', conv.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Fetch unread count
                const { count } = await supabase
                    .from('chat_messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', conv.id)
                    .eq('is_read', false)
                    .neq('sender_id', userId);

                return {
                    id: conv.id,
                    participant1Id: conv.participant1_id,
                    participant2Id: conv.participant2_id,
                    lastMessageAt: conv.last_message_at,
                    otherUser: otherUser || undefined,
                    lastMessagePreview: msg ? msg.content : '',
                    unreadCount: count || 0
                };
            }));

            return enriched;
        } catch (e: any) {
            logError('Fetch conversations exception', e);
            return [];
        }
    },

    // 3. Fetch Messages for a conversation
    async fetchMessages(conversationId: string): Promise<ChatMessage[]> {
        if (!supabase) return [];
        if (!isValidUUID(conversationId)) return [];

        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            logError('Fetch messages', error);
            return [];
        }

        return (data || []).map((m: any) => ({
            id: m.id,
            conversationId: m.conversation_id,
            senderId: m.sender_id,
            content: m.content,
            createdAt: m.created_at,
            isRead: m.is_read
        }));
    },

    // 4. Send Message AND Create Notification
    async sendMessage(conversationId: string, senderId: string, content: string): Promise<ChatMessage | null> {
        if (!supabase) return null;

        // A. Insert Message
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({ conversation_id: conversationId, sender_id: senderId, content })
            .select()
            .single();

        if (error) {
            logError('Send message', error);
            return null;
        }

        // B. Update Conversation Timestamp
        await supabase
            .from('chat_conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId);

        // C. GENERATE NOTIFICATION FOR RECIPIENT
        // 1. Find who is the other person
        const { data: conv } = await supabase
            .from('chat_conversations')
            .select('participant1_id, participant2_id')
            .eq('id', conversationId)
            .single();

        if (conv) {
            const receiverId = conv.participant1_id === senderId ? conv.participant2_id : conv.participant1_id;
            
            // 2. Insert into user_notifications
            await supabase.from('user_notifications').insert({
                user_id: receiverId,
                type: 'CHAT',
                title: 'Yeni Mesaj',
                message: content.length > 50 ? content.substring(0, 50) + '...' : content,
                link: 'chat',
                is_read: false
            });
        }

        return {
            id: data.id,
            conversationId: data.conversation_id,
            senderId: data.sender_id,
            content: data.content,
            createdAt: data.created_at,
            isRead: data.is_read
        };
    },

    // 5. Mark as Read
    async markAsRead(conversationId: string, currentUserId: string): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', currentUserId)
            .eq('is_read', false);
            
        if (error) logError('Mark read', error);
    }
};
