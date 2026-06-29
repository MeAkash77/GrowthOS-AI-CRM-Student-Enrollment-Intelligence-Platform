# API Specification

## Base URL
`import.meta.env.VITE_API_BASE_URL`

## Authentication
All protected routes require a Bearer token in the `Authorization` header.

### Public Routes
- `POST /auth/register` - Register a new user
  - Body: `{ email, password, name? }`
- `POST /auth/login` - Login with email and password
  - Body: `{ email, password }`
- `POST /auth/refresh` - Refresh access token
  - Body: `{ refreshToken }`
- `POST /contact` - Submit a contact form
  - Body: `{ name, email, message }`

### AI Chat
`POST /ai/chat`
- Body: `{ messages: ChatMessage[], model?: string }`
- Response: Streamed or JSON object with content

### AI Enhance Company
`POST /ai/enhance-company`
- Body: `{ name: string, website: string, description: string }`
- Response: `{ content: string }`

### AI Research Response
`POST /ai/research-company`
```json
{
  "intent": "research",
  "query": "nvidia",
  "timestamp": "2026-03-11T16:08:36.123Z",
  "company": {
    "name": "Nvidia Corporation",
    "website": "https://www.nvidia.com",
    "industry": "Semiconductors",
    "sub_industry": "Accelerated Computing",
    "market_segment": "Enterprise/Consumer",
    "business_model": "Fabless Hardware and Software",
    "hq": "Santa Clara, California, USA",
    "founded_year": "1993",
    "employee_count": 29600,
    "public_company": true,
    "description": "Nvidia is a global leader in AI computing...",
    "products": ["GPU", "CUDA", "Omniverse"],
    "use_cases": ["Gaming", "Data Centers", "Autonomous Vehicles"],
    "tech_stack": ["C++", "Python", "CUDA"],
    "customer_segments": ["Gamers", "Data Center Operators", "AI Developers"],
    "partnerships": ["Microsoft", "Google", "AWS"],
    "competitors": ["AMD", "Intel", "TPU makers"],
    "market_positioning": "Dominant leader in AI acceleration",
    "funding": null
  },
  "key_people": [
    {
      "name": "Jensen Huang",
      "role": "CEO",
      "department": "Executive",
      "email": "jensen.huang@nvidia.com",
      "phone": "+1-408-486-2000",
      "linkedin": "...",
      "influence_level": "High",
      "lead_score": 98
    }
  ],
  "potential_leads": [
    {
      "name": "Jane Smith",
      "role": "VP Data Center Sales",
      "department": "Sales",
      "email": "jane.smith@nvidia.com",
      "phone": "+1-408-486-2001",
      "reason": "Decision maker for infrastructure products",
      "lead_score": 85
    }
  ],
  "deals": [
    {
      "deal_name": "Data Center Infrastructure Renewal",
      "value": 5000000,
      "currency": "USD",
      "stage": "Negotiation",
      "probability": 75,
      "expected_close_date": "2026-06-30"
    }
  ],
  "activities": [
    {
      "type": "Meeting",
      "description": "Quarterly business review",
      "date": "2026-03-10",
      "status": "Completed"
    }
  ],
  "emails": [
    {
      "subject": "Follow up on AI infrastructure proposal",
      "sender": "outreach@greencrm.com",
      "recipient": "jensen.huang@nvidia.com",
      "date": "2026-03-11",
      "sentiment": "Positive"
    }
  ],
  "call_logs": [
    {
      "duration": "15m",
      "outcome": "Interested",
      "summary": "Discussed GPU allocation for next quarter",
      "date": "2026-03-09"
    }
  ],
  "lead_discovery": {
    "target_roles": ["VP Sales Operations", "Head of Revenue Operations", "CIO"],
    "estimated_buying_team_size": 5,
    "recommended_departments": ["Sales", "Revenue Operations", "IT"]
  },
  "sales_insights": {
    "pain_points": ["Supply chain constraints", "Energy efficiency"],
    "opportunities": ["Growth in generative AI", "Automotive expansion"],
    "value_proposition": "Highest performance per watt for AI training",
    "suggested_pitch": "Leverage Nvidia's full-stack AI platform..."
  },
  "market_analysis": {
    "industry": "Semiconductors",
    "market_trends": ["AI boom", "Custom silicon", "Geopolitical risk"],
    "opportunities": ["Edge computing", "Digital twins"],
    "competitor_landscape": ["Intense competition from AMD and custom TPUs"]
  },
  "outreach_strategy": {
    "target_roles": ["CTO", "CIO", "Director of AI Ops"],
    "channels": ["LinkedIn", "Direct Email", "Conferences"],
    "messaging_angles": ["AI efficiency", "Future-proof hardware"]
  },
  "analytics": {
    "growth_rate": "126% YoY",
    "market_share": "80% in AI Accelerators",
    "revenue_estimate": "$60B+",
    "hiring_trends": "Aggressive hiring in R&D"
  },
  "data_sources": ["Nvidia IR", "Crunchbase", "Wikipedia"]
}
```

## Response Formats

### Success
```json
{
  "user": { "id": "uuid", "email": "user@example.com", "name": "John Doe" },
  "accessToken": "jwt_token",
  "refreshToken": "jwt_token"
}
```

### Error
```json
{
  "message": "Error message",
  "status": 400
}
```