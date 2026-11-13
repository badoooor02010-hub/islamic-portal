import { useEffect, useMemo, useState } from 'react'
import AddPostModal from './components/AddPostModal'
import Header from './components/Header'
import HexNav from './components/HexNav'
import LoginModal from './components/LoginModal'
import { PostCard, StrategyCard } from './components/PostCard'
import SideFrames from './components/SideFrames'
import Sidebar from './components/Sidebar'
import StrategyModal from './components/StrategyModal'
import { LEARNING_STYLES, SECTION_ACCENTS, TABS, TEACHER_TABS } from './constants'
import { store } from './store'

export default function App() {
  const [tab, setTab] = useState('grade1')
  const [filter, setFilter] = useState('all')
  const [posts, setPosts] = useState([])
  const [sections, setSections] = useState({ strategies: [], learningStyles: [] })
  const [isTeacher, setIsTeacher] = useState(false)
  const [modal, setModal] = useState(null) // 'add' | 'login' | 'strategy'
  const [editing, setEditing] = useState(null)
  const [styleFilter, setStyleFilter] = useState('all')
  const [defaultStyle, setDefaultStyle] = useState('visual')
  const [toast, setToast] = useState('')
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [dbError, setDbError] = useState(false)

  const isTeacherTab = TEACHER_TABS.includes(tab)
  const sectionItems = isTeacherTab ? sections[tab] : []
  const accent = SECTION_ACCENTS[tab]

  useEffect(() => {
    const onErr = () => setDbError(true)
    const unsubs = [
      store.subscribePosts(setPosts, onErr),
      store.subscribeStrategies((items) =>
        setSections((s) => ({ ...s, strategies: items })),
      ),
      store.subscribeLearningStyles((items) =>
        setSections((s) => ({ ...s, learningStyles: items })),
      ),
      store.onAuth(setIsTeacher),
    ]
    return () => unsubs.forEach((u) => u())
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const switchTab = (t) => {
    setTab(t)
    setFilter('all')
    setStyleFilter('all')
  }

  const gradePosts = useMemo(
    () => posts.filter((p) => p.grade === 'grade1'),
    [posts],
  )

  const visiblePosts = useMemo(
    () =>
      filter === 'all'
        ? gradePosts
        : gradePosts.filter((p) => p.category === filter),
    [gradePosts, filter],
  )

  const counts = useMemo(() => {
    const map = {}
    for (const p of gradePosts) map[p.category] = (map[p.category] || 0) + 1
    return map
  }, [gradePosts])

  const closeModal = () => {
    setModal(null)
    setEditing(null)
  }

  const showToast = (msg) => {
    setToast('')
    requestAnimationFrame(() => setToast(msg))
  }

  async function handlePostSubmit(data, file, onProgress) {
    if (editing) {
      await store.updatePost(editing, data, file, onProgress)
      showToast('تم تعديل المشاركة بنجاح')
    } else {
      await store.addPost(data, file, onProgress)
      showToast('تم نشر مشاركتك بنجاح! 🎉')
    }
    closeModal()
  }

  async function handleStrategySubmit(data, file, onProgress) {
    if (editing) {
      await store.updateStrategy(tab, editing, data, file, onProgress)
      showToast('تم التعديل بنجاح')
    } else {
      await store.addStrategy(tab, data, file, onProgress)
      showToast('تمت الإضافة بنجاح')
    }
    closeModal()
  }

  async function handleLogin(email, password) {
    await store.signIn(email, password)
    setIsTeacher(true)
    closeModal()
    showToast('مرحباً أستاذة بدرية 🤍')
  }

  async function handleLogout() {
    await store.signOut()
    setIsTeacher(false)
    showToast('تم تسجيل الخروج')
  }

  async function handleDeletePost(post) {
    if (!isTeacher) return
    if (!window.confirm(`حذف مشاركة "${post.studentName}"؟`)) return
    try {
      await store.deletePost(post)
      showToast('تم حذف المشاركة')
    } catch (err) {
      console.error('[islamic-portal] delete failed:', err)
      showToast('تعذر حذف المشاركة — تحققي من الاتصال والقواعد')
    }
  }

  async function handleDeleteStrategy(item) {
    if (!isTeacher) return
    if (!window.confirm(`حذف "${item.title}"؟`)) return
    try {
      await store.deleteStrategy(tab, item)
      showToast('تم الحذف')
    } catch (err) {
      console.error('[islamic-portal] delete failed:', err)
      showToast('تعذر الحذف — تحققي من الاتصال والقواعد')
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Header
        isTeacher={isTeacher}
        onLogin={() => setModal('login')}
        onLogout={handleLogout}
      />

      {!bannerDismissed && store.mode === 'demo' && (
        <Banner
          onDismiss={() => setBannerDismissed(true)}
          text={
            <>
              ⚠️ وضع المعاينة — لم يتم ربط Firebase بعد. البيانات تُحفظ محلياً في
              المتصفح. أضيفي إعدادات مشروعك في ملف <code dir="ltr">.env</code>{' '}
              لتفعيل النشر الفوري.
            </>
          }
        />
      )}

      {dbError && (
        <div className="mx-4 mt-4 flex max-w-4xl items-center justify-between gap-3 rounded-2xl bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 ring-1 ring-amber-200 sm:mx-auto">
          <p>
            ❌ تعذر الاتصال بقاعدة البيانات — تأكدي من إعدادات{' '}
            <code dir="ltr">.env</code> ومن نشر قواعد Firestore
            (firestore.rules). راجعي وحدة التحكم (Console) للتفاصيل.
          </p>
          <button
            onClick={() => setDbError(false)}
            className="shrink-0 rounded-lg bg-amber-100 px-2.5 py-1 text-amber-600 transition hover:bg-amber-200"
          >
            إخفاء
          </button>
        </div>
      )}

      <HexNav active={tab} onChange={switchTab} />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[270px_1fr]">
        <Sidebar
          tab={tab}
          filter={filter}
          onFilter={setFilter}
          counts={counts}
          total={isTeacherTab ? sectionItems.length : gradePosts.length}
        />

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-extrabold text-gray-800">
              {TABS[tab].emoji} {TABS[tab].label}
              <span className="mr-2 text-sm font-semibold text-indigo-400">
                ({isTeacherTab ? sectionItems.length : visiblePosts.length})
              </span>
            </h2>

            {!isTeacherTab ? (
              <button
                onClick={() => setModal('add')}
                className="rounded-2xl bg-gradient-to-l from-indigo-400 via-sky-400 to-indigo-500 px-6 py-3 font-display text-base font-extrabold text-white shadow-lg shadow-indigo-300/60 transition hover:scale-105 hover:shadow-indigo-400/50"
              >
                ➕ إضافة مشاركة جديدة
              </button>
            ) : isTeacher ? (
              <button
                onClick={() => setModal('strategy')}
                className={`rounded-2xl px-6 py-3 font-display text-base font-extrabold text-white shadow-lg transition hover:scale-105 ${accent.addBtn}`}
              >
                ➕ إضافة
              </button>
            ) : (
              <span className="rounded-2xl bg-indigo-50 px-5 py-2.5 text-sm font-bold text-indigo-600 ring-1 ring-indigo-200">
                🔒 للقراءة فقط — النشر للمعلمة
              </span>
            )}
          </div>

          {isTeacherTab ? (
            tab === 'learningStyles' ? (
              <LearningStylesBoard
                items={sectionItems}
                filter={styleFilter}
                onFilter={setStyleFilter}
                isTeacher={isTeacher}
                accent={accent}
                onAdd={(style) => {
                  setEditing(null)
                  setDefaultStyle(style)
                  setModal('strategy')
                }}
                onEdit={(item) => {
                  setEditing(item)
                  setModal('strategy')
                }}
                onDelete={handleDeleteStrategy}
              />
            ) : sectionItems.length === 0 ? (
              <EmptyState
                icon={TABS[tab].emoji}
                title="لا يوجد محتوى منشور بعد"
                subtitle={isTeacher ? 'اضغطي "إضافة" لنشر أول محتوى' : 'تابعي هذا القسم لاحقاً'}
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {sectionItems.map((item) => (
                  <StrategyCard
                    key={item.id}
                    item={item}
                    accent={accent}
                    coll={tab}
                    isTeacher={isTeacher}
                    onEdit={() => {
                      setEditing(item)
                      setModal('strategy')
                    }}
                    onDelete={() => handleDeleteStrategy(item)}
                  />
                ))}
              </div>
            )
          ) : visiblePosts.length === 0 ? (
            <EmptyState
              icon={TABS[tab].emoji}
              title="لا توجد مشاركات هنا بعد"
              subtitle='كوني أول من يشارك! اضغطي "إضافة مشاركة جديدة"'
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isTeacher={isTeacher}
                  onEdit={() => {
                    setEditing(post)
                    setModal('add')
                  }}
                  onDelete={() => handleDeletePost(post)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <SideFrames />

      <footer className="border-t border-indigo-100 bg-white/60 py-6 text-center text-sm font-medium text-indigo-500">
        <p>أبحاث ومشاريع الدراسات الإسلامية — إشراف الأستاذة بدرية المالكي 🕌</p>
      </footer>

      {modal === 'add' && (
        <AddPostModal
          initial={editing}
          onClose={closeModal}
          onSubmit={handlePostSubmit}
        />
      )}
      {modal === 'login' && (
        <LoginModal
          demo={store.mode === 'demo'}
          onClose={closeModal}
          onSubmit={handleLogin}
        />
      )}
      {modal === 'strategy' && (
        <StrategyModal
          section={tab}
          initial={editing}
          defaultStyle={styleFilter !== 'all' ? styleFilter : defaultStyle}
          onClose={closeModal}
          onSubmit={handleStrategySubmit}
        />
      )}

      {toast && (
        <div className="animate-modal-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-indigo-600 px-6 py-3.5 font-display text-sm font-bold text-white shadow-2xl shadow-indigo-300/60">
          {toast}
        </div>
      )}
    </div>
  )
}

function Banner({ text, onDismiss }) {
  return (
    <div className="mx-4 mt-4 flex max-w-4xl items-center justify-between gap-3 rounded-2xl bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-200 sm:mx-auto">
      <p>{text}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-lg bg-amber-100 px-2.5 py-1 text-amber-700 transition hover:bg-amber-200"
      >
        إخفاء
      </button>
    </div>
  )
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-indigo-200 bg-white/50 px-6 py-16 text-center">
      <span className="animate-float p-1 text-5xl leading-[1.3]">{icon}</span>
      <p className="font-display text-lg font-extrabold text-indigo-800">{title}</p>
      <p className="text-sm font-medium text-indigo-500/80">{subtitle}</p>
    </div>
  )
}

function StyleChip({ active, onClick, children, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
        active
          ? 'bg-gradient-to-l from-indigo-400 to-sky-400 text-white shadow-md shadow-indigo-200/60'
          : 'bg-white/80 text-indigo-800 ring-1 ring-indigo-100 hover:bg-indigo-50'
      }`}
    >
      {children}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[11px] leading-none ${
          active ? 'bg-white/25' : 'bg-indigo-100 text-indigo-600'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

function StyleSection({ style, items, isTeacher, accent, onAdd, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-3xl border border-indigo-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-2xl ring-1 ring-indigo-100">
            {style.icon}
          </span>
          <div>
            <h3 className="font-display text-lg font-extrabold text-indigo-900">
              {style.label}
              <span dir="ltr" className="mr-2 text-xs font-semibold text-indigo-400">
                {style.en} Learner
              </span>
            </h3>
            <p className="mt-1 max-w-2xl text-sm font-medium leading-relaxed text-gray-600">
              {style.desc}
            </p>
            <p className="mt-1 text-xs font-semibold text-indigo-500/90">
              💡 {style.hint}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 ring-1 ring-indigo-100">
            {items.length} عنصر
          </span>
          {isTeacher && (
            <button
              onClick={() => onAdd(style.id)}
              className="rounded-xl bg-gradient-to-l from-indigo-400 to-sky-400 px-4 py-2 text-sm font-extrabold text-white shadow-md shadow-indigo-200/60 transition hover:scale-105"
            >
              ➕ إضافة هنا
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-indigo-200 bg-white/50 px-4 py-8 text-center text-sm font-semibold text-indigo-400">
          لا يوجد محتوى في {style.label} بعد
          {isTeacher ? ' — اضغطي "إضافة هنا" لنشر أول استراتيجية' : ''}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <StrategyCard
              key={item.id}
              item={item}
              accent={accent}
              coll="learningStyles"
              isTeacher={isTeacher}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LearningStylesBoard({ items, filter, onFilter, isTeacher, accent, onAdd, onEdit, onDelete }) {
  const counts = {}
  const uncategorized = []
  for (const item of items) {
    if (LEARNING_STYLES.some((s) => s.id === item.style)) {
      counts[item.style] = (counts[item.style] || 0) + 1
    } else {
      uncategorized.push(item)
    }
  }
  const visible =
    filter === 'all' ? LEARNING_STYLES : LEARNING_STYLES.filter((s) => s.id === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StyleChip active={filter === 'all'} onClick={() => onFilter('all')} count={items.length}>
          ✨ الكل
        </StyleChip>
        {LEARNING_STYLES.map((s) => (
          <StyleChip
            key={s.id}
            active={filter === s.id}
            onClick={() => onFilter(s.id)}
            count={counts[s.id] || 0}
          >
            {s.icon} {s.label}
          </StyleChip>
        ))}
      </div>

      {visible.map((s) => (
        <StyleSection
          key={s.id}
          style={s}
          items={items.filter((it) => it.style === s.id)}
          isTeacher={isTeacher}
          accent={accent}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {filter === 'all' && uncategorized.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display text-base font-extrabold text-gray-500">
            📎 غير مصنف
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {uncategorized.map((item) => (
              <StrategyCard
                key={item.id}
                item={item}
                accent={accent}
                coll="learningStyles"
                isTeacher={isTeacher}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
