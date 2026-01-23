import { motion } from "framer-motion";
import { LogIn, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function AdminLogin() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/admin/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none bg-songket z-[-1] opacity-50" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="text-center pt-10 pb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <CardTitle className="font-display text-3xl font-bold text-primary">Admin Access</CardTitle>
            <CardDescription className="text-base">
              Sila log masuk untuk mengakses panel pengurusan majlis.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10 space-y-6">
            <p className="text-sm text-center text-muted-foreground italic">
              Akses ini adalah untuk urusetia majlis sahaja. Sila gunakan akaun Replit anda untuk meneruskan.
            </p>
            
            <Button 
              className="w-full h-14 text-lg font-bold gap-3 shadow-lg"
              onClick={() => window.location.href = "/api/login"}
            >
              <LogIn className="w-5 h-5" /> Log Masuk Replit
            </Button>

            <Button 
              variant="ghost" 
              className="w-full gap-2 text-muted-foreground"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Laman Utama
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
