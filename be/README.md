# Ditto V3 Backend - AI Cold Outreach Agent

A sophisticated AI-powered cold outreach and lead generation platform built with **LangGraph**, **LiveKit**, and **FastAPI**. This backend provides an intelligent conversational agent that helps users research prospects, draft personalized emails, and execute cold outreach campaigns through voice and chat interactions.

## 🚀 **Key Features**

### **🤖 LangGraph AI Agent**
- **Multi-modal interaction** via voice and chat through LiveKit
- **Intelligent workflow routing** with LLM-based intent detection
- **Human-in-the-loop confirmation** for email sending
- **LinkedIn prospect research** with comprehensive data enrichment
- **Email drafting and sending** via Siren API integration

### **🔧 Core Capabilities**
- **LinkedIn Profile Search** - Find prospects by name, company, location
- **Contact Information Extraction** - Get email addresses from LinkedIn profiles
- **Personalized Email Generation** - AI-drafted outreach messages
- **Email Campaign Execution** - Direct sending via Siren messaging platform
- **Real-time Voice Interaction** - Natural conversation flow with AI agent
- **Workflow State Management** - Persistent conversation context and routing

## 🏗️ **Architecture Overview**

### **LangGraph Workflow Structure**
```
START → agent ──────────────────┐
         ├─── tools ──→ agent   │
         ├─── draft_email       │
         ├─── send_email        │
         └─── END ──────────────┤
                 │              │
         draft_email            │
                 ↓              │
         confirm_email          │
                 ↓              │
             output ←───────────┘
                 ↓
               END
```

### **Key Components**

#### **Agent Node** (`app/core/agent/graph.py`)
- **LLM**: OpenAI GPT-4o-mini for intelligent responses
- **Intent Detection**: Analyzes conversation context to route workflow
- **Tool Integration**: Seamless LinkedIn and Siren API access

#### **LinkedIn Tools** (`app/core/graphs/tools/linkedin/`)
- `search_people` - LinkedIn profile search
- `get_email_from_profile` - Contact information extraction
- **Tool Registry**: Centralized tool management and registration

#### **Email Workflow**
- **Draft Node**: AI-generated personalized emails
- **Confirmation Node**: Human approval with email preview
- **Send Node**: Siren API integration for email delivery

#### **LiveKit Integration** (`app/core/agent/worker.py`)
- **Voice-to-text processing** with Deepgram
- **Text-to-speech synthesis** with Cartesia
- **Real-time conversation management**
- **Room-based session handling**

## 🛠️ **Technology Stack**

- **🐍 FastAPI** - High-performance web framework
- **🧠 LangGraph** - Advanced workflow orchestration
- **🎯 LangChain** - LLM application framework
- **🎙️ LiveKit** - Real-time audio/video infrastructure
- **🔍 LinkedIn/Lix API** - Prospect research and data enrichment
- **📧 Siren API** - Email messaging and delivery

## 📋 **Prerequisites**

- **Python 3.11+**
- **Poetry** for dependency management
- **ngrok** for webhook tunneling (development)
- **API Keys** for external services

## ⚙️ **Environment Variables**

Create a `.env` file in the root directory:


## 🚀 **Quick Start**

### **Installation & Setup**
```bash
# Clone repository
git clone <repository-url>
cd be

# Install dependencies
poetry lock && poetry install --no-root

# Download required files (one time only)
poetry run python -m app.core.agent.worker download-files

# Copy environment template and configure
cp env_sample .env
# Edit .env with your API keys

# Start the voice agent worker
poetry run python -m app.core.agent.worker start

# Start the FastAPI server
python -m app.main
```

### **API Documentation**
Visit `http://localhost:8000/docs` for interactive API documentation.


### **Agent Endpoints**
- **Voice Agent**: Accessible via LiveKit room connections
- **Chat Interface**: Real-time conversational AI
- **Workflow Management**: Automatic state persistence


### **Intent Detection**
```python
# LLM analyzes conversation for user intent:
"draft_email"  # Email creation requests
"send_email"   # Direct email sending  
"tools"        # LinkedIn research/search
"end"          # Conversation termination
```

### **Available Tools**
```python
# LinkedIn Integration
search_people(query, location, company)
get_email_from_profile(linkedin_url)

# Email Integration  
SirenClient.message.send(to, subject, body)
```

### **Human-in-the-Loop Confirmation**
```python
# Email preview and approval flow:
draft_email → confirm_email → send_email
              ↓
           user_approval
```

## 🔧 **Development**

### **Code Structure**
```
app/
├── core/
│   ├── agent/
│   │   ├── graph.py      # LangGraph workflow
│   │   └── worker.py     # LiveKit integration
│   ├── graphs/tools/
│   │   ├── linkedin/     # LinkedIn API tools
│   │   └── siren/        # Email sending tools
│   └── config.py         # Configuration management
├── api/
│   └── v1/endpoints/     # FastAPI routes
└── main.py               # Application entry point
```

### **Key Files**
- **`graph.py`** - Main LangGraph workflow implementation
- **`worker.py`** - LiveKit voice agent integration  
- **`tool_registry.py`** - Centralized tool management
- **`config.py`** - Environment and settings configuration

## 🌐 **Running the Application**

The application consists of two components that need to be running:

1. **Voice Agent Worker**: `poetry run python -m app.core.agent.worker start`
2. **FastAPI Server**: `python -m app.main`

Both commands should be run in separate terminal sessions.

## 🎤 **Voice Agent Usage**

### **Starting a Session**
1. **Connect to LiveKit room** via client application
2. **Agent auto-joins** and introduces capabilities
3. **Voice interaction** begins automatically
4. **Workflow routing** based on user requests

### **Example Interactions**
```
User: "Find John Doe at TechCorp"
Agent: [Uses LinkedIn tools] → Returns profile information

User: "Draft an email to john.doe@techcorp.com"  
Agent: [Creates personalized email] → Shows preview

User: "Send it"
Agent: [Human confirmation] → Sends via Siren API
```
