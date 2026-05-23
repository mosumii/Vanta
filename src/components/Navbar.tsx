import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar({ onOpenUGC }: { onOpenUGC?: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-6"
      >
        <div
          className={`rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto transition-all duration-500 ${
            scrolled ? 'liquid-glass bg-white/[0.03]' : ''
          }`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <span
              className="text-2xl text-white"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              <em>V</em>
            </span>
            <span className="text-sm tracking-[0.2em] uppercase font-sans text-white/80 group-hover:text-white transition-colors">
              anta Creatives
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onOpenUGC}
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Join as Creator
            </button>
            <a
              href="#contact"
              className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Start a Project
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden text-white/80 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
          >
            {links.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ delay: i * 0.1 }}
                className="text-3xl text-white/80 hover:text-white transition-colors"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ delay: 0.4 }}
              className="mt-4 liquid-glass rounded-full px-8 py-3 text-white text-lg"
            >
              Start a Project
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
