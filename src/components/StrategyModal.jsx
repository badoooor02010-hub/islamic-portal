import { useRef, useState } from 'react'
import { LEARNING_STYLES, SECTION_ACCENTS, TABS } from '../constants'
import Modal from './Modal'

export default function StrategyModal({ section = 'strategies', initial, defaultStyle = 'visual', onClose, onSubmit }) {
  const isEdit = Boolean(initial)
  const accent = SECTION_ACCENTS[section]
  const sectionLabel = TABS[section]?.label || 'استراتيجية'
  const [style, setStyle] = useState(initial?.style || defaultStyle)
  const [title, setTitle] = useState(initial?.title || '')
  const [content, setContent] = useState(initial?.content || '')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return setError('الرجاء إدخال العنوان')
    setBusy(true)
    setProgress(0)
    setError('')
    try {
      await onSubmit(
        {
          title: title.trim(),
          content: content.trim(),
          ...(section === 'learningStyles' ? { style } : {}),
        },
        file,
        (done, total) => setProgress(Math.round((done / total) * 100)),
      )
      setTitle('')
      setContent('')
      setFile(null)
      setError('')
    } catch (err) {
      console.error('[islamic-portal] strategy submit failed:', err)
      setError(
        err?.message === 'file-too-large'
          ? 'حجم الملف كبير جداً، يرجى اختيار ملف أصغر من 20 ميجابايت'
          : err?.message === 'timeout'
            ? 'انتهت مهلة الحفظ — تحققي من اتصال الإنترنت وقواعد Firestore'
            : 'حدث خطأ أثناء الحفظ، حاولي مرة أخرى',
      )
      setBusy(false)
    }
  }

  return (
    <Modal
      title={isEdit ? `✏️ تعديل — ${sectionLabel}` : `${TABS[section]?.emoji || '➕'} إضافة — ${sectionLabel}`}
      onClose={onClose}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {section === 'learningStyles' && (
          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
              نمط التعلم
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full rounded-xl border border-indigo-200 bg-indigo-50/40 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
            >
              {LEARNING_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.label} ({s.en})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-700">
            العنوان
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: التعلم التعاوني في حصة الدراسات الإسلامية"
            className="w-full rounded-xl border border-indigo-200 bg-indigo-50/40 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-700">
            الوصف / الخطوات
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="اكتبي الشرح وخطوات التطبيق..."
            className="w-full resize-y rounded-xl border border-indigo-200 bg-indigo-50/40 px-4 py-2.5 text-sm leading-relaxed outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-700">
            ملف مرفق <span className="font-normal text-gray-400">(اختياري — صورة، فيديو، PDF أو Word، حتى 20 ميجابايت)</span>
          </label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 px-4 py-5 text-sm font-semibold text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50"
          >
            <span className="text-2xl">📎</span>
            {file ? file.name : isEdit && initial?.fileName ? `الملف الحالي: ${initial.fileName}` : 'اضغطي لإرفاق ملف'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {error && (
          <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-600 ring-1 ring-amber-200">
            {error}
          </p>
        )}

        {busy && progress > 0 && (
          <div className="space-y-1.5">
            <div className={`h-2.5 w-full overflow-hidden rounded-full ${accent.bar}`}>
              <div
                className={`h-full rounded-full transition-all duration-300 ${accent.barFill}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className={`text-center text-xs font-bold ${accent.barText}`}>
              جاري رفع الملف... {progress}%
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className={`w-full rounded-xl py-3 font-display text-base font-extrabold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-60 ${accent.submitBtn}`}
        >
          {busy
            ? progress > 0
              ? `جارٍ الحفظ... ${progress}%`
              : 'جارٍ تجهيز الملف...'
            : isEdit
              ? 'حفظ التعديلات'
              : 'نشر'}
        </button>
      </form>
    </Modal>
  )
}
