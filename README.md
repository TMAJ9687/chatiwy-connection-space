# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b90804d5-3ea3-4a3c-99e8-2272dd0dc1d8

## Deploying the WebSocket Server

### Option 1: Deploy to Render.com (Recommended)

To get the real-time chat functionality working, deploy the WebSocket server to Render.com:

1. Create an account at [Render.com](https://render.com) if you don't have one
2. Create a new Web Service
3. Connect your GitHub repository or use the Render Git integration
4. Configure your service as follows:
   - **Name**: chatiwy-server (or any name you prefer)
   - **Environment**: Node
   - **Root Directory**: server
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free (or paid for better performance)

5. After deployment, your server will be running at a URL like `https://your-service-name.onrender.com`
6. Update the `RENDER_URL` constant in `src/pages/Chat.tsx` with your Render URL

### Option 2: Deploy to DigitalOcean

You can also deploy the WebSocket server to DigitalOcean:

1. Create a new Droplet on DigitalOcean (Node.js App platform or a basic Droplet)
2. SSH into your Droplet and set up Node.js if not already installed:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
3. Clone your repository and navigate to the server directory:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>/server
   ```
4. Install dependencies and start the server:
   ```bash
   npm install
   # Use pm2 for production (install with: npm install -g pm2)
   pm2 start server.js
   ```
5. Set up a firewall to allow traffic on the WebSocket port (default 5000):
   ```bash
   sudo ufw allow 5000
   ```
6. Update the `DIGITAL_OCEAN_URL` constant in `src/pages/Chat.tsx` with your Droplet's IP or domain.
   For example: `const DIGITAL_OCEAN_URL = 'http://your-droplet-ip:5000';`

## Testing Your Deployment

### Step 1: Deploy the WebSocket Server
Follow the instructions above to deploy your WebSocket server to either Render.com or DigitalOcean.

### Step 2: Deploy the Frontend App
1. In Lovable, click the "Share" button in the top-right corner
2. Click "Publish" to deploy your application
3. Use the provided URL to access your deployed app

### Step 3: Verify the Connection
1. Open your deployed app
2. Complete the profile setup
3. Check the browser console for connection messages
4. Try chatting to verify that real-time functionality is working

**Important Notes**:
- The WebSocket server is meant to handle socket connections, not serve HTML pages. If you visit the URL directly in a browser, you'll see a "Cannot GET /" message, which is normal.
- For production use, consider setting up HTTPS for secure WebSocket connections (WSS).
- You can verify your server is running properly by checking the logs in your Render dashboard or using `pm2 logs` on DigitalOcean.

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
