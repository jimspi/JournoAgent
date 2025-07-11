// /api/ai-convert.js
// Vercel serverless function for OpenAI API integration

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, content } = req.body;

    // Validate input
    if (!prompt || !content) {
      return res.status(400).json({ error: 'Missing prompt or content' });
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Make request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview', // You can also use 'gpt-3.5-turbo' for lower cost
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\n${content}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.3, // Lower temperature for more consistent journalism output
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    // Check if OpenAI API request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return res.status(response.status).json({ 
        error: `OpenAI API Error: ${errorData.error?.message || 'Unknown error'}` 
      });
    }

    const data = await response.json();

    // Extract the generated text
    const result = data.choices[0]?.message?.content;

    if (!result) {
      return res.status(500).json({ error: 'No response generated' });
    }

    // Return the result
    return res.status(200).json({ result: result.trim() });

  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error. Please try again.' 
    });
  }
}
