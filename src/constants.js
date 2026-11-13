export const GRADES = {
  grade1: { id: 'grade1', label: 'أول متوسط', emoji: '1️⃣', color: 'indigo' },
}

export const TABS = {
  grade1: { id: 'grade1', label: 'أول متوسط', emoji: '1️⃣' },
  strategies: { id: 'strategies', label: 'استراتيجيات المعلمة', emoji: '🌟' },
  learningStyles: { id: 'learningStyles', label: 'استراتيجيات أنماط التعلم', emoji: '🧠' },
}

// الأقسام التي لا يمكن النشر فيها إلا للمعلمة المسجلة
export const TEACHER_TABS = ['strategies', 'learningStyles']

// مجموعات Firestore لكل قسم من أقسام المعلمة
export const TEACHER_COLLECTIONS = {
  strategies: 'strategies',
  learningStyles: 'learning_styles',
}

// لون مميز لكل قسم من أقسام المعلمة (كلاسات كاملة ليتعرف عليها Tailwind)
export const SECTION_ACCENTS = {
  strategies: {
    addBtn:
      'bg-gradient-to-l from-sky-400 via-blue-400 to-sky-500 shadow-sky-300/60 hover:shadow-sky-400/50',
    infoBox: 'bg-sky-50 text-sky-800 ring-sky-100',
    infoSub: 'text-sky-700/90',
    cardBorder: 'border-sky-100 shadow-sky-100/60',
    cardTitle: 'text-sky-900',
    bar: 'bg-sky-100',
    barFill: 'bg-gradient-to-l from-sky-400 to-blue-500',
    barText: 'text-sky-500',
    submitBtn:
      'bg-gradient-to-l from-sky-400 to-blue-500 shadow-sky-200/70',
  },
  learningStyles: {
    addBtn:
      'bg-gradient-to-l from-indigo-400 via-violet-400 to-indigo-500 shadow-indigo-300/60 hover:shadow-indigo-400/50',
    infoBox: 'bg-indigo-50 text-indigo-800 ring-indigo-100',
    infoSub: 'text-indigo-700/90',
    cardBorder: 'border-indigo-100 shadow-indigo-100/60',
    cardTitle: 'text-indigo-900',
    bar: 'bg-indigo-100',
    barFill: 'bg-gradient-to-l from-indigo-400 to-violet-500',
    barText: 'text-indigo-500',
    submitBtn:
      'bg-gradient-to-l from-indigo-400 to-violet-500 shadow-indigo-200/70',
  },
}

export const LEARNING_STYLES = [
  {
    id: 'visual',
    label: 'النمط البصري',
    en: 'Visual',
    icon: '👁️',
    desc: 'يفضل استخدام الصور، المخططات، الخرائط الذهنية، والرسوم التوضيحية.',
    hint: 'استراتيجيات مناسبة: عرض الفيديوهات، الألوان، والعروض التقديمية',
  },
  {
    id: 'auditory',
    label: 'النمط السمعي',
    en: 'Auditory',
    icon: '🔊',
    desc: 'يفضل الاستماع للشروحات الشفهية، المناقشات الجماعية، والمحاضرات.',
    hint: 'استراتيجيات مناسبة: الحوار المفتوح، الكتب الصوتية، وتكرار المعلومات بصوت مسموع',
  },
  {
    id: 'readwrite',
    label: 'النمط القرائي والكتابي',
    en: 'Read/Write',
    icon: '✍️',
    desc: 'يفضل الاعتماد على النصوص المكتوبة، قراءة الكتب، وتدوين الملاحظات والملخصات.',
    hint: 'استراتيجيات مناسبة: كتابة المقالات، قراءة الشروحات النصية، وتحويل البيانات إلى قوائم مكتوبة',
  },
  {
    id: 'kinesthetic',
    label: 'النمط الحركي',
    en: 'Kinesthetic',
    icon: '🏃‍♀️',
    desc: 'يفضل التجربة العملية، التطبيق المباشر، والأنشطة التي تتطلب حركة واستكشافاً.',
    hint: 'استراتيجيات مناسبة: التجارب المخبرية، النماذج المجسمة، والأنشطة اليدوية',
  },
]

export function learningStyleOf(id) {
  return LEARNING_STYLES.find((s) => s.id === id)
}

export const CATEGORIES = {
  grade1: [
    { id: 'tawhid', label: 'التوحيد', icon: '☝️' },
    { id: 'tafsir', label: 'التفسير', icon: '📖' },
    { id: 'hadith', label: 'الحديث', icon: '📜' },
    { id: 'fiqh', label: 'الفقه', icon: '⚖️' },
  ],
}

export function categoryLabel(grade, categoryId) {
  const found = (CATEGORIES[grade] || []).find((c) => c.id === categoryId)
  return found ? `${found.icon} ${found.label}` : categoryId
}

export const FILE_TYPE_META = {
  image: { label: 'صورة', icon: '🖼️' },
  video: { label: 'فيديو', icon: '🎬' },
  pdf: { label: 'PDF', icon: '📕' },
  word: { label: 'مستند Word', icon: '📘' },
  other: { label: 'ملف', icon: '📎' },
  none: { label: 'بدون ملف', icon: '📝' },
}

export function detectFileType(file) {
  const t = file.type || ''
  if (t.startsWith('image/')) return 'image'
  if (t.startsWith('video/')) return 'video'
  if (t === 'application/pdf' || /\.pdf$/i.test(file.name)) return 'pdf'
  if (t.includes('word') || /\.(doc|docx)$/i.test(file.name)) return 'word'
  return 'other'
}

function downloadUrl(url, fileName) {
  const a = document.createElement('a')
  a.href = url
  a.download = fileName || 'file'
  a.click()
}

export function openFileUrl(url, fileName, mime) {
  if (!url) return
  if (!url.startsWith('data:')) {
    const renderable = !mime || /^(image\/|video\/|application\/pdf)/.test(mime)
    // Popup blockers return null — fall back to a download so the file
    // is still reachable instead of silently doing nothing.
    if (renderable && window.open(url, '_blank', 'noopener')) return
    downloadUrl(url, fileName)
    return
  }
  const [meta, b64] = url.split(',')
  const dataMime = meta.match(/data:(.*?);/)?.[1] || 'application/octet-stream'
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  const blobUrl = URL.createObjectURL(new Blob([bytes], { type: dataMime }))
  const renderable = /^(image\/|video\/|application\/pdf)/.test(dataMime)
  if (!renderable || !window.open(blobUrl, '_blank', 'noopener')) {
    downloadUrl(blobUrl, fileName)
  }
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
}

export function formatDate(value) {
  if (!value) return ''
  const d = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
}
