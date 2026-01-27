import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { insertGuestSchema, type InsertGuest } from "@shared/schema";
import { useCreateGuest, useSettings, useProgram } from "@/hooks/use-guests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { TicketCard } from "@/components/TicketCard";
import { OrnamentalBorder } from "@/components/OrnamentalBorder";
import { MapPin, Calendar, Clock, Loader2, Heart, ExternalLink, QrCode, List, Volume2, VolumeX, Settings2, Moon, Sun } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { z } from "zod";
import { QRCodeCanvas } from "qrcode.react";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import defaultHeroImage from "@/assets/images/hero-background.jpg";

const formSchema = insertGuestSchema.extend({
  attendance: z.enum(["attending", "maybe", "not_attending"]),
  phoneNumber: z.string().min(10, "Nombor telefon tidak sah"),
  totalPax: z.coerce.number().min(1, "Minimum 1 orang").max(10, "Maksimum 10 orang"),
});

export default function Home() {
  const { toast } = useToast();
  const { data: settings, isLoading: isSettingsLoading } = useSettings();
  const { data: program } = useProgram();
  const createGuest = useCreateGuest();
  const [successData, setSuccessData] = useState<{ name: string; code: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([20]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (settings?.musicUrl && audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
      const playAudio = () => {
        audioRef.current?.play().catch(err => {
          console.log("Autoplay blocked by browser. Waiting for interaction.", err);
        });
      };
      playAudio();
      // Also try playing on first user interaction as backup
      window.addEventListener('click', playAudio, { once: true });
      return () => window.removeEventListener('click', playAudio);
    }
  }, [settings?.musicUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const form = useForm<InsertGuest>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      attendance: "attending",
      totalPax: 1,
      wishes: "",
    },
  });

  const onSubmit = (data: InsertGuest) => {
    createGuest.mutate(data, {
      onSuccess: (res) => {
        setSuccessData({ name: res.name, code: res.luckyDrawCode });
        toast({
          title: "Terima Kasih!",
          description: "Kehadiran anda telah direkodkan.",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      onError: (err) => {
        toast({
          title: "Ralat",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  const isAttending = form.watch("attendance") === "attending";

  if (isSettingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      {settings?.musicUrl && (
        <audio
          ref={audioRef}
          src={settings.musicUrl}
          autoPlay
          loop
          className="hidden"
        />
      )}
      
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3">
        {settings?.musicUrl && (
          <div className="flex items-center gap-3 bg-background/50 backdrop-blur-md border border-white/20 p-2 rounded-full shadow-lg">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full text-primary hover:bg-primary/20 hover:text-primary/80"
              onClick={toggleMute}
              data-testid="button-music-toggle"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
            </Button>
            <span className="text-primary text-xs font-medium select-none">
              {isMuted ? "Pasang Muzik" : "Muzik Latar"}
            </span>
            {settings?.musicTitle && !isMuted && (
              <div className="max-w-[120px] overflow-hidden whitespace-nowrap border-l border-primary/20 pl-2">
                <motion.div
                  animate={{ x: ["100%", "-100%"] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="text-[10px] text-primary/80 italic"
                >
                  {settings.musicTitle}
                </motion.div>
              </div>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-primary hover:bg-primary/20 mr-1">
                  <Settings2 className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-40 p-4 bg-background/95 backdrop-blur-md border-primary/20 shadow-2xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-primary/80">
                    <span>Volume</span>
                    <span>{volume[0]}%</span>
                  </div>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="w-full [&_[role=slider]]:bg-primary [&_.relative]:bg-primary/20 [&_[data-orientation=horizontal]]:bg-primary"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle />
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-background/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          onClick={() => window.location.href = "/admin/login"}
          data-testid="link-admin-login"
        >
          Admin
        </Button>
      </div>

      <div className="fixed inset-0 pointer-events-none bg-songket z-[-1]" />

      <header className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden py-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={settings?.heroImageUrl || defaultHeroImage} 
            alt="Hero Background" 
            className="w-full h-full object-contain md:object-cover"
            style={{ 
              objectPosition: 'center top',
              imageRendering: 'auto',
              WebkitBackfaceVisibility: 'hidden',
              backfaceVisibility: 'hidden',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform',
            }}
            loading="eager"
            decoding="async"
          />
          <div 
            className="absolute inset-0 md:hidden"
            style={{
              background: 'linear-gradient(to bottom, transparent 60%, var(--background) 100%)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-2xl mx-auto text-white space-y-4 md:space-y-6 flex flex-col items-center"
        >
          <p className="font-display italic text-lg md:text-xl text-yellow-200 tracking-wide drop-shadow-md">
            Assalamualaikum & Salam Sejahtera
          </p>
          <h1 className="font-display text-2xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-lg flex flex-wrap justify-center gap-x-2 gap-y-1">
            <span>{settings?.eventName}</span>
            {settings?.eventNameLine2 && <span>{settings.eventNameLine2}</span>}
          </h1>
          <div className="flex flex-col items-center gap-2 mt-2 md:mt-4 font-body text-sm md:text-base opacity-90">
            {settings?.familyIntro && (
              <p className="italic text-yellow-100/90 whitespace-pre-wrap max-w-md text-xs md:text-sm drop-shadow-md">
                {settings.familyIntro}
              </p>
            )}
            <p className="drop-shadow-md">Raikan Cinta & Kesyukuran Bersama Kami</p>
            <div className="h-px w-20 bg-yellow-400/60 my-1 md:my-2" />
            <p className="uppercase tracking-widest text-xs md:text-sm font-semibold drop-shadow-md">{settings?.familyName}</p>
          </div>
        </motion.div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 -mt-32 relative z-20">
        {/* Decorative section header */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/60" />
          <span className="text-primary font-display text-sm uppercase tracking-widest">Maklumat Majlis</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/60" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Calendar, label: "Tarikh", value: settings?.eventDate },
            { icon: Clock, label: "Masa", value: settings?.eventTime },
            { icon: MapPin, label: "Lokasi", value: settings?.locationName },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="bg-card text-card-foreground p-6 rounded-xl shadow-lg border border-border/50 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <item.icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{item.label}</p>
              <p className="text-lg font-semibold font-display text-primary mt-1">{item.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl shadow-2xl p-6 md:p-12 relative overflow-hidden mb-12"
        >
          <OrnamentalBorder />
          
          <div className="relative z-10 max-w-lg mx-auto">
            <div className="text-center mb-10 space-y-3">
              <h2 className="font-display text-3xl md:text-4xl text-primary font-bold">
                {successData ? "Pendaftaran Berjaya" : "RSVP Kehadiran"}
              </h2>
              <p className="text-muted-foreground">
                {successData 
                  ? "Terima kasih kerana sudi hadir. Sila simpan tiket ini." 
                  : "Sila sahkan kehadiran anda untuk memudahkan urusan jamuan."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {successData ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <TicketCard name={successData.name} code={successData.code} />
                  <div className="mt-8 text-center">
                    <Button variant="outline" onClick={() => { setSuccessData(null); form.reset(); }}>
                      Daftar Tetamu Lain
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Penuh</FormLabel>
                            <FormControl><Input placeholder="Ali bin Abu" className="bg-background" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>No. Telefon</FormLabel>
                              <FormControl><Input placeholder="0123456789" type="tel" className="bg-background" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="attendance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status Kehadiran</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="bg-background relative z-20"><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl>
                                <SelectContent className="z-[100] bg-white border shadow-xl">
                                  <SelectItem value="attending">Hadir</SelectItem>
                                  <SelectItem value="maybe">Mungkin</SelectItem>
                                  <SelectItem value="not_attending">Tidak Hadir</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {isAttending && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <FormField
                            control={form.control}
                            name="totalPax"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jumlah Tetamu (termasuk anda)</FormLabel>
                                <FormControl><Input type="number" min={1} max={10} className="bg-background" {...field} value={field.value ?? ""} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}
                      <FormField
                        control={form.control}
                        name="wishes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ucapan (Pilihan)</FormLabel>
                            <FormControl><Textarea placeholder="Sampaikan ucapan atau doa..." className="bg-background resize-none min-h-[100px]" {...field} value={field.value ?? ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" variant="gold" className="w-full text-lg h-12 rounded-xl" disabled={createGuest.isPending}>
                        {createGuest.isPending ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sedang Hantar...</> : <>Hantar RSVP <Heart className="w-4 h-4 ml-2 fill-current" /></>}
                      </Button>
                    </form>
                  </Form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Program Section */}
        {program && program.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl shadow-xl p-8 border border-border/50 mb-12"
          >
            <div className="flex flex-col items-center text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary">
                <List className="w-8 h-8" />
              </div>
              <h2 className="font-display text-3xl font-bold text-primary mb-2">Atur Cara Majlis</h2>
              <p className="text-muted-foreground">Jadual perjalanan majlis kita.</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              {program.map((item, idx) => (
                <div key={idx} className="flex items-center gap-6 p-4 bg-muted/30 rounded-xl border border-border/50 group hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center">
                    <span className="text-primary font-display font-bold text-lg whitespace-nowrap">{item.time}</span>
                    <div className="h-8 w-px bg-primary/20 group-last:hidden" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.activity}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Location Section with QR Code */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl shadow-xl p-8 border border-border/50 text-center"
        >
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary mb-2">Pandu Arah</h2>
          <p className="text-muted-foreground mb-8">Scan QR code di bawah atau guna aplikasi pandu arah.</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-primary/20">
              <QRCodeCanvas value={settings?.googleMapsUrl || ""} size={180} />
              <p className="mt-2 text-xs font-mono text-muted-foreground">Scan Google Maps</p>
            </div>
            
            <div className="flex flex-col gap-4 w-full max-w-[240px]">
              <Button 
                variant="outline" 
                className="w-full h-14 text-lg border-primary/20 hover:bg-primary/5"
                onClick={() => window.open(settings?.googleMapsUrl, "_blank")}
              >
                Google Maps <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-14 text-lg border-primary/20 hover:bg-primary/5"
                onClick={() => window.open(settings?.wazeUrl, "_blank")}
              >
                Waze <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="text-center py-10 text-muted-foreground text-sm font-medium relative z-10">
        <p>{settings?.footerText}</p>
      </footer>
    </div>
  );
}
