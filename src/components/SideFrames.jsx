import { useEffect } from 'react'

// إطاران جانبيان رفيعان بزخرفة إسلامية — يتحركان مع تمرير الصفحة باتجاهين
// متعاكسين (parallax) ويتمدد عرضهما مع حجم الشاشة عبر clamp/vw.
export default function SideFrames() {
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          '--frame-shift',
          `${window.scrollY * 0.35}px`,
        )
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <div className="side-frame side-frame-right" aria-hidden="true" />
      <div className="side-frame side-frame-left" aria-hidden="true" />
    </>
  )
}
