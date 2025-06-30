import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface MentorData {
  name: string;
  title: string;
  description: string;
  expertise: string[];
  price: number;
  personality: string;
  communicationStyle: string;
  targetAudience: string;
  background: string;
}

const CreateMentorPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [mentorData, setMentorData] = useState<MentorData>({
    name: '',
    title: '',
    description: '',
    expertise: [],
    price: 29,
    personality: '',
    communicationStyle: '',
    targetAudience: '',
    background: ''
  });
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const questions = [
    {
      id: 'welcome',
      question: "Hi! I'm excited to help you create your AI mentor. Let's start with the basics - what would you like to name your AI mentor?",
      field: 'name',
      followUp: "Great choice! This will be the name people see when they interact with your AI mentor."
    },
    {
      id: 'title',
      question: "What's your professional title or area of expertise? For example: 'Business Strategy Expert', 'Full-Stack Developer', 'Marketing Consultant'",
      field: 'title',
      followUp: "Perfect! This helps people understand your background and credibility."
    },
    {
      id: 'background',
      question: "Tell me about your professional background and experience. What makes you qualified to mentor others in this area?",
      field: 'background',
      followUp: "Excellent background! This will help establish trust with potential mentees."
    },
    {
      id: 'expertise',
      question: "What specific skills or topics can you help people with? Please list them separated by commas (e.g., React, Node.js, System Design, Leadership)",
      field: 'expertise',
      followUp: "Great skill set! These will help people find your mentor when searching for specific expertise."
    },
    {
      id: 'target_audience',
      question: "Who is your ideal mentee? Describe the type of person who would benefit most from your guidance.",
      field: 'targetAudience',
      followUp: "Understanding your target audience will help your AI mentor provide more relevant advice."
    },
    {
      id: 'personality',
      question: "How would you describe your mentoring personality? Are you more direct and challenging, supportive and encouraging, analytical and methodical, or something else?",
      field: 'personality',
      followUp: "This personality will be reflected in how your AI mentor communicates with mentees."
    },
    {
      id: 'communication_style',
      question: "What's your preferred communication style? Do you like to use examples, ask probing questions, provide step-by-step guidance, or share stories from your experience?",
      field: 'communicationStyle',
      followUp: "This will help your AI mentor match your unique teaching approach."
    },
    {
      id: 'description',
      question: "Finally, write a compelling description of what makes your mentoring unique. What value do you bring that others might not?",
      field: 'description',
      followUp: "Perfect! This description will be what potential mentees see when they discover your AI mentor."
    },
    {
      id: 'price',
      question: "What monthly price would you like to charge for access to your AI mentor? Consider the value you provide and your target audience's budget.",
      field: 'price',
      followUp: "Great! Your AI mentor is almost ready. Let me create your personalized AI mentor now..."
    }
  ];

  // Initialize conversation
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '0',
      text: questions[0].question,
      isBot: true,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text: string, isBot: boolean = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = (callback: () => void, delay: number = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const processAnswer = (answer: string) => {
    const question = questions[currentQuestion];
    
    // Update mentor data based on current question
    if (question.field === 'expertise') {
      const expertiseArray = answer.split(',').map(skill => skill.trim()).filter(skill => skill);
      setMentorData(prev => ({ ...prev, [question.field]: expertiseArray }));
    } else if (question.field === 'price') {
      const price = parseInt(answer) || 29;
      setMentorData(prev => ({ ...prev, [question.field]: price }));
    } else {
      setMentorData(prev => ({ ...prev, [question.field]: answer }));
    }

    // Add follow-up message
    simulateTyping(() => {
      addMessage(question.followUp, true);
      
      // Move to next question or complete
      if (currentQuestion < questions.length - 1) {
        setTimeout(() => {
          const nextQuestion = questions[currentQuestion + 1];
          addMessage(nextQuestion.question, true);
          setCurrentQuestion(prev => prev + 1);
        }, 1500);
      } else {
        // Conversation complete
        setTimeout(() => {
          setIsComplete(true);
        }, 1500);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    // Add user message
    addMessage(currentInput, false);
    const answer = currentInput;
    setCurrentInput('');

    // Process the answer
    processAnswer(answer);
  };

  const createMentor = async () => {
    if (!user) {
      toast.error('You must be logged in to create a mentor');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the mentor with all collected data
      const { error } = await supabase
        .from('mentors')
        .insert({
          creator_id: user.id,
          name: mentorData.name,
          title: mentorData.title,
          description: `${mentorData.description}\n\nBackground: ${mentorData.background}\nPersonality: ${mentorData.personality}\nCommunication Style: ${mentorData.communicationStyle}\nTarget Audience: ${mentorData.targetAudience}`,
          expertise: mentorData.expertise,
          price: mentorData.price,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Your AI mentor has been created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating mentor:', error);
      toast.error('Error creating mentor');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your AI Mentor is Ready!
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Based on our conversation, I've created a personalized AI mentor that reflects your expertise and teaching style.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Mentor Summary</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900 font-medium">{mentorData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-gray-900">{mentorData.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p className="text-gray-900 font-medium">${mentorData.price}/month</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Expertise</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {mentorData.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Personality</label>
                  <p className="text-gray-900">{mentorData.personality}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Communication Style</label>
                  <p className="text-gray-900">{mentorData.communicationStyle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Target Audience</label>
                  <p className="text-gray-900">{mentorData.targetAudience}</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-gray-900 mt-1">{mentorData.description}</p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={createMentor}
              disabled={isSubmitting}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Mentor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Launch AI Mentor</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Create Your AI Mentor
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Let's have a conversation to create your personalized AI mentor. I'll ask you some questions to understand your expertise and teaching style.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-medium text-primary-600">
                {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                  message.isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'
                }`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.isBot ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    {message.isBot ? (
                      <Bot className="h-4 w-4 text-primary-600" />
                    ) : (
                      <User className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.isBot 
                      ? 'bg-gray-50 text-gray-900' 
                      : 'bg-primary-500 text-white'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="bg-gray-50 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Type your answer here..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                disabled={isTyping || isComplete}
              />
              <button
                type="submit"
                disabled={!currentInput.trim() || isTyping || isComplete}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMentorPage;