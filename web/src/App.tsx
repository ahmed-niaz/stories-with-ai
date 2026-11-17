import React, { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PanelLeft, RotateCcw, AlertCircle, Plus } from 'lucide-react'
import { Sidebar } from './components/sidebar'
import { ChatMessage } from './components/chat-message'
import { StoryGenerator } from './components/story-generator'
import { StoryLoader } from './components/story-loader'
import type {
  CompleteStory,
  ConversationTurn,
  StoryJob,
  StoryOption,
  StoryNode,
} from './types/story'

interface HistoryItem {
  id: number
  title: string
  date: string
}

export const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [jobId, setJobId] = useState<string | null>(null)
  const [storyId, setStoryId] = useState<number | null>(null)
  const [storyData, setStoryData] = useState<CompleteStory | null>(null)
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('adventure_history')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation, jobId])

  useEffect(() => {
    localStorage.setItem('adventure_history', JSON.stringify(history))
  }, [history])

  // 1. Mutation: Start New Story
  const createStoryMutation = useMutation({
    mutationFn: async (theme: string) => {
      const res = await fetch('/api/stories/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ theme }),
      })
      if (!res.ok) {
        throw new Error('Failed to create story')
      }
      return (await res.json()) as StoryJob
    },
    onSuccess: (job, theme) => {
      setJobId(job.job_id)
      setStoryData(null)
      setStoryId(null)
      setConversation([
        {
          id: 'turn-init',
          sender: 'user',
          text: theme,
          timestamp: new Date(),
        },
      ])
    },
  })

  // 2. Query: Poll Job Status
  const { data: jobData } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) return null
      const res = await fetch(`/api/jobs/${jobId}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to poll status')
      return (await res.json()) as StoryJob
    },
    enabled: !!jobId && !storyData,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'completed' || status === 'failed' ? false : 1500
    },
  })

  useEffect(() => {
    if (jobData?.status === 'completed' && jobData.story_id) {
      setStoryId(jobData.story_id)
    }
  }, [jobData])

  // 3. Query: Fetch Complete Story Tree
  const { data: completeStoryResponse } = useQuery({
    queryKey: ['story', storyId],
    queryFn: async () => {
      if (!storyId) return null
      const res = await fetch(`/api/stories/${storyId}/complete`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to load story')
      return (await res.json()) as CompleteStory
    },
    enabled: !!storyId,
  })

  useEffect(() => {
    if (completeStoryResponse && completeStoryResponse.id !== storyData?.id) {
      setStoryData(completeStoryResponse)
      setJobId(null)

      setHistory((prev) => {
        if (prev.some((h) => h.id === completeStoryResponse.id)) return prev
        return [
          {
            id: completeStoryResponse.id,
            title: completeStoryResponse.title,
            date: new Date().toLocaleDateString(),
          },
          ...prev,
        ]
      })

      const rootNode = completeStoryResponse.root_node
      setConversation((prev) => [
        ...prev,
        {
          id: `node-${rootNode.id}`,
          sender: 'assistant',
          text: rootNode.content,
          timestamp: new Date(),
          node: rootNode,
        },
      ])
    }
  }, [completeStoryResponse, storyData?.id])

  const handleSelectOption = (option: StoryOption) => {
    if (!storyData || !option.node_id) return
    const nextNode: StoryNode | undefined = storyData.all_nodes[option.node_id]
    if (!nextNode) return

    setConversation((prev) => [
      ...prev,
      {
        id: `user-choice-${Date.now()}`,
        sender: 'user',
        text: option.text,
        timestamp: new Date(),
      },
      {
        id: `node-${nextNode.id}`,
        sender: 'assistant',
        text: nextNode.content,
        timestamp: new Date(),
        node: nextNode,
      },
    ])
  }

  const handleNewStory = () => {
    setJobId(null)
    setStoryId(null)
    setStoryData(null)
    setConversation([])
  }

  const handleSelectHistoryStory = (id: number) => {
    handleNewStory()
    setStoryId(id)
  }

  const handleRestartCurrentStory = () => {
    if (!storyData) return
    const root = storyData.root_node
    setConversation([
      {
        id: 'turn-init',
        sender: 'user',
        text: storyData.title,
        timestamp: new Date(),
      },
      {
        id: `node-${root.id}`,
        sender: 'assistant',
        text: root.content,
        timestamp: new Date(),
        node: root,
      },
    ])
  }

  const isLoading =
    createStoryMutation.isPending || (!!jobId && jobData?.status !== 'completed')

  return (
    <div className="flex h-screen w-full bg-[#18181b] text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onNewStory={handleNewStory}
        history={history}
        currentStoryId={storyData?.id}
        onSelectStory={handleSelectHistoryStory}
        onClearHistory={() => setHistory([])}
      />

      {/* Main Chat Canvas */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Navbar */}
        <header className="h-12 border-b border-zinc-800/80 px-3.5 flex items-center justify-between shrink-0 bg-[#18181b]">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
                title="Open sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            <span className="font-medium text-xs md:text-sm text-zinc-200 truncate max-w-xs md:max-w-md">
              {storyData?.title || 'Adventure AI'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {storyData && (
              <button
                onClick={handleRestartCurrentStory}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleNewStory}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
              title="New story"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-2xl mx-auto space-y-2">
            {jobData?.status === 'failed' && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{jobData.error || 'Generation failed. Please try again.'}</span>
              </div>
            )}

            {conversation.map((turn, index) => (
              <ChatMessage
                key={turn.id}
                turn={turn}
                isLatest={index === conversation.length - 1}
                isLoading={isLoading}
                onSelectOption={handleSelectOption}
                onRestart={handleRestartCurrentStory}
              />
            ))}

            {isLoading && <StoryLoader status={jobData?.status || 'pending'} />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="shrink-0 bg-gradient-to-t from-[#18181b] via-[#18181b]/90 to-transparent">
          <StoryGenerator
            onStartStory={(theme) => createStoryMutation.mutate(theme)}
            isLoading={isLoading}
            hasActiveStory={conversation.length > 0}
          />
        </div>
      </main>
    </div>
  )
}

export default App
