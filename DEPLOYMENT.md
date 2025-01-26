## 🚀 Deploying Lumina on Render

### Step 1: Fork the Repository
1. Go to the Lumina repository: [Lumina Repository](https://github.com/JohnDev19/Lumina-Bot/)
2. Click on the **Fork** button in the top right corner to create a copy of the repository in your GitHub account.

### Step 2: Create a Render Account
1. Visit [Render.com](https://render.com) and sign up for a free account if you don’t have one.

### Step 3: Create a New Web Service
1. After logging in, click on the **New** button in the top right corner.
2. Select **Web Service** from the dropdown menu.

### Step 4: Connect Your Repository
1. Choose the GitHub repository you just forked.
2. Authorize Render to access your GitHub account if prompted.

### Step 5: Configure Your Service
1. **Name**: Enter a name for your service (e.g., `lumina-bot`).
2. **Environment**: Select `Node`.
3. **Branch**: Select the branch you want to deploy (usually `main`).

### Step 6: Set Build and Start Commands
- **Build Command**: 
  ```bash
  npm install
  ```
- **Start Command**: 
  ```bash
  node index.js
  ```

### Step 7: Set Environment Variables (This is optional, if you don't want to create .env file manually
1. Scroll down to the **Environment Variables** section.
2. Add the following variables:
   - TELEGRAM_BOT_TOKEN=your_bot_token_here
   - OWNER_ID=your_owner_id_here
   - URL=https://your_deployment_url_here
   - GROUP_JOIN_NOTIFICATIONS=on
   - UPTIME_URL=https://your_uptime_url_here

### Step 8: Deploy Your Service
1. Click the **Create Web Service** button at the bottom of the page.
2. Render will start building and deploying your service. You can monitor the progress in the dashboard.

### Note
- Render offers a free tier, but be aware of any limitations regarding uptime and resource usage.
- Make sure to check the logs in Render if you encounter any issues during deployment.

-----

Now your Lumina bot should be live and ready to assist you and your users!
