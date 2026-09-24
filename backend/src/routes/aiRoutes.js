import express from 'express';
import { generateProductContent, chatAssistant } from '../services/aiService.js';
import { handleAICopilot } from '../controllers/apiController.js';

const router = express.Router();

router.post('/generate-listing', async (req, res) => {
  try {
    const aiContent = await generateProductContent(req.body.productDetails);
    res.json(aiContent);
  } catch (error) {
    res.status(500).json({ message: 'AI Generation Failed' });
  }
});

router.post('/copilot', handleAICopilot);

export default router;

