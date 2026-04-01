"use client"

import { useEffect, useRef } from "react"

interface Node {
  x: number
  y: number
  vx: number
  vy: number
}

interface NetworkCanvasProps {
  exclusionWidth?: number
  exclusionHeight?: number
}

export function NetworkCanvas({ exclusionWidth = 700, exclusionHeight = 600 }: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize nodes only in outer border region (220px from edges)
    const nodeCount = Math.floor((window.innerWidth * window.innerHeight) / 25000)
    const borderWidth = 220
    
    const spawnInBorderRegion = (): { x: number; y: number } => {
      // Randomly pick which border region to spawn in: top, bottom, left, or right
      const region = Math.floor(Math.random() * 4)
      switch (region) {
        case 0: // Top border
          return { x: Math.random() * canvas.width, y: Math.random() * borderWidth }
        case 1: // Bottom border
          return { x: Math.random() * canvas.width, y: canvas.height - Math.random() * borderWidth }
        case 2: // Left border
          return { x: Math.random() * borderWidth, y: Math.random() * canvas.height }
        case 3: // Right border
        default:
          return { x: canvas.width - Math.random() * borderWidth, y: Math.random() * canvas.height }
      }
    }
    
    nodesRef.current = Array.from({ length: Math.min(nodeCount, 80) }, () => {
      const pos = spawnInBorderRegion()
      return {
        x: pos.x,
        y: pos.y,
        vx: (Math.random() - 0.5) * 0.075,
        vy: (Math.random() - 0.5) * 0.075,
      }
    })

    const connectionDistance = 150
    const repulsionStrength = 0.02

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const nodes = nodesRef.current
      
      // Calculate exclusion zone bounds (centered)
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const exclusionLeft = centerX - exclusionWidth / 2
      const exclusionRight = centerX + exclusionWidth / 2
      const exclusionTop = centerY - exclusionHeight / 2
      const exclusionBottom = centerY + exclusionHeight / 2

      // Update node positions
      for (const node of nodes) {
        // Check if node is inside or near the exclusion zone
        const inExclusionX = node.x > exclusionLeft && node.x < exclusionRight
        const inExclusionY = node.y > exclusionTop && node.y < exclusionBottom
        
        if (inExclusionX && inExclusionY) {
          // Calculate direction away from center of exclusion zone
          const dx = node.x - centerX
          const dy = node.y - centerY
          
          // Apply soft repulsion - push node away from center
          // Stronger push the closer to center
          const distFromCenterX = Math.abs(dx)
          const distFromCenterY = Math.abs(dy)
          const maxDistX = exclusionWidth / 2
          const maxDistY = exclusionHeight / 2
          
          const repulsionX = (1 - distFromCenterX / maxDistX) * repulsionStrength * Math.sign(dx)
          const repulsionY = (1 - distFromCenterY / maxDistY) * repulsionStrength * Math.sign(dy)
          
          node.vx += repulsionX
          node.vy += repulsionY
        }
        
        // Apply velocity with speed limit
        const maxSpeed = 0.2
        node.vx = Math.max(-maxSpeed, Math.min(maxSpeed, node.vx))
        node.vy = Math.max(-maxSpeed, Math.min(maxSpeed, node.vy))
        
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1

        // Keep within bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x))
        node.y = Math.max(0, Math.min(canvas.height, node.y))
      }

      // Draw connections
      ctx.strokeStyle = "rgba(94, 170, 168, 0.12)"
      ctx.lineWidth = 1

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.2
            ctx.strokeStyle = `rgba(94, 170, 168, ${opacity})`
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      ctx.fillStyle = "rgba(94, 170, 168, 0.5)"
      for (const node of nodes) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [exclusionWidth, exclusionHeight])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  )
}
