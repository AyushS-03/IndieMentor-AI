import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import toast from 'react-hot-toast';

type Mentor = Database['public']['Tables']['mentors']['Row'];

export const useMentors = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('mentors')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mentors:', error);
        toast.error(`Error fetching mentors: ${error.message}`);
        setMentors([]);
        return;
      }

      setMentors(data || []);
    } catch (error) {
      console.error('Unexpected error in fetchMentors:', error);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const createMentor = async (mentorData: Database['public']['Tables']['mentors']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('mentors')
        .insert(mentorData)
        .select()
        .single();

      if (error) {
        toast.error('Error creating mentor');
        throw error;
      }

      toast.success('Mentor created successfully!');
      await fetchMentors();
      return data;
    } catch (error) {
      console.error('Error creating mentor:', error);
      throw error;
    }
  };

  const updateMentor = async (id: string, updates: Database['public']['Tables']['mentors']['Update']) => {
    try {
      const { error } = await supabase
        .from('mentors')
        .update(updates)
        .eq('id', id);

      if (error) {
        toast.error('Error updating mentor');
        throw error;
      }

      toast.success('Mentor updated successfully!');
      await fetchMentors();
    } catch (error) {
      console.error('Error updating mentor:', error);
      throw error;
    }
  };

  const deleteMentor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mentors')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Error deleting mentor');
        throw error;
      }

      toast.success('Mentor deleted successfully!');
      await fetchMentors();
    } catch (error) {
      console.error('Error deleting mentor:', error);
      throw error;
    }
  };

  return {
    mentors,
    loading,
    createMentor,
    updateMentor,
    deleteMentor,
    refetch: fetchMentors
  };
};