import React from 'react'
import { Plus, MessageSquare, PanelLeftClose, Trash2, Compass } from 'lucide-react'

interface HistoryItem {
  id: number
  title: string
  date: string
}

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  onNewStory: () => void
  history: HistoryItem[]
  currentStoryId?: number | null
  onSelectStory: (id: number) => void
  onClearHistory: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onNewStory,
  history,
  currentStoryId,
  onSelectStory,
  onClearHistory,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-[#121316] border-r border-zinc-800/80 transition-all duration-200 ease-in-out ${
          isOpen ? 'w-60 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 overflow-hidden'
        }`}
      >
        {/* Header */}
        <div className="p-3 flex items-center justify-between border-b border-zinc-850">
          <div className="flex items-center gap-2 px-1">
            <Compass className="w-4 h-4 text-zinc-300" />
            <span className="font-medium text-xs text-zinc-200">
              Adventure AI
            </span>
          </div>

          <button
            onClick={onToggle}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
            title="Close sidebar"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* New Adventure Button */}
        <div className="p-2.5">
          <button
            onClick={onNewStory}
            className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-750 text-xs font-medium transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New story</span>
          </button>
        </div>

        {/* Recent Adventures */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          <div className="px-2 pt-2 pb-1 text-[11px] font-medium text-zinc-500">
            Recent
          </div>

          {history.length === 0 ? (
            <div className="px-2 py-4 text-zinc-500 text-xs">
              No recent stories
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectStory(item.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-2 cursor-pointer truncate ${
                  currentStoryId === item.id
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                <span className="truncate">{item.title}</span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-500">
          <span className="text-[11px]">Gemini 3.5</span>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
              title="Clear history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
