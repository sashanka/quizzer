# Quizzer

Quizzer is a web application that leverages Google's Gemini Pro AI to automatically generate Google Forms quizzes from uploaded source materials (PDFs, text files, etc.).

## Features

-   **AI-Powered Generation**: Uses Gemini Pro to analyze content and generate relevant quiz questions.
-   **Google Forms Integration**: Automatically creates formatted Google Forms with the generated questions.
-   **Source Material Support**: Upload PDFs or text documents as context for the quiz.
-   **Customizable**: Configure quiz difficulty, question count, and strict formatting rules.
-   **Modern UI**: Clean, responsive interface built with React and Tailwind CSS.

## Project Structure

This is a monorepo containing both the client and server applications:

-   `client/`: React frontend application (Vite + Tailwind CSS)
-   `server/`: Node.js/Express backend application

## getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   A Google Cloud Project with Gemini API and Google Forms API enabled.
-   Google Cloud OAuth credentials.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/quizzer.git
    cd quizzer
    ```

2.  **Setup Server:**
    ```bash
    cd server
    npm install
    cp .env.example .env
    ```
    *Edit `server/.env` with your API keys and credentials.*

### Configuration (.env)

You must configure the following variables in `server/.env` for the application to work:

```ini
PORT=3000

# Gemini API Key (Get from Google AI Studio: https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth Credentials (Get from Google Cloud Console: https://console.cloud.google.com/)
# Required for Google Forms API access
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

3.  **Setup Client:**
    ```bash
    cd ../client
    npm install
    ```

### Running the Application

1.  **Start the Server:**
    ```bash
    cd server
    npm run dev
    ```

2.  **Start the Client:**
    ```bash
    cd client
    npm run dev
    ```

3.  Open http://localhost:5173 to view the app.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
