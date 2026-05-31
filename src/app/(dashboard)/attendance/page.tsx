"use client"

import * as React from "react"
import { Calendar, MapPin, Sparkles, Navigation, UserCheck, ShieldAlert, CircleDot, Clock } from "lucide-react"
import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface GeoSpend {
  id: string
  collaborator: string
  location: string
  coordinates: string
  amount: string
  category: string
  timestamp: string
  status: "AUTHORIZED" | "AUDIT_FLAG"
}

const mockLocations: GeoSpend[] = [
  { id: "1", collaborator: "Sophia Martinez", location: "Starbucks Cyber Park", coordinates: "-6.2088, 106.8456", amount: "IDR 125,000", category: "Food & Dining", timestamp: "10 mins ago", status: "AUTHORIZED" },
  { id: "2", collaborator: "Reinvy (You)", location: "Neon Plaza Mall", coordinates: "-6.1751, 106.8272", amount: "IDR 3,420,000", category: "Utilities", timestamp: "1 hour ago", status: "AUTHORIZED" },
  { id: "3", collaborator: "David Chen", location: "Co-Work Station", coordinates: "-6.2297, 106.8167", amount: "IDR 45,000", category: "Office Supplies", timestamp: "2 hours ago", status: "AUTHORIZED" },
  { id: "4", collaborator: "Sophia Martinez", location: "Graha Gas Station", coordinates: "-6.1950, 106.7900", amount: "IDR 400,000", category: "Transportation", timestamp: "Yesterday", status: "AUDIT_FLAG" },
]

export default function AttendancePage() {
  const [locations] = React.useState<GeoSpend[]>(mockLocations)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Presence Activity Ledger</h1>
          <p className="text-xs font-medium text-muted-foreground">Monitor live physical transactions, geolocations, and spend windows</p>
        </div>
      </div>

      {/* Overview indicators */}
      <div className="grid gap-6 md:grid-cols-3">
        
        <GlowCard glowColor="rgba(99, 102, 241, 0.12)">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-border/80 bg-secondary/50 p-2.5 text-muted-foreground shadow-sm">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Geolocation Vectors</p>
              <h3 className="text-2xl font-extrabold text-foreground tracking-tight mt-0.5">3 Active Points</h3>
            </div>
          </div>
        </GlowCard>

        <GlowCard glowColor="rgba(16, 185, 129, 0.12)">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-2.5 text-emerald-500 shadow-sm">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Collaborators Checked In</p>
              <h3 className="text-2xl font-extrabold text-emerald-500 tracking-tight mt-0.5">3 Online Seats</h3>
            </div>
          </div>
        </GlowCard>

        <GlowCard glowColor="rgba(244, 63, 94, 0.12)">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-2.5 text-rose-500 shadow-sm">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Active Spending Shift</p>
              <h3 className="text-2xl font-extrabold text-rose-500 tracking-tight mt-0.5">08:00 - 18:00</h3>
            </div>
          </div>
        </GlowCard>

      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Map visualization mock */}
        <GlowCard className="md:col-span-2 p-6 overflow-hidden h-[400px]">
          <div className="flex items-center justify-between pb-4 border-b border-border/20 mb-4">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Interactive Presence Geospace</h3>
              <p className="text-[10px] text-muted-foreground">Mock visualization of live transactional nodes</p>
            </div>
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold py-0.5 px-2">
              GPS Signal Live
            </Badge>
          </div>

          {/* Luxury styled simulated map area */}
          <div className="relative h-[280px] w-full rounded-2xl bg-secondary/35 border border-border/40 overflow-hidden flex items-center justify-center">
            
            {/* Grid pattern mimicking vector map */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            {/* Pulsing radar scanner */}
            <div className="absolute h-48 w-48 rounded-full border border-primary/10 bg-primary/2 animate-ping pointer-events-none" />
            
            {/* Jakarta map mockup visual vectors */}
            <div className="absolute border-2 border-border/20 rounded-full h-80 w-80 pointer-events-none" />
            <div className="absolute border border-border/10 rounded-full h-[500px] w-[500px] pointer-events-none" />
            <div className="absolute h-[1px] w-full bg-border/20 pointer-events-none" />
            <div className="absolute w-[1px] h-full bg-border/20 pointer-events-none" />

            {/* Simulated interactive Pin 1 */}
            <div className="absolute top-1/4 left-1/3 group/pin cursor-pointer">
              <div className="absolute -inset-1 rounded-full bg-primary/20 animate-pulse" />
              <MapPin className="h-5 w-5 text-primary relative z-10 hover:-translate-y-0.5 transition-transform" />
              <div className="absolute left-6 top-0 hidden group-hover/pin:block bg-popover border border-border text-[9px] font-bold p-2 rounded-lg shadow-premium-3 min-w-[120px] z-30">
                <p className="text-foreground">Sophia Martinez</p>
                <p className="text-muted-foreground mt-0.5">Starbucks Cyber Park</p>
                <p className="text-primary mt-1">125k IDR spend</p>
              </div>
            </div>

            {/* Simulated interactive Pin 2 */}
            <div className="absolute top-1/2 left-1/2 group/pin cursor-pointer">
              <div className="absolute -inset-1 rounded-full bg-indigo-500/20 animate-pulse" />
              <MapPin className="h-5 w-5 text-indigo-500 relative z-10 hover:-translate-y-0.5 transition-transform" />
              <div className="absolute left-6 top-0 hidden group-hover/pin:block bg-popover border border-border text-[9px] font-bold p-2 rounded-lg shadow-premium-3 min-w-[120px] z-30">
                <p className="text-foreground">Reinvy (You)</p>
                <p className="text-muted-foreground mt-0.5">Neon Plaza Mall</p>
                <p className="text-primary mt-1">3.4M IDR spend</p>
              </div>
            </div>

            {/* Simulated interactive Pin 3 */}
            <div className="absolute bottom-1/4 right-1/3 group/pin cursor-pointer">
              <div className="absolute -inset-1 rounded-full bg-rose-500/20 animate-pulse" />
              <MapPin className="h-5 w-5 text-rose-500 relative z-10 hover:-translate-y-0.5 transition-transform" />
              <div className="absolute left-6 top-0 hidden group-hover/pin:block bg-popover border border-border text-[9px] font-bold p-2 rounded-lg shadow-premium-3 min-w-[120px] z-30">
                <p className="text-foreground">Sophia Martinez</p>
                <p className="text-rose-500 mt-0.5">Graha Gas Station</p>
                <p className="text-rose-500 mt-1">400k IDR spend (Audit Flag)</p>
              </div>
            </div>

            <span className="absolute bottom-3 right-3 text-[8px] font-bold text-muted-foreground tracking-widest uppercase">Geospace Simulator v1</span>
          </div>

        </GlowCard>

        {/* Live Vector Feed list */}
        <GlowCard className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/20 mb-4">
            <h3 className="text-sm font-semibold tracking-tight">Active Vector Feed</h3>
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Rolling Feed</span>
          </div>

          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
            {locations.map((loc) => (
              <div key={loc.id} className="flex flex-col gap-1.5 p-2 rounded-xl bg-secondary/25 border border-border/20 hover:border-border transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <CircleDot className="h-3 w-3 text-primary animate-pulse" />
                    <span>{loc.collaborator}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground font-medium">{loc.timestamp}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                  <span className="truncate max-w-[150px]">{loc.location}</span>
                  <span className={loc.status === "AUDIT_FLAG" ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>
                    {loc.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </GlowCard>

      </div>

      {/* Compliance / Safety Alerts */}
      <GlowCard className="p-6 border border-rose-500/20 bg-rose-500/5">
        <div className="flex items-start gap-3 text-xs font-semibold text-foreground">
          <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-rose-500 font-bold">1 Operational Spend Audit Flag Triggered</p>
            <p className="text-muted-foreground mt-0.5 font-medium leading-relaxed">
              We detected a transaction of **400,000 IDR** at **Graha Gas Station** triggered by **Sophia Martinez** outside the designated spending shift window (08:00 - 18:00). Compliance policies marked it as an audit flag. No automated freeze was executed.
            </p>
            <div className="mt-3 flex gap-2.5">
              <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white font-semibold text-[10px] px-3.5 h-8 rounded-lg shadow">Dismiss Flag</Button>
              <Button size="sm" variant="outline" className="text-[10px] px-3.5 h-8 rounded-lg">Review Details</Button>
            </div>
          </div>
        </div>
      </GlowCard>

    </div>
  )
}
