import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  pulseSpeed: number
  pulseOffset: number
}

export default function ParticleField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Respect users who prefer reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let animationId: number | null = null
    let particles: Particle[] = []
    let isVisible = false
    // Reduce particle count on mobile / lower DPR devices
    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    const PARTICLE_COUNT = isCoarse ? 40 : 80
    const CONNECTION_DISTANCE = 120
    const MOUSE = { x: -1000, y: -1000 }

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    const init = () => {
      resize()
      particles = []
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulseOffset: Math.random() * Math.PI * 2,
        })
      }
    }

    const draw = (time: number) => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      // Update & draw particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        // Wrap around edges
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        // Mouse repulsion
        const dx = p.x - MOUSE.x
        const dy = p.y - MOUSE.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          const force = (150 - dist) / 150 * 0.8
          p.x += (dx / dist) * force
          p.y += (dy / dist) * force
        }

        // Pulse opacity
        const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(123, 97, 255, ${p.opacity * pulse})`
        ctx.fill()
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.15
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(200, 169, 96, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      if (isVisible && !document.hidden) {
        animationId = requestAnimationFrame(draw)
      } else {
        animationId = null
      }
    }

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      MOUSE.x = e.clientX - rect.left
      MOUSE.y = e.clientY - rect.top
    }

    const handleLeave = () => {
      MOUSE.x = -1000
      MOUSE.y = -1000
    }

    init()

    // Only animate while the canvas is in the viewport — saves a huge
    // amount of CPU on a section that's offscreen most of the time
    // (O(n²) connection checks on 80 particles ≈ 3160 distance calcs / frame).
    const start = () => {
      if (animationId === null) {
        animationId = requestAnimationFrame(draw)
      }
    }
    const stop = () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId)
        animationId = null
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible && !document.hidden) start()
        else stop()
      },
      { rootMargin: '100px' }
    )
    io.observe(canvas)

    // Also pause when the tab is backgrounded
    const handleVisibility = () => {
      if (document.hidden) stop()
      else if (isVisible) start()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove', handleMouse)
    canvas.addEventListener('mouseleave', handleLeave)

    return () => {
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouse)
      canvas.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
    />
  )
}
