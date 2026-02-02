
"use client"

import { PricingModal } from "@/components/subscription/pricing-modal"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function PricingPage() {
    const [showModal, setShowModal] = useState(true);

    // Reuse the modal but styled as a full page or just trigger it.
    // Ideally, we'd refactor the modal content into a 'PricingTables' component.
    // For now, let's keep it simple and just show the modal centered or use a placeholder page that opens it.
    
    return (
        <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
             <div className="text-center max-w-2xl">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
                    Upgrade Your Experience
                </h1>
                <p className="text-muted-foreground mb-8 text-lg">
                    Unlock higher limits, faster performance, and priority support.
                </p>
                <Button size="lg" onClick={() => setShowModal(true)}>
                    View Plans
                </Button>
             </div>
             
             <PricingModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    )
}
