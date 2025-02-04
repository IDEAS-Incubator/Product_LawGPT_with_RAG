import axios from 'axios';
import { QdrantClient } from "@qdrant/js-client-rest";
import ollama from 'ollama';

const QDRANT_COLLECTION = "test108";  // Replace with your actual Qdrant collection name

// Function to generate embeddings using the Ollama API
async function getEmbedding(text) {
    try {
        const response = await ollama.embeddings({
            model: 'nomic-embed-text', 
            prompt: text
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
async function classifyQuestion(userQuery, systemPrompt) {
    try {
        const response = await ollama.chat({
            model: 'llama2',
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userQuery }
            ]
        });

        const responseContent = response.message.content.trim();
        return JSON.parse(responseContent);
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error(`JSON parsing error: ${error.message}`);
        } else {
            console.error(`An error occurred during classification: ${error.message}`);
        }
        return null;
    }
}

// Function to handle law-related queries
async function handleLawRelatedQuery(userQuery, promptTemplate) {
    try {
        const result = await queryDocuments(userQuery);
        const score = result[0].score;
        const context = result[0].payload.data;

        if (score >= 0.7) {
        console.log("YES FROM LOCAL RAG");
        
        console.log("Score:", score);
        console.log("Data:\n", context);
        console.log("--".repeat(100));
        } else {
            console.log("FROM LLM");
            console.log("Maybe the answer is:");
            await handleLlmResponse(promptTemplate);
        }
    } catch (error) {
        console.error(`An error occurred while handling law-related query: ${error.message}`);
    }
}


// Function to handle non-law-related queries
async function handleNonLawRelatedQuery(promptTemplate) {
    await handleLlmResponse(promptTemplate);
}

// Function to handle general responses from the LLM
async function handleLlmResponse(promptTemplate) {
    const systemMessage = "You are a helpful assistant that handles user queries and provides only the answer to the user's question.";

    try {
        const response = await ollama.chat({
            model: "llama2",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: promptTemplate }
            ],
            stream: true
        });

        // const llmResponse = response.message.content;
        console.log("This Question is not related to Immigration or copyright, but I can provide the answer:");
        for await (const part of response) {
            process.stdout.write(part.message.content)
          }
    } catch (error) {
        console.error(`An error occurred during LLM response handling: ${error.message}`);
    }
}

// Main function to handle the process
async function m(userQuery) {
    const systemPrompt = `
        You are a lawyer with expertise in immigration and copyright law. Determine whether the following question relates to immigration or copyright. Respond only in JSON format as {"results":"yes"} or {"results":"no"} without any explanations or extra text.
    `;
    const promptTemplate = `
        You are an experienced Immigration or copyright Lawyer. Your task is to provide clear and accurate information regarding immigration or copyright processes and legal advice based on the questions asked. The question you need to address is provided below. Please offer a comprehensive response based on your expertise and knowledge of immigration or copyright laws and procedures.

        Here is the question: ${userQuery}

        Provide your detailed answer below:
    `;

    const responseDict = await classifyQuestion(userQuery, systemPrompt);

    if (responseDict) {
        const result = responseDict.results.toLowerCase();
        if (result === "yes") {
            await handleLawRelatedQuery(userQuery, promptTemplate);
        } else if (result === "no") {
            await handleNonLawRelatedQuery(promptTemplate);
        } else {
            console.log("Unexpected result in classification:", responseDict);
        }
    } else {
        console.log("Failed to classify the question.");
    }
}

m("H1b Immigration");
