interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-3">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Progress</span>
        <span className="text-sm font-bold text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
          {current} <span className="text-gray-400">/ {total}</span>
        </span>
      </div>
      <div className="h-3 w-full bg-gray-100/50 backdrop-blur-sm rounded-full overflow-hidden shadow-inner border border-gray-200">
        <div
          className="h-full bg-gradient-to-r from-sakura-400 to-sakura-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(232,92,82,0.4)] relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
