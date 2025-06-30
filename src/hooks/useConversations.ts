import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

type Conversation = Database['public']['Tables']['conversations']['Row'];

interface Message {
  id: string;
  sender: 'user' | 'mentor';
  content: string;
  timestamp: Date;
  type?: 'text' | 'voice' | 'video';
}

export const useConversations = (mentorId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (mentorId && user) {
      loadOrCreateConversation(mentorId);
    }
  }, [mentorId, user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          mentors (
            name,
            avatar_url,
            title
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const loadOrCreateConversation = async (mentorId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // Try to find existing conversation
      const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('mentor_id', mentorId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let conversation = existing;

      // Create new conversation if none exists
      if (!existing) {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            mentor_id: mentorId,
            messages: []
          })
          .select()
          .single();

        if (createError) throw createError;
        conversation = newConversation;
      }

      setCurrentConversation(conversation);
      setMessages(conversation?.messages || []);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Error loading conversation');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, type: 'text' | 'voice' | 'video' = 'text') => {
    if (!currentConversation || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content,
      timestamp: new Date(),
      type
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Simulate AI typing
    setIsTyping(true);

    try {
      // Update conversation in database
      const { error } = await supabase
        .from('conversations')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentConversation.id);

      if (error) throw error;

      // Simulate AI response (in production, this would call your AI service)
      setTimeout(async () => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'mentor',
          content: generateAIResponse(content),
          timestamp: new Date(),
          type: 'text'
        };

        const finalMessages = [...updatedMessages, aiResponse];
        setMessages(finalMessages);
        setIsTyping(false);

        // Update conversation with AI response
        await supabase
          .from('conversations')
          .update({
            messages: finalMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentConversation.id);

        // Update mentor conversation count
        await supabase.rpc('increment_mentor_conversations', {
          mentor_id: currentConversation.mentor_id
        });
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    // Simple AI response simulation - in production, integrate with OpenAI/Claude
    const responses = [
      "That's a great question! Based on my experience, I'd recommend focusing on these key areas...",
      "I understand your challenge. Here's how I've approached similar situations in the past...",
      "Let me share some insights that might help you with this...",
      "That's an interesting perspective. Have you considered this approach?",
      "I've seen this scenario many times. The key is to..."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    isTyping,
    sendMessage,
    loadOrCreateConversation,
    refetch: fetchConversations
  };
};