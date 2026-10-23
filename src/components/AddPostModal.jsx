import { useEffect, useRef, useState } from 'react'
import { CATEGORIES } from '../constants'
import Modal from './Modal'

export default function AddPostModal({ initial, onClose, onSubmit }) {
  const isEdit = Boolean(initial)
  const [studentName, setStudentName] = useState(initial?.studentName || '')
  const [category, setCategory] = useState(initial?.category || '')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const categories = CATEGORIES.grade1
  const validCategory = categories.some((c) => c.id === category)
    ? category
    : categories[0]?.id || ''

  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  function handleFileChange(e) {
    const f = e.target.files?.[0] || null
    setFile(f)
    setPreview(f && f.type.startsWith('image/') ? URL.createObjectURL(f) : null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!studentName.trim()) return setError('الرجاء إدخال اسم الطالبة')
    if (!validCategory) return setError('الرجاء اختيار التصنيف')
    if (!isEdit && !file) return setError('الرجاء إرفاق ملف المشروع أو البحث')
    setBusy(true)
    setProgress(0)
    setError('')
    try {
      await onSubmit(
        { studentName: studentName.trim(), grade: 'grade1', category: validCategory },
        file,
        (done, total) => setProgress(Math.round((done / total) * 100)),
      )
      setStudentName('')
      setFile(null)
      setPreview(null)
      setError('')
    } catch (err) {
      console.error('[islamic-portal] post submit failed:', err)
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
      title={isEdit ? '✏️ تعديل المشاركة' : '➕ إضافة مشاركة جديدة — أول متوسط'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-700">
            اسم الطالبة
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="اكتبي اسمك هنا..."
            className="w-full rounded-xl border border-indigo-200 bg-indigo-50/40 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-700">
            التصنيف
          </label>
          <select
            value={validCategory}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-indigo-200 bg-indigo-50/40 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-gray-700">
            ملف المشروع {isEdit && <span className="font-normal text-gray-400">(اتركيه فارغاً للإبقاء على الملف الحالي)</span>}
          </label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 px-4 py-6 text-sm text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50"
          >
            {preview ? (
              <img src={preview} alt="معاينة" className="max-h-32 rounded-lg object-contain" />
            ) : (
              <span className="text-3xl">📤</span>
            )}
            <span className="font-semibold">
              {file ? file.name : 'اضغطي لاختيار ملف — صورة، فيديو، PDF أو Word'}
            </span>
            <span className="text-[11px] font-normal text-indigo-400">
              حتى 20 ميجابايت — الصور الكبيرة تُضغط تلقائياً
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {error && (
          <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-600 ring-1 ring-amber-200">
            {error}
          </p>
        )}

        {busy && progress > 0 && (
          <div className="space-y-1.5">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-indigo-100">
              <div
                className="h-full rounded-full bg-gradient-to-l from-indigo-400 to-sky-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-xs font-bold text-indigo-500">
              جاري رفع الملف... {progress}%
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-gradient-to-l from-indigo-400 to-sky-400 py-3 font-display text-base font-extrabold text-white shadow-lg shadow-indigo-200/70 transition hover:scale-[1.02] disabled:opacity-60"
        >
          {busy
            ? progress > 0
              ? `جارٍ النشر... ${progress}%`
              : 'جارٍ تجهيز الملف...'
            : isEdit
              ? 'حفظ التعديلات'
              : 'نشر المشاركة 🕌'}
        </button>
      </form>
    </Modal>
  )
}
