import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Loader2, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchSeries, createSeries } from '@/lib/api-content'
import { apiErrorMessage } from '@/lib/http'
import { useToast } from '@/components/ui/use-toast'

export function SeriesPage() {
  const [title, setTitle] = useState('')
  const [links, setLinks] = useState<string[]>([''])
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['series'], queryFn: fetchSeries })

  const mutation = useMutation({
    mutationFn: () => createSeries(links.map((l) => l.trim()).filter(Boolean), title || undefined),
    onSuccess: () => {
      setTitle('')
      setLinks([''])
      queryClient.invalidateQueries({ queryKey: ['series'] })
      toast({ title: 'Series created' })
    },
    onError: (err) => toast({ title: 'Could not create series', description: apiErrorMessage(err), variant: 'destructive' }),
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-medium">Series</h1>
        <p className="text-sm text-muted-foreground">Link Medium episodes together into one continuing series.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New series</CardTitle>
          <CardDescription>Add episode links in order — episode 1 first.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title (optional)</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Episode links</Label>
              {links.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={link}
                    placeholder={`https://medium.com/@you/episode-${i + 1}`}
                    onChange={(e) => setLinks((prev) => prev.map((l, idx) => (idx === i ? e.target.value : l)))}
                  />
                  {links.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setLinks((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => setLinks((prev) => [...prev, ''])}
              >
                <Plus className="h-4 w-4" /> Add episode
              </Button>
            </div>

            <Button type="submit" disabled={mutation.isPending} className="self-start">
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating…
                </>
              ) : (
                'Create series'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-medium">Your series</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : data?.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No series yet.</p>
        ) : (
          data?.data.map((series) => (
            <Card key={series.id}>
              <CardContent className="flex items-center gap-3 py-4">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{series.title}</p>
                  <p className="text-xs text-muted-foreground">{series.stories_count ?? 0} episodes</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
