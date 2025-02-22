"use server"

export const optimizePrompt = async (prompt: string, openAPIKey: string) => {
  try {
    const url = 'https://api.openai.com/v1/chat/completions';

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAPIKey}`,
    };

    const data = {
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert at writing prompts for AI image generation. Optimize the given prompt to produce better results. Keep the core idea but enhance it with better descriptive language and relevant artistic details. Return only the optimized prompt without any explanation or quotation marks.' 
        },
        { 
          role: 'user', 
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.choices[0].message.content.trim().replace(/['"]/g, '');

  } catch (error) {
    console.error('Error optimizing prompt:', error);
    throw error;
  }
}; 