import { Hono, Context } from 'hono';
import { Llm, LlmProvider } from '@uptiqai/integrations-sdk';
import catchAsync from '../utils/catchAsync.ts';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import * as aiService from '../services/aiService.ts';

const aiRoutes = new Hono();

aiRoutes.post('/chat', authMiddleware, catchAsync(async (c: Context) => {
  const body = await c.req.json();
  const { messages, model } = body;

  const llm = new Llm({ provider: process.env.LLM_PROVIDER as LlmProvider });

  const result = await llm.createStream({
    messages,
    model: model || process.env.LLM_MODEL,
    options: { temperature: 0.7, maxTokens: 1000, topP: 0.9 }
  });

  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');

  return c.body(result.data);
}));

aiRoutes.post('/research-company', authMiddleware, catchAsync(async (c: Context) => {
  const body = await c.req.json();
  const { query } = body;

  const result = await aiService.researchCompany(query);
  return c.json(result);
}));

aiRoutes.post('/enhance-company', authMiddleware, catchAsync(async (c: Context) => {
  const body = await c.req.json();
  const { name, website, description } = body;

  const result = await aiService.enhanceCompanyInfo(name, website, description);
  return c.json(result);
}));

export default aiRoutes;