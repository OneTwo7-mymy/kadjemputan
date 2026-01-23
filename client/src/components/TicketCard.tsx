import { motion } from "framer-motion";
import { Ticket, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface TicketCardProps {
  name: string;
  code: string;
}

export function TicketCard({ name, code }: TicketCardProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Disalin!",
      description: "Kod cabutan bertuah telah disalin.",
    });
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative w-full max-w-sm mx-auto mt-8 perspective-1000"
    >
      <div className="bg-white border-2 border-accent rounded-xl p-6 shadow-xl relative overflow-hidden group">
        {/* Decorative Circles */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-r-2 border-accent" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-l-2 border-accent" />
        <div className="absolute top-1/2 left-0 right-0 border-t-2 border-dashed border-accent/30 -z-10" />

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent mb-2">
            <Ticket className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-1">Tiket Bertuah Anda</h3>
            <p className="font-display text-xl font-bold text-primary truncate px-4">{name}</p>
          </div>

          <div className="bg-accent/5 py-4 px-6 rounded-lg border border-accent/20">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Kod Rahsia</p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-3xl font-bold text-accent tracking-wider">{code}</span>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="text-muted-foreground hover:text-accent"
          >
            <Copy className="w-4 h-4 mr-2" />
            Salin Kod
          </Button>

          <p className="text-xs text-muted-foreground italic mt-4">
            *Simpan kod ini. Pemenang akan diumumkan semasa majlis.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
