import React from 'react'
import { Sparkles } from 'lucide-react'

interface StoryLoaderProps {
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export const StoryLoader: React.FC<StoryLoaderProps> = ({ status }) => {
  return (
    <div className="flex items-center gap-3 py-3 px-1 my-2">
      <div className="w-7 h-7 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
        <Sparkles className="w-3.5 h-3.5 animate-spin" />
      </div>
      <div className="flex items-center gap-2 text-xs md:text-sm text-zinc-400">
        <span className="inline-block animate-pulse text-zinc-300">
          {status === 'pending' ? 'Preparing adventure...' : 'Writing story...'}
        </span>
      </div>
    </div>
  )
}
