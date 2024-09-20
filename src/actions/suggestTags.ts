"use server"

export const suggestTags = async (freestyle: string, tags: string[], openAPIKey: string, useCredits: boolean, credits: number) => {
    try {
        if (useCredits && credits < 1) {
            throw new Error("Not enough credits to suggest a tag. Please purchase credits or use your own API Keys.")
        }

        const url = 'https://api.openai.com/v1/chat/completions';

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${useCredits ? process.env.OPENAI_API_KEY : openAPIKey}`,
        };

        const data = {
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'For all response reply just the answer without giving any description.' },
                { role: 'user', content: `Using this image created with the prompt: ${freestyle}\n\nSuggest tags for the image. It shouldn't be from this list: ${tags}. Please list the tags in this format: separate all tags with commas, that's it, nothing else, and don't use a full stop at the end. Provide only suggest 5, no explanation.\n\n` }
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
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        return result.choices[0].message.content;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error suggesting tags:", error);
        return { error: errorMessage };
    }
}