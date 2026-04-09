interface BattleHeaderProps {
  hostName: string;
  guestName: string;
  hostScore: number;
  guestScore: number;
  hostProgress: number;
  guestProgress: number;
  totalQuestions: number;
}

export default function BattleHeader({
  hostName,
  guestName,
  hostScore,
  guestScore,
  hostProgress,
  guestProgress,
  totalQuestions
}: BattleHeaderProps) {
  return (
    <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50">
      <div className="flex items-center justify-between gap-4">
        {/* Host */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-black shadow-lg mb-2">
            {hostName.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-bold text-gray-800 truncate max-w-[120px]">{hostName}</p>
          <p className="text-2xl font-black text-indigo-500 mt-1">{hostScore}</p>
          {/* Progress bar */}
          <div className="w-full mt-2 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(hostProgress / totalQuestions) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 font-medium">{hostProgress}/{totalQuestions}</p>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center px-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sakura-400 to-sakura-600 flex items-center justify-center shadow-xl">
              <span className="text-white text-xl font-black tracking-tighter">VS</span>
            </div>
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-sakura-400 to-sakura-600 opacity-30 blur-md -z-10 animate-pulse" />
          </div>
        </div>

        {/* Guest */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl font-black shadow-lg mb-2">
            {guestName ? guestName.charAt(0).toUpperCase() : '?'}
          </div>
          <p className="text-sm font-bold text-gray-800 truncate max-w-[120px]">{guestName || 'Waiting...'}</p>
          <p className="text-2xl font-black text-teal-500 mt-1">{guestScore}</p>
          {/* Progress bar */}
          <div className="w-full mt-2 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${(guestProgress / totalQuestions) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 font-medium">{guestProgress}/{totalQuestions}</p>
        </div>
      </div>
    </div>
  );
}
