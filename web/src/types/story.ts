export interface StoryOption {
  text: string
  node_id: number | null
}

export interface StoryNode {
  id: number
  content: string
  is_ending: boolean
  is_winning_ending: boolean
  options: StoryOption[]
}

export interface CompleteStory {
  id: number
  title: string
  session_id?: string | null
  created_at: string
  root_node: StoryNode
  all_nodes: Record<number, StoryNode>
}

export interface StoryJob {
  job_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  story_id: number | null
  completed_at: string | null
  error: string | null
}

export interface ConversationTurn {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: Date
  node?: StoryNode
}
