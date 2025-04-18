const Loading :React.FC=()=>{
    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
  <div className="text-center p-8 bg-white rounded-xl shadow-lg">
    {/* Animated spinner with gradient */}
    <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto
      bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-border
      [animation-duration:0.8s]"></div>
    
    {/* Loading text with subtle animation */}
    <p className="mt-6 text-gray-600 text-lg font-medium flex justify-center items-center gap-2">
      <span className="animate-pulse [animation-duration:1.5s]">Loading user data</span>
      <span className="flex">
        <span className="animate-bounce [animation-delay:0ms]">.</span>
        <span className="animate-bounce [animation-delay:150ms]">.</span>
        <span className="animate-bounce [animation-delay:300ms]">.</span>
      </span>
    </p>
    
    {/* Optional progress bar */}
    <div className="mt-6 w-full bg-gray-200 rounded-full h-1.5 max-w-xs mx-auto overflow-hidden">
      <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-full w-1/2 
        animate-progress [animation-duration:2s] [animation-iteration-count:infinite]"></div>
    </div>
  </div>
</div>
    )
}

export default Loading 