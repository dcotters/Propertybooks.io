'use client'

import { useState, useEffect } from 'react'

const MODES = [
  { value: 'summary', label: 'Summarize Data' },
  { value: 'categorize', label: 'Categorize Expense' },
  { value: 'anomaly', label: 'Detect Anomalies' },
  { value: 'tax_tips', label: 'Tax Optimization Tips' },
  { value: 'qa', label: 'Ask a Question' },
  { value: 'auto_analyze', label: 'Auto-Analyze Portfolio' },
]

export default function AIAnalysisPanel() {
  const [mode, setMode] = useState('auto_analyze')
  const [text, setText] = useState('')
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [transactions, setTransactions] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [transactionsRes, propertiesRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/properties')
      ])
      
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData)
      }
      
      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json()
        setProperties(propertiesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    setResult('')
    
    try {
      let dataToAnalyze = text
      
      if (mode === 'auto_analyze') {
        // Auto-analyze portfolio with real data
        dataToAnalyze = JSON.stringify({
          properties: properties,
          transactions: transactions,
          summary: {
            totalProperties: properties.length,
            totalTransactions: transactions.length,
            totalIncome: transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0),
            totalExpenses: transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0)
          }
        })
      }
      
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: dataToAnalyze, 
          question, 
          mode,
          autoData: mode === 'auto_analyze' ? { properties, transactions } : undefined
        }),
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

// Simple Modal component
export function Modal({ open, onClose, title, children }: { open: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
} 