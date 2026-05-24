import { motion } from 'framer-motion'

export default function Loader() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Wrapper — `overflow-visible` + padding keeps the italic glyph from clipping */}
      <div className="relative overflow-visible px-6 py-4">
        {/* Animated V letter
            - leading-[1.15] gives the italic ascender/descender room
            - pt-2 / pl-3 compensates for the italic slant pushing the glyph up-left
            - inline-block makes the box hug the actual glyph, not the line box */}
        <motion.div
          className="inline-block text-8xl md:text-[10rem] font-serif italic text-gradient leading-[1.15] pt-2 pl-3 pr-1 pb-1"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          V
        </motion.div>

        {/* Expanding ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-gold/30 pointer-events-none"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 2.5, opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
          style={{ margin: '-50%' }}
        />

        {/* Subtitle reveal */}
        <motion.p
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm tracking-[0.4em] uppercase text-warm-white/50 font-sans whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          Creatives
        </motion.p>
      </div>
    </motion.div>
  )
}
