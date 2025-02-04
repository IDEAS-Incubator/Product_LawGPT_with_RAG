import pkg from '@lmstudio/sdk';
const { LMStudioClient } = pkg;

const client = new LMStudioClient();

async function main() {
  const modelPath = "bartowski/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-GGUF";
  const llama3 = await client.llm.load(modelPath, { config: { gpuOffload: "max", noHup: true } });
  
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

    conversationHistory.push({ role: "user", content: userInput });
    
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
