import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { QdrantClient } from "@qdrant/js-client-rest";
import { fileURLToPath } from 'url';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import ollama from 'ollama'

// Manually define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateEmbeddings(text) {
  try {
    // Call Ollama's embeddings API
    const response = await ollama.embeddings({
      model: 'nomic-embed-text', 
      prompt: text
    });

    // Extract the embedding directly from the response
    const embedding = response.embedding; // Assuming the response contains a single embedding
    return embedding; // Return the embedding array
  } catch (error) {
    console.error('Error generating embeddings with Ollama:', error);
    throw error;
  }
}

async function upsertToQdrant(embeddingData, collectionName) {
  const qdrantClient = new QdrantClient({ host: "localhost", port: 6333 });

  try {
    // Check if the collection exists
    const collectionsResponse = await qdrantClient.getCollections();
    const collectionExists = collectionsResponse.collections.some(
      (collection) => collection.name === collectionName
    );

    if (!collectionExists) {
      // Create the collection if it doesn't exist
      console.log(`Collection '${collectionName}' does not exist. Creating collection.`);
      await qdrantClient.createCollection(collectionName, {
        vectors: { size: embeddingData[0].vector.length, distance: "Cosine" },
      });
    // Upsert the data
      const operationInfo = await qdrantClient.upsert(collectionName, {
      wait: true,
      points: embeddingData.map((data, index) => ({
        id: index, // Use a unique identifier; you can replace 'index' with a more unique ID if necessary.
        vector: data.vector,
        payload: data.payload,
      })),
    });
    console.log('Upsert operation info:', operationInfo);
    } else {
      console.log(`Collection '${collectionName}' already exists. Skipping creation.`);
    }
  } catch (error) {
    console.error('Error during upsert operation:', error);
    throw error;
  }
}



// Function to load and split PDF documents using Langchain
async function loadAndSplitPdfDocument(filePath) {
  // Load the PDF document
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  if (docs.length > 0) {
    // Use the content of the first document for further processing
    const text = docs[0].pageContent;

    // Initialize the text splitter with the desired chunk size and overlap
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 100,
      is_separator_regex: false,
    });

    // Split the loaded PDF document into chunks
    const docOutput = await splitter.splitDocuments([
      new Document({ pageContent: text }),
    ]);

    return docOutput;
  } else {
    console.error("No documents were loaded from the PDF.");
    return [];
  }
}

// Main function to handle the process
async function main() {
  
  const collectionName = 'docslaw1'; // Define your collection name

  // Use __dirname to correctly resolve the absolute path to the "data" directory
  const directoryPath = path.join(__dirname, 'data');
  const files = fs.readdirSync(directoryPath);

  const embeddingData = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const filePath = path.join(directoryPath, file);

    if (ext === '.pdf') {
      // Load and split the PDF document
      const docChunks = await loadAndSplitPdfDocument(filePath);

      // Generate embeddings for each chunk and prepare data for upsert
      for (const chunk of docChunks) {
        const embedding = await generateEmbeddings(chunk.pageContent);
        embeddingData.push({
          id: `${file}-${chunk.metadata.pageNumber}`, // Using filename and page number as ID
          vector: embedding,
          payload: { "data": chunk.pageContent}
        });
      }
    }
  }

  // Upsert the generated embeddings to Qdrant
  await upsertToQdrant(embeddingData, collectionName);
}

// Execute the main function
main().catch(console.error);
