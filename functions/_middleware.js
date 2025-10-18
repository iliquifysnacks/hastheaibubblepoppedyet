// Cloudflare Pages Functions with D1 integration
// API endpoints for AI bubble predictions

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // API Routes
  if (url.pathname === '/api/predictions' && request.method === 'POST') {
    return handleSubmitPrediction(request, env, corsHeaders);
  }

  if (url.pathname === '/api/predictions/average' && request.method === 'GET') {
    return handleGetAverage(env, corsHeaders);
  }

  if (url.pathname === '/api/predictions/stats' && request.method === 'GET') {
    return handleGetStats(env, corsHeaders);
  }

  // Pass through to next middleware/static files
  return context.next();
}

// Submit a new prediction
async function handleSubmitPrediction(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { username, daysUntilPop } = body;

    // Validation
    if (!daysUntilPop || daysUntilPop < 1 || daysUntilPop > 36500) {
      return new Response(JSON.stringify({ error: 'Invalid days value (1-36500)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for duplicate username (if username is provided)
    if (username && username.trim() !== '') {
      const existingUser = await env.DB.prepare(
        'SELECT id FROM predictions WHERE username = ? AND username IS NOT NULL'
      )
        .bind(username.trim())
        .first();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'This username has already submitted a prediction' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Calculate dates
    const submittedAt = new Date().toISOString();
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + parseInt(daysUntilPop));

    // Insert into database
    const trimmedUsername = username && username.trim() !== '' ? username.trim() : null;
    const result = await env.DB.prepare(
      'INSERT INTO predictions (username, days_until_pop, submitted_at, predicted_date) VALUES (?, ?, ?, ?)'
    )
      .bind(
        trimmedUsername,
        daysUntilPop,
        submittedAt,
        predictedDate.toISOString()
      )
      .run();

    // Get the average after insertion
    const avgResult = await env.DB.prepare(
      'SELECT AVG(days_until_pop) as avg_days, COUNT(*) as total_predictions FROM predictions'
    ).first();

    const avgDate = new Date();
    avgDate.setDate(avgDate.getDate() + Math.round(avgResult.avg_days));

    return new Response(
      JSON.stringify({
        success: true,
        averageDate: avgDate.toISOString(),
        averageDays: Math.round(avgResult.avg_days),
        totalPredictions: avgResult.total_predictions,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error submitting prediction:', error);
    return new Response(JSON.stringify({ error: 'Failed to submit prediction' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Get average prediction
async function handleGetAverage(env, corsHeaders) {
  try {
    const result = await env.DB.prepare(
      'SELECT AVG(days_until_pop) as avg_days, COUNT(*) as total_predictions FROM predictions'
    ).first();

    if (!result || result.total_predictions === 0) {
      return new Response(
        JSON.stringify({
          averageDate: null,
          averageDays: null,
          totalPredictions: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const avgDate = new Date();
    avgDate.setDate(avgDate.getDate() + Math.round(result.avg_days));

    return new Response(
      JSON.stringify({
        averageDate: avgDate.toISOString(),
        averageDays: Math.round(result.avg_days),
        totalPredictions: result.total_predictions,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error getting average:', error);
    return new Response(JSON.stringify({ error: 'Failed to get average' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Get statistics
async function handleGetStats(env, corsHeaders) {
  try {
    const stats = await env.DB.prepare(
      `SELECT
        COUNT(*) as total_predictions,
        AVG(days_until_pop) as avg_days,
        MIN(days_until_pop) as min_days,
        MAX(days_until_pop) as max_days
      FROM predictions`
    ).first();

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return new Response(JSON.stringify({ error: 'Failed to get stats' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
