import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const aiChatRouter = Router();
const apiKey = process.env.GEMINI_API_KEY!;
const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
  model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
});

const systemPrompt = `
You are a helpful medical chatbot. 
You can provide **general health information** but do NOT diagnose, prescribe, or give personalized treatment. 
Always advise the user to consult a qualified medical professional for medical advice.
Respond politely, clearly, and with concise explanations.
If a user asks about non-medical topics, politely say: 
"I'm here to provide general medical information. For other topics, please consult an appropriate expert."
`;

aiChatRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    const chat = model.startChat({ history: [{ role: 'user', parts: [{ text: systemPrompt }] }] });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server Error' });
  }
});

export default aiChatRouter;
