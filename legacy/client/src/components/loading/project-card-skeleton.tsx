
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function ProjectCardSkeleton() {
  return (
    <Card className="flex flex-col h-full border-border/50 bg-card overflow-hidden">
      <div className="w-full aspect-video bg-muted relative overflow-hidden">
         <Skeleton className="w-full h-full" />
      </div>
      
      <CardHeader className="space-y-3 pb-3">
         <Skeleton className="h-6 w-3/4" />
         <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
         </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 py-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          
          <div className="flex gap-1.5 pt-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
      </CardContent>

      <CardFooter className="border-t pt-3 pb-3 flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
      </CardFooter>
    </Card>
  )
}
