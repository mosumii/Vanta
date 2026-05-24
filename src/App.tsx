import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Loader from './components/Loader'
import Navbar from './components/Navbar'
import QuestionnaireModal from './components/QuestionnaireModal'
import KineticTransition from './components/KineticTransition'
import MorphTransition from './components/MorphTransition'
import Hero from './sections/Hero'
import Reel from './sections/Reel'
import Services from './sections/Services'
import UGCShowcase from './sections/UGCShowcase'
import Work from './sections/Work'
import Pricing from './sections/Pricing'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import UGCApply from './sections/UGCApply'

// Free Mixkit video URL used as a soft parallax background (NOT scroll-scrubbed)
const BG_VIDEO = 'https://assets.mixkit.co/videos/22614/22614-720.mp4'

export default function App() {
  // Loader policy:
  //   - Always render the page content immediately (no blank screen).
  //   - Only show the loader overlay if the page isn't ready within 200ms.
  //     On fast loads (warm cache, fast network), the user never sees it.
  //   - If the loader does show, keep it visible for at least 600ms so
  //     it doesn't flash for a single frame.
  //   - "Ready" = fonts loaded (the realistic cause of layout shift here).
  const [showLoader, setShowLoader] = useState(false)
  const [showUGC, setShowUGC] = useState(false)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)

  useEffect(() => {
    let cancelled = false
    let shownAt = 0
    const SHOW_DELAY = 200
    const MIN_VISIBLE = 600

    const showTimer = window.setTimeout(() => {
      if (cancelled) return
      shownAt = performance.now()
      setShowLoader(true)
    }, SHOW_DELAY)

    const hide = () => {
      if (cancelled) return
      window.clearTimeout(showTimer)
      if (shownAt === 0) {
        // Loader was never shown — nothing to do.
        return
      }
      const elapsed = performance.now() - shownAt
      const wait = Math.max(0, MIN_VISIBLE - elapsed)
      window.setTimeout(() => { if (!cancelled) setShowLoader(false) }, wait)
    }

    // Wait for fonts (Instrument Serif + Inter) — the genuine source of
    // perceived layout shift. Fall back to window.load if not supported.
    const fontReady = (document as Document & { fonts?: FontFaceSet }).fonts?.ready
    if (fontReady) {
      fontReady.then(hide)
    } else if (document.readyState === 'complete') {
      hide()
    } else {
      window.addEventListener('load', hide, { once: true })
    }

    return () => {
      cancelled = true
      window.clearTimeout(showTimer)
      window.removeEventListener('load', hide)
    }
  }, [])

  useEffect(() => {
    (window as any).__openUGC = () => setShowUGC(true);
    (window as any).__openQuestionnaire = () => setShowQuestionnaire(true)
    return () => {
      delete (window as any).__openUGC
      delete (window as any).__openQuestionnaire
    }
  }, [])

  return (
    <div className="grain">
      <Navbar onOpenUGC={() => setShowUGC(true)} />
      <main>
        <Hero />
        <UGCShowcase />
        <Reel />
        <Services />

        {/* ── Kinetic typography transition: Services → Work ── */}
        <KineticTransition
          label="PORTFOLIO"
          subtitle="Selected Work"
          title="See what we've"
          accent="built"
          videoSrc={BG_VIDEO}
          height="150vh"
        />

        <Work />

        {/* ── Liquid mesh transition: Work → Pricing ── */}
        <MorphTransition
          subtitle="Pricing"
          title="Simple plans for"
          accent="serious brands"
          palette="mixed"
          height="100vh"
        />

        <Pricing onOpenQuestionnaire={() => setShowQuestionnaire(true)} />
        <Contact />
      </main>
      <Footer onOpenUGC={() => setShowUGC(true)} />

      {/* Loader overlay — only mounts if first paint is slow */}
      <AnimatePresence>
        {showLoader && <Loader key="loader" />}
      </AnimatePresence>

      <AnimatePresence>
        {showUGC && <UGCApply onClose={() => setShowUGC(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showQuestionnaire && <QuestionnaireModal onClose={() => setShowQuestionnaire(false)} />}
      </AnimatePresence>
    </div>
  )
}
