# Echoes of the Forgotten

> **An Interactive Digital Archive of Lost Computing & Retro AI Terminal**  
> Built for the **DEV Community Hacktoberfest 2026 — Week 4 Challenge: "Ghost in the Machine"**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Meta Llama 3.1](https://img.shields.io/badge/Model-Llama_3.1_8B_Instant-blue.svg)](https://llama.meta.com/)
[![Tests](https://img.shields.io/badge/pytest-27%20passed-brightgreen.svg)]()

---

## 1. Project Overview

**Echoes of the Forgotten** is an interactive digital archaeology archive and retro terminal experience. It resurrects the computing milestones and forgotten programming languages that laid the groundwork for modern software engineering:

- **COBOL (1959):** The stoic veteran of enterprise systems and global banking mainframes.
- **FORTRAN (1957):** The pioneering spirit of scientific computation and optimizing compilers.
- **BASIC (1964):** The democratic language that brought computing to high schools and living rooms.
- **Assembly (1947):** The elemental machine beneath the machine—direct opcodes, registers, and bare metal.

Users converse with machine spirits inside an atmospheric CRT terminal. Every response is strictly grounded in verified historical documents using pure-Python **BM25 lexical retrieval**, ensuring zero hallucinations, authentic citations, and **100% operation on standard consumer laptops with zero GPU requirements**.

---

## 2. Core Features

- **Haunted CRT Terminal:** Authentic phosphor green and amber CRT aesthetics, scanline shaders, moving beams, and an accessible toggle to disable flicker (`prefers-reduced-motion` compliant).
- **CPU-Friendly Retrieval (BM25):** Fast lexical search over curated archival documents using `rank-bm25`. No PyTorch, no CUDA, no GPU, and zero local embedding overhead.
- **Source-Grounded AI Generation:** Combines retrieved primary sources with open-weight **Meta Llama 3.1 8B Instant** through an OpenAI-compatible interface (Groq Cloud API).
- **Offline Resiliency (Zero-Cost Operation):** Automatically detects if an API key is absent or unreachable, seamlessly switching to local archive playback. Zero API fees or GPU downloads required.
- **Safe Command Console:** Direct terminal interpreter for `help`, `whoami`, `list`, `switch <tech>`, `search <query>`, `inspect <doc_id>`, `clear`, and `exit`. Strictly zero use of `eval`, `exec`, or `subprocess`.
- **Memory Vault (SQLite Persistence):** Save fascinating discoveries and revisit past conversation sessions stored locally in parameterized SQLite tables.

---

## 3. Architecture

```
                      +---------------------------------------+
                      |         React 18 + Vite + TS          |
                      |   (Retro CRT Shader, Safe Console,    |
                      |    Archive Index, Memory Vault)       |
                      +-------------------+-------------------+
                                          |
                                          | HTTP REST (Port 5173 -> 8000)
                                          v
                      +---------------------------------------+
                      |         FastAPI Engine (Python)       |
                      +---------+-------------------+---------+
                                |                   |
        +-----------------------+                   +-----------------------+
        |                                                                   |
        v                                                                   v
+-------------------------------+                           +-------------------------------+
|   CPU Lexical BM25 Engine     |                           |   SQLite Parameterized DB     |
|   - Pure Python (rank-bm25)   |                           |   - Conversations             |
|   - Zero GPU / Zero Embeddings|                           |   - Messages (Transcripts)    |
|   - Relevance thresholding    |                           |   - Saved Discoveries         |
+---------------+---------------+                           +-------------------------------+
                | Verified Document Extracts
                v
+-------------------------------+
|    Bounded Prompt Builder     |
|    - Separates Persona/Facts  |
|    - Prevents Hallucination   |
|    - Injects Real Citations   |
+---------------+---------------+
                |
                v
+-----------------------------------------------------------+
|          AI Provider Layer (Pluggable Abstraction)        |
|  ├─ Primary: OpenAI-Compatible API (Groq / OpenRouter)    |
|  │  Model: Llama-3.1-8B-Instant (Open Weights)            |
|  └─ Fallback: Local Archive Offline Synthesizer           |
|     (Guarantees full utility without API keys/internet)   |
+-----------------------------------------------------------+
```

---

## 4. Hardware Constraints & Open-Source AI Alignment

| Constraint | How This Project Solves It |
| :--- | :--- |
| **No Dedicated GPU** | Uses pure-Python BM25 lexical retrieval and external cloud inference for open weights. |
| **No Large Local Weights** | External inference API handles token generation without downloading 15GB+ model files. |
| **No CUDA / PyTorch Overhead** | Lightweight dependencies (`fastapi`, `uvicorn`, `rank-bm25`, `httpx`). Total backend size < 40 MB. |
| **Open-Source Innovation** | Employs **Meta Llama 3.1 8B Instant** (Meta Llama 3.1 Community License, open weights). |
| **Citation Integrity** | URLs are never generated by the model. Real citations are attached directly from document metadata. |
| **Zero Cost / Offline Mode** | Full feature set (search, terminal chat, memory vault) works without an API key. |

---

## 5. Installation & Setup (Windows PowerShell)

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ (tested on Node v24)
- Git

### Step A: Clone the Repository
```powershell
git clone https://github.com/Ganesh-978/git-course.git
cd "Echoes of the forgotten"
```

### Step B: Backend Setup
```powershell
cd backend

# Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run FastAPI backend server (Port 8000)
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
*(If PowerShell blocks script execution: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`)*

### Step C: Frontend Setup (in a separate terminal)
```powershell
cd frontend

# Install npm dependencies
npm install

# Run Vite dev server (Port 5173)
npm run dev
```

Open `http://127.0.0.1:5173` in your browser to experience the application.

---

## 6. Environment Configuration (`backend/.env`)

```env
ENVIRONMENT=development
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# AI Provider Configuration
# Set AI_PROVIDER to 'groq', 'openrouter', or 'offline'
AI_PROVIDER=groq
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.1-8b-instant

# Optional: Obtain a free API key at https://console.groq.com/
# Leave empty to run in Zero-Cost Offline Archive Mode!
AI_API_KEY=

AI_TIMEOUT_SECONDS=15
AI_MAX_TOKENS=600

# SQLite Persistence
DATABASE_PATH=echoes.db
```

---

## 7. Running the Automated Test Suite

The backend contains 27 comprehensive tests validating health telemetry, BM25 retrieval, prompt bounding, offline fallback, safe terminal commands, and SQLite transactions.

```powershell
cd backend
.\venv\Scripts\pytest.exe
```

Expected result:
```
============================= 27 passed in ~2.5s ==============================
```

To run the frontend production build test:
```powershell
cd frontend
npm run build
```

---

## 8. Verifiable Archival Sources

All historical documents in `backend/knowledge/` are verified against credible archives:
- **Computer History Museum:** *The Birth of High-Level Programming Languages* (CODASYL / Grace Hopper).
- **ACM Turing Award Archives:** *John Backus Citation & Biography* (FORTRAN / IBM 704).
- **Dartmouth College Archives:** *The Birth of BASIC and Time-Sharing* (Kemeny & Kurtz, May 1964).
- **Birkbeck, University of London:** *Remembering Dr. Kathleen Booth, Computing Pioneer* (Assembly mnemonics).
- **Oak Ridge National Laboratory:** *Why Fortran Endures in Supercomputing* (High-Performance Computing).
- **Reuters Financial Analysis:** *The Global Financial Architecture Built on COBOL* (Mainframe transaction processing).

---

## 9. License

This project is licensed under the [MIT License](LICENSE).  
The open-weight model is governed by the [Meta Llama 3.1 Community License](https://llama.meta.com/license/).
