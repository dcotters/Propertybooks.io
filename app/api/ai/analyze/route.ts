import { NextRequest, NextResponse } from 'next/server'
import { Configuration, OpenAIApi } from 'openai'

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }))

export async function POST(request: NextRequest) {
  const { text, question, mode } = await request.json()

  let prompt = ''
  if (mode === 'summary') {
    prompt = `Summarize this for a landlord's accounting: ${text}`
  } else if (mode === 'categorize') {
    prompt = `Categorize the following transaction or expense for landlord accounting. Return only the category name.\nText: ${text}`
  } else if (mode === 'anomaly') {
    prompt = `Analyze the following transactions and flag any unusual or suspicious activity.\n${text}`
  } else if (mode === 'tax_tips') {
    prompt = `Based on this data, provide personalized tax optimization tips for a landlord.\n${text}`
  } else if (mode === 'qa' && question) {
    prompt = `Answer the following question based on the user's data.\nData: ${text}\nQuestion: ${question}`
  } else {
    return NextResponse.json({ error: 'Invalid mode or missing data' }, { status: 400 })
  }

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.2,
  })

  return NextResponse.json({ result: response.data.choices[0].message?.content })
} 