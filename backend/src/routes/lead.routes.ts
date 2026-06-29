import { Hono, Context } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import prisma from '../client.ts';
import catchAsync from '../utils/catchAsync.ts';

const leadRoutes = new Hono();

leadRoutes.get('/', authMiddleware, catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const leads = await prisma.lead.findMany({
    where: { 
      userId,
      isDeleted: false 
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return c.json({ leads });
}));

leadRoutes.post('/', authMiddleware, catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  
  const lead = await prisma.lead.create({
    data: {
      ...body,
      userId
    }
  });
  
  return c.json({ lead });
}));

export default leadRoutes;
