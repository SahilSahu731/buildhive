"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CodeEditor from "@/components/code-review/code-editor"
import LanguageSelector from "@/components/code-review/language-selector"
import ReviewResult from "@/components/code-review/review-result"
import { codeReviewAPI, CodeReviewResult } from "@/lib/codeReviewApi"
import { toast } from "sonner"
import { Loader2, Code2, Sparkles, History, Trash2, Copy } from "lucide-react"
import Link from "next/link"

const SAMPLE_CODE = {
  javascript: `function fetchUserData(userId) {
  var users = [];
  for(var i = 0; i < 100; i++) {
    users.push({ id: i, name: 'User ' + i });
  }
  return users.filter(function(user) {
    return user.id == userId;
  })[0];
}`,
  typescript: `interface User {
  id: number;
  name: string;
}

function findUser(users: User[], id: number): User | undefined {
  for(let i = 0; i < users.length; i++) {
    if(users[i].id === id) {
      return users[i];
    }
  }
}`,
  python: `def process_data(data):
    result = []
    for i in range(len(data)):
        if data[i] > 0:
            result.append(data[i] * 2)
    return result

# O(n^2) causing example
def find_duplicates(items):
    duplicates = []
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                duplicates.append(items[i])
    return duplicates`,
}


import { PricingModal } from "@/components/subscription/pricing-modal"

import { getSubscriptionStatus } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function CodeReviewPage() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CodeReviewResult | null>(null)
  const [showPricing, setShowPricing] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
      getSubscriptionStatus().then(setSubscription).catch(console.error);
  }, [showPricing]); // Refetch when pricing modal closes/updates

  const handleReview = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to review")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const reviewResult = await codeReviewAPI.create({ code, language })
      setResult(reviewResult)
      toast.success("Code reviewed successfully!")
      // Refresh limits
      getSubscriptionStatus().then(setSubscription);
    } catch (error: any) {
      toast.error(error.message || "Failed to review code")
      if (error.message && error.message.includes("Daily limit reached")) {
          setShowPricing(true);
      }
    } finally {
      setLoading(false)
    }
  }

  const loadSample = () => {
    // @ts-ignore
    setCode(SAMPLE_CODE[language] || SAMPLE_CODE["javascript"])
  }

  return (
    <div className="min-h-screen mt-16 bg-muted/20 pb-20">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container max-w-[95%] mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                 <Code2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Code Review</h1>
                <div className="flex flex-col gap-1">
                    <p className="text-muted-foreground">Get instant feedback on bugs, security, and performance.</p>
                    {subscription && (
                        <div className="flex items-center gap-3 mt-1 text-sm animate-in fade-in">
                            <Badge variant={subscription.plan === 'FREE' ? 'secondary' : 'default'} className="uppercase">
                                {subscription.plan}
                            </Badge>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-xs whitespace-nowrap">
                                    {subscription.usage} / {subscription.limit} used today
                                </span>
                                <Progress value={subscription.percentUsed} className="w-20 h-2" />
                            </div>
                            {subscription.plan === 'FREE' && (
                                <Button variant="link" size="sm" className="h-auto p-0 text-primary font-semibold" onClick={() => setShowPricing(true)}>
                                    Upgrade ⚡
                                </Button>
                            )}
                        </div>
                    )}
                </div>
              </div>
            </div>
            
             <Link href="/code-review/history">
                <Button variant="outline">
                    <History className="mr-2 h-4 w-4" />
                    History
                </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-[95%] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Code Input */}
          <div className="space-y-4 lg:sticky lg:top-24 h-fit">
            <Card className="p-6 flex flex-col h-[85vh]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    Write Code
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => {
                      navigator.clipboard.writeText(code);
                      toast.success("Code copied to clipboard");
                  }} title="Copy Code">
                     <span className="sr-only">Copy</span>
                     <Copy />
                  </Button>
                   <Button variant="ghost" size="sm" onClick={() => setCode("")} title="Clear Code">
                     <span className="sr-only">Clear</span>
                     <Trash2 />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={loadSample}>
                    Load Sample
                  </Button>
                  <LanguageSelector value={language} onChange={setLanguage} />
                </div>
              </div>

              <div className="flex-1 min-h-[70vh]">
                <CodeEditor value={code} onChange={setCode} language={language} height="70vh" />
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Powered by Gemini 3.0 Flash • 20k chars max
                </p>
                <Button onClick={handleReview} disabled={loading || !code.trim()} size="lg" className="px-8">
                  {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                    </>
                  ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Review Code
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
             {/* Info Cards */}
             {!result && !loading && (
                <div className="grid grid-cols-1 gap-4 mb-4">
                    <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                         <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            How it works
                         </h3>
                         <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>1. Paste your code snippet or file content</li>
                            <li>2. Select the programming language</li>
                            <li>3. Click "Review Code" to get instant AI feedback</li>
                         </ul>
                    </Card>
                </div>
             )}

            <Card className={`p-6 h-full ${!result && !loading ? 'flex items-center justify-center bg-muted/30 border-dashed' : ''}`}>
              {!result && !loading && (
                <div className="text-center text-muted-foreground max-w-xs mx-auto">
                  <Code2 className="h-16 w-16 mb-4 mx-auto opacity-20" />
                  <p className="text-lg font-medium text-foreground">Awaiting Input</p>
                  <p className="text-sm mt-2">Paste your code on the left and hit review to see the magic happen.</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center h-[500px]">
                  <div className="relative">
                      <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <Code2 className="h-6 w-6 text-primary" />
                      </div>

                  </div>
                  <h3 className="mt-6 text-xl font-semibold animate-pulse">Analyzing Code Architecture...</h3>
                  <p className="text-muted-foreground mt-2">Checking for bugs, security risks, and optimization opportunities.</p>
                </div>
              )}

              {result && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Review Results</h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                    if (!result) return;
                                    const element = document.createElement("a");
                                    const file = new Blob([JSON.stringify(result, null, 2)], {type: 'application/json'});
                                    element.href = URL.createObjectURL(file);
                                    element.download = `code-review-${new Date().toISOString()}.json`;
                                    document.body.appendChild(element);
                                    element.click();
                                    document.body.removeChild(element);
                                }}>
                                    Download JSON
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setResult(null)}>Clear</Button>
                            </div>
                      </div>
                      <ReviewResult result={result} />
                  </div>
              )}
            </Card>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t">
            <Card className="p-6 border-none shadow-none bg-background/50">
              <h3 className="font-semibold mb-2 text-primary">🔍 Deep Static Analysis</h3>
              <p className="text-sm text-muted-foreground">
                AI scans for logical errors, potential runtime exceptions, and security vulnerabilities that linters might miss.
              </p>
            </Card>
            <Card className="p-6 border-none shadow-none bg-background/50">
              <h3 className="font-semibold mb-2 text-primary">💡 Smart Refactoring</h3>
              <p className="text-sm text-muted-foreground">
                Get specific, copy-pasteable code suggestions to improve readability, performance, and maintainability.
              </p>
            </Card>
            <Card className="p-6 border-none shadow-none bg-background/50">
              <h3 className="font-semibold mb-2 text-primary">📚 Educational Resources</h3>
              <p className="text-sm text-muted-foreground">
                Links to relevant documentation, articles, and tutorials to help you understand the "why" behind the feedback.
              </p>
            </Card>
        </div>
      </div>
      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  )
}
