# # Library Management System

The Library Management System is a comprehensive web application that allows users to manage their personal book collections. It features user authentication, CRUD operations for books, an admin dashboard, and AI-powered analytics using natural language processing.

## Features

### Core Features
- **User Authentication and Authorization**: Secure registration and login system
- **Book Management**: Add, edit, and delete books from your personal library
- **Genre Organization**: Categorize books by genre for easy browsing
- **Reading Status Tracking**: Track books as "reading," "read," "to-read," 
- **User-Specific Libraries**: Each user has their own personal book collection
- **Admin Dashboard**: Full administrative privileges to manage all books and users

### AI-Powered Features
- **Natural Language Query Agent**: Ask questions about your library in plain English
  - "Who owns the most books?"
  - "Can you list all the books I own."
- **Smart Data Insights**: AI-generated summaries and analytics about reading habits
- **Intelligent Recommendations**: Get personalized book suggestions based on your reading history

### AI Integration
- **Ollama** - Local LLM inference
- **Llama 3.1** - Large language model for natural language processing

### Installing Ollama and Llama 3.1

1. Install Ollama from [https://ollama.ai/](https://ollama.ai/)

2. Pull the Llama 3.1 model:
```bash
ollama pull llama3.1
```

3. Verify installation:
```bash
ollama list
```

4. Start Ollama (if not running):
```bash
ollama serve
```

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/MaltineR/PersonalLMS.git
cd PersonalLibrary
```

### 2. Setup the Server (Backend)

Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
OLLAMA_API_URL=http://localhost:11434
NODE_ENV=development
```
Start the server:
```bash
npm start
```
The server will run on `http://localhost:3000`

### 3. Setup the Client (Frontend)

Open a new terminal and navigate to the client directory:
```bash
cd client
```

Install dependencies:
```bash
npm install
```
Start the development server:
```bash
npm run dev
```
The client will run on `http://localhost:5173` (or another port if 5173 is busy)

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

## Screenshots

### Home Page
![Home Page](./screenshots/home.png)

### User Dashboard
![User Dashboard](./screenshots/dashboard.png)

### Book Management
![Book Management](./screenshots/books.png)

### AI Query Agent
![AI Query Agent](./screenshots/ai-query.png)

### Admin Dashboard
![Admin Dashboard](./screenshots/admin.png)

## Testing

Run tests for the backend:
```bash
cd server
npm test
```

Run tests for the frontend:
```bash
cd client
npm test
```

##  Docker Deployment 

Build and run with Docker Compose:
```bash
docker-compose up --build
```
**Note**: Make sure Ollama is running with the Llama 3.1 model before using AI features. If you encounter any issues, please check that all prerequisites are properly installed and configured.