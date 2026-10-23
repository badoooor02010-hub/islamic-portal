import { CATEGORIES, SECTION_ACCENTS, TABS, TEACHER_TABS } from '../constants'

const TEACHER_SECTION_INFO = {
  strategies:
    'هذا القسم مخصص لعرض استراتيجيات التدريس التي تنشرها الأستاذة، وهو للقراءة فقط للطالبات والزائرات.',
  learningStyles:
    'هذا القسم مخصص لعرض استراتيجيات أنماط التعلم التي تنشرها الأستاذة، وهو للقراءة فقط للطالبات والزائرات.',
}

export default function Sidebar({ tab, filter, onFilter, counts, total }) {
  if (TEACHER_TABS.includes(tab)) {
    const accent = SECTION_ACCENTS[tab]
    return (
      <aside className="rounded-3xl border border-indigo-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <h3 className="font-display text-lg font-extrabold text-indigo-800">
          {TABS[tab].emoji} {TABS[tab].label}
        </h3>
        <div className={`mt-4 rounded-2xl p-4 text-sm leading-relaxed ring-1 ${accent.infoBox}`}>
          <p className="font-bold">🔒 قسم خاص بالمعلمة</p>
          <p className={`mt-1.5 ${accent.infoSub}`}>{TEACHER_SECTION_INFO[tab]}</p>
        </div>
        <p className="mt-4 text-center text-sm font-semibold text-indigo-500">
          {total} عنصر منشور
        </p>
      </aside>
    )
  }

  const categories = CATEGORIES[tab] || []

  return (
    <aside className="rounded-3xl border border-indigo-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
      <h3 className="font-display text-lg font-extrabold text-indigo-800">
        📂 تصنيفات {TABS[tab].label}
      </h3>
      <ul className="mt-4 space-y-1.5">
        <li>
          <button
            onClick={() => onFilter('all')}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              filter === 'all'
                ? 'bg-gradient-to-l from-indigo-400 to-sky-300 text-white shadow-md shadow-indigo-200/60'
                : 'text-indigo-900/80 hover:-translate-x-1 hover:bg-indigo-50 hover:shadow-sm'
            }`}
          >
            <span>✨ الكل</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                filter === 'all' ? 'bg-white/25' : 'bg-indigo-100 text-indigo-600'
              }`}
            >
              {total}
            </span>
          </button>
        </li>
        {categories.map((cat) => {
          const active = filter === cat.id
          const count = counts[cat.id] || 0
          return (
            <li key={cat.id}>
              <button
                onClick={() => onFilter(cat.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-l from-indigo-400 to-sky-300 text-white shadow-md shadow-indigo-200/60'
                    : 'text-indigo-900/80 hover:-translate-x-1 hover:bg-indigo-50 hover:shadow-sm'
                }`}
              >
                <span>
                  {cat.icon} {cat.label}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active ? 'bg-white/25' : 'bg-indigo-100 text-indigo-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
