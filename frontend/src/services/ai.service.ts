import { api } from '@/lib/api';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const aiService = {
    parseStreamData: (data: any): any => {
        if (typeof data !== 'string') {
            return data;
        }

        // If it's a raw JSON string that looks like our suspect object, return it as a string
        if (data.startsWith('{') && data.includes('"name"') && data.includes('"description"')) {
            try {
                const parsed = JSON.parse(data);
                if (parsed.description) return parsed.description;
                if (parsed.content) return parsed.content;
                return data; // Return original string if we can't find a better field
            } catch (e) {
                // Not valid JSON or other error, continue
            }
        }

        // If it doesn't look like streaming data, return as is
        if (!data.includes('data: ') && !data.includes('"delta":')) {
            return data;
        }

        let reconstructedText = '';

        // Standard SSE format data: data: {"type": "text-delta", "delta": "..."}
        // Splitting by 'data:' and filtering out metadata
        const lines = data.split('\n');
        
        for (const line of lines) {
            let content = line.trim();
            if (content.startsWith('data: ')) {
                content = content.substring(6).trim();
            }
            
            if (!content || content === '[DONE]') continue;

            try {
                // If it's a JSON object, parse it
                if (content.startsWith('{')) {
                    const parsed = JSON.parse(content);
                    if (parsed.type === 'text-delta' && parsed.delta) {
                        reconstructedText += parsed.delta;
                    } else if (parsed.choices?.[0]?.delta?.content) {
                        reconstructedText += parsed.choices[0].delta.content;
                    } else if (parsed.delta) {
                        reconstructedText += parsed.delta;
                    } else if (parsed.content && typeof parsed.content === 'string') {
                        reconstructedText += parsed.content;
                    }
                }
            } catch (e) {
                // Not JSON, skip
            }
        }

        // Fallback: If we got nothing but the string definitely has deltas, use regex
        if (!reconstructedText.trim()) {
            const deltaRegex = /"delta"\s*:\s*"((?:\\.|[^"\\])*)"/g;
            let match;
            while ((match = deltaRegex.exec(data)) !== null) {
                try {
                    const unescaped = JSON.parse(`"${match[1]}"`);
                    reconstructedText += unescaped;
                } catch {
                    reconstructedText += match[1];
                }
            }
        }

        const result = reconstructedText.trim();
        return result || data;
    },

    chat: async (messages: ChatMessage[]) => {
        // If mock mode is enabled, simulate a response
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: 'This is a mock response from GreenCRM AI.'
            };
        }

        try {
            const response = await api.post('/ai/chat', { messages });
            const data = aiService.parseStreamData(response.data);

            if (typeof data === 'string') {
                return {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: data
                };
            }
            return data;
        } catch (error) {
            console.error('AI chat failed:', error);
            throw error;
        }
    },

    researchCompany: async (query: string) => {
        const timestamp = new Date().toISOString();

        // If mock mode is enabled, simulate a response
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return {
                metadata: {
                    intent: 'research_company',
                    query: query,
                    timestamp: timestamp,
                    generated_by: 'ai_research_agent',
                    data_sources: ['Crunchbase', 'Company Website', 'LinkedIn']
                },
                account: {
                    account_id: 'ACC-9921',
                    name: query.charAt(0).toUpperCase() + query.slice(1).split(' ')[0],
                    website: `https://${query.toLowerCase().replace(/\s+/g, '')}.com`,
                    industry: 'Technology',
                    sub_industry: 'Software',
                    market_segment: 'Enterprise',
                    business_model: 'SaaS',
                    hq: 'San Francisco, CA',
                    founded_year: '2015',
                    employee_count: 5000,
                    public_company: false,
                    description: `${query} is a leading technology company specializing in innovative software solutions for modern businesses. They have been at the forefront of digital transformation for over a decade.`,
                    market_positioning: 'Market leader in enterprise software'
                },
                products: ['Platform X', 'Service Y', 'Tool Z'],
                use_cases: ['Digital Transformation', 'Business Automation'],
                tech_stack: ['TypeScript', 'React', 'Node.js', 'Python'],
                customer_segments: ['Enterprise', 'Mid-market'],
                partnerships: ['AWS', 'Google Cloud', 'Microsoft'],
                competitors: ['Competitor A', 'Competitor B'],
                funding: {
                    total_raised: '$500M',
                    last_round: 'Series D',
                    investors: ['Venture Partners', 'Global Capital']
                },
                deals: [
                    {
                        deal_id: 'DEAL-001',
                        deal_name: 'Enterprise License Expansion',
                        stage: 'Negotiation',
                        value_estimate: 500000,
                        probability: 75
                    },
                    {
                        deal_id: 'DEAL-002',
                        deal_name: 'Professional Services Wrap',
                        stage: 'Discovery',
                        value_estimate: 150000,
                        probability: 35
                    },
                    {
                        deal_id: 'DEAL-003',
                        deal_name: 'Regional Office Pilot',
                        stage: 'Proposal',
                        value_estimate: 80000,
                        probability: 55
                    }
                ],
                leads: [
                    {
                        lead_id: 'LEAD-001',
                        target_role: 'Director of IT',
                        priority: 'High',
                        reason: 'Expanding cloud infrastructure needs'
                    },
                    {
                        lead_id: 'LEAD-002',
                        target_role: 'Operations Manager',
                        priority: 'Medium',
                        reason: 'Looking for efficiency tools'
                    },
                    {
                        lead_id: 'LEAD-003',
                        target_role: 'VP Engineering',
                        priority: 'High',
                        reason: 'Budget allocated for AI tools'
                    }
                ],
                interaction_history: [
                    { interaction_id: 'INT-001', channel: 'LinkedIn', timestamp: new Date().toISOString() },
                    { interaction_id: 'INT-002', channel: 'Email', timestamp: new Date().toISOString() }
                ],
                emails: [
                    {
                        email_id: 'EML-001',
                        subject: 'Next Steps: Enterprise License',
                        direction: 'INBOUND',
                        timestamp: new Date().toISOString(),
                        summary: 'Customer interested in proceeding with the expansion pilot.'
                    },
                    {
                        email_id: 'EML-002',
                        subject: 'Follow up on demo',
                        direction: 'OUTBOUND',
                        timestamp: new Date().toISOString(),
                        summary: 'Sent technical documentation and pricing sheet.'
                    }
                ],
                call_logs: [
                    {
                        call_id: 'CAL-001',
                        contact: 'John Doe',
                        outcome: 'Interested',
                        duration_seconds: 450,
                        notes: 'Discussed integration requirements.',
                        timestamp: new Date().toISOString()
                    }
                ],
                ai_summary: {
                    account_value: '$1.2M',
                    deal_potential: '$730K',
                    recommended_next_step: 'Schedule a technical deep dive with the CTO and Director of IT.'
                },
                lead_discovery: {
                    estimated_buying_team_size: 8
                },
                market_analysis: {
                    market_trends: [
                        'Shift towards decentralized infrastructure',
                        'Increased focus on data sovereignty'
                    ],
                    competitor_landscape: ['Competitor A', 'Competitor B', 'Competitor C']
                },
                contacts: [
                    {
                        contact_id: 'CON-001',
                        name: 'John Doe',
                        role: 'CEO',
                        department: 'Executive',
                        linkedin: 'linkedin.com/in/johndoe',
                        email: 'john@company.com',
                        phone: '+1-555-0123',
                        contact_type: 'decision_maker',
                        influence_level: 'High',
                        lead_score: 95
                    },
                    {
                        contact_id: 'CON-002',
                        name: 'Jane Smith',
                        role: 'CTO',
                        department: 'Engineering',
                        linkedin: 'linkedin.com/in/janesmith',
                        email: 'jane@company.com',
                        phone: '+1-555-0124',
                        contact_type: 'decision_maker',
                        influence_level: 'High',
                        lead_score: 92
                    }
                ],
                sales_insights: {
                    pain_points: ['Legacy systems migration', 'Data security concerns'],
                    opportunities: ['Expansion into European market', 'New AI-driven features'],
                    value_proposition: 'Streamline operations with cutting-edge AI technology',
                    suggested_pitch: `I noticed ${query} is expanding its AI capabilities. Our solutions can help accelerate this growth by 30% while reducing costs.`
                }
            };
        }

        try {
            const response = await api.post('/ai/research-company', { query });
            const result = response.data;

            // If the entire result is a stream string, parse it
            if (typeof result === 'string' && (result.includes('data: ') || result.includes('"delta":'))) {
                try {
                    const parsedStr = aiService.parseStreamData(result);
                    const parsed = JSON.parse(parsedStr);
                    if (parsed.metadata) parsed.metadata.timestamp = timestamp;
                    return parsed;
                } catch (e) {
                    // If it's not JSON after parsing stream, it might be just text
                    // or it might be partial JSON. We try to return what we can.
                    return result;
                }
            }

            if (result.account?.description) {
                result.account.description = aiService.parseStreamData(result.account.description);
            }

            if (result.metadata) {
                result.metadata.timestamp = timestamp;
            }
            return result;
        } catch (error) {
            console.error('Research company failed:', error);
            throw error;
        }
    },

    enhanceCompanyInfo: async (name: string, website: string, description: string) => {
        if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return `${name} is a globally recognized leader in its sector, known for driving innovation at the intersection of technology and business strategy. With their platform accessible at ${website}, they have redefined how enterprises approach digital transformation, offering unparalleled efficiency and scalable solutions. Their market positioning is strengthened by a commitment to excellence and a forward-thinking product roadmap that addresses the complex needs of modern global markets.`;
        }

        try {
            const response = await api.post('/ai/enhance-company', {
                name,
                website,
                description
            });

            const data = response.data;
            let result = data;
            if (data?.content) result = data.content;

            // Safety: if the result is still an object, try to extract description or stringify
            if (typeof result === 'object' && result !== null) {
                return result.description || result.content || result.name || JSON.stringify(result);
            }

            return result || description;
        } catch (error) {
            console.error('Error enhancing company info:', error);
            return description;
        }
    }
};
