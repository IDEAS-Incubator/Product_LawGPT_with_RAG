import pkg from '@lmstudio/sdk';
const { LMStudioClient } = pkg;

const client = new LMStudioClient();

async function main() {
  const modelPath = "bartowski/DarkIdol-Llama-3.1-8B-Instruct-1.2-Uncensored-GGUF";
  //const llama3 = await client.llm.get(modelPath);
  const llama3 = await client.llm.load(modelPath, { config: { gpuOffload: "max" ,  noHup: true,} });
  const prediction = llama3.respond([
    { role: "system", content: "Always answer in rhymes." },
    { role: "user", content: "what is Paris" },
  ]);

  for await (const text of prediction) {
    process.stdout.write(text);
  }



//   const { stats } = await prediction;
//   console.log(stats);
 }

main();
