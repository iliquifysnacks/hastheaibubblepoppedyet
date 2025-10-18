# Has the AI Bubble Popped Yet?

A simple, responsive website that answers the important question: Has the AI bubble popped yet?

Now with community predictions powered by Cloudflare D1!

## Setting Up the Database

Before deploying, you need to create the D1 database:

1. Install Wrangler CLI (if not already installed):
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Create the D1 database:
   ```bash
   wrangler d1 create bubble-predictions
   ```

4. Copy the `database_id` from the output and update it in `wrangler.toml`

5. Initialize the database schema:
   ```bash
   wrangler d1 execute bubble-predictions --file=./schema/schema.sql
   ```

## Deploying to Cloudflare Pages (Free)

### GitHub Integration (Recommended)

1. Push your code to GitHub (if not already done)

2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)

3. Navigate to **Workers & Pages**

4. Click **Create application** > **Pages** > **Connect to Git**

5. Select your repository

6. Configure build settings:
   - **Build command**: (leave empty)
   - **Build output directory**: `/`

7. Click **Save and Deploy**

8. After deployment, bind the D1 database:
   - Go to your Pages project settings
   - Click **Functions**
   - Scroll to **D1 database bindings**
   - Add binding: Variable name: `DB`, D1 database: `bubble-predictions`
   - Click **Save**

9. Go to **Custom domains** and add `hastheaibubblepoppedyet.com`

10. Redeploy to apply the D1 binding

## Features

- Fully responsive design that works on all devices (mobile, tablet, desktop)
- Clean, minimalist aesthetic with smooth animations
- Community predictions feature:
  - Users can submit their prediction for when the bubble will pop
  - Calculates and displays the average prediction date
  - Optional username for recognition when predictions come true
  - Stores submission date to calculate accurate predictions over time
- Powered by Cloudflare D1 (free SQL database)
- Free hosting on Cloudflare Pages with Cloudflare Functions

## How Predictions Work

1. Users enter the number of days they think it will take for the AI bubble to pop
2. Optionally, they can enter a username for recognition
3. The submission date is stored along with the prediction
4. The predicted date is calculated as: `submission_date + days_until_pop`
5. The average predicted date is shown based on all submissions
6. This ensures predictions remain accurate even as time passes (it won't always say "+4 weeks from now")

## Development

To regenerate the OG image:
```bash
npm install
npm run generate-og
```

## Future Updates

When the bubble actually pops:
1. Edit the `<div class="answer">` text in `index.html` from "No" to "Yes"
2. Optionally display the users who predicted correctly (query DB for predictions close to the current date)
3. Redeploy
