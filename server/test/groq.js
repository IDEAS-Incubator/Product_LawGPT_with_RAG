import Groq from "groq-sdk";

const groq = new Groq({ apiKey: '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' });

export async function main() {
  try {
    const chatCompletion = await getGroqChatCompletion();
    // Print the completion returned by the LLM.
    console.log("Chat completion response:", chatCompletion);
    console.log(chatCompletion.choices[0]?.message?.content || "");

  } catch (error) {
    console.error("Error fetching completion:", error);
  }
}

export async function getGroqChatCompletion() {
  try {
    
    return await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "what is sky",
        },
      ],
      model: "llama3-8b-8192",
    });
  } catch (error) {
    console.error("Error in getGroqChatCompletion:", error);
    throw error; // Re-throw to let main handle it
  }
}
main();