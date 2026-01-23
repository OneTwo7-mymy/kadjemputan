import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGuests, useDrawWinner, useResetDraw } from "@/hooks/use-guests";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Trophy, Users, LogOut, Search, UserCheck, UserX } from "lucide-react";
import { useLocation } from "wouter";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Guest } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { data: guests, isLoading: isGuestsLoading } = useGuests();
  const drawWinner = useDrawWinner();
  const resetDraw = useResetDraw();

  const [drawState, setDrawState] = useState<"idle" | "rolling" | "winner">("idle");
  const [displayWinner, setDisplayWinner] = useState<Guest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Rolling animation refs
  const rollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/api/login");
    }
  }, [user, isAuthLoading, setLocation]);

  const handleDraw = async () => {
    if (!guests) return;
    
    // Filter eligible candidates locally for animation purposes
    const eligible = guests.filter(g => !g.isWinner && g.attendance === 'attending');
    
    if (eligible.length === 0) {
      alert("Tiada peserta yang layak!");
      return;
    }

    setDrawState("rolling");
    
    // Start rolling effect
    rollingIntervalRef.current = setInterval(() => {
      const random = eligible[Math.floor(Math.random() * eligible.length)];
      setDisplayWinner(random);
    }, 100);

    try {
      // Call API to get actual winner
      const winner = await drawWinner.mutateAsync();
      
      // Stop rolling after minimum time (e.g., 3s)
      setTimeout(() => {
        if (rollingIntervalRef.current) clearInterval(rollingIntervalRef.current);
        setDisplayWinner(winner);
        setDrawState("winner");
        triggerConfetti();
      }, 3000);
      
    } catch (error) {
      if (rollingIntervalRef.current) clearInterval(rollingIntervalRef.current);
      setDrawState("idle");
      setDisplayWinner(null);
      // Error handled by mutation hook or global handler usually, but alert here for simplicity
      console.error(error);
    }
  };

  const handleReset = async () => {
    if (window.confirm("Adakah anda pasti mahu menetapkan semula semua pemenang?")) {
      await resetDraw.mutateAsync();
      setDrawState("idle");
      setDisplayWinner(null);
    }
  };

  const triggerConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  if (isAuthLoading || isGuestsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const winners = guests?.filter(g => g.isWinner).sort((a, b) => (b.winRank || 0) - (a.winRank || 0)) || [];
  const attendingGuests = guests?.filter(g => g.attendance === 'attending') || [];
  const filteredGuests = guests?.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.phoneNumber.includes(searchTerm)
  ) || [];

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <nav className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-display font-bold text-xl">
            A
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Majlis Akikah & Rumah Terbuka</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => logout()} disabled={!user}>
          <LogOut className="w-4 h-4 mr-2" /> Log Keluar
        </Button>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Lucky Draw Section */}
          <section className="space-y-6">
            <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl p-8 shadow-xl text-center relative overflow-hidden">
              {/* Texture */}
              <div className="absolute inset-0 bg-songket opacity-30 mix-blend-overlay" />
              
              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-2">
                  <Trophy className="w-8 h-8 text-yellow-300" />
                </div>
                <h2 className="font-display text-3xl font-bold">Cabutan Bertuah</h2>
                
                {/* Winner Display Area */}
                <div className="min-h-[200px] bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex flex-col items-center justify-center p-6 transition-all">
                  {drawState === "idle" && (
                    <div className="text-primary-foreground/60 space-y-2">
                      <p className="text-lg">Bersedia untuk mencabut undi?</p>
                      <p className="text-sm">{attendingGuests.length} peserta layak</p>
                    </div>
                  )}
                  
                  {(drawState === "rolling" || drawState === "winner") && displayWinner && (
                    <motion.div
                      key={displayWinner.id} // force re-render for animation
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center space-y-2"
                    >
                      <p className="text-yellow-300 font-mono text-4xl font-bold tracking-wider">
                        {displayWinner.luckyDrawCode}
                      </p>
                      <h3 className="font-display text-2xl md:text-3xl font-bold truncate max-w-xs md:max-w-md">
                        {displayWinner.name}
                      </h3>
                      {drawState === "winner" && (
                        <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 mt-2">
                          PEMENANG
                        </Badge>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-4 justify-center pt-4">
                  <Button 
                    size="lg" 
                    variant="gold"
                    onClick={handleDraw}
                    disabled={drawState === "rolling" || attendingGuests.length === 0}
                    className="w-full max-w-xs font-bold text-lg"
                  >
                    {drawState === "rolling" ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Sedang Mengundi...
                      </>
                    ) : "Cabut Pemenang"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Winners List */}
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent" />
                  Senarai Pemenang
                </h3>
                {winners.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-destructive hover:text-destructive/80">
                    Reset
                  </Button>
                )}
              </div>
              
              {winners.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm italic">Belum ada pemenang.</p>
              ) : (
                <div className="space-y-3">
                  {winners.map((winner, idx) => (
                    <div key={winner.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-sm">
                          #{winners.length - idx}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{winner.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{winner.luckyDrawCode}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">Winner</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Guest List Section */}
          <section className="bg-card rounded-xl border p-6 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Senarai Tetamu
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Total: {guests?.length || 0} RSVPs</p>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Cari nama atau no. telefon..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="border rounded-lg flex-1 overflow-hidden flex flex-col">
              <div className="overflow-y-auto max-h-[600px]">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Pax</TableHead>
                      <TableHead className="text-right">Kod</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGuests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Tiada rekod dijumpai.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredGuests.map((guest) => (
                        <TableRow key={guest.id}>
                          <TableCell className="font-medium">
                            <div>{guest.name}</div>
                            <div className="text-xs text-muted-foreground">{guest.phoneNumber}</div>
                          </TableCell>
                          <TableCell>
                            {guest.attendance === 'attending' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><UserCheck className="w-3 h-3 mr-1"/> Hadir</Badge>}
                            {guest.attendance === 'maybe' && <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Mungkin</Badge>}
                            {guest.attendance === 'not_attending' && <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100"><UserX className="w-3 h-3 mr-1"/> Tidak</Badge>}
                          </TableCell>
                          <TableCell className="text-center">{guest.totalPax}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{guest.luckyDrawCode}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
