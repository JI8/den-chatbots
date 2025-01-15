import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const CONTINUATION_MARKER = '... [continued]';

// Helper to validate environment variables and get OpenAI client
function getOpenAIClient() {
    // Only initialize on server-side
    if (typeof window !== 'undefined') {
        throw new Error('OpenAI client can only be initialized server-side');
    }

    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is missing');
    }

    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

export async function generateChatResponse(
    message: string,
    systemPrompt: string,
    messageHistory: { role: 'user' | 'assistant', content: string }[] = [],
    stream = false
): Promise<ReadableStream | string> {
    try {
        // Initialize OpenAI client
        const openai = getOpenAIClient();

        console.log('Generating chat response:', {
            messageLength: message.length,
            systemPromptLength: systemPrompt.length,
            historyLength: messageHistory.length,
            isStreaming: stream
        });

        // Add completion marker to system prompt
        const enhancedSystemPrompt = `${systemPrompt}

IMPORTANT FORMATTING RULES:
1. Always complete your sentences
2. If you need to end early due to length, end with a complete sentence and add "... [continued]"
3. Never cut off mid-sentence
4. If continuing a previous response, start with "[continuing] " and complete the thought`

        const messages: ChatCompletionMessageParam[] = [
            { role: 'system', content: enhancedSystemPrompt },
            ...messageHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        if (stream) {
            try {
                const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages,
                    temperature: 0.7,
                    max_tokens: 4000,
                    stream: true,
                    presence_penalty: 0.6,
                    frequency_penalty: 0.3
                });

                // For streaming, return a ReadableStream that yields chunks of the response
                return new ReadableStream({
                    async start(controller) {
                        try {
                            let isFirstChunk = true;
                            let buffer = '';
                            let totalTokens = 0;
                            
                            for await (const chunk of response) {
                                const content = chunk.choices[0]?.delta?.content || '';
                                if (content) {
                                    totalTokens += content.split(' ').length; // Rough token estimation
                                    
                                    // If we're approaching token limit, inject continuation marker naturally
                                    if (totalTokens > 3800 && !buffer.includes(CONTINUATION_MARKER)) {
                                        buffer += '\n\n... [continued]';
                                        controller.enqueue(buffer);
                                        break;
                                    }

                                    // If this is a continuation, add the prefix to the first chunk
                                    if (isFirstChunk && messageHistory.length > 0 && content.trim().startsWith('[continuing]')) {
                                        controller.enqueue(content);
                                    } else if (isFirstChunk) {
                                        controller.enqueue(content);
                                    } else {
                                        // Buffer the content to ensure we don't cut words
                                        buffer += content;
                                        if (buffer.includes(' ')) {
                                            const words = buffer.split(' ');
                                            const completeWords = words.slice(0, -1).join(' ') + ' ';
                                            controller.enqueue(completeWords);
                                            buffer = words[words.length - 1];
                                        }
                                    }
                                    isFirstChunk = false;
                                }
                            }
                            // Flush any remaining buffer
                            if (buffer && !buffer.includes(CONTINUATION_MARKER)) {
                                controller.enqueue(buffer);
                            }
                        } catch (streamError) {
                            console.error('Error in stream processing:', streamError);
                            throw streamError;
                        } finally {
                            controller.close();
                        }
                    }
                });
            } catch (streamError) {
                console.error('Error creating streaming response:', streamError);
                throw streamError;
            }
        } else {
            // For non-streaming responses
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                temperature: 0.7,
                max_tokens: 4000,
                stream: false,
                presence_penalty: 0.6,
                frequency_penalty: 0.3
            });

            if (!response.choices[0].message?.content) {
                throw new Error('No response content from OpenAI');
            }
            return response.choices[0].message.content;
        }
    } catch (error) {
        console.error('Detailed error in generateChatResponse:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
    }
} 