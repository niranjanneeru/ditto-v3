# SynapseAI Dashboard

A modern React-based SalesAI dashboard with real-time voice assistant capabilities, lead management, and comprehensive analytics.

## 🚀 Features

### 📊 Sales Dashboard
- **Key Performance Indicators (KPIs)**: Real-time metrics with Lucide React icons
- **Recent Campaigns**: Campaign management and tracking
- **Quick Actions**: Import leads, start voice sessions, and more
- **Performance Overview**: Interactive charts using MUI LineChart
- **Black & White Minimalistic Design**: Clean, professional UI theme

### 🎤 Voice Assistant
- **LiveKit Integration**: Real-time audio communication with AI agents
- **Google Meet-style Controls**: Mute/unmute and end call functionality
- **Audio Visualizations**: 
  - Horizontal wave visualizer with microphone icon
  - Amorphous blob animation responding to audio levels
  - Circular wave visualizer with dynamic bars
- **Session Management**: Elegant session interface with live timer
- **Event Handling**: Success notifications for email events

### 📈 Lead Management
- **XLSX File Upload**: Bulk lead import functionality
- **Multi-channel Messaging**: Support for WhatsApp, Email, and SMS
- **API Integration**: RESTful endpoints for lead processing
- **Success Feedback**: Toast notifications and animations

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Real-time Communication**: LiveKit Client
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: MUI X Charts
- **File Processing**: XLSX library
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ditto-v3/fe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `fe` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_LIVEKIT_URL=ws://localhost:7880
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
fe/src/
├── api/                    # API utilities and calls
├── components/             # Reusable UI components
├── constants/              # Application constants
├── pages/                  # Page components
│   ├── home/              # SalesAI dashboard
│   ├── voice-assistant/   # Voice communication
│   └── import-leads/      # Lead management
├── routes/                 # Routing configuration
└── utils/                  # Utility functions
```

### Key Components

#### Voice Assistant Features
- **Audio Analysis**: Real-time audio level detection
- **Visualizers**: Multiple audio-responsive animations
- **Session Management**: Room creation and connection handling
- **Event System**: Backend event subscription and handling

#### Dashboard Features
- **KPI Cards**: Performance metrics with icons
- **Campaign Management**: Recent campaigns display
- **Quick Actions**: Common task shortcuts
- **Analytics**: Performance charts and data visualization

#### Lead Management
- **File Upload**: XLSX parsing and validation
- **Message Composition**: Multi-channel message creation
- **API Integration**: Bulk operations and messaging

## 🌐 API Endpoints

### Room Management
- `POST /api/v1/rooms` - Create new voice session room

### Lead Management
- `POST /api/v1/leads/bulk-insert` - Bulk import leads from XLSX
- `POST /api/v1/leads/{channel}` - Send messages via specific channel

## 🎨 Design System

### Color Scheme
- **Primary**: Black and white theme
- **Accents**: Grayscale variations
- **Success**: Green for positive feedback
- **Error**: Red for error states

### Typography
- **Primary Font**: IBM Plex Serif
- **Icons**: Lucide React icon set

### Animations
- **Page Transitions**: Framer Motion
- **Audio Visualizations**: Custom CSS animations
- **Success Reactions**: Google Meet-style celebrations

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |
| `VITE_LIVEKIT_URL` | LiveKit WebSocket URL | `ws://localhost:7880` |

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please refer to the project documentation or create an issue in the repository.
