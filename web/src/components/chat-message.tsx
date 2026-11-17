import React from 'react'
import { Sparkles, Trophy, Skull, ArrowRight, RotateCcw } from 'lucide-react'
import type { ConversationTurn, StoryOption } from '../types/story'

interface ChatMessageProps {
  turn: ConversationTurn
  isLatest: boolean
  isLoading: boolean
  onSelectOption?: (option: StoryOption) => void
  onRestart?: () => void
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  turn,
  isLatest,
  isLoading,
  onSelectOption,
  onRestart,
}) => {
  const isUser = turn.sender === 'user'
  const node = turn.node

  if (isUser) {
    return (
      <div className="flex justify-end my-3">
        <div className="max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2.5 bg-zinc-800 text-zinc-100 text-sm md:text-[15px] leading-relaxed shadow-sm">
          {turn.text}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 md:gap-4 py-3 my-1">
      {/* AI Avatar */}
      <div className="shrink-0 pt-0.5">
        <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Narrative content */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="text-sm md:text-[15px] leading-relaxed text-zinc-200 whitespace-pre-line font-normal">
          {turn.text}
        </div>

        {/* Ending state */}
        {node?.is_ending && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              node.is_winning_ending
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {node.is_winning_ending ? (
                <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Skull className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="text-xs md:text-sm font-medium">
                {node.is_winning_ending ? 'Victory achieved' : 'Journey ended'}
              </span>
            </div>

            {onRestart && (
              <button
                onClick={onRestart}
                className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Play again
              </button>
            )}
          </div>
        )}

        {/* Action Choice Buttons */}
        {isLatest && !node?.is_ending && node?.options && node.options.length > 0 && (
          <div className="pt-1.5 space-y-1.5">
            {node.options.map((option, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => onSelectOption && onSelectOption(option)}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white text-xs md:text-sm transition flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <span className="flex items-center gap-2.5 pr-2">
                  <span className="w-5 h-5 rounded-md bg-zinc-800 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 flex items-center justify-center text-[11px] font-semibold text-zinc-400 shrink-0 transition-colors">
                    {idx + 1}
                  </span>
                  <span>{option.text}</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
