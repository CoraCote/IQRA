// src/app/dashboard/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Mic, Wifi, Info, User, MessageSquare, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Msg = { id: string; role: 'user' | 'assistant'; content: string; ts: string }

export default function Dashboard() {
  const [connected, setConnected] = useState(true)      // wire to socket later
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'greet', role: 'assistant', content: "Welcome! How can I help you with your restaurant orders today? 🍕", ts: new Date().toISOString() }
  ])
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // keep view pinned to latest
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text) return
    const now = new Date().toISOString()

    setMessages(prev => [...prev, { id: `u-${now}`, role: 'user', content: text, ts: now }])
    setInput('')

    // fake assistant for now; replace with your socket callback
    setTimeout(() => {
      const reply = `I understand you said: "${text}". How can I help you with your order?`
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: reply, ts: new Date().toISOString() }])
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage your AI restaurant assistant</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Chat column */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Chat Assistant</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Real-time conversation with customers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-green-50 dark:bg-green-900/20 px-4 py-2 border border-green-200 dark:border-green-800">
                  <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                  <span className="text-sm font-medium text-green-800 dark:text-green-400">
                    {connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Messages */}
              <div ref={listRef} className="mb-6 h-[400px] overflow-y-auto rounded-xl bg-gray-50 dark:bg-gray-800 p-4 space-y-4">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      m.role === 'assistant' 
                        ? 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    }`}>
                      <p className="text-sm">{m.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(m.ts).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Composer */}
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" title="Voice input (coming soon)">
                  <Mic className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type your message…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  className="flex-1"
                />
                <Button onClick={send} disabled={!input.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-teal-600 shadow-lg">
                  <Info className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Session Info</h3>
              </div>
            </CardHeader>

            <CardContent>
              <dl className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</dt>
                  <dd className="flex items-center gap-2 text-sm">
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {connected ? 'Active' : 'Offline'}
                    </span>
                  </dd>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Session ID</dt>
                  <dd className="truncate text-sm font-mono text-gray-900 dark:text-white">
                    chat.{Math.floor(Date.now()/1000)}
                  </dd>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Messages</dt>
                  <dd className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{messages.length}</span>
                  </dd>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">User Messages</dt>
                  <dd className="flex items-center gap-2 text-sm">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/20">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {messages.filter(m => m.role === 'user').length}
                    </span>
                  </dd>
                </div>
              </dl>

              {/* Quick Stats */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Activity</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  AI assistant is actively monitoring and ready to help with customer orders.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
