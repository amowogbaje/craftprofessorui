export interface Wallet {
  balance: number
  lifetime_purchased: number
  lifetime_spent: number
}

export interface PublishSetting {
  id: number
  daily_image_limit: number
  daily_video_limit: number
  monthly_image_limit: number | null
  monthly_video_limit: number | null
  timezone: string
  auto_publish: boolean
}

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  email_verified_at: string | null
  phone_verified_at: string | null
  wallet?: Wallet
  publish_setting?: PublishSetting
}

export type OtpChannel = 'email' | 'sms'
export type OtpPurpose = 'signup' | 'password_reset'

export type ContentStatus = 'draft' | 'scheduled' | 'published'

export interface FeedItem {
  type: 'image' | 'video'
  id: number
  url: string
  prompt?: string
  status: ContentStatus
  scheduled_at: string | null
  published_at: string | null
  story_id?: number
  has_video?: boolean
  source_image_prompt_id?: number
  sort_at: string
}

export interface Story {
  id: number
  user_id: number
  series_id: number | null
  episode_number: number | null
  story_link: string | null
  story_text: string | null
  user_supplied_text: string | null
  prompt_generated: boolean
  image_prompts_count?: number
  series?: { id: number; title: string; slug: string } | null
  created_at: string
}

export interface StorySeries {
  id: number
  user_id: number
  title: string
  slug: string
  description: string | null
  stories_count?: number
  created_at: string
}

export interface CoinPackage {
  coins: number
  amount: number
  currency: string
  label: string
}

export interface CoinCosts {
  image_prompt: number
  image_generation: number
  video_prompt: number
  video_generation: number
  character_portrait: number
}

export interface WalletDetail {
  balance: number
  lifetime_purchased: number
  lifetime_spent: number
  packages: CoinPackage[]
  costs: CoinCosts
}

export interface CoinTransaction {
  id: number
  type: 'credit' | 'debit'
  reason: string
  amount: number
  balance_after: number
  created_at: string
}

export interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ApiErrorShape {
  message?: string
  errors?: Record<string, string[]>
  required_coins?: number
  available_coins?: number
}
