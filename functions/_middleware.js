// Cloudflare Pages Functions with D1 integration
// API endpoints for AI bubble predictions

const MAX_USERNAME_LENGTH = 50;
const MAX_REQUEST_SIZE = 1024; // 1KB

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // CORS headers - restrict to your domain in production
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // TODO: Change to 'https://hastheaibubblepoppedyet.com' in production
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

// Hash IP address for rate limiting
async function hashIP(ip) {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Submit a new prediction
async function handleSubmitPrediction(request, env, corsHeaders) {
  try {
    // Content-Type validation
    const contentType = request.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Invalid content type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Request size limit
    const contentLength = request.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return new Response(JSON.stringify({ error: 'Request too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { username, daysUntilPop } = body;

    // Input validation
    if (typeof daysUntilPop !== 'number' || !Number.isInteger(daysUntilPop)) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (daysUntilPop < 1 || daysUntilPop > 36500) {
      return new Response(JSON.stringify({ error: 'Invalid days value' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Username validation
    if (username !== undefined && username !== null) {
      if (typeof username !== 'string') {
        return new Response(JSON.stringify({ error: 'Invalid input' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (username.trim().length > MAX_USERNAME_LENGTH) {
        return new Response(JSON.stringify({ error: 'Username too long' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Get and hash client IP for rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ipHash = await hashIP(clientIP);

    // Rate limiting: Check if IP has submitted in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentSubmission = await env.DB.prepare(
      'SELECT id FROM predictions WHERE ip_hash = ? AND submitted_at > ?'
    )
      .bind(ipHash, fiveMinutesAgo)
      .first();

    if (recentSubmission) {
      return new Response(
        JSON.stringify({ error: 'Please wait before submitting again' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check for duplicate username (case-insensitive)
    const trimmedUsername = username && username.trim() !== '' ? username.trim() : null;
    if (trimmedUsername) {
      const existingUser = await env.DB.prepare(
        'SELECT id FROM predictions WHERE LOWER(username) = LOWER(?) AND username IS NOT NULL'
      )
        .bind(trimmedUsername)
        .first();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'Username already taken' }),
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

    // Insert into database with IP hash
    const result = await env.DB.prepare(
      'INSERT INTO predictions (username, days_until_pop, submitted_at, predicted_date, ip_hash) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(
        trimmedUsername,
        daysUntilPop,
        submittedAt,
        predictedDate.toISOString(),
        ipHash
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
    // Don't leak error details to client
    return new Response(JSON.stringify({ error: 'Server error' }), {
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
