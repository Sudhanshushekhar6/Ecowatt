"use client";

export function SparkleText() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tighter text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl/none">
        Prabhawatt
      </h1>
      <div className="w-full mt-1 h-4 relative">
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-green-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-green-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-green-300 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-green-300 to-transparent h-px w-1/4" />
      </div>
    </div>
  );
}
