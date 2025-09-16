// frontend/src/app/chat/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Mic, Phone, Settings, ArrowLeft, MessageSquare, Activity, MicOff, PhoneOff } from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
}

export default function ChatPage() {
    const searchParams = useSearchParams()
    const isVoiceMode = searchParams.get('mode') === 'voice'
    
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [isConnected, setIsConnected] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [isCalling, setIsCalling] = useState(false)
    const [isVoiceCall, setIsVoiceCall] = useState(isVoiceMode)
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessingVoice, setIsProcessingVoice] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [lastInputWasVoice, setLastInputWasVoice] = useState(false)
    const [sessionId, setSessionId] = useState<string>('')

    const socketRef = useRef<Socket | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
    const isVoiceCallRef = useRef(isVoiceCall)
    const lastInputWasVoiceRef = useRef(false)

    useEffect(() => {
        // Generate sessionId on client side only
        if (!sessionId) {
            setSessionId(`chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
        }
    }, [sessionId])

    useEffect(() => {
        // Only initialize socket if we have a sessionId
        if (!sessionId) return
        
        // Initialize socket connection
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
        socketRef.current = socket

        socket.on('connect', () => {
            setIsConnected(true)
            console.log('Connected to chat server')

            // Join session
            socket.emit('join_session', { sessionId })

            // Add welcome message
            const welcomeMessage = 'Hello! Welcome to our restaurant. I\'m your AI assistant. How can I help you today? 🍕'
            setMessages([{
                id: `welcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                role: 'assistant',
                content: welcomeMessage,
                timestamp: new Date().toISOString()
            }])
            
            // Don't speak welcome message - only speak when user provides voice input
        })

        socket.on('disconnect', () => {
            setIsConnected(false)
            console.log('Disconnected from chat server')
        })

        socket.on('chat_response', (data) => {
            setIsTyping(false)
            handleAIResponse(data.message)
        })

        socket.on('chat_error', (data) => {
            setIsTyping(false)
            handleAIResponse(data.error)
        })

        return () => {
            socket.disconnect()
        }
    }, [sessionId])

    // Update voice call ref
    useEffect(() => {
        isVoiceCallRef.current = isVoiceCall
        console.log('🎤 Updated isVoiceCallRef to:', isVoiceCall)
    }, [isVoiceCall])

    // Cleanup speech synthesis on unmount
    useEffect(() => {
        return () => {
            if (speechSynthesisRef.current) {
                speechSynthesis.cancel()
            }
        }
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = () => {
        if (!inputMessage.trim() || !socketRef.current || !sessionId) return

        // Mark that the last input was TEXT, not voice
        setLastInputWasVoice(false)
        lastInputWasVoiceRef.current = false

        const userMessage: ChatMessage = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])
        setIsTyping(true)

        socketRef.current.emit('chat_message', {
            message: inputMessage,
            sessionId,
            restaurantId: 'default'
        })

        setInputMessage('')
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const startVoiceCall = () => {
        setIsVoiceCall(true)
        startVoiceRecording()
    }

    const endVoiceCall = () => {
        setIsVoiceCall(false)
        stopVoiceRecording()
        stopSpeaking() // Stop any ongoing speech
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
        }
    }

    const startVoiceRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            
            // Set up audio context for silence detection
            audioContextRef.current = new AudioContext()
            analyserRef.current = audioContextRef.current.createAnalyser()
            microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)
            microphoneRef.current.connect(analyserRef.current)
            
            analyserRef.current.fftSize = 256
            const bufferLength = analyserRef.current.frequencyBinCount
            const dataArray = new Uint8Array(bufferLength)
            
            const checkSilence = () => {
                if (!analyserRef.current || !isRecording) return
                
                analyserRef.current.getByteFrequencyData(dataArray)
                const average = dataArray.reduce((a, b) => a + b) / bufferLength
                
                if (average < 10) { // Silence threshold
                    if (silenceTimeoutRef.current) {
                        clearTimeout(silenceTimeoutRef.current)
                    }
                    silenceTimeoutRef.current = setTimeout(() => {
                        if (isRecording) {
                            stopVoiceRecording()
                        }
                    }, 5000) // 5 seconds of silence
                } else {
                    if (silenceTimeoutRef.current) {
                        clearTimeout(silenceTimeoutRef.current)
                    }
                }
                
                if (isRecording) {
                    requestAnimationFrame(checkSilence)
                }
            }
            
            // Set up MediaRecorder
            mediaRecorderRef.current = new MediaRecorder(stream)
            audioChunksRef.current = []
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }
            
            mediaRecorderRef.current.onstop = () => {
                processVoiceRecording()
            }
            
            setIsRecording(true)
            mediaRecorderRef.current.start()
            checkSilence()
            
        } catch (error) {
            console.error('Error accessing microphone:', error)
            alert('Microphone access denied. Please allow microphone access to use voice features.')
        }
    }

    const stopVoiceRecording = () => {
        setIsRecording(false)
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
        }
        
        // Clean up audio context
        if (audioContextRef.current) {
            audioContextRef.current.close()
            audioContextRef.current = null
        }
        
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current)
        }
    }

    const processVoiceRecording = async () => {
        if (audioChunksRef.current.length === 0 || !sessionId) return
        
        console.log('🎤 Starting voice processing...')
        
        // Mark that the last input was VOICE
        setLastInputWasVoice(true)
        lastInputWasVoiceRef.current = true
        console.log('🎤 Set lastInputWasVoice to true')
        
        setIsProcessingVoice(true)
        
        try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
            const formData = new FormData()
            formData.append('audio', audioBlob, 'voice-input.wav')
            formData.append('sessionId', sessionId)
            formData.append('restaurantId', 'default')
            
            // Send to backend for processing
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/twilio/voice/process-web`, {
                method: 'POST',
                body: formData
            })
            
            if (response.ok) {
                const result = await response.json()
                
                // Add user message
                setMessages(prev => [...prev, {
                    id: `voice_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    role: 'user',
                    content: result.transcription || '[Voice message]',
                    timestamp: new Date().toISOString()
                }])
                
                // Add AI response (will be spoken because lastInputWasVoice is true)
                const aiResponse = result.response || 'I received your voice message.'
                console.log('🎤 AI response received:', aiResponse)
                console.log('🎤 About to call handleAIResponse with lastInputWasVoice:', lastInputWasVoice)
                
                // Add message to UI
                setMessages(prev => [...prev, {
                    id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    role: 'assistant',
                    content: aiResponse,
                    timestamp: new Date().toISOString()
                }])
                
                // Force speech for voice input
                console.log('🎤 Forcing speech for voice input response')
                speakText(aiResponse, true)
            }
        } catch (error) {
            console.error('Error processing voice recording:', error)
            const errorMessage = 'Sorry, I had trouble processing your voice message. Please try again.'
            
            // Add error message to UI
            setMessages(prev => [...prev, {
                id: `ai_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                role: 'assistant',
                content: errorMessage,
                timestamp: new Date().toISOString()
            }])
            
            // Force speech for voice input error
            console.log('🎤 Forcing speech for voice input error')
            speakText(errorMessage, true)
        } finally {
            setIsProcessingVoice(false)
            audioChunksRef.current = []
        }
    }

    const speakText = (text: string, force: boolean = false) => {
        console.log('🎤 speakText called:', { 
            text, 
            isVoiceCall, 
            isVoiceCallRef: isVoiceCallRef.current,
            lastInputWasVoice,
            lastInputWasVoiceRef: lastInputWasVoiceRef.current,
            force
        })
        
        // Check if speech synthesis is supported
        if (!('speechSynthesis' in window)) {
            console.error('🎤 Speech synthesis not supported in this browser')
            return
        }
        
        // Speak if we're in voice call mode AND the last input was voice, or if forced
        // Use both state and ref for more reliable checking
        const shouldSpeak = force || ((isVoiceCall || isVoiceCallRef.current) && (lastInputWasVoice || lastInputWasVoiceRef.current))
        
        if (shouldSpeak) {
            console.log('🎤 Speaking because in voice call mode and last input was voice (or forced)')
        } else {
            console.log('🎤 Not speaking - voice call mode:', isVoiceCall, 'last input was voice:', lastInputWasVoice)
            return
        }
        
        // Stop any current speech
        if (speechSynthesisRef.current) {
            speechSynthesis.cancel()
        }
        
        setIsSpeaking(true)
        console.log('🎤 Starting speech synthesis for:', text)
        
        const utterance = new SpeechSynthesisUtterance(text)
        speechSynthesisRef.current = utterance
        
        // Configure speech settings
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 0.8
        
        // Try to use a natural-sounding voice
        const voices = speechSynthesis.getVoices()
        console.log('🎤 Available voices:', voices.map(v => v.name))
        
        const preferredVoice = voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft') ||
            voice.name.includes('Natural') ||
            voice.name.includes('Samantha') ||
            voice.name.includes('Alex')
        )
        
        if (preferredVoice) {
            console.log('🎤 Using voice:', preferredVoice.name)
            utterance.voice = preferredVoice
        } else {
            console.log('🎤 Using default voice')
        }
        
        utterance.onend = () => {
            console.log('🎤 Speech synthesis ended')
            setIsSpeaking(false)
            speechSynthesisRef.current = null
        }
        
        utterance.onerror = (event) => {
            console.error('🎤 Speech synthesis error:', event.error)
            setIsSpeaking(false)
            speechSynthesisRef.current = null
        }
        
        utterance.onstart = () => {
            console.log('🎤 Speech synthesis started')
        }
        
        speechSynthesis.speak(utterance)
    }

    const stopSpeaking = () => {
        if (speechSynthesisRef.current) {
            speechSynthesis.cancel()
            setIsSpeaking(false)
            speechSynthesisRef.current = null
        }
    }

    const handleAIResponse = (response: string) => {
        console.log('🎤 handleAIResponse called with:', { response, lastInputWasVoice, isVoiceCall: isVoiceCallRef.current })
        
        // Add to messages
        setMessages(prev => [...prev, {
            id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
        }])
        
        // Only speak if the last input was voice
        if (lastInputWasVoiceRef.current) {
            console.log('🎤 Calling speakText because lastInputWasVoice is true')
            speakText(response)
        } else {
            console.log('🎤 Not calling speakText because lastInputWasVoice is false')
        }
    }

    const initiateVoiceCall = () => {
        if (isVoiceCall) {
            endVoiceCall()
        } else {
            startVoiceCall()
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mb-4">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {isVoiceCall ? 'AI Voice Assistant' : 'AI Chat Assistant'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isVoiceCall 
                            ? 'Voice conversation with our AI-powered restaurant assistant' 
                            : 'Real-time conversation with our AI-powered restaurant assistant'
                        }
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Chat Container */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <Bot className="w-6 h-6 text-white" />
                                        </div>
                                        {isConnected && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Restaurant AI Assistant</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Powered by GPT-4 • Always here to help</p>
                                        {isTyping && (
                                            <p className="text-blue-600 dark:text-blue-400 text-sm animate-pulse">AI is typing...</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {/* Messages */}
                            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-6">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                            message.role === 'assistant' 
                                                ? 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600' 
                                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                        }`}>
                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                            <div className={`flex items-center mt-2 space-x-2 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                                    message.role === 'assistant'
                                                        ? 'bg-gradient-to-br from-blue-400 to-purple-500'
                                                        : 'bg-gradient-to-br from-green-400 to-blue-500'
                                                }`}>
                                                    {message.role === 'assistant' ? (
                                                        <Bot className="w-3 h-3 text-white" />
                                                    ) : (
                                                        <User className="w-3 h-3 text-white" />
                                                    )}
                                                </div>
                                                <span className="text-xs opacity-70">
                                                    {new Date(message.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[80%] rounded-2xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3">
                                            <div className="flex space-x-2 items-center">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                                <span className="text-gray-600 dark:text-gray-400 text-sm">AI is thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Voice Call Status */}
                            {isVoiceCall && (
                                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${
                                                isRecording ? 'bg-red-500 animate-pulse' : 
                                                isSpeaking ? 'bg-blue-500 animate-pulse' : 
                                                'bg-gray-400'
                                            }`}></div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {isRecording ? 'Recording... Speak now' : 
                                                 isProcessingVoice ? 'Processing your voice...' : 
                                                 isSpeaking ? 'AI is speaking...' :
                                                 lastInputWasVoice ? 'Voice mode - Last input was voice' :
                                                 'Voice call active - Click to speak'}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                                                disabled={isProcessingVoice || isSpeaking}
                                                className="bg-white hover:bg-gray-50 border-gray-300"
                                            >
                                                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => {
                                                    setLastInputWasVoice(true)
                                                    lastInputWasVoiceRef.current = true
                                                    console.log('🎤 Test button clicked - forcing speech')
                                                    speakText("Hello, this is a test of the speech synthesis system. Can you hear me?")
                                                }}
                                                className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                                                title="Test speech synthesis"
                                            >
                                                🔊
                                            </Button>
                                            {isSpeaking && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={stopSpeaking}
                                                    className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                                                >
                                                    <MicOff className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Input */}
                            {!isVoiceCall && <div className="w-full">
                                <div className="relative">
                                    <Input
                                        placeholder={isVoiceCall ? "Voice call active - use voice input above" : "Type your message..."}
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        disabled={!isConnected || isVoiceCall}
                                        className="w-full pr-20"
                                    />
                                    <Button 
                                        onClick={sendMessage}
                                        disabled={!inputMessage.trim() || !isConnected || isVoiceCall}
                                        className="absolute right-1 bottom-2 h-8 px-3 text-sm"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>}
                        </CardContent>
                    </Card>

                    {/* Session Info */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Activity className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Session Info</h3>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <dl className="space-y-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Connection Status</dt>
                                    <dd className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                                        <span className={`text-sm font-medium ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {isConnected ? 'Connected' : 'Disconnected'}
                                        </span>
                                    </dd>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Session ID</dt>
                                    <dd className="text-xs font-mono text-gray-900 dark:text-white break-all">
                                        {sessionId || 'Generating...'}
                                    </dd>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Messages</dt>
                                    <dd className="flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{messages.length}</span>
                                    </dd>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">User Messages</dt>
                                    <dd className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {messages.filter(m => m.role === 'user').length}
                                        </span>
                                    </dd>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">AI Responses</dt>
                                    <dd className="flex items-center gap-2">
                                        <Bot className="h-4 w-4 text-purple-500" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {messages.filter(m => m.role === 'assistant').length}
                                        </span>
                                    </dd>
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Voice Call</dt>
                                    <dd className="flex items-center gap-2">
                                        <Phone className={`h-4 w-4 ${isVoiceCall ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                                        <span className={`text-sm font-medium ${isVoiceCall ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {isVoiceCall ? (
                                                isRecording ? 'Recording...' : 
                                                isSpeaking ? 'AI Speaking...' : 
                                                'Active'
                                            ) : 'Ready to call'}
                                        </span>
                                    </dd>
                                </div>

                                {isVoiceCall && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Voice Status</dt>
                                        <dd className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                isRecording ? 'bg-red-500 animate-pulse' : 
                                                isSpeaking ? 'bg-blue-500 animate-pulse' : 
                                                'bg-gray-400'
                                            }`}></div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {isRecording ? 'Listening...' : 
                                                 isSpeaking ? 'AI Speaking...' : 
                                                 lastInputWasVoice ? 'Voice mode active' :
                                                 'Ready to speak'}
                                            </span>
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}