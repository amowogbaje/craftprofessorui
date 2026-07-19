import { api } from './http'
import type { ContentStatus, FeedItem, Paginated, Story, StorySeries } from './types'

export async function fetchFeed(type: 'all' | 'image' | 'video', status: 'all' | ContentStatus) {
  const { data } = await api.get<{ data: FeedItem[] }>('/dashboard/feed', { params: { type, status } })
  return data.data
}

export async function updateFeedItemStatus(
  item: Pick<FeedItem, 'type' | 'id'>,
  status: ContentStatus,
  scheduledAt?: string,
) {
  const path = item.type === 'image' ? `/dashboard/images/${item.id}` : `/dashboard/videos/${item.id}`
  const { data } = await api.patch<FeedItem>(path, { status, scheduled_at: scheduledAt })
  return data
}

export async function requestVideo(imagePromptId: number) {
  const { data } = await api.post<{ message: string }>(`/story-image-prompts/${imagePromptId}/video`)
  return data
}

export async function fetchStories() {
  const { data } = await api.get<Paginated<Story>>('/stories')
  return data
}

export async function submitStory(text: string, storyLink?: string) {
  const { data } = await api.post<{ message: string; story: Story }>('/stories', {
    text,
    story_link: storyLink || undefined,
  })
  return data
}

export async function fetchSeries() {
  const { data } = await api.get<Paginated<StorySeries>>('/story-series')
  return data
}

export async function createSeries(links: string[], title?: string, description?: string) {
  const { data } = await api.post<{ series: StorySeries }>('/story-series', { links, title, description })
  return data
}
