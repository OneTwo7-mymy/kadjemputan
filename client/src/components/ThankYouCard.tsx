import { motion } from "framer-motion";
import { Heart, PartyPopper } from "lucide-react";

interface ThankYouCardProps {
  name: string;
}

export function ThankYouCard({ name }: ThankYouCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative w-full max-w-sm mx-auto mt-8"
    >
      <div className="bg-white dark:bg-card border-2 border-primary/30 rounded-xl p-8 shadow-xl relative overflow-hidden text-center">
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-r-2 border-primary/30" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-l-2 border-primary/30" />
        
        <div className="space-y-6">
          <div className="flex justify-center">
            <img 
              src="https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif" 
              alt="Celebration"
              className="w-32 h-32 object-contain rounded-lg"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <PartyPopper className="w-6 h-6" />
              <span className="font-display text-2xl font-bold">Terima Kasih!</span>
              <PartyPopper className="w-6 h-6" />
            </div>
            <p className="font-display text-lg font-semibold text-foreground">{name}</p>
          </div>

          <div className="bg-primary/5 dark:bg-primary/10 py-4 px-6 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kehadiran anda amat kami hargai. Jumpa anda di majlis nanti!
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-accent">
            <Heart className="w-5 h-5 fill-current" />
            <span className="text-sm font-medium">Dengan penuh kasih sayang</span>
            <Heart className="w-5 h-5 fill-current" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
