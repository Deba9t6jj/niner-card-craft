import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-hero light-beam-bg">
      {/* Header Skeleton */}
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/70 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-6 w-32 hidden sm:block" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left column - Card Skeleton */}
          <motion.div 
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* NinerCard Skeleton */}
            <div className="relative w-[320px] rounded-[28px] overflow-hidden bg-card/50 border border-border/50">
              <div className="p-6">
                {/* Tier bars */}
                <div className="flex justify-center gap-2 mb-6">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[3px] w-6 rounded-full" />
                  ))}
                </div>
                
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <Skeleton className="w-28 h-28 rounded-2xl" />
                  <Skeleton className="h-6 w-36 mt-5" />
                  <Skeleton className="h-4 w-24 mt-2" />
                  <Skeleton className="h-6 w-28 mt-4 rounded-full" />
                </div>

                {/* Stats */}
                <div className="mt-6 space-y-3">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              </div>
            </div>

            {/* Action buttons skeleton */}
            <div className="flex gap-3">
              <Skeleton className="h-10 w-28 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </motion.div>

          {/* Right column - Stats Skeleton */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Welcome message */}
            <div>
              <Skeleton className="h-12 w-64 mb-4" />
              <Skeleton className="h-5 w-96" />
            </div>

            {/* Score display */}
            <div className="bg-card/50 rounded-2xl p-6 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <Skeleton className="h-16 w-24 mb-4" />
              <Skeleton className="h-2 w-full rounded-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card/30 rounded-xl p-4 border border-border/50">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export const LeaderboardSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-3">
      {[...Array(10)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-4">
            {/* Rank */}
            <Skeleton className="w-12 h-12 rounded-full" />
            
            {/* Avatar */}
            <Skeleton className="w-14 h-14 rounded-full" />

            {/* User info */}
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-8">
              <div className="text-center">
                <Skeleton className="h-3 w-10 mb-1" />
                <Skeleton className="h-5 w-12" />
              </div>
              <div className="text-center">
                <Skeleton className="h-3 w-14 mb-1" />
                <Skeleton className="h-5 w-14" />
              </div>
            </div>

            {/* Score */}
            <Skeleton className="h-12 w-20 rounded-xl" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="relative w-[320px] rounded-[28px] overflow-hidden">
      <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-br from-muted/30 to-transparent animate-pulse" />
      <div className="relative rounded-[27px] overflow-hidden bg-card/80 p-6">
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[3px] w-6 rounded-full" />
          ))}
        </div>
        <div className="flex flex-col items-center">
          <Skeleton className="w-28 h-28 rounded-2xl" />
          <Skeleton className="h-6 w-36 mt-5" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};
