import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGuests, useDrawWinner, useResetDraw, useSettings, useUpdateSettings } from "@/hooks/use-guests";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Trophy, Users, LogOut, Search, UserCheck, UserX, Settings as SettingsIcon, Save } from "lucide-react";
import { useLocation } from "wouter";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSettingsSchema, type InsertSettings, type Guest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { data: guests, isLoading: isGuestsLoading } = useGuests();
  const { data: settings, isLoading: isSettingsLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const drawWinner = useDrawWinner();
  const resetDraw = useResetDraw();

  const [drawState, setDrawState] = useState<"idle" | "rolling" | "winner">("idle");
  const [displayWinner, setDisplayWinner] = useState<Guest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const rollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<InsertSettings>({
    resolver: zodResolver(insertSettingsSchema),
    defaultValues: {
      eventName: "",
      eventDate: "",
      eventTime: "",
      locationName: "",
      googleMapsUrl: "",
      wazeUrl: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setLocation("/admin/login");
    }
  }, [user, isAuthLoading, setLocation]);

  const onUpdateSettings = (data: InsertSettings) => {
    updateSettings.mutate(data, {
      onSuccess: () => {
        toast({ title: "Berjaya", description: "Tetapan majlis telah dikemaskini." });
      },
      onError: (err) => {
        toast({ title: "Ralat", description: err.message, variant: "destructive" });
      },
    });
  };

  const handleDraw = async () => {
    if (!guests) return;
    const eligible = guests.filter(g => !g.isWinner && g.attendance === 'attending');
    if (eligible.length === 0) {
      alert("Tiada peserta yang layak!");
      return;
    }
    setDrawState("rolling");
    rollingIntervalRef.current = setInterval(() => {
      const random = eligible[Math.floor(Math.random() * eligible.length)];
      setDisplayWinner(random);
    }, 100);
    try {
      const winner = await drawWinner.mutateAsync();
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
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  if (isAuthLoading || isGuestsLoading || isSettingsLoading) {
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
    g.phoneNumber.includes(searchTerm) ||
    g.luckyDrawCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <nav className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-display font-bold text-xl">A</div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">{settings?.eventName}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => logout()}>
          <LogOut className="w-4 h-4 mr-2" /> Log Keluar
        </Button>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="draw" className="space-y-8">
          <TabsList className="bg-card border w-full justify-start h-12 p-1">
            <TabsTrigger value="draw" className="flex-1 max-w-[200px] h-full"><Trophy className="w-4 h-4 mr-2" /> Cabutan</TabsTrigger>
            <TabsTrigger value="guests" className="flex-1 max-w-[200px] h-full"><Users className="w-4 h-4 mr-2" /> Tetamu</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 max-w-[200px] h-full"><SettingsIcon className="w-4 h-4 mr-2" /> Tetapan</TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="space-y-6">
                <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl p-8 shadow-xl text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-songket opacity-30 mix-blend-overlay" />
                  <div className="relative z-10 space-y-6">
                    <Trophy className="w-12 h-12 text-yellow-300 mx-auto" />
                    <h2 className="font-display text-3xl font-bold">Cabutan Bertuah</h2>
                    <div className="min-h-[200px] bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex flex-col items-center justify-center p-6 transition-all">
                      {drawState === "idle" && <div className="text-primary-foreground/60 space-y-2"><p className="text-lg">Sedia untuk undian?</p><p className="text-sm">{attendingGuests.length} peserta layak</p></div>}
                      {(drawState === "rolling" || drawState === "winner") && displayWinner && (
                        <motion.div key={displayWinner.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-2">
                          <p className="text-yellow-300 font-mono text-4xl font-bold tracking-wider">{displayWinner.luckyDrawCode}</p>
                          <h3 className="font-display text-2xl md:text-3xl font-bold truncate max-w-xs">{displayWinner.name}</h3>
                          {drawState === "winner" && <Badge className="bg-yellow-400 text-yellow-900 mt-2">PEMENANG</Badge>}
                        </motion.div>
                      )}
                    </div>
                    <Button size="lg" variant="gold" onClick={handleDraw} disabled={drawState === "rolling" || attendingGuests.length === 0} className="w-full max-w-xs font-bold text-lg">
                      {drawState === "rolling" ? <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Sedang Mengundi...</> : "Cabut Pemenang"}
                    </Button>
                  </div>
                </div>
              </section>

              <section className="bg-card rounded-xl border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-accent" /> Senarai Pemenang</h3>
                  {winners.length > 0 && <Button variant="ghost" size="sm" onClick={handleReset} className="text-destructive">Reset</Button>}
                </div>
                {winners.length === 0 ? <p className="text-muted-foreground text-center py-8 italic">Belum ada pemenang.</p> : (
                  <div className="space-y-3">
                    {winners.map((winner, idx) => (
                      <div key={winner.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-sm">#{winners.length - idx}</div>
                          <div><p className="font-medium">{winner.name}</p><p className="text-xs text-muted-foreground font-mono">{winner.luckyDrawCode}</p></div>
                        </div>
                        <Badge className="bg-yellow-50 text-yellow-700">Winner</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </TabsContent>

          <TabsContent value="guests">
            <section className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div><h3 className="font-display text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Senarai Tetamu</h3><p className="text-sm text-muted-foreground">Total: {guests?.length} RSVPs</p></div>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Cari nama, telefon atau kod..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50"><TableRow><TableHead>Nama</TableHead><TableHead>Status</TableHead><TableHead className="text-center">Pax</TableHead><TableHead className="text-right">Kod Untung</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredGuests.map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell className="font-medium"><div>{guest.name}</div><div className="text-xs text-muted-foreground">{guest.phoneNumber}</div></TableCell>
                        <TableCell>
                          {guest.attendance === 'attending' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Hadir</Badge>}
                          {guest.attendance === 'maybe' && <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">Mungkin</Badge>}
                          {guest.attendance === 'not_attending' && <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">Tidak</Badge>}
                        </TableCell>
                        <TableCell className="text-center">{guest.totalPax}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-primary">{guest.luckyDrawCode}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="settings">
            <section className="bg-card rounded-xl border p-6 shadow-sm max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <SettingsIcon className="w-6 h-6 text-primary" />
                <h3 className="font-display text-xl font-bold">Tetapan Majlis</h3>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onUpdateSettings)} className="space-y-6">
                  <FormField control={form.control} name="eventName" render={({ field }) => (
                    <FormItem><FormLabel>Nama Majlis</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="familyName" render={({ field }) => (
                    <FormItem><FormLabel>Nama Keluarga (Tuan Rumah)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="eventDate" render={({ field }) => (
                      <FormItem><FormLabel>Tarikh</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="eventTime" render={({ field }) => (
                      <FormItem><FormLabel>Masa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="locationName" render={({ field }) => (
                    <FormItem><FormLabel>Nama Lokasi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="googleMapsUrl" render={({ field }) => (
                    <FormItem><FormLabel>URL Google Maps</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="wazeUrl" render={({ field }) => (
                    <FormItem><FormLabel>URL Waze</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={updateSettings.isPending}>
                    {updateSettings.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Simpan Tetapan
                  </Button>
                </form>
              </Form>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
