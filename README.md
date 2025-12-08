# Mimino Editor

An AI-powered image editor using Google's Gemini 2.5 Flash Image model.

## Local Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment:**
    Create a `.env` file in the root directory:
    ```
    API_KEY=your_google_ai_api_key_here
    ```

3.  **Run:**
    ```bash
    npm run dev
    ```

## Deploy to Vercel

1.  Push this project to a GitHub repository.
2.  Import the repository into Vercel.
3.  Vercel will automatically detect the Vite settings.
4.  **Crucial Step:** In the Vercel project settings, go to **Environment Variables** and add a new variable named `API_KEY` with your actual Google Gemini API key.
5.  Deploy!
