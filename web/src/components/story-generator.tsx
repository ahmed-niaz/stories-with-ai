import React, { useState } from 'react'
import { ArrowUp, Compass, Swords, Rocket, Ghost, ShieldAlert } from 'lucide-react'

interface StoryGeneratorProps {
  onStartStory: (theme: string) => void
  isLoading: boolean
  hasActiveStory: boolean
}

const STARTER_PROMPTS = [
  {
    icon: Rocket,
    title: 'Ghost Nebula',
    desc: 'Derelict cruiser crawling with rogue defense drones',
  },
  {
    icon: Swords,
    title: 'Sunken Citadel',
    desc: 'Flooded ruins under an ancient siren curse',
  },
  {
    icon: ShieldAlert,
    title: 'Neon Syndicate',
    desc: 'Cyberpunk data heist in a mega-corp tower',
  },
  {
    icon: Ghost,
    title: 'Blackwood Manor',
    desc: 'Gothic estate with shifting corridors in a storm',
  },
]

export const StoryGenerator: React.FC<StoryGeneratorProps> = ({
  onStartStory,
  isLoading,
  hasActiveStory,
}) => {
  const [inputTheme, setInputTheme] = useState('')

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputTheme.trim() || isLoading) return
    onStartStory(inputTheme.trim())
    setInputTheme('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full">
      {/* Hero Welcome (Only when no story is active) */}
      {!hasActiveStory && (
        <div className="max-w-2xl mx-auto px-4 py-12 md:py-16 text-center">
          <div className="w-10 h-10 rounded-xl bg-zinc-850 border border-zinc-750 flex items-center justify-center text-zinc-300 mx-auto mb-4">
            <Compass className="w-5 h-5" />
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
            What adventure shall we explore?
          </h2>
          <p className="mt-1.5 text-xs md:text-sm text-zinc-400">
            Pick a scenario below or enter your own world.
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6 text-left">
            {STARTER_PROMPTS.map((prompt, i) => {
              const Icon = prompt.icon
              return (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => onStartStory(`${prompt.title}: ${prompt.desc}`)}
                  className="p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    <span className="text-xs font-medium text-zinc-200 group-hover:text-white">
                      {prompt.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">
                    {prompt.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Floating Prompt Bar */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-4">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 rounded-2xl px-3 py-1.5 shadow-xl transition"
        >
          <textarea
            value={inputTheme}
            onChange={(e) => setInputTheme(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasActiveStory
                ? 'Start a new adventure theme...'
                : 'Enter a theme or scenario...'
            }
            rows={1}
            disabled={isLoading}
            className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-500 text-sm px-1 py-1.5 resize-none focus:outline-none max-h-32 min-h-[38px] leading-relaxed"
          />

          <button
            type="submit"
            disabled={!inputTheme.trim() || isLoading}
            className="shrink-0 w-8 h-8 rounded-xl bg-white text-zinc-900 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            title="Send"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  )
}
