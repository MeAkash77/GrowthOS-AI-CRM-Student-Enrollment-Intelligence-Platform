import ApiError from '../utils/ApiError.ts';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const API_KEY = process.env.UPTIQ_API_KEY;
const API_SECRET = process.env.UPTIQ_API_SECRET;
const AGENT_ID = process.env.UPTIQ_AGENT_ID;
const AGENT_URL = `${process.env.UPTIQ_API_BASE_URL}/v1/agents/${AGENT_ID}/execute`;

export const executeAgent = async (query: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 seconds timeout

  try {
    const response = await fetch(AGENT_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY!,
        'X-API-Secret': API_SECRET!,
      },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || 'Failed to execute AI agent');
    }

    const data = await response.json();

    if (data.content && typeof data.content === 'string') {
      try {
        data.data = JSON.parse(data.content);
      } catch (e) {
        console.error('Failed to parse agent content as JSON:', e);
      }
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, error instanceof Error ? error.message : 'Internal Server Error');
  }
};

export const researchCompany = async (query: string) => {
  const systemPrompt = `You are an AI research agent for a CRM system.

Your job is to research a company from a simple user query and return structured CRM intelligence. Go very deep in your research to provide the most accurate and detailed information possible.

IMPORTANT RULES:

1. Output MUST be valid JSON.
2. Do NOT include explanations or markdown.
3. If a field cannot be found, use null or an empty array.
4. Facilitate realistic emails and phone numbers. If exact ones are not found, use highly probable formats based on the company's domain (e.g., first.last@company.com) and regional phone patterns. Avoid vague placeholders.
5. Only include data that is publicly discoverable or highly probable based on industry standards.
6. All JSON keys must remain exactly as defined in the schema.
7. employee_count MUST be an integer (number), not a string.
8. For public companies, funding should be null and public_company should be set to true.
9. Populate EVERY field in the JSON schema with deep, research-backed data. If data is unavailable, use realistic simulated data that fits the company context (especially for deals, activities, emails, and call logs).

Steps you must follow:

1. Extract the company name and intent from the query.
2. Research the company deeply:
- industry, products, market position, competitors, funding, leadership.
3. Identify potential decision makers and sales leads with realistic contact info.
4. Generate deep sales insights, outreach strategy, and comprehensive CRM data (deals, activities, emails, call logs, etc.).
5. Populate the JSON schema below accurately and thoroughly.

Return ONLY the JSON object.

JSON SCHEMA:
{
  "metadata": {
    "intent": "",
    "query": "",
    "timestamp": "",
    "generated_by": "ai_research_agent",
    "data_sources": []
  },
  "account": {
    "account_id": "",
    "name": "",
    "website": "",
    "industry": "",
    "sub_industry": "",
    "market_segment": "",
    "business_model": "",
    "hq": "",
    "founded_year": "",
    "employee_count": 0,
    "public_company": false,
    "description": "",
    "market_positioning": ""
  },
  "products": [],
  "use_cases": [],
  "tech_stack": [],
  "customer_segments": [],
  "partnerships": [],
  "competitors": [],
  "funding": {
    "total_raised": "",
    "last_round": "",
    "investors": []
  },
  "contacts": [
    {
      "contact_id": "",
      "name": "",
      "role": "",
      "department": "",
      "linkedin": "",
      "email": null,
      "phone": null,
      "contact_type": "decision_maker",
      "influence_level": "",
      "lead_score": 0
    }
  ],
  "leads": [
    {
      "lead_id": "",
      "target_role": "",
      "department": "",
      "priority": "",
      "reason": "",
      "recommended_contact_strategy": ""
    }
  ],
  "deals": [
    {
      "deal_id": "",
      "account_id": "",
      "deal_name": "",
      "stage": "prospecting",
      "value_estimate": null,
      "probability": 0,
      "owner": "",
      "associated_contacts": [],
      "created_at": ""
    }
  ],
  "activities": [
    {
      "activity_id": "",
      "type": "research",
      "lead": "",
      "sales_rep": "",
      "timestamp": "",
      "outcome": "",
      "notes": ""
    }
  ],
  "interaction_history": [
    {
      "interaction_id": "",
      "contact": "",
      "channel": "",
      "timestamp": "",
      "summary": "",
      "sentiment": ""
    }
  ],
  "call_logs": [
    {
      "call_id": "",
      "contact": "",
      "duration_seconds": 0,
      "timestamp": "",
      "outcome": "",
      "notes": ""
    }
  ],
  "emails": [
    {
      "email_id": "",
      "contact": "",
      "subject": "",
      "timestamp": "",
      "direction": "outbound",
      "summary": ""
    }
  ],
  "sales_insights": {
    "pain_points": [],
    "opportunities": [],
    "value_proposition": "",
    "suggested_pitch": ""
  },
  "market_analysis": {
    "industry": "",
    "market_trends": [],
    "opportunities": [],
    "competitor_landscape": []
  },
  "outreach_strategy": {
    "target_roles": [],
    "channels": [],
    "messaging_angles": []
  },
  "lead_discovery": {
    "target_roles": [],
    "estimated_buying_team_size": 0,
    "recommended_departments": []
  },
  "ai_summary": {
    "account_value": "",
    "deal_potential": "",
    "best_entry_point": "",
    "recommended_next_step": ""
  }
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content || '{}';

    try {
      return JSON.parse(content);
    } catch {
      return {
        error: 'Model returned invalid JSON',
        raw: content,
      };
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, error instanceof Error ? error.message : 'Failed to generate structured company data');
  }
};

export const enhanceCompanyInfo = async (name: string, website: string, description: string) => {
  const prompt = `You are a high-end corporate researcher. Enhance the following company profile using your knowledge and web search capabilities.
    
    Company Name: ${name}
    Website: ${website}
    Current Description: ${description}
    
    Provide an enhanced, professional, and detailed company description (approx 3-4 sentences). 
    Focus on their value proposition, industry impact, and core market positioning.
    Return ONLY the enhanced description text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional business analyst specializing in company research.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    return { content: completion.choices[0].message.content || '' };
  } catch (error) {
    throw new ApiError(500, error instanceof Error ? error.message : 'Failed to enhance company info');
  }
};