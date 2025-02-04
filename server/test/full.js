import { QdrantClient } from "@qdrant/js-client-rest";
import pkg from '@lmstudio/sdk';

const { LMStudioClient } = pkg;

// Initialize Qdrant Client
const qdrantClient = new QdrantClient({ host: "localhost", port: 6333 });

// Function to generate embeddings using LLM or external API
async function generateEmbeddings(text, model) {
    // Option 2: Using the external API to generate embeddings
    const url = 'http://localhost:1234/v1/embeddings';
    const headers = {
        'Content-Type': 'application/json'
    };
    const data = {
        input: text,
        model: "nomic-ai/nomic-embed-text-v1.5-GGUF"
    };

    const response = await axios.post(url, data, { headers });
    console.log('Response:', response.data);

    const embeddings = response.data.data.map(item => item.embedding);
    return embeddings[0]; // Assuming we're dealing with a single input

}

// Function to set up Qdrant collection and insert data with LLM-generated embeddings
async function setupQdrantCollection(llmModel) {
    await qdrantClient.createCollection("test_collection3", {
        vectors: { size: 1536, distance: "Cosine" }, // Assuming the embedding size is 1536
    });

    const documents = [
        { id: 1, text: "Berlin is the capital of Germany." },
        { id: 2, text: "London is the capital of the UK." },
        { id: 3, text: "Moscow is the capital of Russia." },
        { id: 4, text: "New York is a major city in the USA." },
        { id: 5, text: "Beijing is the capital of China." },
        { id: 6, text: "Mumbai is a major city in India." },
    ];

    const points = [];

    for (const doc of documents) {
        const vector = await generateEmbeddings(doc.text, llmModel);
        points.push({
            id: doc.id,
            vector: vector,
            payload: { text: doc.text },
        });
    }

    const operationInfo = await qdrantClient.upsert("test_collection3", {
        wait: true,
        points: points,
    });

    console.debug(operationInfo);
}

// Function to perform search in Qdrant using an LLM-generated query embedding
async function searchQdrant(queryText, llmModel) {
    const queryVector = await generateEmbeddings(queryText, llmModel);

    const searchResult = await qdrantClient.search("test_collection3", {
        vector: queryVector,
        limit: 3,
    });

    return searchResult.result.map(item => item.payload.text);
}

// Main function to run the interactive chatbot with RAG
async function main() {
    const lmStudioClient = new LMStudioClient();
    const modelPath = "bartowski/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-GGUF";
    const llama3 = await lmStudioClient.llm.load(modelPath, { config: { gpuOffload: "max", noHup: true } });

    // Set up Qdrant collection with LLM-generated embeddings
    await setupQdrantCollection(llama3);

    const conversationHistory = [
        { role: "system", content: "Always answer in rhymes." }
    ];

    while (true) {
        const userInput = await new Promise((resolve) => {
            process.stdout.write("You: ");
            process.stdin.once("data", (data) => resolve(data.toString().trim()));
        });

        if (["quit", "exit", "bye"].includes(userInput.toLowerCase())) {
            console.log("Ending conversation. Goodbye!");
            break;
        }

        // Retrieve relevant information from Qdrant using the user input
        const retrievedDocs = await searchQdrant(userInput, llama3);

        // Append the retrieved documents to the conversation history
        conversationHistory.push({ role: "user", content: userInput });
        retrievedDocs.forEach(doc => conversationHistory.push({ role: "system", content: doc }));

        // Generate a response from the LLM
        const prediction = llama3.respond(conversationHistory);

        let responseText = "";
        for await (const text of prediction) {
            responseText += text;
        }

        console.log("Bot:", responseText);
        conversationHistory.push({ role: "assistant", content: responseText });
    }
}

main();
