# Expert Chatbots - Platform

A web application that simulates conversations between historical experts and thought leaders using AI. Users can choose any topic and two experts, and watch them engage in an authentic, intelligent dialogue.

---

##  Architecture Overview

This project consists of two main components:
- **Frontend**: Static HTML/CSS/JavaScript hosted on GitHub Pages
- **Backend**: Flask API deployed on Render (handles OpenAI API calls)

---

##  Frontend

### Description
The frontend is a single-page application that provides an interactive interface for starting and viewing expert debates. It displays two chat panels side-by-side where expert responses appear with smooth animations.

### Files
- `index.html` - Main HTML structure
- `style.css` - Styling and animations
- `script.js` - Client-side logic and API communication

### How It Works

1. **User Input**: User enters a debate topic and two expert names
2. **API Request**: Frontend sends POST request to backend with topic and expert names
3. **Loading State**: Displays "Thinking..." indicators in both chat panels
4. **Response Handling**: Receives conversation exchanges from backend
5. **Message Display**: Animates messages appearing in their respective panels with 2-second delays
6. **Format Compatibility**: Handles both old format (`debate` string) and new format (`exchanges` array)

### Frontend-Backend Communication

**Endpoint Called**: `POST https://expertchatbots-backend.onrender.com/debate`

**When**: Triggered when user submits the debate form

**Request Payload**:
```json
{
  "topic": "AI in education",
  "expert1": "Einstein",
  "expert2": "Curie",
  "turns": 4
}
```

**Expected Response**:
```json
{
  "topic": "AI in education",
  "expert1": "Einstein",
  "expert2": "Curie",
  "exchanges": [
    {
      "speaker": "Einstein",
      "statement": "I've spent considerable time...",
      "turn": 1
    },
    {
      "speaker": "Curie",
      "statement": "That's a compelling perspective...",
      "turn": 1
    }
  ],
  "total_turns": 4,
  "figure": {
    "type": "bar",
    "labels": ["Baseline", "Improved"],
    "values": [66, 86]
  }
}
```

**What Frontend Does With Response**:
- Parses `exchanges` array
- For each exchange, creates a message div
- Assigns message to correct expert panel based on `speaker` field
- Animates messages appearing sequentially with delays
- Handles errors with user-friendly alerts

### How to Run Frontend Locally

```bash
# Navigate to project directory
cd expertchatbots.github.io

# Start a local server (option 1: Python)
python3 -m http.server 8000

# Or (option 2: Node.js)
npx serve

# Open browser
# Visit: http://localhost:8000
```

### Security Note
The frontend **does not** contain any API keys or secrets. All sensitive credentials are stored securely on the backend.

---

##  Backend

### Description
A Flask REST API that generates AI-powered conversations between experts using OpenAI's GPT-4o-mini model. The backend handles all AI requests, prompt engineering, and conversation flow logic.

### Technology Stack
- **Framework**: Flask
- **CORS**: Flask-CORS (allows frontend to make cross-origin requests)
- **AI Provider**: OpenAI API (GPT-4o-mini)
- **Environment**: Python 3.x
- **Dependencies**: `openai`, `flask`, `flask-cors`, `python-dotenv`

### API Endpoints

#### 1. **GET /**
- **Purpose**: Health check endpoint
- **Parameters**: None
- **Returns**: 
  ```json
  {
    "message": "Expert Chatbots Backend Running"
  }
  ```
- **Status Code**: 200

#### 2. **POST /debate**
- **Purpose**: Generate a multi-turn conversation between two experts on a given topic
- **Content-Type**: `application/json`
- **Parameters**:
  | Parameter | Type | Required | Default | Description |
  |-----------|------|----------|---------|-------------|
  | `topic` | string | Yes | - | The subject of the conversation |
  | `expert1` | string | Yes | - | Name of the first expert |
  | `expert2` | string | Yes | - | Name of the second expert |
  | `turns` | integer | No | 4 | Number of back-and-forth exchanges |

- **Request Example**:
  ```json
  {
    "topic": "quantum mechanics",
    "expert1": "Einstein",
    "expert2": "Bohr",
    "turns": 4
  }
  ```

- **Success Response** (200):
  ```json
  {
    "topic": "quantum mechanics",
    "expert1": "Einstein",
    "expert2": "Bohr",
    "exchanges": [
      {
        "speaker": "Einstein",
        "statement": "From my perspective on quantum theory...",
        "turn": 1
      },
      {
        "speaker": "Bohr",
        "statement": "I appreciate your viewpoint, but...",
        "turn": 1
      }
    ],
    "total_turns": 4,
    "figure": {
      "type": "bar",
      "labels": ["Baseline", "Improved"],
      "values": [72, 89]
    }
  }
  ```

- **Error Response** (400):
  ```json
  {
    "error": "Missing topic or expert names"
  }
  ```

### How It Works

1. **Request Validation**: Checks that topic, expert1, and expert2 are provided
2. **API Key Selection**: Tries primary OpenAI API key, falls back to secondary if needed
3. **Conversation Generation**:
   - For each turn, generates expert1's response, then expert2's response
   - Each response is 4-6 sentences and contextually aware of previous messages
   - Uses temperature of 0.9 for creative, authentic responses
   - Max 250 tokens per response
4. **Voice Matching**: AI is prompted to match each expert's authentic speaking style, vocabulary, and intellectual approach
5. **Context Building**: Maintains conversation history so experts respond to each other
6. **Fallback**: If API calls fail, returns mock conversation data

### Environment Setup

#### Required Environment Variables

Create a `.env` file in the backend directory:

```bash
# Primary OpenAI API Key (required)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Secondary OpenAI API Key (optional fallback)
OPENAI_API_KEY_SECOND=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/nabilasharif22/expertchatbots.github.io.git
cd expertchatbots.github.io

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install flask flask-cors openai python-dotenv

# 4. Create .env file
touch .env
# Add your OpenAI API keys to .env (see above)

# 5. Run the backend
python app.py
```

The backend will start on `http://127.0.0.1:5000`

#### Testing the Backend

```bash
# Test health check
curl http://127.0.0.1:5000/

# Test debate endpoint
curl -X POST http://127.0.0.1:5000/debate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "artificial intelligence",
    "expert1": "Turing",
    "expert2": "Lovelace",
    "turns": 2
  }'
```

### Authentication & Security

#### How API Keys Are Handled

 **Secure Practices**:
- API keys are stored in `.env` file on the backend server only
- `.env` file is added to `.gitignore` (never committed to version control)
- Frontend makes requests to backend API, never directly to OpenAI
- Backend acts as a secure proxy between frontend and OpenAI
- CORS is configured to allow requests from authorized origins only

 **What NOT to Do**:
- Never put API keys in frontend JavaScript
- Never commit `.env` file to Git
- Never hardcode API keys in source code

#### Deployment Environment Variables (Render)

When deploying to Render:
1. Go to your Render service dashboard
2. Navigate to "Environment" section
3. Add environment variables:
   - `OPENAI_API_KEY`: Your primary OpenAI API key
   - `OPENAI_API_KEY_SECOND`: (Optional) Your secondary API key

#### API Key Fallback Logic

```python
# Backend tries each API key in order
llm_clients = [
    OpenAI(api_key=os.getenv("OPENAI_API_KEY")),        # Primary
    OpenAI(api_key=os.getenv("OPENAI_API_KEY_SECOND"))  # Fallback
]

# If both fail, returns mock data instead of crashing
```

### Production Deployment

**Current Deployment**: https://expertchatbots-backend.onrender.com

**Deployment Platform**: Render

**Deploy New Version**:
1. Push changes to your backend repository
2. Render automatically detects changes and redeploys
3. Or manually trigger deploy from Render dashboard

### Dependencies

```
flask==3.0.0
flask-cors==4.0.0
openai==1.12.0
python-dotenv==1.0.0
```

---

## Quick Start (Full Stack)

### Frontend Only
```bash
cd expertchatbots.github.io
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Backend + Frontend (Local Development)
```bash
# Terminal 1: Start backend
cd expertchatbots.github.io
python app.py  # Runs on port 5000

# Terminal 2: Start frontend
python3 -m http.server 8000

# Update script.js to use local backend:
# const BACKEND_URL = 'http://127.0.0.1:5000/debate';
```





