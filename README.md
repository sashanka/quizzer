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

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### How to get API Keys

#### 1. Gemini API Key
1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Click **"Get API key"** in the sidebar.
3.  Click **"Create API key"** and copy the string.
4.  Paste it into `.env` as `GEMINI_API_KEY`.

#### 2. Google OAuth Credentials & Forms API
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Create a new project** (or select an existing one).
3.  **Enable APIs**:
    -   Go to **APIs & Services > Library**.
    -   Search for **"Google Forms API"** and enable it.
    -   Search for **"Google Drive API"** and enable it.
4.  **Configure OAuth Consent Screen**:
    -   Go to **APIs & Services > OAuth consent screen**.
    -   Select **External** (for testing) or **Internal** (if Google Workspace).
    -   Fill in required fields (App name: "Quizzer", User support email, etc.).
    -   Add **Scopes**: `.../auth/forms.body` and `.../auth/drive.file`.
    -   Add **Test Users**: Add your own Google email address so you can log in.
5.  **Create Credentials**:
    -   Go to **APIs & Services > Credentials**.
    -   Click **Create Credentials > OAuth client ID**.
    -   Application type: **Web application**.
    -   Name: "Quizzer Client".
    -   **Authorized redirect URIs**: Add `http://localhost:3000/api/auth/google/callback`.
    -   Click **Create**.
6.  Copy the **Client ID** and **Client Secret** into your `.env` file.

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
