import ollama from 'ollama'

const response= await ollama.embeddings({ model: 'nomic-embed-text', prompt: 'The sky is blue because of rayleigh scattering' })

console.log(response)