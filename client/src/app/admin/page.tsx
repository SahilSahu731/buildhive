
"use client"

import { useEffect, useState } from "react"
import { getAdminStats } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FolderOpen, Code2, DollarSign } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  
  useEffect(() => {
    const loadStats = async () => {
        try {
            const data = await getAdminStats()
            setStats(data)
        } catch (e) {
            console.error(e)
        }
    }
    loadStats()
  }, [])

  if (!stats) return <div>Loading statistics...</div>

  return (
    <div className="space-y-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <StatsCard 
              title="Total Users" 
              value={stats.users.total} 
              icon={<Users className="w-4 h-4 text-muted-foreground" />} 
              subtext={`${stats.users.premium + stats.users.pro} Paid Subscribers`}
           />
           <StatsCard 
              title="Total Projects" 
              value={stats.projects} 
              icon={<FolderOpen className="w-4 h-4 text-muted-foreground" />} 
              subtext="Launched projects"
           />
           <StatsCard 
              title="Total Code Reviews" 
              value={stats.reviews} 
              icon={<Code2 className="w-4 h-4 text-muted-foreground" />} 
              subtext="AI Analyses performed"
           />
           <StatsCard 
              title="Monthly Revenue" 
              value={`$${stats.revenue.mrr}`} 
              icon={<DollarSign className="w-4 h-4 text-muted-foreground" />} 
              subtext="Estimated MRR"
           />
       </div>

       <div className="grid gap-4 md:grid-cols-2">
           <Card>
               <CardHeader><CardTitle>Subscription Distribution</CardTitle></CardHeader>
               <CardContent>
                   <div className="space-y-2">
                       <div className="flex justify-between text-sm"><span className="text-muted-foreground">Free Plan</span> <span>{stats.users.free}</span></div>
                       <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-slate-400" style={{ width: `${(stats.users.free / stats.users.total) * 100}%` }} />
                       </div>
                       
                       <div className="flex justify-between text-sm"><span className="text-muted-foreground">Premium Plan</span> <span>{stats.users.premium}</span></div>
                       <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500" style={{ width: `${(stats.users.premium / stats.users.total) * 100}%` }} />
                       </div>

                       <div className="flex justify-between text-sm"><span className="text-muted-foreground">Pro Plan</span> <span>{stats.users.pro}</span></div>
                       <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500" style={{ width: `${(stats.users.pro / stats.users.total) * 100}%` }} />
                       </div>
                   </div>
               </CardContent>
           </Card>
       </div>
    </div>
  )
}

function StatsCard({ title, value, icon, subtext }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{subtext}</p>
            </CardContent>
        </Card>
    )
}
