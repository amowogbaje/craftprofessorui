import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Clapperboard, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { StatusChip } from './StatusChip'
import { updateFeedItemStatus, requestVideo } from '@/lib/api-content'
import { apiErrorMessage } from '@/lib/http'
import { useToast } from '@/components/ui/use-toast'
import type { FeedItem } from '@/lib/types'

export function FeedItemDialog({ item, onClose }: { item: FeedItem | null; onClose: () => void }) {
  const [scheduledAt, setScheduledAt] = useState('')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['feed'] })

  const statusMutation = useMutation({
    mutationFn: ({ status, at }: { status: 'draft' | 'scheduled' | 'published'; at?: string }) =>
      updateFeedItemStatus(item!, status, at),
    onSuccess: () => {
      invalidate()
      toast({ title: 'Updated' })
    },
    onError: (err) => toast({ title: 'Could not update', description: apiErrorMessage(err), variant: 'destructive' }),
  })

  const videoMutation = useMutation({
    mutationFn: () => requestVideo(item!.id),
    onSuccess: () => {
      invalidate()
      toast({ title: 'Video queued', description: 'This can take a few minutes — check back on the feed.' })
    },
    onError: (err) =>
      toast({ title: 'Could not start video generation', description: apiErrorMessage(err), variant: 'destructive' }),
  })

  if (!item) return null

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{item.type === 'video' ? 'Video' : 'Scene image'}</DialogTitle>
            <StatusChip status={item.status} scheduledAt={item.scheduled_at} />
          </div>
          {item.prompt && <DialogDescription>{item.prompt}</DialogDescription>}
        </DialogHeader>

        <div className="overflow-hidden rounded-md border border-border bg-secondary">
          {item.type === 'video' ? (
            <video src={item.url} controls className="max-h-96 w-full" />
          ) : (
            <img src={item.url} alt={item.prompt ?? 'Generated scene'} className="max-h-96 w-full object-contain" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={item.status === 'published' ? 'secondary' : 'default'}
            disabled={statusMutation.isPending || item.status === 'published'}
            onClick={() => statusMutation.mutate({ status: 'published' })}
          >
            Publish now
          </Button>
          <Button
            size="sm"
            variant={item.status === 'draft' ? 'secondary' : 'outline'}
            disabled={statusMutation.isPending || item.status === 'draft'}
            onClick={() => statusMutation.mutate({ status: 'draft' })}
          >
            Move to draft
          </Button>

          {item.type === 'image' && !item.has_video && (
            <Button
              size="sm"
              variant="outline"
              disabled={videoMutation.isPending}
              onClick={() => videoMutation.mutate()}
              className="ml-auto gap-1.5"
            >
              {videoMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Clapperboard className="h-3.5 w-3.5" />
              )}
              Generate video
            </Button>
          )}
        </div>

        <Separator />

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="schedule-at" className="text-xs text-muted-foreground">
              Schedule for
            </Label>
            <Input
              id="schedule-at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            disabled={!scheduledAt || statusMutation.isPending}
            onClick={() =>
              statusMutation.mutate({ status: 'scheduled', at: new Date(scheduledAt).toISOString() })
            }
          >
            Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
