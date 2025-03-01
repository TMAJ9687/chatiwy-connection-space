
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b90804d5-3ea3-4a3c-99e8-2272dd0dc1d8

## Deploying the WebSocket Server to Render.com

To get the real-time chat functionality working, you need to deploy the WebSocket server to Render.com:

1. Create a new Web Service on Render.com
2. Connect your GitHub repository or use the Render Git integration
3. Configure your service as follows:
   - **Name**: chatiwy-server (or any name you prefer)
   - **Environment**: Node
   - **Root Directory**: server
   - **Build Command**: `yarn install` or `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

4. After deployment, copy the URL of your Render service (e.g., https://your-chatiwy-server.onrender.com)
5. In your React app, update the `SERVER_URLS` array in the `src/services/socketService.ts` file with your Render URL

**Note**: The free tier of Render.com will spin down after periods of inactivity, which may cause some delay when connecting to the WebSocket server after it's been inactive.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b90804d5-3ea3-4a3c-99e8-2272dd0dc1d8) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b90804d5-3ea3-4a3c-99e8-2272dd0dc1d8) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
