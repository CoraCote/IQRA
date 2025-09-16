// frontend/src/app/conversations/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Phone, MessageCircle, Clock, User, Search, Filter, ArrowLeft, Play, Bot } from 'lucide-react'
import Link from 'next/link'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    audioUrl?: string
    createdAt: string
}

interface Conversation {
    id: string
    sessionId: string
    type: 'voice' | 'chat'
    customerPhone?: string
    status: string
    startedAt: string
    endedAt?: string
    messages: Message[]
    duration?: string
}

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'voice' | 'chat'>('all')

    useEffect(() => {
        // Simulate API call to fetch conversations
        setTimeout(() => {
            setConversations([
                {
                    id: '1',
                    sessionId: 'call_123',
                    type: 'voice',
                    customerPhone: '+1 (555) 123-4567',
                    status: 'completed',
                    startedAt: '2024-01-15T10:30:00Z',
                    endedAt: '2024-01-15T10:33:00Z',
                    duration: '3m 15s',
                    messages: [
                        {
                            id: '1',
                            role: 'assistant',
                            content: 'Hello! Welcome to our restaurant. How can I help you today?',
                            createdAt: '2024-01-15T10:30:00Z'
                        },
                        {
                            id: '2',
                            role: 'user',
                            content: 'Hi, I\'d like to know about your pizza menu.',
                            createdAt: '2024-01-15T10:30:30Z'
                        },
                        {
                            id: '3',
                            role: 'assistant',
                            content: 'Great! We have a variety of delicious pizzas. Our most popular are Margherita, Pepperoni, and Hawaiian. Would you like to hear about our current specials?',
                            createdAt: '2024-01-15T10:30:45Z'
                        },
                        {
                            id: '4',
                            role: 'user',
                            content: 'Yes, tell me about the specials please.',
                            createdAt: '2024-01-15T10:31:15Z'
                        }
                    ]
                },
                {
                    id: '2',
                    sessionId: 'chat_456',
                    type: 'chat',
                    status: 'completed',
                    startedAt: '2024-01-15T09:15:00Z',
                    endedAt: '2024-01-15T09:20:00Z',
                    duration: '5m 12s',
                    messages: [
                        {
                            id: '4',
                            role: 'user',
                            content: 'What are your hours of operation?',
                            createdAt: '2024-01-15T09:15:00Z'
                        },
                        {
                            id: '5',
                            role: 'assistant',
                            content: 'We\'re open Monday through Sunday from 11 AM to 10 PM. Is there anything else I can help you with today?',
                            createdAt: '2024-01-15T09:15:15Z'
                        }
                    ]
                },
                {
                    id: '3',
                    sessionId: 'call_789',
                    type: 'voice',
                    customerPhone: '+1 (555) 234-5678',
                    status: 'completed',
                    startedAt: '2024-01-15T08:45:00Z',
                    endedAt: '2024-01-15T08:48:00Z',
                    duration: '2m 45s',
                    messages: [
                        {
                            id: '6',
                            role: 'assistant',
                            content: 'Hello! Welcome to our restaurant. How can I help you today?',
                            createdAt: '2024-01-15T08:45:00Z'
                        },
                        {
                            id: '7',
                            role: 'user',
                            content: 'I want to place an order for delivery.',
                            createdAt: '2024-01-15T08:45:30Z'
                        }
                    ]
                }
            ])
            setIsLoading(false)
        }, 1000)
    }, [])

    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.customerPhone?.includes(searchTerm) ||
            conv.sessionId.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterType === 'all' || conv.type === filterType
        return matchesSearch && matchesFilter
    })

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
                <div className="glass-card p-8 text-center">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading Conversations...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
            {/* Navigation */}
            <nav className="px-6 py-4 border-b border-white/10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3">
                        <ArrowLeft className="w-6 h-6 text-white" />
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-white text-xl font-bold">Conversation History</h1>
                                <p className="text-white/80 text-sm">Review customer interactions</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header & Filters */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Conversations</h1>
                            <p className="text-white/80 text-lg">{filteredConversations.length} total conversations</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-64"
                                />
                            </div>

                            {/* Filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as 'all' | 'voice' | 'chat')}
                                    className="pl-10 pr-8 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                                >
                                    <option value="all">All Types</option>
                                    <option value="voice">Voice Calls</option>
                                    <option value="chat">Chat Sessions</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Conversations List */}
                    <div className="lg:col-span-1">
                        <div className="glass-card overflow-hidden">
                            <div className="p-6 border-b border-white/10">
                                <h3 className="text-xl font-bold text-white">Recent Conversations</h3>
                                <p className="text-white/70 text-sm">{filteredConversations.length} conversations found</p>
                            </div>
                            <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
                                {filteredConversations.map((conversation) => (
                                    <div
                                        key={conversation.id}
                                        className={`p-6 cursor-pointer hover:bg-white/5 transition-all duration-300 ${selectedConversation?.id === conversation.id ? 'bg-blue-500/20 border-r-4 border-blue-400' : ''
                                            }`}
                                        onClick={() => setSelectedConversation(conversation)}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${conversation.type === 'voice'
                                                    ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                                                    : 'bg-gradient-to-br from-purple-400 to-purple-600'
                                                    }`}>
                                                    {conversation.type === 'voice' ? (
                                                        <Phone className="w-6 h-6 text-white" />
                                                    ) : (
                                                        <MessageCircle className="w-6 h-6 text-white" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-white font-semibold">
                                                        {conversation.type === 'voice' ? 'Voice Call' : 'Chat Session'}
                                                    </p>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${conversation.status === 'completed'
                                                        ? 'bg-green-500/20 text-green-300'
                                                        : 'bg-yellow-500/20 text-yellow-300'
                                                        }`}>
                                                        {conversation.status}
                                                    </span>
                                                </div>

                                                {conversation.customerPhone && (
                                                    <p className="text-white/70 text-sm mb-1">{conversation.customerPhone}</p>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="w-4 h-4 text-white/60" />
                                                        <p className="text-white/60 text-xs">
                                                            {new Date(conversation.startedAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    {conversation.duration && (
                                                        <p className="text-white/60 text-xs">{conversation.duration}</p>
                                                    )}
                                                </div>

                                                <p className="text-white/60 text-xs mt-2 truncate">
                                                    {conversation.messages.length} messages
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {filteredConversations.length === 0 && (
                                    <div className="p-8 text-center">
                                        <MessageCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
                                        <p className="text-white/60">No conversations found</p>
                                        <p className="text-white/40 text-sm">Try adjusting your search or filter</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Conversation Details */}
                    <div className="lg:col-span-2">
                        {selectedConversation ? (
                            <div className="glass-card">
                                {/* Conversation Header */}
                                <div className="p-6 border-b border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${selectedConversation.type === 'voice'
                                                ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                                                : 'bg-gradient-to-br from-purple-400 to-purple-600'
                                                }`}>
                                                {selectedConversation.type === 'voice' ? (
                                                    <Phone className="w-8 h-8 text-white" />
                                                ) : (
                                                    <MessageCircle className="w-8 h-8 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white">
                                                    {selectedConversation.type === 'voice' ? 'Voice Call' : 'Chat Conversation'}
                                                </h3>
                                                <p className="text-white/70">
                                                    Session: {selectedConversation.sessionId}
                                                </p>
                                                {selectedConversation.customerPhone && (
                                                    <p className="text-white/70">From: {selectedConversation.customerPhone}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Clock className="w-4 h-4 text-white/60" />
                                                <span className="text-white/70 text-sm">
                                                    {selectedConversation.duration || 'Duration unknown'}
                                                </span>
                                            </div>
                                            <p className="text-white/60 text-sm">
                                                {new Date(selectedConversation.startedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="p-6">
                                    <div className="space-y-6 max-h-96 overflow-y-auto">
                                        {selectedConversation.messages.map((message, index) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom duration-300`}
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <div className={`max-w-md lg:max-w-lg ${message.role === 'assistant' ? 'order-2' : 'order-1'
                                                    }`}>
                                                    <div className={`px-6 py-4 rounded-2xl shadow-lg ${message.role === 'assistant'
                                                        ? 'bg-white/10 backdrop-blur-lg text-white border border-white/20'
                                                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                                        }`}>
                                                        <p className="leading-relaxed">{message.content}</p>
                                                        {message.audioUrl && (
                                                            <div className="mt-4 p-3 bg-black/20 rounded-xl">
                                                                <div className="flex items-center space-x-3">
                                                                    <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                                                                        <Play className="w-4 h-4 text-white ml-0.5" />
                                                                    </button>
                                                                    <div className="flex-1 h-1 bg-white/20 rounded-full">
                                                                        <div className="h-full w-1/3 bg-white/60 rounded-full"></div>
                                                                    </div>
                                                                    <span className="text-white/70 text-xs">0:45</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={`flex items-center mt-2 space-x-2 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'
                                                        }`}>
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${message.role === 'assistant'
                                                            ? 'bg-gradient-to-br from-blue-400 to-purple-500'
                                                            : 'bg-gradient-to-br from-green-400 to-blue-500'
                                                            }`}>
                                                            {message.role === 'assistant' ? (
                                                                <Bot className="w-3 h-3 text-white" />
                                                            ) : (
                                                                <User className="w-3 h-3 text-white" />
                                                            )}
                                                        </div>
                                                        <span className="text-white/60 text-xs">
                                                            {new Date(message.createdAt).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Conversation Stats */}
                                <div className="p-6 border-t border-white/10">
                                    <h4 className="text-white font-semibold mb-4">Conversation Analytics</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                <MessageCircle className="w-6 h-6 text-white" />
                                            </div>
                                            <p className="text-white/70 text-sm">Messages</p>
                                            <p className="text-white font-semibold">{selectedConversation.messages.length}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                <User className="w-6 h-6 text-white" />
                                            </div>
                                            <p className="text-white/70 text-sm">User Messages</p>
                                            <p className="text-white font-semibold">
                                                {selectedConversation.messages.filter(m => m.role === 'user').length}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                <Bot className="w-6 h-6 text-white" />
                                            </div>
                                            <p className="text-white/70 text-sm">AI Responses</p>
                                            <p className="text-white font-semibold">
                                                {selectedConversation.messages.filter(m => m.role === 'assistant').length}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                <Clock className="w-6 h-6 text-white" />
                                            </div>
                                            <p className="text-white/70 text-sm">Duration</p>
                                            <p className="text-white font-semibold">{selectedConversation.duration || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card flex items-center justify-center h-96">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <MessageCircle className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Select a Conversation</h3>
                                    <p className="text-white/70">Choose a conversation from the list to view details</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}