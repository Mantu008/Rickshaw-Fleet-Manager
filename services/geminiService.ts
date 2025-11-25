import { GoogleGenAI } from "@google/genai";
import { Transaction, Vehicle } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFleetInsights = async (
  transactions: Transaction[],
  vehicles: Vehicle[]
): Promise<string> => {
  const client = getAiClient();
  if (!client) return "API Key is missing. Unable to generate insights.";

  // Prepare a summary for the AI
  const today = new Date().toISOString().split('T')[0];
  const recentTransactions = transactions.filter(t => t.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  
  const summary = {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === 'Active').length,
    totalRevenueLast7Days: recentTransactions.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0),
    totalExpensesLast7Days: recentTransactions.filter(t => t.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0),
    recentTransactionCount: recentTransactions.length,
    dateOfReport: today
  };

  const prompt = `
    You are an expert fleet manager assistant. Analyze the following fleet summary data:
    ${JSON.stringify(summary, null, 2)}
    
    Provide 3 concise, actionable bullet points to help the owner improve profitability or efficiency. 
    Focus on maintenance, driver performance, or cash flow.
    Keep the tone professional yet encouraging.
    Format the output as simple text with bullet points (no markdown bolding needed).
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating insights. Please try again later.";
  }
};