
import axios from 'axios';
const url = 'http://localhost:1234/v1/embeddings';
const headers = {
  'Content-Type': 'application/json'
};
const data = {
  input: "Your text string goes here",
  model: "nomic-ai/nomic-embed-text-v1.5-GGUF"
};

axios.post(url, data, { headers })
  .then(response => {
    console.log('Response:', response.data);
    const embeddings = response.data.data.map(item => item.embedding);
    console.log('Embeddings:', embeddings);
  })
  .catch(error => {
    console.error('Error:', error);
  });
