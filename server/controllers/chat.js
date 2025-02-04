import chat from "../helpers/chat.js";
import { sendErrorEmail } from "../mail/send.js";
import { ObjectId } from "mongodb";
import { QdrantClient } from "@qdrant/js-client-rest";
import ollama from 'ollama';
import {
  createSendingErrorMessage,
  extractErrorDetails,
} from "../utility/errors.js";
let chatId;
let sendingError;
import { formatHistory } from "../utility/feature.js";
import 'dotenv/config'; // or require('dotenv').config() if using CommonJS

const QDRANT_COLLECTION = "docslaw";  // Replace with your actual Qdrant collection name
const LLAMA_MODEL = process.env.LLAMA_MODEL || 'llama2:latest'; // fallback to llama2:latest if not set

// Function to generate embeddings using the Ollama API
async function getEmbedding(text) {
    try {
        const response = await ollama.embeddings({
            model: 'nomic-embed-text', 
            prompt: text,
            options: {
                num_gpu: 0  // Force CPU usage
            }
        });
        const embedding = response.embedding;
        return embedding;
    } catch (error) {
        console.error('Error generating embeddings with Ollama:', error);
        throw error;
    }
}

// Function to query Qdrant for relevant documents
async function queryDocuments(query) {
    const qdrantClient = new QdrantClient({ host: "localhost", port: 6333 });

    try {
        const queryEmbedding = await getEmbedding(query);
        const searchResults = await qdrantClient.search(QDRANT_COLLECTION, {
            vector: queryEmbedding,
            limit: 1
        });
        return searchResults;
    } catch (error) {
        console.error('Error querying documents:', error);
        throw error;
    }
}

// Function to classify the user's question
async function classifyQuestion(userQuery, systemPrompt, modelType) {
    try {
        const structuredPrompt = `
You must respond in valid JSON format only. No other text.
Format: {"results": "yes"} or {"results": "no"}

Question: Is this question related to immigration law?
"${userQuery}"

Remember: Only respond with {"results": "yes"} or {"results": "no"}. Nothing else.`;

        const response = await ollama.chat({
            model: LLAMA_MODEL,
            messages: [
                { 
                    role: "system", 
                    content: "You are a JSON-only response bot. You must ONLY output valid JSON in the format {\"results\": \"yes\"} or {\"results\": \"no\"}. No other text or explanation." 
                },
                { role: "user", content: structuredPrompt }
            ],
            options: {
                num_gpu: 0,  // Force CPU usage
                temperature: 0.1  // Lower temperature for more consistent responses
            }
        });
        
        const responseContent = response.message.content.trim();
        
        // Try to extract JSON if it's embedded in other text
        const jsonMatch = responseContent.match(/\{.*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        // If no JSON found, make a best-effort classification based on the response
        if (responseContent.toLowerCase().includes('yes')) {
            return { results: "yes" };
        } else if (responseContent.toLowerCase().includes('no')) {
            return { results: "no" };
        }
        
        // Default fallback
        console.log("Could not parse response, defaulting to no");
        return { results: "no" };

    } catch (error) {
        console.error(`An error occurred during classification: ${error.message}`);
        // Default to "no" on error
        return { results: "no" };
    }
}

async function handleLawRelatedQuery(userQuery, promptTemplate,modelType) {
  try {
      const result = await queryDocuments(userQuery);
      const score = result[0].score;
      const context = result[0].payload.data;

      if (score >= 0.5) {
          console.log("YES FROM LOCAL RAG");
          let promptTemplateRAG = `
            You are an expert Immigration Lawyer, tasked with delivering precise and accurate information about immigration processes and legal advice. Your response should be based on the specific question presented, utilizing your deep knowledge of immigration laws and procedures.

            Question to address: ${userQuery}
            Context provided: ${context}
            
            Please provide a thorough and detailed answer below.
          `;
          const llmResponseRag = await handleLlmResponse(promptTemplateRAG,modelType);
          return { source: 'local_rag', content: llmResponseRag };  // Return response with content field

      } else {
          console.log("FROM LLM");
          const llmResponse = await handleLlmResponse(promptTemplate,modelType);
          return { source: 'llm', content: llmResponse };  // Return response with content field
      }
  } catch (error) {
      console.error(`An error occurred while handling law-related query: ${error.message}`);
      throw error;
  }
}

async function handleNonLawRelatedQuery(promptTemplate,modelType) {
  const llmResponse = await handleLlmResponse(promptTemplate,modelType);
  return { source: 'llm', content: llmResponse };  // Return response with content field
}

async function handleLlmResponse(promptTemplate, modelType) {
    const systemMessage = "You are a helpful assistant that handles user queries and provides only the answer to the user's question.";

    try {
        const response = await ollama.chat({
            model: LLAMA_MODEL,
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: promptTemplate }
            ],
            options: {
                num_gpu: 0  // Force CPU usage
            }
        });

        return response.message.content;

    } catch (error) {
        console.error(`An error occurred during LLM response handling: ${error.message}`);
        throw error;
    }
}

//Add chat
async function handleLawRelatedQueryAddChat(userQuery, promptTemplate,history,modelType) {
  try {
      const result = await queryDocuments(userQuery);
      const score = result[0].score;
      const context = result[0].payload.data;
      if (score >= 0.5) {
          console.log("YES FROM LOCAL RAG");
          let promptTemplateRAG = `
            You are an expert Immigration Lawyer, tasked with delivering precise and accurate information about immigration processes and legal advice. Your response should be based on the specific question presented, utilizing your deep knowledge of immigration laws and procedures.

            Question to address: ${userQuery}
            Context provided: ${context}
            
            Please provide a thorough and detailed answer below.
          `;
          const llmResponseRag = await handleLlmResponseAddChat(promptTemplateRAG,history,modelType);
          return { source: 'local_rag', content: llmResponseRag };  // Return response with content field
      } else {
          console.log("FROM LLM");
          const llmResponse = await handleLlmResponseAddChat(promptTemplate,history,modelType);
          return { source: 'llm', content: llmResponse };  // Return response with content field
      }
  } catch (error) {
      console.error(`An error occurred while handling law-related query: ${error.message}`);
      throw error;
  }
}

async function handleNonLawRelatedQueryAddChat(promptTemplate,history,modelType) {
  const llmResponse = await handleLlmResponseAddChat(promptTemplate,history,modelType);
  return { source: 'llm', content: llmResponse };  // Return response with content field
}

async function handleLlmResponseAddChat(promptTemplate, history, modelType) {
    const systemMessage = "You are a helpful assistant that handles user queries and provides only the answer to the user's question.";

    try {
        const messages = [
            { role: "system", content: systemMessage },
            ...history,
            { role: "user", content: promptTemplate }
        ];

        const response = await ollama.chat({
            model: LLAMA_MODEL,
            messages: messages,
            options: {
                num_gpu: 0  // Force CPU usage
            }
        });

        return response.message.content;

    } catch (error) {
        console.error(`An error occurred during LLM response handling: ${error.message}`);
        throw error;
    }
}

export const newChat = async (req, res) => {
  const { prompt, userId } = req.body;
  chatId = new ObjectId().toHexString();
  let response = {};
  let conversation = [
      {
          role: "user",
          content: prompt,
      }
  ];

  try {
      await chat.saveConversation(chatId, conversation); // Save initial conversation with the user query
      const modelType = await chat.getModelType(userId);  // Get the model type for the user

          let systemPrompt = `
              You are a lawyer with expertise in immigration law. Determine whether the following question relates to immigration. Respond only in JSON format as {"results":"yes"} or {"results":"no"} without any explanations or extra text.
          `;
          let promptTemplate = `
              You are an experienced Immigration Lawyer. Your task is to provide clear and accurate information regarding immigration processes and legal advice based on the questions asked. The question you need to address is provided below. Please offer a comprehensive response based on your expertise and knowledge of immigration  laws and procedures.

              Here is the question: ${prompt}
          `;

          const responseDict = await classifyQuestion(prompt, systemPrompt,modelType);

          if (responseDict) {
              
              const result = responseDict.results.toLowerCase();
              console.log("Result of CLassification",result);
              if (result === "yes") {
                  console.log("YES")
                  response = await handleLawRelatedQuery(prompt, promptTemplate, modelType);
              } else if (result === "no") {
                console.log("NO")
                  response = await handleNonLawRelatedQuery(promptTemplate, modelType);
              } else {
                  console.log("Unexpected result in classification:", responseDict);
                  response = { error: "Unexpected classification result" };
              }
          } else {
              console.log("Failed to classify the question.");
              response = { error: "Failed to classify the question" };
          }

          // Save the response to the database
          const savedResponse = await chat.newResponse(prompt, response.content, userId, chatId);
          response._id = savedResponse._id;
          response.content = response.content;

          conversation.push({
              role: "assistant",
              content: response.content
          });
          await chat.saveConversation(chatId, conversation);  // Save the updated conversation with the assistant's response



      res.status(200).json({
          status: 200,
          message: "Success",
          data: {
              _id: chatId,
              content: response.content
          },
      });

  } catch (err) {
      const sendingError = createSendingErrorMessage(err);
      console.log(sendingError);
      res.status(500).json({
          status: 500,
          message: "Internal server error",
      });
  }
};


export const addChat = async (req, res) => {
  const { prompt, userId, chatId } = req.body;
  let response = {};

  try {
          const modelType = await chat.getModelType(userId);  // Get the model type for the user

          let conversation = await chat.getConversation(chatId);
          
          let history = formatHistory(conversation, false);

          let systemPrompt = `
              You are a lawyer with expertise in immigration law. Determine whether the following question relates to immigration . Respond only in JSON format as {"results":"yes"} or {"results":"no"} without any explanations or extra text.
          `;
          let promptTemplate = `
              You are an experienced Immigration Lawyer. Your task is to provide clear and accurate information regarding immigration processes and legal advice based on the questions asked. The question you need to address is provided below. Please offer a comprehensive response based on your expertise and knowledge of immigration laws and procedures.

              Here is the question: ${prompt}

              Provide your detailed answer below:
          `;

          const responseDict = await classifyQuestion(prompt, systemPrompt,modelType);

          if (responseDict) {
              const result = responseDict.results.toLowerCase();
              if (result === "yes") {
                  response = await handleLawRelatedQueryAddChat(prompt, promptTemplate,history,modelType);
              } else if (result === "no") {
                  response = await handleNonLawRelatedQueryAddChat(promptTemplate,history,modelType);
              } else {
                  console.log("Unexpected result in classification:", responseDict);
                  response = { error: "Unexpected classification result" };
              }
          } else {
              console.log("Failed to classify the question.");
              response = { error: "Failed to classify the question" };
          }
          conversation.push({
              role: "assistant",
              content: response.content
          });

          // Save the conversation and response to the database
          response.db = await chat.updateChat(chatId, prompt,response.content, userId);
          await chat.saveConversation(chatId, conversation);  // Save the updated conversation with the assistant's response

          // Format the response in the desired structure
          const formattedResponse = {
              content: response.content
          };

          res.status(200).json({
              status: 200,
              message: "Success",
              data: formattedResponse
          });

  } catch (err) {
      const sendingError = createSendingErrorMessage(err);
      console.log(sendingError);
      res.status(500).json({
          status: 500,
          message: "Internal server error",
      });
  }
};

export const getChat = async (req, res) => {
  const { userId } = req.body;
  const { chatId = null } = req.query;

  let response = null;

  try {
    response = await chat.getChat(userId, chatId);
  } catch (err) {
    if (err?.status === 404) {
      res.status(404).json({
        status: 404,
        message: "Not found",
      });
    } else {
      sendingError = "Error in getChat : ${err}";
      sendErrorEmail(sendingError);
      res.status(500).json({
        status: 500,
        message: err,
      });
    }
  } finally {
    if (response) {
      res.status(200).json({
        status: 200,
        message: "Success",
        data: response,
      });
    }
  }
};

export const getHistory = async (req, res) => {
  const { userId } = req.body;

  let response = null;

  try {
    response = await chat.getHistory(userId);
  } catch (err) {
    sendingError = "Error in getting history " + err;
    sendErrorEmail(sendingError);
    res.status(500).json({
      status: 500,
      message: err,
    });
  } finally {
    if (response) {
      res.status(200).json({
        status: 200,
        message: "Success",
        data: response,
      });
    }
  }
};

export const deleteAllChat = async (req, res) => {
  const { userId } = req.body;

  let response = null;

  try {
    response = await chat.deleteAllChat(userId);
  } catch (err) {
    sendingError = "Error in deleting chat" + err;
    sendErrorEmail(sendingError);

    res.status(500).json({
      status: 500,
      message: err,
    });
  } finally {
    if (response) {
      res.status(200).json({
        status: 200,
        message: "Success",
      });
    }
  }
};

export const deleteChat = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.body.userId;

  try {
    if (!chatId) {
      return res.status(400).json({ error: "Invalid or missing chat ID." });
    }
    const result = await chat.deleteChat(userId, chatId);

    if (!result) {
      return res.status(404).json({ error: "Chat not found." });
    }

    res.status(200).json({ message: "Chat deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
