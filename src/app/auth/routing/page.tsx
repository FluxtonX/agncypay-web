"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Server, Zap } from "lucide-react";

function RoutingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = searchParams.get("destination") || "/dashboard";
  
  const [step, setStep] = useState(0);

  const steps = [
    { text: "Authenticating session...", icon: <ShieldCheck className="w-5 h-5 text-emerald-400" /> },
    { text: "Securing workspace...", icon: <Server className="w-5 h-5 text-blue-400" /> },
    { text: "Preparing dashboard...", icon: <Zap className="w-5 h-5 text-amber-400" /> }
  ];

  useEffect(() => {
    // Step progression
    const step1 = setTimeout(() => setStep(1), 1000);
    const step2 = setTimeout(() => setStep(2), 2000);
    
    // Final redirect
    const redirect = setTimeout(() => {
      router.push(destination);
    }, 3000);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(redirect);
    };
  }, [router, destination]);

  return (
    <div className="min-h-screen w-full bg-[#000000] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]"
        />
      </div>

      <div className="z-10 flex flex-col items-center max-w-md w-full px-6">
        <motion.img 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          src="/agncypayLogo.png" 
          alt="AgncyPay" 
          className="h-10 mb-16 object-contain"
        />

        {/* Progress Bar Container */}
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-8 relative">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "linear" }}
            className="absolute top-0 left-0 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
          />
        </div>

        {/* Dynamic Status Text */}
        <div className="h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 text-sm font-semibold tracking-wide"
            >
              {steps[step].icon}
              <span className="text-[#A1A1AA]">{steps[step].text}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function RoutingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse w-32 h-1.5 bg-white/20 rounded-full" />
      </div>
    }>
      <RoutingContent />
    </Suspense>
  );
}
