from fastapi import APIRouter, HTTPException, Depends
from mentor_agent.services.auth_service import auth_service
from pydantic import BaseModel
import os

chat_router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    mentor_id: str = None

class ChatResponse(BaseModel):
    response: str
    mentor_name: str = None

@chat_router.post("/send", response_model=ChatResponse)
async def send_message(
    chat_data: ChatMessage,
    current_user: dict = Depends(auth_service.get_current_user)
):
    """Send a message to a mentor and get AI response"""
    try:
        # Check if Groq API key is available
        groq_api_key = os.getenv("GROQ_API_KEY")
        
        # Get mentor info (use default if not specified)
        mentor_name = "Dr. Sarah Chen"
        system_prompt = "You are Dr. Sarah Chen, a senior software engineer with 15+ years of experience. You're known for your technical expertise and ability to explain complex concepts simply. Focus on practical advice, career growth, and technical excellence."
        
        if chat_data.mentor_id:
            # In a real implementation, we'd fetch the mentor from database
            mentor_mapping = {
                "mentor_001": {
                    "name": "Dr. Sarah Chen",
                    "prompt": "You are Dr. Sarah Chen, a senior software engineer with 15+ years of experience. You're known for your technical expertise and ability to explain complex concepts simply. Focus on practical advice, career growth, and technical excellence."
                },
                "mentor_002": {
                    "name": "Marcus Johnson", 
                    "prompt": "You are Marcus Johnson, a successful serial entrepreneur. You're known for your strategic thinking and no-nonsense approach. Focus on business growth, strategic decisions, and entrepreneurial mindset."
                },
                "mentor_003": {
                    "name": "Elena Rodriguez",
                    "prompt": "You are Elena Rodriguez, an award-winning UX design director. You're passionate about user-centered design and innovation. Focus on design thinking, user experience, and creative problem-solving."
                },
                "mentor_004": {
                    "name": "Dr. Michael Thompson",
                    "prompt": "You are Dr. Michael Thompson, an AI/ML research scientist with deep expertise in machine learning and data science. You're passionate about making AI accessible and providing practical guidance for implementation."
                },
                "mentor_005": {
                    "name": "Jessica Kim",
                    "prompt": "You are Jessica Kim, a digital marketing strategist known for innovative growth strategies. You're results-focused and help people understand the 'why' behind marketing tactics."
                },
                "mentor_006": {
                    "name": "David Park",
                    "prompt": "You are David Park, a DevOps engineer and cloud architecture specialist. You're practical and focus on automation, scalability, and best practices in infrastructure management."
                },
                "mentor_007": {
                    "name": "Dr. Priya Patel",
                    "prompt": "You are Dr. Priya Patel, a product management expert focused on user-centric innovation. You help people understand how to build products that users truly need and love."
                },
                "mentor_008": {
                    "name": "Robert Williams",
                    "prompt": "You are Robert Williams, a certified financial advisor focused on long-term wealth building. You provide conservative, well-researched financial guidance and help people understand investment fundamentals."
                },
                "mentor_009": {
                    "name": "Lisa Anderson",
                    "prompt": "You are Lisa Anderson, a career coach and leadership expert. You're supportive and help people discover their potential, navigate career challenges, and develop authentic leadership skills."
                },
                "mentor_010": {
                    "name": "Carlos Martinez",
                    "prompt": "You are Carlos Martinez, an e-commerce expert who has built multiple successful online businesses. You provide practical, actionable advice for online business success."
                }
            }
            
            mentor_info = mentor_mapping.get(chat_data.mentor_id)
            if mentor_info:
                mentor_name = mentor_info["name"]
                system_prompt = mentor_info["prompt"]

        # Use Groq API if available
        if groq_api_key:
            try:
                from groq import Groq
                groq_client = Groq(api_key=groq_api_key)
                
                chat_completion = groq_client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": system_prompt
                        },
                        {
                            "role": "user",
                            "content": f"Hello! I'm {current_user['name']}. {chat_data.message}"
                        }
                    ],
                    model="llama3-8b-8192",
                    temperature=0.7,
                    max_tokens=1000
                )
                
                response_content = chat_completion.choices[0].message.content
                
                return ChatResponse(
                    response=response_content,
                    mentor_name=mentor_name
                )
            except Exception as groq_error:
                print(f"Groq API error: {groq_error}")
                # Fall through to mock response
        
        # Fallback mock response
        mock_responses = {
            "mentor_001": f"Hello {current_user['name']}! As a senior software engineer, I appreciate your question: '{chat_data.message}'. Let me share some insights based on my 15+ years in the industry. First, it's important to understand that software engineering is not just about writing code - it's about solving problems efficiently and building systems that scale. What specific aspect of your development journey would you like to focus on?",
            "mentor_002": f"Great to meet you, {current_user['name']}! Your message '{chat_data.message}' reminds me of the challenges I faced when building my first startup. In the entrepreneurial world, every problem is an opportunity in disguise. The key is to think strategically and act decisively. What's your current business challenge, and how can we turn it into your competitive advantage?",
            "mentor_003": f"Hi {current_user['name']}! I love your question: '{chat_data.message}'. As a UX designer, I always start by understanding the user's perspective. Design is not just about making things look beautiful - it's about creating meaningful experiences that solve real problems. Let's dive into how we can approach this from a user-centered design perspective. What problem are you trying to solve for your users?"
        }
        
        default_response = f"Hello {current_user['name']}! Thank you for your message: '{chat_data.message}'. I'm {mentor_name}, and I'm here to help guide you on your journey. Based on my experience, I believe the key to success is continuous learning and applying practical wisdom to real-world challenges. How can I help you grow today?"
        
        response_content = mock_responses.get(chat_data.mentor_id, default_response)
        
        return ChatResponse(
            response=response_content,
            mentor_name=mentor_name
        )
        
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process chat message")

@chat_router.get("/mentors")
async def get_available_mentors():
    """Get list of available mentors for chat"""
    return [
        {
            "id": "mentor_001",
            "name": "Dr. Sarah Chen",
            "title": "Senior Software Engineer & Tech Lead",
            "expertise": ["Software Engineering", "System Architecture", "Team Leadership"]
        },
        {
            "id": "mentor_002", 
            "name": "Marcus Johnson",
            "title": "Startup Founder & Business Strategist",
            "expertise": ["Entrepreneurship", "Business Strategy", "Fundraising"]
        },
        {
            "id": "mentor_003",
            "name": "Elena Rodriguez", 
            "title": "UX Design Director & Product Innovation Expert",
            "expertise": ["UX Design", "Product Design", "Design Systems"]
        }
    ]
