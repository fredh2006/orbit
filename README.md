# Orbit - Social Network Simulation 

**Orbit** is an innovative platform that simulates how content spreads through social networks by creating AI-powered personas, predicting their reactions, and visualizing the results as an interactive 3D constellation. The name "Orbit" reflects how ideas, content, and influence travel through social networks—like celestial bodies in orbit, personas influence each other through gravitational social connections.

## What Does Orbit Do?

Orbit helps you understand how your content will perform on social media **before you post it**. Here's how:

### 1. **Video Analysis**
Upload a video and Orbit's AI analyzes the content—understanding themes, messaging, tone, and visual elements.

### 2. **Persona Generation & Reaction Simulation**
- Creates hundreds of realistic AI personas representing your target audience (age, location, interests, occupation, etc.)
- Each persona independently evaluates the video and decides whether to view, like, comment, or share
- Personas make decisions based on their unique characteristics, preferences, and behavioral patterns

### 3. **Social Network Simulation**
- Generates a dynamic social network graph showing how personas are connected
- Simulates real social dynamics: influence, peer pressure, and viral spread
- Tracks how content propagates through the network as personas share with their connections
- Models second-order reactions where personas change their behavior based on their friends' actions

### 4. **3D Constellation Visualization**
- Visualizes the entire social network as an **interactive 3D constellation**
- Each persona appears as a "star" in the network sky:
  - **Brightest stars** = High engagement (shared the content)
  - **Bright stars** = Medium engagement (liked/commented)
  - **Dim stars** = Low engagement (viewed only)
- Connection lines show the social network structure
- Golden lines highlight active viral propagation paths
- Navigate the constellation to explore individual personas and their reactions

### 5. **Metrics & Insights**
Get actionable data:
- Predicted engagement rate
- Total views, likes, shares, comments
- Social influence percentage (how many personas were influenced by their network)
- Interaction chains showing how content spreads virally
- Individual persona reasoning for their decisions

## Why "Orbit"?

The constellation metaphor represents how content and influence orbit through social networks. Just like celestial mechanics:
- **Stars** (personas) have different brightness based on their engagement
- **Gravity** (social connections) pulls personas together into clusters
- **Orbital paths** (interaction chains) show how ideas travel through the network
- **Constellations** (communities) form patterns based on shared interests and connections

When you enter the network visualization, you experience a cinematic zoom from seeing the entire universe of personas down to individual stars, mimicking how content starts with a single post and orbits through an entire social network.

## Architecture Overview

Orbit is built with two main components that work together:

### Backend (Python + FastAPI)
The backend powers the AI simulation engine using a **LangGraph pipeline** with 6 sequential nodes:

**Node 1: Video Analysis**
- Uses Google Gemini AI to analyze video content
- Extracts themes, messaging, tone, visual elements
- Categorizes content type (fashion, tech, comedy, etc.)

**Node 2: Initial Reactions (Parallel Processing)**
- Loads platform-specific personas (Instagram, TikTok, Twitter, YouTube)
- Each persona independently evaluates the video using AI
- Generates realistic reactions with reasoning
- Processes 500+ personas in parallel for speed

**Node 2.5: Social Network Generation**
- Dynamically creates connections between personas
- Forms realistic clusters based on shared interests and demographics
- Identifies influence hubs (highly connected personas)
- Builds graph structure for visualization

**Node 3: Interaction Simulation**
- Simulates viral spread through the network
- Models sharing behavior and content propagation
- Tracks influence chains (A shares → B sees → B shares → C sees, etc.)
- Generates interaction events with timestamps

**Node 4: Second Reactions (Social Influence)**
- Re-evaluates persona reactions after seeing their friends' behavior
- Models social proof and peer pressure effects
- Detects changed reactions due to social influence
- Processes reactions in parallel

**Node 5: Results Compilation**
- Aggregates all metrics and data
- Calculates engagement rates and social influence percentages
- Prepares visualization data structures
- Saves comprehensive JSON results

**Tech Stack:**
- FastAPI for REST API
- LangGraph for stateful AI pipeline orchestration
- Google Gemini AI for video analysis and persona simulation
- Async/parallel processing for scalability

### Frontend (Next.js + React + Three.js)
The frontend creates the immersive 3D constellation experience:

**Visualization Engine:**
- Uses **3D Force Graph** library built on Three.js
- Renders network as an interactive 3D space
- Real-time physics simulation for natural node positioning
- Smooth camera controls (rotate, zoom, pan)

**Constellation Design:**
- **Stars** = Personas (nodes) sized and colored by engagement level
- **Constellation lines** = Social network connections (faint blue, ethereal)
- **Golden connections** = Active viral propagation paths (glowing amber)
- **Background stars** = Procedurally generated star field for depth
- **Space theme** = Deep night sky background (#000814)

**Cinematic Entrance:**
- Starts at high elevation (800 units) at 135° angle
- Camera positioned 3000 units away (zoomed out view)
- Smooth 3.5-second spiral animation zooming to 300 units
- Creates dramatic "diving into the constellation" effect
- Animation preserves user controls after completion

**Interactive Features:**
- **Hover**: Quick persona info tooltip
- **Click**: Full persona detail modal with demographics and reaction reasoning
- **Chat**: Interactive chat with AI personas about their decisions
- **Stats Panel**: Real-time network metrics (total stars, connections, interactions, engagement %)
- **Legend**: Visual guide to star types and connection meanings

**Tech Stack:**
- Next.js 16 (App Router)
- React 19 with TypeScript
- Three.js + 3D Force Graph
- Tailwind CSS 4 for UI
- Lucide React for icons

## Project Structure

```
orbit/
├── backend/                    # AI simulation engine
│   ├── app/
│   │   ├── api/               # FastAPI routes
│   │   ├── graph/             # LangGraph pipeline nodes
│   │   ├── models/            # Data models
│   │   ├── services/          # Business logic
│   │   └── data/
│   │       └── personas/      # Platform-specific persona datasets
│   ├── test_results/          # Simulation output (JSON)
│   ├── videos/                # Test video uploads
│   ├── test_pipeline.py       # Standalone pipeline test script
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # API keys (GEMINI_API_KEY)
│
├── frontend/                  # 3D visualization interface
│   ├── app/
│   │   ├── components/
│   │   │   ├── ChatModal.tsx           # Persona chat interface
│   │   │   ├── PersonaDetailModal.tsx  # Persona details popup
│   │   │   └── OrbitLoadingTransition.tsx
│   │   ├── network/
│   │   │   ├── NetworkVisualization.tsx  # Main 3D graph component
│   │   │   └── page.tsx                  # Network page route
│   │   └── page.tsx           # Home page
│   ├── public/                # Static assets
│   └── package.json           # Node dependencies
│
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **Python** 3.8+
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Backend Setup

1. Navigate to backend:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment:
```bash
cp .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key_here
```

5. Run a test simulation:
```bash
# Quick test with 5 personas
./run_test.sh test

# Or test with Instagram personas
./run_test.sh instagram
```

6. Start the API server:
```bash
python app/main.py
```

The API will run at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Open browser:
```
http://localhost:3000
```

5. Navigate to the constellation:
```
http://localhost:3000/network
```

## Usage Flow

### 1. Run a Simulation (Backend)

```bash
cd backend
./run_test.sh test
```

This will:
- Analyze a test video
- Generate reactions from 5 AI personas
- Create a social network
- Simulate viral spread
- Save results to `test_results/test_*.json`

### 2. View Results (Frontend)

The frontend automatically fetches the latest test results and visualizes them:

1. Go to `http://localhost:3000/network`
2. Watch the cinematic zoom animation
3. Explore the constellation:
   - **Rotate**: Click + drag
   - **Zoom**: Scroll wheel
   - **Inspect**: Hover over stars
   - **Details**: Click any star
   - **Chat**: Open persona details → "Start Chat"

### 3. Understand the Metrics

**Stats Panel** shows:
- Total Stars (personas in network)
- Connections (social network edges)
- Interactions (viral propagation events)
- Engagement Rate (% of personas who engaged)

**Star Types:**
- ⭐ Large white star = Shared content (highest engagement)
- ✦ Medium gray star = Liked/commented (medium engagement)
- • Small dim star = Viewed only (passive)

**Connection Types:**
- Faint blue lines = Social network connections
- Golden glowing lines = Active viral sharing paths

## API Endpoints

### Get Latest Test Results
```
GET http://localhost:8000/api/v1/test-results/latest
```

Returns the most recent simulation data including:
- All personas and their reactions
- Social network graph structure
- Interaction events and timelines
- Engagement metrics

### Chat with Personas
```
POST http://localhost:8000/api/v1/chat
{
  "test_id": "test_123",
  "persona_id": "persona_001",
  "message": "Why did you share this video?"
}
```

## Development

### Backend Scripts
- `./run_test.sh` - Run pipeline test
- `python test_pipeline.py` - Test with custom video
- `python app/main.py` - Start FastAPI server

### Frontend Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Serve production build
- `npm run lint` - Run linter

## Performance

- **Test platform** (5 personas): ~30-60 seconds
- **Instagram** (3 personas): ~20-45 seconds
- **Full simulation** (500+ personas): ~10-20 minutes

## Learn More

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Three.js Documentation](https://threejs.org/docs/)
- [3D Force Graph](https://github.com/vasturiano/3d-force-graph)

