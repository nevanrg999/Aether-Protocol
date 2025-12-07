
import { GoogleGenAI, Type } from "@google/genai";
import { Agent, VerificationResult, AgentActionProof } from "../types";
import { MOCK_AGENTS } from "../constants";

// Helper to generate a mock hash for the proof ID
const generateMockHash = () => {
  return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
};

// Helper to reliably parse JSON from AI response, handling Markdown code blocks
const cleanAndParseJson = (text: string) => {
    try {
        // Remove markdown code blocks like ```json ... ```
        let cleaned = text.replace(/```json\n?|```/g, '').trim();
        
        // Isolate the JSON object if there's extra text around it
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
        
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Raw Text:", text);
        // Return a basic fallback structure if parsing fails entirely, rather than crashing
        return {
            output: "Error parsing agent output. Raw response: " + text.substring(0, 100) + "...",
            reasoning: ["Format error in response", "Check raw logs"],
            riskScore: 50
        };
    }
};

interface AgentResponse {
  output: string;
  reasoning: string[];
  riskScore: number;
}

export const runAgentTask = async (
  agent: Agent,
  input: string,
  apiKey: string
): Promise<{
  actionOutput: string;
  reasoning: string[];
  proofId: string;
  crossChecks: VerificationResult[];
  trustScoreDelta: number;
}> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  // 1. Main Agent Execution
  const mainModel = 'gemini-2.5-flash';
  
  const mainSystemInstruction = `You are ${agent.name}, an AI agent specialized in ${agent.role}. 
  Your task is to analyze the user input based on your specialty.
  
  RESPONSE FORMAT:
  You MUST return valid JSON only. Do not add markdown formatting.
  Structure:
  {
    "output": "Your detailed analysis or decision here.",
    "reasoning": ["Reason 1", "Reason 2", "Reason 3"],
    "riskScore": 0-100
  }`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      output: { type: Type.STRING, description: "The final decision or summary of the action." },
      reasoning: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of 2-3 short reasons for the decision."
      },
      riskScore: { type: Type.NUMBER, description: "A score from 0 to 100 indicating risk or confidence." }
    },
    required: ["output", "reasoning", "riskScore"]
  };

  try {
      const mainResponse = await ai.models.generateContent({
        model: mainModel,
        contents: input,
        config: {
          systemInstruction: mainSystemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.3, 
        }
      });

      const mainResult: AgentResponse = cleanAndParseJson(mainResponse.text || "{}");

      // 2. Trust Swarm Execution (Multiple Checkers)
      // Select 2 random agents from the pool (excluding the executor)
      const potentialCheckers = MOCK_AGENTS.filter(a => a.id !== agent.id);
      const swarmSize = 2;
      const swarmAgents = potentialCheckers.sort(() => 0.5 - Math.random()).slice(0, swarmSize);

      const crossChecks: VerificationResult[] = [];
      let agreementCount = 0;

      // Execute swarm checks in parallel
      const checkPromises = swarmAgents.map(async (checker) => {
        const checkerSystemInstruction = `You are ${checker.name}, acting as an impartial auditor in the Aether Trust Swarm.
        Your role is: ${checker.role}.
        
        Review a decision made by another AI agent.
        Original Input: "${input.substring(0, 500)}..."
        Original Agent Decision: "${mainResult.output}"
        
        Based on your expertise, determine if you agree or disagree. 
        Be strict but fair.`;

        const checkerSchema = {
          type: Type.OBJECT,
          properties: {
            agreement: { type: Type.BOOLEAN, description: "True if you agree with the agent's decision." },
            comment: { type: Type.STRING, description: "A brief, 1-sentence comment explaining your position." }
          },
          required: ["agreement", "comment"]
        };

        try {
            const checkResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: "Audit this transaction.",
                config: {
                systemInstruction: checkerSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: checkerSchema,
                temperature: 0.4 
                }
            });
            const checkResult = cleanAndParseJson(checkResponse.text || "{}");
            return {
                checkerAgentId: checker.id,
                checkerAgentName: checker.name,
                checkerRole: checker.role,
                agreement: checkResult.agreement,
                comment: checkResult.comment,
                timestamp: new Date().toISOString()
            };
        } catch (e) {
            return {
                checkerAgentId: checker.id,
                checkerAgentName: checker.name,
                checkerRole: checker.role,
                agreement: true,
                comment: "Automated verification pass (Error in checker node).",
                timestamp: new Date().toISOString()
            };
        }
      });

      const results = await Promise.all(checkPromises);
      results.forEach(r => {
          crossChecks.push(r);
          if (r.agreement) agreementCount++;
      });

      // Calculate Trust Score Delta
      let trustScoreDelta = 0;
      if (agreementCount === swarmAgents.length) {
          trustScoreDelta = 5;
      } else if (agreementCount > 0) {
          trustScoreDelta = 2;
      } else {
          trustScoreDelta = -5; // Swarm rejected it
      }

      return {
        actionOutput: mainResult.output,
        reasoning: mainResult.reasoning || [],
        proofId: generateMockHash(),
        crossChecks: crossChecks,
        trustScoreDelta
      };
      
  } catch (error: any) {
      console.error("Agent Execution Failed:", error);
      throw new Error("Agent execution failed: " + error.message);
  }
};

// 3. Dispute Resolution (Judge Agent)
export const resolveDispute = async (
    proof: AgentActionProof,
    challengeReason: string,
    apiKey: string
): Promise<{ verdict: 'Resolved_Upheld' | 'Resolved_Overturned', comment: string, penalty: number }> => {
    
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });

    const judgeInstruction = `You are "Justitia", the Supreme Judge Agent of the Aether Protocol.
    A user has challenged a decision made by an AI agent.
    
    CASE DATA:
    original_input: "${proof.inputSnippet}"
    agent_output: "${proof.actionOutput}"
    agent_reasoning: ${proof.reasoning.join("; ")}
    swarm_consensus: ${proof.crossChecks.map(c => c.checkerAgentName + ': ' + (c.agreement ? 'Agreed' : 'Disagreed')).join(', ')}

    CHALLENGER ARGUMENT:
    "${challengeReason}"

    TASK:
    Evaluate the Challenger's Argument against the Agent's Decision and Swarm Consensus.
    Is the Challenger correct? Did the Agent miss something or make a mistake?
    
    If the Agent was fundamentally correct, UPHOLD the decision.
    If the Agent was wrong, biased, or the challenger has a valid point that invalidates the result, OVERTURN the decision.
    
    Render a verdict and provide a judicial comment explaining why.`;

    const judgeSchema = {
        type: Type.OBJECT,
        properties: {
          upholdAgent: { type: Type.BOOLEAN, description: "True to Uphold the agent (Challenger loses), False to Overturn (Challenger wins)." },
          verdictComment: { type: Type.STRING, description: "The final verdict explanation, addressing the challenger's argument." }
        },
        required: ["upholdAgent", "verdictComment"]
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Render your verdict on this dispute.",
        config: {
          systemInstruction: judgeInstruction,
          responseMimeType: "application/json",
          responseSchema: judgeSchema,
          temperature: 0.1
        }
    });

    const result = cleanAndParseJson(response.text || "{}");
    
    return {
        verdict: result.upholdAgent ? 'Resolved_Upheld' : 'Resolved_Overturned',
        comment: result.verdictComment,
        penalty: result.upholdAgent ? 5 : -15 // Agent gains trust if challenge fails (upheld), loses heavily if overturned
    };
};
