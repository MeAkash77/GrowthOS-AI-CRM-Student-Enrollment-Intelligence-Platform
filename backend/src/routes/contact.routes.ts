import { Hono } from 'hono';
import * as contactController from '../controllers/contactController.ts';

const contactRoutes = new Hono();

contactRoutes.post('/', contactController.submitContact);

export default contactRoutes;
