
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"
import { useRazorpay } from "react-razorpay"
import { getHeaders } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [loading, setLoading] = useState(false);
  const { Razorpay } = useRazorpay();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubscribe = async (plan: 'PREMIUM' | 'PRO') => {
    setLoading(true);
    try {
      // 1. Create Order
      const headers = getHeaders();
      const orderRes = await fetch(`${API_URL}/payment/create-order`, {
         method: 'POST',
         headers,
         body: JSON.stringify({ plan })
      });
      
      if (!orderRes.ok) {
          throw new Error("Failed to initiate payment");
      }
      
      const orderData = await orderRes.json();
      
      // 2. Open Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "BuildHive",
        description: `Upgrade to ${plan} Plan`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
            // 3. Verify Payment
            try {
                const verifyRes = await fetch(`${API_URL}/payment/verify`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        plan
                    })
                });
                
                if (verifyRes.ok) {
                    toast.success(`Successfully upgraded to ${plan}!`);
                    onClose();
                    router.refresh();
                } else {
                    toast.error("Payment verification failed");
                }
            } catch (err) {
                 toast.error("Error verifying payment");
            }
        },
        prefill: {
            name: "User", // Ideally fetch from profile
            email: "user@example.com",
            contact: ""
        },
        theme: {
            color: "#0f172a"
        }
      };

      const rzp1 = new Razorpay(options);
      rzp1.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment failed");
      });
      rzp1.open();

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-4xl bg-card p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}>
            ✕
        </Button>
        
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Upgrade Your Workflow</h2>
            <p className="text-muted-foreground">Choose a plan that fits your needs and code without limits.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="border rounded-xl p-6 flex flex-col items-center opacity-70">
                <h3 className="font-semibold text-lg mb-2">Free</h3>
                <div className="text-3xl font-bold mb-4">₹0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-3 mb-8 w-full">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 5 AI Reviews / Day</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Basic Analysis</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Community Support</li>
                </ul>
                <Button className="w-full mt-auto" variant="outline" disabled>Current Plan</Button>
            </div>

            {/* Premium Plan */}
            <div className="border border-primary/50 bg-primary/5 rounded-xl p-6 flex flex-col items-center relative transform md:scale-105 shadow-xl">
                <div className="absolute top-0 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
                <h3 className="font-semibold text-lg mb-2 text-primary">Premium</h3>
                <div className="text-3xl font-bold mb-4">₹99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-3 mb-8 w-full">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 50 AI Reviews / Day</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Priority Processing</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Advanced Security Checks</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Email Support</li>
                </ul>
                <Button className="w-full mt-auto" onClick={() => handleSubscribe('PREMIUM')} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Upgrade to Premium"}
                </Button>
            </div>

            {/* Pro Plan */}
            <div className="border rounded-xl p-6 flex flex-col items-center">
                <h3 className="font-semibold text-lg mb-2">Pro</h3>
                <div className="text-3xl font-bold mb-4">₹299<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-3 mb-8 w-full">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 1000 Reviews / Day</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Fastest Processing</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Custom Rules (Coming Soon)</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 24/7 Priority Support</li>
                </ul>
                <Button className="w-full mt-auto" variant="outline" onClick={() => handleSubscribe('PRO')} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Upgrade to Pro"}
                </Button>
            </div>
        </div>
      </Card>
    </div>
  );
}
