import { motion } from 'framer-motion'
import { CONFIG } from '../config'

export default function Footer({ onOpenUGC }: { onOpenUGC?: () => void }) {
  return (
    <footer className="relative py-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-4xl font-serif italic text-gradient">V</span>
              <span className="text-sm tracking-[0.3em] uppercase text-warm-white/50">anta Creatives</span>
            </div>
            <p className="text-warm-white/60 text-sm leading-relaxed max-w-xs">
              Bold creative for brands that refuse to blend in.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-xs tracking-[0.3em] uppercase text-warm-white/70 mb-4">Navigate</h4>
            <div className="space-y-3">
              {['Work', 'Services', 'Pricing', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block text-sm text-warm-white/75 hover:text-warm-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* More */}
          <div>
            <h4 className="text-xs tracking-[0.3em] uppercase text-warm-white/70 mb-4">More</h4>
            <div className="space-y-3">
              <button
                onClick={onOpenUGC}
                className="block text-sm text-warm-white/75 hover:text-warm-white transition-colors text-left"
              >
                Join as Creator
              </button>
              <a
                href={`mailto:${CONFIG.EMAIL}`}
                className="block text-sm text-warm-white/75 hover:text-warm-white transition-colors"
              >
                {CONFIG.EMAIL}
              </a>
              {['Privacy', 'Terms'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block text-sm text-warm-white/75 hover:text-warm-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-warm-white/45 text-xs">
            &copy; {new Date().getFullYear()} Vanta Creatives. All rights reserved.
          </p>
          <p className="text-warm-white/45 text-xs">
            Designed & built with intention.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
