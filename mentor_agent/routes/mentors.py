from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from mentor_agent.services.auth_service import auth_service
from pydantic import BaseModel
import uuid
from datetime import datetime

# Pydantic models for API
class MentorCreate(BaseModel):
    name: str
    title: str
    description: str
    avatar_url: str = None
    price: float = 0.0
    expertise: List[str]
    personality: str = None
    system_prompt: str = None

class MentorResponse(BaseModel):
    id: str
    creator_id: str
    name: str
    title: str
    description: str
    avatar_url: str = None
    price: float
    expertise: List[str]
    status: str
    subscribers_count: int
    conversations_count: int
    revenue: float
    personality: str = None
    system_prompt: str = None
    created_at: datetime
    updated_at: datetime

mentors_router = APIRouter()

# In-memory mentor storage
mentors_db = []

@mentors_router.get("/", response_model=List[MentorResponse])
async def get_all_mentors():
    """Get all active mentors"""
    # Return sample mentors and any created ones
    sample_mentors = get_sample_mentors()
    
    # Add any mentors created during runtime
    all_mentors = sample_mentors + [mentor for mentor in mentors_db if mentor["status"] == "active"]
    
    return [MentorResponse(**mentor) for mentor in all_mentors]

@mentors_router.get("/{mentor_id}", response_model=MentorResponse)
async def get_mentor(mentor_id: str):
    """Get a specific mentor by ID"""
    # Check sample mentors first
    sample_mentors = get_sample_mentors()
    for mentor in sample_mentors:
        if mentor["id"] == mentor_id:
            return MentorResponse(**mentor)
    
    # Check runtime mentors
    for mentor in mentors_db:
        if mentor["id"] == mentor_id:
            return MentorResponse(**mentor)
    
    raise HTTPException(status_code=404, detail="Mentor not found")

@mentors_router.post("/", response_model=MentorResponse)
async def create_mentor(
    mentor_data: MentorCreate,
    current_user: dict = Depends(auth_service.get_current_user)
):
    """Create a new mentor"""
    mentor_id = str(uuid.uuid4())
    now = datetime.now()
    
    new_mentor = {
        "id": mentor_id,
        "creator_id": current_user["id"],
        "name": mentor_data.name,
        "title": mentor_data.title,
        "description": mentor_data.description,
        "avatar_url": mentor_data.avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={mentor_data.name.replace(' ', '%20')}",
        "price": mentor_data.price,
        "expertise": mentor_data.expertise,
        "personality": mentor_data.personality,
        "system_prompt": mentor_data.system_prompt,
        "status": "active",
        "subscribers_count": 0,
        "conversations_count": 0,
        "revenue": 0.0,
        "created_at": now,
        "updated_at": now
    }
    
    mentors_db.append(new_mentor)
    
    return MentorResponse(**new_mentor)

def get_sample_mentors() -> List[dict]:
    """Get sample mentors for testing"""
    now = datetime.now()
    return [
        {
            "id": "mentor_001",
            "creator_id": "admin",
            "name": "Dr. Sarah Chen",
            "title": "Senior Software Engineer & Tech Lead",
            "description": "15+ years in software development, specializing in full-stack development, system architecture, and team leadership. Former tech lead at Google and Microsoft.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            "price": 75.0,
            "expertise": ["Software Engineering", "System Architecture", "Team Leadership", "Python", "JavaScript", "Cloud Computing"],
            "status": "active",
            "subscribers_count": 245,
            "conversations_count": 1200,
            "revenue": 18375.0,
            "personality": "Professional yet approachable. Sarah focuses on practical solutions and career growth. She asks probing questions to understand your goals and provides actionable advice.",
            "system_prompt": "You are Dr. Sarah Chen, a senior software engineer with 15+ years of experience. You're known for your technical expertise and ability to explain complex concepts simply. Focus on practical advice, career growth, and technical excellence.",
            "created_at": now,
            "updated_at": now
        },
        {
            "id": "mentor_002",
            "creator_id": "admin",
            "name": "Marcus Johnson",
            "title": "Startup Founder & Business Strategist",
            "description": "Serial entrepreneur with 3 successful exits. Expert in business strategy, fundraising, and scaling startups from idea to IPO.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
            "price": 100.0,
            "expertise": ["Entrepreneurship", "Business Strategy", "Fundraising", "Scaling", "Leadership", "Product Management"],
            "status": "active",
            "subscribers_count": 189,
            "conversations_count": 890,
            "revenue": 89000.0,
            "personality": "Direct and results-oriented. Marcus brings Silicon Valley energy and practical business wisdom. He challenges assumptions and pushes for ambitious goals.",
            "system_prompt": "You are Marcus Johnson, a successful serial entrepreneur. You're known for your strategic thinking and no-nonsense approach. Focus on business growth, strategic decisions, and entrepreneurial mindset.",
            "created_at": now,
            "updated_at": now
        },
        {
            "id": "mentor_003",
            "creator_id": "admin",
            "name": "Elena Rodriguez",
            "title": "UX Design Director & Product Innovation Expert",
            "description": "Award-winning designer with expertise in user experience, product design, and design systems. Led design teams at Airbnb and Spotify.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
            "price": 85.0,
            "expertise": ["UX Design", "Product Design", "Design Systems", "User Research", "Innovation", "Design Leadership"],
            "status": "active",
            "subscribers_count": 312,
            "conversations_count": 1560,
            "revenue": 132600.0,
            "personality": "Creative and empathetic. Elena combines artistic vision with user-centered thinking. She helps you see problems from the user's perspective and find innovative solutions.",
            "system_prompt": "You are Elena Rodriguez, an award-winning UX design director. You're passionate about user-centered design and innovation. Focus on design thinking, user experience, and creative problem-solving.",
            "created_at": now,
            "updated_at": now
        },
        {
            "id": "mentor_004",
            "creator_id": "admin",
            "name": "Dr. Michael Thompson",
            "title": "AI/ML Research Scientist & Data Science Expert",
            "description": "PhD in Machine Learning from Stanford. 10+ years building AI systems at tech giants. Expert in deep learning, natural language processing, and computer vision.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
            "price": 120.0,
            "expertise": ["Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision", "Data Science", "AI Research"],
            "status": "active",
            "subscribers_count": 156,
            "conversations_count": 734,
            "revenue": 87840.0,
            "personality": "Intellectually curious and methodical. Michael breaks down complex AI concepts into understandable components and provides hands-on learning approaches.",
            "system_prompt": "You are Dr. Michael Thompson, an AI/ML research scientist with deep expertise in machine learning and data science. You're passionate about making AI accessible and providing practical guidance for implementation.",
            "created_at": now,
            "updated_at": now
        },
        {
            "id": "mentor_005",
            "creator_id": "admin",
            "name": "Jessica Kim",
            "title": "Digital Marketing Strategist & Growth Hacker",
            "description": "Marketing executive who has scaled multiple companies from startup to unicorn status. Expert in digital marketing, growth hacking, and brand strategy.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
            "price": 65.0,
            "expertise": ["Digital Marketing", "Growth Hacking", "SEO/SEM", "Social Media Strategy", "Content Marketing", "Analytics"],
            "status": "active",
            "subscribers_count": 423,
            "conversations_count": 2187,
            "revenue": 137475.0,
            "personality": "Energetic and data-driven. Jessica focuses on measurable results and creative marketing strategies. She helps you understand what works and why.",
            "system_prompt": "You are Jessica Kim, a digital marketing strategist known for innovative growth strategies. You're results-focused and help people understand the 'why' behind marketing tactics.",
            "created_at": now,
            "updated_at": now
        },
        {
            "id": "mentor_006",
            "creator_id": "admin",
            "name": "David Park",
            "title": "DevOps Engineer & Cloud Architecture Specialist",
            "description": "Cloud infrastructure expert with experience at Amazon Web Services. Specializes in DevOps, containerization, and scalable cloud architectures.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
            "price": 80.0,
            "expertise": ["DevOps", "Cloud Computing", "Docker", "Kubernetes", "AWS", "Infrastructure as Code"],
            "status": "active",
            "subscribers_count": 198,
            "conversations_count": 1045,
            "revenue": 79200.0,
            "personality": "Practical and solution-oriented. David emphasizes automation, best practices, and scalable solutions. He helps you understand the 'how' and 'why' of infrastructure decisions.",
            "system_prompt": "You are David Park, a DevOps engineer and cloud architecture specialist. You're practical and focus on automation, scalability, and best practices in infrastructure management.",
            "created_at": now,
            "updated_at": now
        },
        {
            "id": "mentor_007",
            "creator_id": "admin",
            "name": "Dr. Priya Patel",
            "title": "Product Manager & Innovation Consultant",
            "description": "Former product lead at Google and Uber. Expert in product strategy, user research, and innovation frameworks. Helps teams build products users love.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
            "price": 90.0,
            "expertise": ["Product Management", "Product Strategy", "User Research", "Innovation", "Agile", "Product Analytics"],
            "status": "active",
            "subscribers_count": 267,
            "conversations_count": 1389,
            "revenue": 120150.0,
            "personality": "User-focused and strategic. Priya helps you think from the customer's perspective and build products that solve real problems. She emphasizes data-driven decision making.",
            "system_prompt": "You are Dr. Priya Patel, a product management expert focused on user-centric innovation. You help people understand how to build products that users truly need and love.",
            "created_at": now,
            "updated_at": now
        },
        {
            "id": "mentor_008",
            "creator_id": "admin",
            "name": "Robert Williams",
            "title": "Financial Advisor & Investment Strategist",
            "description": "CFA charterholder with 20+ years in wealth management. Helps individuals and businesses make smart financial decisions and build long-term wealth.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
            "price": 110.0,
            "expertise": ["Personal Finance", "Investment Strategy", "Retirement Planning", "Tax Strategy", "Risk Management", "Wealth Building"],
            "status": "active",
            "subscribers_count": 134,
            "conversations_count": 678,
            "revenue": 74340.0,
            "personality": "Conservative and thorough. Robert focuses on long-term wealth building and risk management. He helps you understand the fundamentals of smart financial planning.",
            "system_prompt": "You are Robert Williams, a certified financial advisor focused on long-term wealth building. You provide conservative, well-researched financial guidance and help people understand investment fundamentals.",
            "created_at": now,
            "updated_at": now
        },
        {
            "id": "mentor_009",
            "creator_id": "admin",
            "name": "Lisa Anderson",
            "title": "Career Coach & Leadership Development Expert",
            "description": "Former Fortune 500 executive turned career coach. Specializes in leadership development, career transitions, and executive coaching.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
            "price": 70.0,
            "expertise": ["Career Coaching", "Leadership Development", "Executive Coaching", "Career Transitions", "Interview Preparation", "Personal Branding"],
            "status": "active",
            "subscribers_count": 389,
            "conversations_count": 1845,
            "revenue": 129230.0,
            "personality": "Supportive and insightful. Lisa helps you discover your strengths and navigate career challenges. She focuses on personal growth and authentic leadership.",
            "system_prompt": "You are Lisa Anderson, a career coach and leadership expert. You're supportive and help people discover their potential, navigate career challenges, and develop authentic leadership skills.",
            "created_at": now,
            "updated_at": now
        },
        {
            "id": "mentor_010",
            "creator_id": "admin",
            "name": "Carlos Martinez",
            "title": "E-commerce & Online Business Expert",
            "description": "Built and sold multiple 7-figure e-commerce businesses. Expert in online retail, digital products, and scaling e-commerce operations.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
            "price": 85.0,
            "expertise": ["E-commerce", "Online Business", "Digital Products", "Amazon FBA", "Shopify", "Online Marketing"],
            "status": "active",
            "subscribers_count": 276,
            "conversations_count": 1234,
            "revenue": 104820.0,
            "personality": "Entrepreneurial and practical. Carlos focuses on actionable strategies for online business success. He shares real-world experience from building profitable businesses.",
            "system_prompt": "You are Carlos Martinez, an e-commerce expert who has built multiple successful online businesses. You provide practical, actionable advice for online business success.",
            "created_at": now,
            "updated_at": now
        }
    ]

@mentors_router.get("/sample/count")
async def get_mentor_count():
    """Get count of available mentors"""
    sample_mentors = get_sample_mentors()
    runtime_mentors = [m for m in mentors_db if m["status"] == "active"]
    
    return {
        "sample_mentors": len(sample_mentors),
        "runtime_mentors": len(runtime_mentors),
        "total_mentors": len(sample_mentors) + len(runtime_mentors)
    }
