// Fallback mentors for demonstration when database is empty
export const sampleMentors = [
  {
    id: 'sample-1',
    name: 'AI Business Coach',
    title: 'Entrepreneurship & Strategy Expert',
    description: 'I help entrepreneurs build successful businesses with proven strategies and insights from 10+ years of experience in scaling startups and Fortune 500 companies.',
    price: 49,
    expertise: ['Business Strategy', 'Entrepreneurship', 'Marketing', 'Fundraising', 'Leadership'],
    status: 'active',
    subscribers_count: 1247,
    avatar_url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
  },
  {
    id: 'sample-2',
    name: 'Code Mentor Pro',
    title: 'Senior Software Engineer',
    description: 'Learn modern web development, best practices, and career advancement tips from a seasoned developer with experience at Google, Meta, and leading startups.',
    price: 39,
    expertise: ['JavaScript', 'React', 'Node.js', 'Career Development', 'System Design'],
    status: 'active',
    subscribers_count: 892,
    avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
  },
  {
    id: 'sample-3',
    name: 'Fitness Guru AI',
    title: 'Personal Trainer & Nutritionist',
    description: 'Transform your body and mind with personalized fitness plans and nutrition guidance. Certified trainer with 8+ years helping people achieve their health goals.',
    price: 29,
    expertise: ['Fitness', 'Nutrition', 'Weight Loss', 'Muscle Building', 'Mental Health'],
    status: 'active',
    subscribers_count: 2156,
    avatar_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
  },
  {
    id: 'sample-4',
    name: 'Creative Director AI',
    title: 'Design & Brand Strategy Expert',
    description: 'Elevate your creative projects and build powerful brands. Former creative director at top agencies, now helping individuals and businesses tell their visual story.',
    price: 35,
    expertise: ['Graphic Design', 'Branding', 'UI/UX', 'Creative Strategy', 'Adobe Creative Suite'],
    status: 'active',
    subscribers_count: 654,
    avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
  },
  {
    id: 'sample-5',
    name: 'Career Coach Pro',
    title: 'Executive Career Strategist',
    description: 'Navigate your career path with confidence. Former HR executive and career coach helping professionals land dream jobs and negotiate better compensation.',
    price: 45,
    expertise: ['Career Development', 'Interview Preparation', 'Salary Negotiation', 'LinkedIn Optimization', 'Leadership'],
    status: 'active',
    subscribers_count: 1083,
    avatar_url: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
  },
  {
    id: 'sample-6',
    name: 'Financial Advisor AI',
    title: 'Investment & Wealth Building Expert',
    description: 'Build long-term wealth with smart investment strategies. Former Wall Street analyst now helping individuals achieve financial independence through proven methods.',
    price: 55,
    expertise: ['Investing', 'Personal Finance', 'Retirement Planning', 'Crypto', 'Real Estate'],
    status: 'active',
    subscribers_count: 1876,
    avatar_url: 'https://images.pexels.com/photos/936126/pexels-photo-936126.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop'
  }
];

export const getMentorsWithFallback = (databaseMentors: any[]) => {
  // If database has mentors, use them, otherwise use sample mentors
  return databaseMentors.length > 0 ? databaseMentors : sampleMentors;
};
