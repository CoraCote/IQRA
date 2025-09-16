export default function LoadingSpinner() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
            <div className="glass-card p-12 text-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-white/20 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mt-6 mb-2">Loading</h3>
                <p className="text-white/80">Please wait while we prepare your experience...</p>
                <div className="flex justify-center space-x-1 mt-4">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    )
}