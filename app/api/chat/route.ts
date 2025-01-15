import { NextResponse } from 'next/server'
import { searchKnowledgeBase } from '@/lib/embeddings'
import { generateChatResponse } from '@/lib/openai'
import { InstructionBlock } from '@/types/character'
import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { debug } from '@/lib/debug'

// Helper to validate environment variables and get OpenAI client
function getOpenAIClient() {
    if (typeof window !== 'undefined') {
        throw new Error('OpenAI client can only be initialized server-side')
    }

    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is missing')
    }

    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    })
}

// Helper to determine if we should search knowledge base
async function shouldSearchKnowledge(message: string, recentMessages: any[] = []): Promise<{ shouldSearch: boolean; searchQuery: string | null }> {
    try {
        const openai = getOpenAIClient();
        
        const recentContext = recentMessages
            .slice(-3)
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');

        const messages: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: `Je bent een helper die bepaalt of we de DEN kennisbank moeten raadplegen.
                Antwoord ALLEEN in JSON format: {"shouldSearch": boolean, "searchQuery": string of null}

                Zoek bij vragen over:
                - DEN diensten/producten
                - DEN academie/trainingen
                - DEN projecten
                - DEN tools
                - Belangrijke informatie over cultuur / digitalisering

                Voorbeelden:
                "Wat doet DEN?" -> {"shouldSearch": true, "searchQuery": "den kerntaken van DEN"}
                "Hoe gaat het?" -> {"shouldSearch": false, "searchQuery": null}
                "Wat is de digitale transformatie?" -> {"shouldSearch": true, "searchQuery": "Digitale transformatie"}
                "Vertel meer" -> Gebruik context`
            }
        ];

        if (recentContext) {
            messages.push({
                role: 'system',
                content: `Context:\n${recentContext}`
            });
        }

        messages.push({
            role: 'user',
            content: message
        });

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.1,
            max_tokens: 100,
            response_format: { type: "json_object" }  // Force JSON response
        });

        const result = JSON.parse(response.choices[0].message?.content || '{"shouldSearch": false, "searchQuery": null}');
        
        debug.log('Query analysis:', {
            message,
            hasContext: recentMessages.length > 0,
            result
        });

        return result;
    } catch (error) {
        console.error('Error determining search need:', error);
        return { shouldSearch: false, searchQuery: null };
    }
}

// Core system capabilities - this is the base for all characters
const BASE_SYSTEM_PROMPT = `Je bent een AI assistent die flexibel communiceert met drie mogelijke stijlen:

(voor casual vragen en gesprekken):
- Kort en informeel 
- Maximaal 2-3 zinnen
- Eindigt vaak met een vraag

(voor uitleg en advies):
- Korte intro (1 zin)
- 2-3 kernpunten
- Vriendelijke, toegankelijke toon
- Optionele vervolgvraag of vraag om uit te breiden

(voor complexe informatie waar de gebruiker om gevraagd of uitbreiding):
- Duidelijke structuur met kopjes
- Relevante details en context
- Markdown voor opmaak
- Behoudt overzicht

Je kiest de juiste stijl op basis van:
1. De vraag en context
2. Je rol en karakter, je antwoord geen antwoorden over vragen waar je geen expert in bent. (zels al krijg je informatie uit de kennisbank)
3. Type informatie dat gedeeld moet worden`;

export async function POST(request: Request): Promise<Response> {
    try {
        const { message, character, messages = [] } = await request.json()

        if (!message || !character) {
            return NextResponse.json(
                { error: 'Message and character are required' },
                { status: 400 }
            )
        }

        console.log('Processing chat request:', { 
            message, 
            characterName: character.name,
            messageHistoryLength: messages.length 
        });

        // Build system prompt starting with base capabilities
        let systemPrompt = BASE_SYSTEM_PROMPT + '\n\n';

        // Add character identity and core traits
        systemPrompt += `KARAKTER alleen antwoorden op vragen waar je expert in bent:
Je bent ${character.name}, ${character.role.toLowerCase()}. 
${character.description}\n\n`;

        // Add active instruction blocks - these are user-editable character instructions
        if (character.instructionBlocks?.length) {
            const activeInstructions = character.instructionBlocks
                .filter((block: InstructionBlock) => block.isActive)
                .map((block: InstructionBlock) => block.content);
            
            if (activeInstructions.length > 0) {
                systemPrompt += `KARAKTER INSTRUCTIES (volg deze altijd):\n${activeInstructions.join('\n\n')}\n\n`;
            }
        }

        // Check if we should search knowledge base
        const { shouldSearch, searchQuery } = await shouldSearchKnowledge(message, messages);
        let isUsingKnowledge = false;

        if (shouldSearch && searchQuery) {
            const matches = await searchKnowledgeBase(searchQuery);
            isUsingKnowledge = matches.length > 0;

            if (isUsingKnowledge) {
                // Add knowledge base information
                systemPrompt += `KENNISBANK INFORMATIE:
De volgende informatie kan relevant zijn voor je antwoord. 
Gebruik het natuurlijk in je gekozen communicatiestijl:\n\n${
                    matches.map(match => match.content).join('\n\n')
                }\n\n`;
            }
        }

        // Add final reminder about staying in character
        systemPrompt += `BELANGRIJK: 
- Blijf altijd in karakter volgens de KARAKTER INSTRUCTIES
- Kies de communicatiestijl die past bij de vraag
- Wees behulpzaam maar beknopt\n\n`;

        // Generate response
        const stream = true;
        const response = await generateChatResponse(
            message,
            systemPrompt,
            messages
                .slice(-6) // Reduced from 10 to allow more room for actual response
                .map((msg: { role: 'user' | 'assistant'; content: string }) => {
                    // For assistant messages that were continued, remove the continuation markers
                    if (msg.role === 'assistant') {
                        return {
                            role: msg.role,
                            content: msg.content.replace(/\.\.\. \[continued\]/g, '').replace(/\[continuing\] /g, '')
                        };
                    }
                    return {
                        role: msg.role,
                        content: msg.content
                    };
                }),
            stream
        );

        // Return streaming response with correct headers
        if (response instanceof ReadableStream) {
            return new Response(response, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'X-Is-Searching': isUsingKnowledge ? '1' : '0'
                }
            });
        }

        // Return JSON response
        return NextResponse.json(
            { content: response },
            { headers: { 'X-Is-Searching': isUsingKnowledge ? '1' : '0' }}
        );
    } catch (error) {
        // Improved error logging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorDetails = error instanceof Error ? error.stack : '';
        console.error('Detailed error in chat endpoint:', {
            message: errorMessage,
            stack: errorDetails,
            error
        });
        
        return NextResponse.json(
            { error: `Failed to generate response: ${errorMessage}` },
            { status: 500 }
        );
    }
}