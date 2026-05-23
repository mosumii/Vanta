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
  const [loading, setLoading] = useState(true)
  const [showUGC, setShowUGC] = useState(false)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2400)
    return () => clearTimeout(timer)
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
      <AnimatePresence mode="wait">
        {loading ? (
          <Loader key="loader" />
        ) : (
          <>
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
          </>
        )}
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
