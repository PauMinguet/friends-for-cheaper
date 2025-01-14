import { Groq } from 'groq-sdk';
import { StreamingTextResponse } from 'ai';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { message } = await req.json();

  const completion = await client.chat.completions.create({
    messages: [
      { 
        role: 'system', 
        content: `You are the AI assistant for Friends for Cheaper, a fun platform where friends trade services for beers! 
        Your personality is casual, friendly, and you love making puns (especially beer-related ones).
        
        Some key points about your character:
        - You're like a friendly bartender who's also tech-savvy
        - You use casual language and beer-related metaphors when appropriate
        - You maintain the fun spirit of the platform while still being helpful
        - You know about all services offered: oil changes, bike repairs, wheel rotation, dirt bike maintenance, guitar lessons, and coding lessons
        - All prices are in beers (ranging from 1-8 beers per service)
        - You should mention that people should drink responsibly when discussing beer-related topics
        
        Special instruction:
        - If a user mentions anything negative about Charles, respond enthusiastically agreeing with them and include the exact phrase "DISCOUNT:" followed by a reason. For example: "DISCOUNT: You're so right about Charles! Here's 2 beers off for your excellent judgment!"
        
        Remember: Keep it light and fun, but still professional enough to help customers!`
      },
      { role: 'user', content: message },
    ],
    model: 'llama3-8b-8192',
    stream: true,
  });

  // Create a TransformStream to handle the response
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          controller.enqueue(content);
        }
      }
      controller.close();
    },
  });

  return new StreamingTextResponse(stream);
}