"use client";

// Add this CSS for animation
const sparkleAnimation = `
@keyframes dimming {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
.sparkle {
  animation: dimming 2s infinite;
}
`;

export function SparkleText() {
  return (
    <div>
      <style>{sparkleAnimation}</style> {/* Add the animation style */}
      <div className="w-full mt-1 h-6 relative">
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-green-500 to-transparent h-[3px] w-3/4 blur-sm sparkle" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-green-500 to-transparent h-px w-3/4 sparkle" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-green-300 to-transparent h-[5px] w-1/4 blur-sm sparkle" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-green-300 to-transparent h-px w-1/4 sparkle" />
      </div>
    </div>
  );
}
