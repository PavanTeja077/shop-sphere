import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client (Needs GEMINI_API_KEY in .env)
const ai = new GoogleGenAI({});

export const generateProductContent = async (productDetails) => {
  try {
    const prompt = `
      Act as an expert e-commerce copywriter. Based on these product details, generate:
      1. A compelling description
      2. 3-5 Key Selling Points
      3. 3-5 SEO Keywords
      4. 3 Frequently Asked Questions (FAQs) with answers
      5. A Listing Quality Score (1-100)
      
      Return ONLY a valid JSON object matching this schema:
      {
        "description": "string",
        "keySellingPoints": ["string"],
        "seoKeywords": ["string"],
        "faqs": [{"question": "string", "answer": "string"}],
        "listingQualityScore": number
      }
      
      Product Details:
      ${JSON.stringify(productDetails)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw error;
  }
};

export const generateEmbeddings = async (text) => {
    try {
        const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: text,
        });
        return response.embeddings[0].values;
    } catch (error) {
        console.error('Embedding Generation Error:', error);
        throw error;
    }
};

export const chatAssistant = async (userMessage, contextData) => {
    try {
        const prompt = `
          You are the ShopSphere AI Shopping Assistant. 
          Use the following product data context to answer the user's question, summarize differences, or ask for preferences if requirements are incomplete.
          Do NOT invent product specifications; answers must be grounded in the provided context data.
          
          Context Data: ${JSON.stringify(contextData)}
          
          User Message: ${userMessage}
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('AI Chat Error:', error);
        throw error;
    }
};
