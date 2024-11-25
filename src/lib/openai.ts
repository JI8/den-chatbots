import { InstructionBlock } from '@/types/character'

export async function generateChatResponse(
  message: string,
  instructions: InstructionBlock[],
  characterName: string,
  characterRole: string
) {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  
  console.log('API Key exists:', !!apiKey)
  console.log('Instructions:', instructions)
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured')
  }

  // Filter and log active instructions
  const activeInstructions = instructions.filter(
    block => block.isLocked || block.isActive
  )
  console.log('Active Instructions:', activeInstructions)

  // Build and log the system prompt
  const systemPrompt = `You are ${characterName}, ${characterRole}.
Core Instructions:
${activeInstructions.map(block => `- ${block.content}`).join('\n')}

Remember to stay in character at all times.`

  console.log('System Prompt:', systemPrompt)

  try {
    console.log('Sending request to OpenAI...')
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error details:', error)
      throw new Error(`Failed to get response from OpenAI: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    console.log('OpenAI Response:', data)
    return data.choices[0].message.content
  } catch (error) {
    console.error('Detailed error:', error)
    throw error
  }
} 