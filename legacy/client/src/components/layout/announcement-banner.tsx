
"use client"

import { useEffect, useState } from "react"
import { getActiveAnnouncements } from "@/lib/api"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [visibleBannerId, setVisibleBannerId] = useState<string | null>(null)
  const [popup, setPopup] = useState<any>(null)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await getActiveAnnouncements()
        if (Array.isArray(data)) {
            const banner = data.find(a => a.type === 'BANNER')
            const popupData = data.find(a => a.type === 'POPUP')
            
            setAnnouncements(data)
            
            if (banner) {
                // Check if dismissed in session? Maybe not for Dev banner.
                // User requirement: "line at the top like this website is still in development" - usually persistent.
                setVisibleBannerId(banner.id)
            }
            if (popupData) {
                // Check local storage for popup dismissal
                const dismissed = localStorage.getItem(`popup_${popupData.id}`)
                if (!dismissed) {
                    setPopup(popupData)
                }
            }
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchAnnouncements()
  }, [])

  const dismissPopup = () => {
      if (popup) {
          localStorage.setItem(`popup_${popup.id}`, 'true')
          setPopup(null)
      }
  }

  const dismissBanner = () => {
      setVisibleBannerId(null)
  }

  const activeBanner = announcements.find(a => a.id === visibleBannerId)

  return (
    <>
      {/* Banner */}
      {activeBanner && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-4 py-2 text-center text-sm relative">
           <span className="font-medium">{activeBanner.message}</span>
           <button 
             onClick={dismissBanner}
             className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
           >
             <X className="w-4 h-4" />
           </button>
        </div>
      )}

      {/* Popup */}
      {popup && (
        <Dialog open={true} onOpenChange={(open) => !open && dismissPopup()}>
             <DialogContent>
                 <DialogHeader>
                     <DialogTitle>Announcement</DialogTitle>
                     <DialogDescription className="pt-2">
                         {popup.message}
                     </DialogDescription>
                 </DialogHeader>
             </DialogContent>
        </Dialog>
      )}
    </>
  )
}
