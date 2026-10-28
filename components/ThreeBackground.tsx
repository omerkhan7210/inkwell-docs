'use client'
import { useEffect, useRef } from 'react'

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let cleanup: (() => void) | null = null

    const init = async () => {
      const THREE = await import('three')
      if (!mountRef.current) return

      const w = window.innerWidth
      const h = window.innerHeight

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000)
      camera.position.z = 32

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      })
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setClearColor(0x000000, 0)
      mountRef.current.appendChild(renderer.domElement)

      // Central large wireframe icosahedron — pushed up and back so it frames the hero without obscuring text
      const mainGeo = new THREE.IcosahedronGeometry(11, 2)
      const mainMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.07,
      })
      const mainMesh = new THREE.Mesh(mainGeo, mainMat)
      mainMesh.position.set(0, 8, -6)
      scene.add(mainMesh)

      // Orbiting secondary shapes
      const orbiters = [
        { geo: new THREE.OctahedronGeometry(4.5, 0), pos: [-20, 9, -6], speed: 0.009, color: 0x8b5cf6, oy: 0.006 },
        { geo: new THREE.TetrahedronGeometry(3.2, 0), pos: [22, -7, -10], speed: -0.007, color: 0x3b82f6, oy: -0.004 },
        { geo: new THREE.IcosahedronGeometry(2.8, 0), pos: [13, 14, -4], speed: 0.011, color: 0xa78bfa, oy: 0.008 },
        { geo: new THREE.OctahedronGeometry(2.2, 0), pos: [-16, -12, 3], speed: -0.008, color: 0x60a5fa, oy: -0.005 },
        { geo: new THREE.IcosahedronGeometry(1.8, 0), pos: [5, -18, 8], speed: 0.013, color: 0x818cf8, oy: 0.007 },
      ]

      const orbiterMeshes = orbiters.map(({ geo, pos, speed, color, oy }) => {
        const mat = new THREE.MeshBasicMaterial({
          color,
          wireframe: true,
          transparent: true,
          opacity: 0.22,
        })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(...(pos as [number, number, number]))
        scene.add(mesh)
        return { mesh, speed, oy }
      })

      // Particle constellation
      const N = 1400
      const pos = new Float32Array(N * 3)
      for (let i = 0; i < N; i++) {
        const r = 28 + Math.random() * 28
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        pos[i * 3 + 2] = r * Math.cos(phi) - 8
      }
      const ptGeo = new THREE.BufferGeometry()
      ptGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const ptMat = new THREE.PointsMaterial({
        color: 0x818cf8,
        size: 0.07,
        transparent: true,
        opacity: 0.65,
      })
      const points = new THREE.Points(ptGeo, ptMat)
      scene.add(points)

      // Mouse parallax
      let mx = 0, my = 0
      const onMove = (e: MouseEvent) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2
        my = -(e.clientY / window.innerHeight - 0.5) * 2
      }
      window.addEventListener('mousemove', onMove, { passive: true })

      // Resize
      const onResize = () => {
        const nw = window.innerWidth, nh = window.innerHeight
        camera.aspect = nw / nh
        camera.updateProjectionMatrix()
        renderer.setSize(nw, nh)
      }
      window.addEventListener('resize', onResize, { passive: true })

      const clock = new THREE.Clock()
      let raf: number

      const tick = () => {
        raf = requestAnimationFrame(tick)
        const t = clock.getElapsedTime()

        mainMesh.rotation.x = t * 0.035
        mainMesh.rotation.y = t * 0.055

        orbiterMeshes.forEach(({ mesh, speed, oy }) => {
          mesh.rotation.x += speed
          mesh.rotation.y += speed * oy * 10
        })

        points.rotation.y = t * 0.012
        points.rotation.x = Math.sin(t * 0.008) * 0.15

        camera.position.x += (mx * 5 - camera.position.x) * 0.022
        camera.position.y += (my * 3.5 - camera.position.y) * 0.022
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
      }
      tick()

      cleanup = () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('resize', onResize)
        renderer.dispose()
        if (mountRef.current?.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement)
        }
      }
    }

    init()
    return () => { cleanup?.() }
  }, [])

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
