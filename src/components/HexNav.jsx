import { BookOpen, Brain, Lightbulb } from 'lucide-react'
import { TABS } from '../constants'

const ICONS = {
  grade1: BookOpen,
  strategies: Lightbulb,
  learningStyles: Brain,
}

const tabs = [TABS.grade1, TABS.strategies, TABS.learningStyles]

export default function HexNav({ active, onChange }) {
  return (
    <nav className="mx-auto -mt-2 flex max-w-4xl flex-wrap items-center justify-center gap-5 px-4 py-8 sm:gap-10">
      {tabs.map((tab) => {
        const isActive = active === tab.id
        const Icon = ICONS[tab.id]
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`hex-btn hex-clip group h-36 w-40 sm:h-40 sm:w-48 ${
              isActive ? 'hex-active' : ''
            }`}
            aria-pressed={isActive}
          >
            <span
              className={`hex-clip absolute inset-0 ${
                isActive
                  ? 'bg-gradient-to-br from-indigo-300 via-sky-400 to-indigo-400'
                  : 'bg-gradient-to-br from-indigo-100 via-indigo-200 to-sky-200'
              }`}
            />
            <span
              className={`hex-inner hex-clip flex flex-col items-center justify-center gap-1.5 px-2 ${
                isActive
                  ? 'bg-gradient-to-br from-indigo-500/95 via-indigo-400/95 to-sky-300/95 text-white'
                  : 'bg-white/95 text-indigo-900'
              }`}
            >
              <span
                className={`grid h-12 w-12 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 ${
                  isActive
                    ? 'bg-white/25 ring-1 ring-white/50 shadow-inner'
                    : 'bg-indigo-50 ring-1 ring-indigo-200 shadow-sm'
                }`}
              >
                <Icon
                  className={isActive ? 'text-white' : 'text-indigo-600'}
                  size={26}
                  strokeWidth={2.2}
                />
              </span>
              <span className="w-full text-balance text-center font-display text-[13px] font-extrabold leading-tight sm:text-base">
                {tab.label}
              </span>
              <span
                className={`w-full text-center text-[11px] font-semibold leading-none ${
                  isActive ? 'text-indigo-100' : 'text-indigo-400'
                }`}
              >
                {tab.id === 'grade1' ? 'أبحاث ومشاريع' : 'للمعلمة'}
              </span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}
