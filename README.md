# Has the AI Bubble Popped Yet?

A simple, responsive website that answers the important question: Has the AI bubble popped yet?

## Deploying to Cloudflare Pages (Free)

### Option 1: Direct Upload (Easiest)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** in the left sidebar
3. Click **Create application** > **Pages** > **Upload assets**
4. Drag and drop the `index.html` file
5. Click **Deploy site**
6. Once deployed, go to **Custom domains** and add `hastheaibubblepoppedyet.com`

### Option 2: GitHub Integration (Recommended)

1. Create a new GitHub repository for this project
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
3. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
4. Navigate to **Workers & Pages**
5. Click **Create application** > **Pages** > **Connect to Git**
6. Select your repository
7. Configure build settings:
   - **Build command**: (leave empty)
   - **Build output directory**: `/`
8. Click **Save and Deploy**
9. Once deployed, go to **Custom domains** and add `hastheaibubblepoppedyet.com`

## Features

- Fully responsive design that works on all devices (mobile, tablet, desktop)
- Clean, minimalist aesthetic
- Smooth animations
- No build process required - just a single HTML file
- Free hosting on Cloudflare Pages

## Future Updates

When you want to change the answer (if the bubble pops), just edit the `<div class="answer">` text in `index.html` and redeploy.
