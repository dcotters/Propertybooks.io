'use client'

import { useState } from 'react'

const MODES = [
  { value: 'summary', label: 'Summarize Data' },
  { value: 'categorize', label: 'Categorize Expense' },
  { value: 'anomaly', label: 'Detect Anomalies' },
  { value: 'tax_tips', label: 'Tax Optimization Tips' },
  { value: 'qa', label: 'Ask a Question' },
]

export default function AIAnalysisPanel() {
  const [mode, setMode] = useState('summary')
  const [text, setText] = useState('')
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    setResult('')
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, question, mode }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data.result)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Failed to contact AI service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">AI-Powered Data Analysis</h2>
      <div className="mb-4">
        <label className="block font-medium mb-1">Analysis Type</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={mode}
          onChange={e => setMode(e.target.value)}
        >
          {MODES.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">
          {mode === 'qa' ? 'Paste your data (CSV, text, etc.)' : 'Paste or type your data (CSV, text, etc.)'}
        </label>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[100px]"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste your data here (e.g., transactions, receipts, etc.)"
        />
      </div>
      {mode === 'qa' && (
        <div className="mb-4">
          <label className="block font-medium mb-1">Your Question</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="e.g., How much did I spend on repairs last year?"
          />
        </div>
      )}
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
        onClick={handleAnalyze}
        disabled={loading || !text || (mode === 'qa' && !question)}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      {error && <div className="mt-4 text-red-600">{error}</div>}
      {result && (
        <div className="mt-6 p-4 bg-gray-50 border rounded">
          <div className="font-semibold mb-2">AI Result:</div>
          <pre className="whitespace-pre-wrap text-gray-800">{result}</pre>
        </div>
      )}
    </div>
  )
} 