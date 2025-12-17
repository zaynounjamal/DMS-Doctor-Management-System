# Run the Project (A to Z)

This repo contains:
- **Backend**: .NET Web API (`DMS-DOTNETREACT/DMS-DOTNETREACT`) 
- **Frontend**: React + Vite (`frontend/`)
- **AI Service**: FastAPI + LangChain (`ai-service/`) (optional)

This guide is written for **Windows + PowerShell**.

---

## A) Install prerequisites

- **.NET SDK**: .NET 10 (or compatible version installed on your machine)
- **Node.js**: 18+
- **Python**: 3.10+ (your environment currently uses Python 3.13; it works)
- **SQL Server**: LocalDB or SQL Server instance

---

## B) Get the database ready

### 1) Check connection string
Open:
- `DMS-DOTNETREACT/appsettings.Development.json`

Look for something like `ConnectionStrings:DefaultConnection`.

### 2) Start SQL Server
Make sure SQL Server is running and the connection string points to a valid instance.

### 3) Schema setup
This backend uses EF Core and also includes some startup-time checks (e.g., chat tables). 
When you start the backend, it will ensure the DB exists and seed data if configured.

---

## C) Run the backend (API)

### Folder
Backend project is here:
- `DMS-DOTNETREACT/DMS-DOTNETREACT`

### Command
In PowerShell:
```powershell
# from repo root
# (run this inside: DMS-DOTNETREACT/DMS-DOTNETREACT)
dotnet run
```

### Expected URL
- API base: `http://localhost:5024/api`

### Quick health checks (open in browser)
- Public settings: `http://localhost:5024/api/public/settings`
- Public treatments (no price): `http://localhost:5024/api/public/clinic/treatments`
- Public doctors (no phone): `http://localhost:5024/api/public/clinic/doctors`
- Public FAQ: `http://localhost:5024/api/public/faq`

### Common backend issues
- **Build fails because files are locked**: stop the running backend instance and run again.
- **Port already in use**: stop the process using that port.

---

## D) Run the frontend (website)

### Folder
Frontend is here:
- `frontend/`

### Install dependencies
```powershell
npm install
```

### Start dev server
```powershell
npm run dev
```

### Expected URL
- Website: `http://localhost:5173`

### Environment variables (optional)
Frontend reads:
- `VITE_API_URL` (default: `http://localhost:5024/api`)
- `VITE_AI_URL` (default: `http://localhost:8001`)

If you need to override, create a file:
- `frontend/.env.local`

Example:
```ini
VITE_API_URL=http://localhost:5024/api
VITE_AI_URL=http://localhost:8001
```
Then restart `npm run dev`.

---

## E) Run the AI Service (optional)

The AI service powers the **AI Chat widget** on the Home page.

### 1) Backend must be running
The AI service calls these endpoints:
- `/api/public/clinic/treatments`
- `/api/public/clinic/doctors`
- `/api/public/clinic/payment-info`
- `/api/public/faq`

So you must have:
- Backend running at `http://localhost:5024`

### 2) Setup Python venv
Folder:
- `ai-service/`

Commands:
```powershell
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
```

### 3) Choose your LLM provider

#### Option 1: Groq (hosted API)
You must set environment variables in **your own terminal**:
```powershell
$env:BACKEND_API_URL="http://localhost:5024/api"
$env:GROQ_API_KEY="YOUR_NEW_KEY_HERE"
$env:GROQ_MODEL="llama-3.1-8b-instant"

.\.venv\Scripts\uvicorn main:app --host 0.0.0.0 --port 8001
```

#### Option 2: Ollama (local model)
Install Ollama and pull a model:
```powershell
ollama pull qwen2.5:7b-instruct
```

Then run AI service:
```powershell
$env:BACKEND_API_URL="http://localhost:5024/api"
$env:OLLAMA_BASE_URL="http://localhost:11434"
$env:OLLAMA_MODEL="qwen2.5:7b-instruct"

.\.venv\Scripts\uvicorn main:app --host 0.0.0.0 --port 8001
```

### 4) AI Service URLs
- Health: `http://localhost:8001/health`
- Swagger docs: `http://localhost:8001/docs`

### Common AI issues
- **AI service not reachable from website**:
  - Ensure AI service is running on `:8001`
  - Ensure frontend points to it (`VITE_AI_URL`)
  - Ensure you restarted the AI service after code changes

---

## F) Verify everything end-to-end

1. Start **backend** (`dotnet run`)
2. Start **AI service** (`uvicorn ... --port 8001`) (optional)
3. Start **frontend** (`npm run dev`)
4. Open:
   - Website: `http://localhost:5173`
5. Check:
   - AI Chat widget on Home page (bottom-right)
   - Patient↔Secretary chat widget (patient users only)

---

## G) Security notes (important)

- Do **NOT** commit API keys to git.
- Do **NOT** paste secrets into chat.
- If a key was exposed, **revoke it** and generate a new one.

---

## H) Useful ports

- Backend API: `5024`
- Frontend (Vite): `5173` (sometimes `5174`)
- AI service: `8001`
- Ollama: `11434`
