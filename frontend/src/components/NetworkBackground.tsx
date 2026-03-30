import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
}

const BORDER_SIZE = 220
const MAX_SPEED = 0.3
const NUM_NODES = 60
const CONNECTION_DISTANCE = 150
const CENTER_REPULSION_FORCE = 0.05
const TEAL = '#2dd4bf'

/**
 * Initialize a single node in the border region of the canvas.
 *
 * @param width - Canvas width.
 * @param height - Canvas height.
 * @returns Node positioned within the peripheral border strip.
 */
function createBorderNode(width: number, height: number): Node {
  const side = Math.floor(Math.random() * 4)
  let x: number
  let y: number

  if (side === 0) {
    x = Math.random() * width
    y = Math.random() * BORDER_SIZE
  } else if (side === 1) {
    x = Math.random() * width
    y = height - Math.random() * BORDER_SIZE
  } else if (side === 2) {
    x = Math.random() * BORDER_SIZE
    y = Math.random() * height
  } else {
    x = width - Math.random() * BORDER_SIZE
    y = Math.random() * height
  }

  const angle = Math.random() * Math.PI * 2
  const speed = Math.random() * MAX_SPEED
  return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed }
}

/**
 * Check whether a node is within the clear central zone.
 *
 * @param node - Node to test.
 * @param width - Canvas width.
 * @param height - Canvas height.
 * @returns True when node is not in the 220px border strip.
 */
function isInCentralZone(node: Node, width: number, height: number): boolean {
  return (
    node.x > BORDER_SIZE &&
    node.x < width - BORDER_SIZE &&
    node.y > BORDER_SIZE &&
    node.y < height - BORDER_SIZE
  )
}

/**
 * Render a full-viewport fixed canvas with animated network nodes.
 * Nodes are confined to the peripheral border region of the viewport.
 *
 * @returns Fixed canvas element with no interactive content.
 */
export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const nodes: Node[] = Array.from({ length: NUM_NODES }, () =>
      createBorderNode(canvas.width, canvas.height),
    )

    let animationId: number

    const animate = () => {
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2

      ctx.clearRect(0, 0, width, height)

      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy

        if (node.x < 0 || node.x > width) {
          node.vx *= -1
          node.x = Math.max(0, Math.min(width, node.x))
        }
        if (node.y < 0 || node.y > height) {
          node.vy *= -1
          node.y = Math.max(0, Math.min(height, node.y))
        }

        if (isInCentralZone(node, width, height)) {
          const dx = node.x - centerX
          const dy = node.y - centerY
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > 0) {
            node.vx += (dx / dist) * CENTER_REPULSION_FORCE
            node.vy += (dy / dist) * CENTER_REPULSION_FORCE
          }
          const speed = Math.sqrt(node.vx ** 2 + node.vy ** 2)
          if (speed > MAX_SPEED * 2) {
            node.vx = (node.vx / speed) * MAX_SPEED * 2
            node.vy = (node.vy / speed) * MAX_SPEED * 2
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DISTANCE) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(45, 212, 191, 0.15)`
            ctx.lineWidth = 1
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      for (const node of nodes) {
        ctx.beginPath()
        ctx.fillStyle = 'rgba(45, 212, 191, 0.6)'
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
        ctx.fill()
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
