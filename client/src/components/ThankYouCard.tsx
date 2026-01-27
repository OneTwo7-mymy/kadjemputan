import { motion } from "framer-motion";
import { Heart, PartyPopper, UserCheck, Users, UserX } from "lucide-react";

interface ThankYouCardProps {
  name: string;
  message: string;
  attendance: "attending" | "maybe" | "not_attending";
}

export function ThankYouCard({ name, message, attendance }: ThankYouCardProps) {
  const getAttendanceIcon = () => {
    switch (attendance) {
      case "attending":
        return <UserCheck className="w-6 h-6 text-green-600" />;
      case "maybe":
        return <Users className="w-6 h-6 text-yellow-600" />;
      case "not_attending":
        return <UserX className="w-6 h-6 text-red-600" />;
    }
  };

  const getAttendanceLabel = () => {
    switch (attendance) {
      case "attending":
        return "Hadir";
      case "maybe":
        return "Mungkin Hadir";
      case "not_attending":
        return "Tidak Hadir";
    }
  };

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
            <div className="flex items-center justify-center gap-2 mt-2">
              {getAttendanceIcon()}
              <span className="text-sm font-medium text-muted-foreground">{getAttendanceLabel()}</span>
            </div>
          </div>

          <div className="bg-primary/5 dark:bg-primary/10 py-4 px-6 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {message}
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
