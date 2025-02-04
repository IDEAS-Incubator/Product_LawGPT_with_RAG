import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { fileURLToPath } from 'url';
import path from 'path';
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Manually define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadAndSplitPdfDocument() {
  // Define the path to your PDF file
  const nike10kPdfPath = path.join(__dirname, 'data/immigration.pdf');

  // Load the PDF document
  const loader = new PDFLoader(nike10kPdfPath);
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

    // Log the output chunks
    console.log(docOutput);
  } else {
    console.error("No documents were loaded from the PDF.");
  }
}

// Call the function to load, split, and process the PDF
loadAndSplitPdfDocument().catch(console.error);
