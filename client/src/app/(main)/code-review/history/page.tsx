"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { codeReviewAPI } from "@/lib/codeReviewApi"
import { useRouter } from "next/navigation"
import { Loader2, Clock, Code2, ArrowLeft, BarChart3 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ReviewHistoryPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsData, statsData] = await Promise.all([
          codeReviewAPI.getMyReviews(),
          codeReviewAPI.getStats(),
        ])
        setReviews(reviewsData.reviews)
        setStats(statsData)
      } catch (error) {
        // console.error("Failed to fetch reviews:", error) // Silent fail or redirect if auth issue
        toast.error("Please login to view history")
        router.push("/code-review")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading history...</p>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen mt-16 bg-muted/20 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/code-review">
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Review History</h1>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="p-6 flex flex-col justify-between">
              <div>
                  <p className="text-muted-foreground text-sm font-medium mb-1">Total Reviews</p>
                  <p className="text-4xl font-bold">{stats.totalReviews}</p>
              </div>
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <BarChart3 className="mr-2 h-4 w-4" /> Lifetime analysis
              </div>
            </Card>
            <Card className="p-6 flex flex-col justify-between">
              <div>
                  <p className="text-muted-foreground text-sm font-medium mb-1">Average Score</p>
                  <div className={`text-4xl font-bold ${
                      stats.averageScore >= 80 ? 'text-green-600' : 
                      stats.averageScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                      {stats.averageScore}
                  </div>
              </div>
               <div className="mt-4">
                 <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${stats.averageScore}%` }} />
                 </div>
              </div>
            </Card>
            <Card className="p-6">
              <p className="text-muted-foreground text-sm font-medium mb-4">Languages Analyzed</p>
              <div className="flex gap-2 flex-wrap">
                {stats.languageBreakdown.map((item: any) => (
                  <Badge key={item.language} variant="secondary" className="px-3 py-1">
                    {item.language} 
                    <span className="ml-2 px-1.5 py-0.5 bg-background rounded-full text-xs">
                        {item.count}
                    </span>
                  </Badge>
                ))}
                {stats.languageBreakdown.length === 0 && (
                    <span className="text-sm text-muted-foreground">No data yet</span>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>
          {reviews.length === 0 ? (
            <Card className="p-16 text-center border-dashed">
              <Code2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No reviews yet</h3>
              <p className="text-muted-foreground mb-6">Start analyzing your code to see history here.</p>
              <Link href="/code-review">
                <Button>Start Your First Review</Button>
              </Link>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <Badge className="uppercase">{review.language}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(review.createdAt).toLocaleDateString()} at {new Date(review.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="bg-muted/50 rounded-md p-4 text-sm font-mono overflow-x-auto border">
                      <pre>
                        {review.code.substring(0, 300)}
                        {review.code.length > 300 && "..."}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 min-w-[120px]">
                        <div className="flex flex-col items-end">
                            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Score</span>
                            <span className={`text-4xl font-bold ${
                                review.score >= 80 ? 'text-green-600' : 
                                review.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                                {review.score}
                            </span>
                        </div>
                        <Link href={`/code-review/${review.id}`}>
                            <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
