# Open Innovation, Model Selection & Licensing

## 1. Selected Open-Weight Model
- **Model:** Meta Llama 3.1 8B Instant (`llama-3.1-8b-instant`)
- **Developer:** Meta AI
- **Weight Availability:** Open weights downloadable via Hugging Face and Meta.
- **Hosted Inference Provider:** Groq Cloud API (utilizing LPU hardware for high-speed terminal streaming). Alternative supported providers include OpenRouter, Together AI, and any OpenAI-compatible server (vLLM, Ollama, etc.).

---

## 2. Model License & Usage Terms
- **License:** Meta Llama 3.1 Community License Agreement.
- **Permissibility:** The license permits commercial and non-commercial deployment without fees for applications with fewer than 700 million monthly active users.
- **Redistribution & Attribution:** Conforms with open innovation standards by providing public access to weights, tokenizer configurations, and fine-tuning checkpoints.

---

## 3. Clear Distinction of Components
To adhere strictly to open-source transparency:
1. **Application Code:** Licensed under the MIT License. 100% open-source and maintained in this repository.
2. **Open-Weight Model:** Governed by the Meta Llama 3.1 Community License. Weights are hosted externally on Groq Cloud LPU clusters for ultra-low latency inference without consuming laptop GPU resources.
3. **Historical Knowledge Documents:** Curated from public archival materials (Computer History Museum, ACM, IEEE Annals, Dartmouth Archives).
4. **Offline Fallback Engine:** Pure-Python BM25 matching and local response generation, running entirely locally without internet access or API credentials.

---

## 4. Privacy & Data Transmission Boundaries
- **What is sent to the remote inference provider:**
  - The conversational persona system prompt.
  - The user's query.
  - The retrieved historical text passages relevant to the query.
- **What is NEVER transmitted:**
  - API keys (kept securely in server `.env`).
  - User identifiers or local database contents.
  - Browser cookies or local storage.
- **Offline Assurance:**
  - When running in Offline Archive Mode (empty `AI_API_KEY`), **zero bytes are transmitted over the internet**. All queries are processed locally on the CPU.
