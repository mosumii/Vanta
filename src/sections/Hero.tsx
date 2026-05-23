import { useRef, useState, useEffect, useCallback } from 'react'
import { ArrowRight, Calendar, Sparkles } from 'lucide-react'
import { CONFIG } from '../config'

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef<number | null>(null)
  const opacityRef = useRef(0)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  // Fade-in on first play only — loop natively afterwards
  const cancelFade = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const fadeIn = useCallback(() => {
    cancelFade()
    const video = videoRef.current
    if (!video) return

    const start = opacityRef.current
    const startTime = performance.now()
    const duration = 800

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const current = start + (1 - start) * progress
      opacityRef.current = current
      video.style.opacity = String(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        rafRef.current = null
      }
    }

    rafRef.current = requestAnimationFrame(step)
  }, [cancelFade])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let hasFadedIn = false

    const handlePlay = () => {
      if (!hasFadedIn) {
        hasFadedIn = true
        fadeIn()
      }
    }

    video.addEventListener('play', handlePlay)
    return () => {
      cancelFade()
      video.removeEventListener('play', handlePlay)
    }
  }, [fadeIn, cancelFade])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Stash the captured email/name so Contact form pre-fills
      try {
        sessionStorage.setItem('vanta_prefill_email', email)
        if (name) sessionStorage.setItem('vanta_prefill_name', name)
      } catch { /* ignore */ }
      const el = document.getElementById('contact')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex flex-col">
      {/* ── Full-screen background video ── */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover translate-y-[17%]"
        style={{ opacity: 0 }}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
        muted
        autoPlay
        playsInline
        loop
      />

      {/* ── Ambient color wash over video ── */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 40%, transparent 0%, rgba(8,8,8,0.4) 70%, rgba(8,8,8,0.7) 100%)',
        }}
      />

      {/* ── Bottom gradient blend ── */}
      <div className="absolute bottom-0 left-0 right-0 h-72 z-[2] pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(8,8,8,0.5) 35%, rgba(8,8,8,0.85) 65%, #080808 100%)',
        }}
      />

      {/* ── Hero content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-28 md:py-32 text-center">

        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-6 liquid-glass rounded-full px-4 py-2">
          <Sparkles size={14} className="text-gold" />
          <span className="text-[11px] tracking-[0.3em] uppercase text-white/85">
            Strategy call · on us
          </span>
        </div>

        {/* Headline — softer, more action-oriented */}
        <h1
          className="text-3xl md:text-5xl lg:text-6xl text-white mb-3 tracking-tight max-w-3xl leading-[1.1]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Let's build something <em className="text-gradient-bold">unforgettable</em>.
        </h1>
        <p className="text-white/80 text-sm md:text-base max-w-md mb-10 font-sans">
          Tell us about your brand. We'll send back a plan.
        </p>

        {/* ── Primary sign-up form ── */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl liquid-glass rounded-3xl p-2 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-white/[0.02] rounded-2xl px-5 py-3.5 text-white placeholder:text-white/40 text-sm outline-none font-sans focus:bg-white/[0.05] transition-colors"
            />
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/[0.02] rounded-2xl px-5 py-3.5 text-white placeholder:text-white/40 text-sm outline-none font-sans focus:bg-white/[0.05] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="group w-full bg-white text-black rounded-2xl py-4 font-medium text-sm tracking-wide hover:bg-gold hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
          >
            Get Your Game Plan
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Secondary CTA — direct Calendly */}
        <a
          href={CONFIG.CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-white/60 hover:text-gold text-sm font-medium transition-colors group"
        >
          <Calendar size={14} />
          <span>Or book a strategy call directly</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      {/* Bottom spacer to preserve Hero rhythm */}
      <div className="pb-10" />
    </section>
  )
}
