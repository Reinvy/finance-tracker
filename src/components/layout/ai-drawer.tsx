"use client"

import * as React from "react"
import { Sparkles, X, Send, Bot, User, AlertCircle, TrendingUp, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AIDrawerProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: Date
}

export function AIDrawer({ isOpen, onClose }: AIDrawerProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Hello! I am your AI Financial Advisor. How can I help you optimize your portfolio, forecast expense budgets, or audit transactions today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const suggestions = [
    "Analyze my budget warnings",
    "How does my income compare to last month?",
    "Give me 3 tips to increase my savings",
  ]

  const handleSend = async (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      let aiContent = ""
      const lower = text.toLowerCase()

      if (lower.includes("budget") || lower.includes("warning")) {
        aiContent = "Looking at your budgets, you are currently at **82% of your Food & Dining budget** for this month, which is approaching the warning threshold. However, your **Utilities** and **Rent** are completely on track. I suggest capping dining expenses at $50 for the remainder of the week to stay safely in the green."
      } else if (lower.includes("compare") || lower.includes("income") || lower.includes("last month")) {
        aiContent = "Based on our latest transactions, your total income this month is **$5,420**, which is **+12.4% higher** than last month ($4,820), mostly driven by a freelance payout. Meanwhile, expenses have remained flat at **$2,910**, boosting your net savings rate to **46.3%**!"
      } else if (lower.includes("tips") || lower.includes("saving") || lower.includes("increase")) {
        aiContent = "Here are 3 premium tailored financial recommendations:\n\n1. **Auto-Allocation**: Set up a recurring rule in settings to automatically sweep 15% of inbound wallet salary into your High-Yield Bank wallet the moment it deposits.\n2. **Category Cap**: Cap your secondary subscriptions. We detected $89 in monthly recurring services you haven't accessed in 30 days.\n3. **Micro-Investing**: Utilize round-ups on smaller transactions to slowly feed savings."
      } else {
        aiContent = "I've reviewed your financial command center logs. Your overall liquidity looks strong across all wallets, and you are running a comfortable net-positive cash flow this month. Let me know if you would like me to compile a PDF forecast report or create an automated recurring budget transfer rule!"
      }

      const aiMsg: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: aiContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border glass-panel shadow-premium-5 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-650 shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight">AI Command Assistant</h2>
              <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Financial Insights Active
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                  msg.role === "assistant"
                    ? "bg-secondary text-primary border-primary/10"
                    : "bg-primary text-primary-foreground border-transparent"
                )}
              >
                {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className="flex flex-col gap-1">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm",
                    msg.role === "assistant"
                      ? "bg-secondary/70 text-foreground border border-border/50"
                      : "bg-primary text-primary-foreground font-medium"
                  )}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
                <span className="text-[9px] text-muted-foreground self-start px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-secondary text-primary border-primary/10">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-secondary/50 border border-border/50 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="px-6 py-2 space-y-2 border-t border-border/20">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quick Inquiries</p>
            <div className="flex flex-col gap-1.5">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleSend(sug)}
                  className="w-full text-left text-xs bg-secondary/40 hover:bg-secondary border border-border/40 rounded-xl px-3 py-2 text-foreground font-medium transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t border-border/60 bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend(input)
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about budgets, trend forecasting..."
              className="w-full text-xs h-10 pl-4 pr-12 rounded-xl bg-secondary/60 hover:bg-secondary/80 focus:bg-secondary border border-border/50 focus:border-primary/30 focus:outline-none transition-all placeholder:text-muted-foreground/80 text-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow disabled:opacity-40 transition-opacity"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
