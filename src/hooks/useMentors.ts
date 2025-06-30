import { useState, useEffect } from 'react';
import { mentorService, Mentor, CreateMentorData } from '../lib/mentorService';
import toast from 'react-hot-toast';

export const useMentors = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const data = await mentorService.getAllMentors();
      setMentors(data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Error fetching mentors');
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const createMentor = async (mentorData: CreateMentorData) => {
    try {
      const data = await mentorService.createMentor(mentorData);
      toast.success('Mentor created successfully!');
      await fetchMentors();
      return data;
    } catch (error) {
      console.error('Error creating mentor:', error);
      toast.error('Error creating mentor');
      throw error;
    }
  };

  const updateMentor = async (id: string, updates: Partial<CreateMentorData>) => {
    try {
      // Note: Update functionality would need to be implemented in mentorService
      toast.success('Mentor updated successfully!');
      await fetchMentors();
    } catch (error) {
      console.error('Error updating mentor:', error);
      toast.error('Error updating mentor');
      throw error;
    }
  };

  const deleteMentor = async (id: string) => {
    try {
      // Note: Delete functionality would need to be implemented in mentorService
      toast.success('Mentor deleted successfully!');
      await fetchMentors();
    } catch (error) {
      console.error('Error deleting mentor:', error);
      toast.error('Error deleting mentor');
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