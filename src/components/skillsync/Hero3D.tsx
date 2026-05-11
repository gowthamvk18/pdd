import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, ContactShadows, PresentationControls } from '@react-three/drei'
import * as THREE from 'three'

function NetworkGlobe() {
  const groupRef = useRef<THREE.Group>(null)

  // Generate nodes, connections, and "mobile data" packets
  const { positions, lines, lineSegments, dataPackets } = useMemo(() => {
    const points = []
    const numPoints = 80
    const radius = 1.8

    // Fibonacci sphere distribution
    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = phi * i

      const x = Math.cos(theta) * r
      const z = Math.sin(theta) * r

      points.push(new THREE.Vector3(x * radius, y * radius, z * radius))
    }

    const posArray = new Float32Array(numPoints * 3)
    points.forEach((p, i) => {
      posArray[i * 3] = p.x
      posArray[i * 3 + 1] = p.y
      posArray[i * 3 + 2] = p.z
    })

    const linePoints = []
    const segments = []
    for (let i = 0; i < numPoints; i++) {
      for (let j = i + 1; j < numPoints; j++) {
        if (points[i].distanceTo(points[j]) < 1.1) {
          linePoints.push(points[i].x, points[i].y, points[i].z)
          linePoints.push(points[j].x, points[j].y, points[j].z)
          segments.push({ start: points[i], end: points[j] })
        }
      }
    }
    const lineArray = new Float32Array(linePoints)

    // Generate 40 "mobile data" packets flowing across the network
    const packets = Array.from({ length: 40 }).map(() => ({
      lineIndex: Math.floor(Math.random() * segments.length),
      progress: Math.random(),
      speed: 0.005 + Math.random() * 0.01
    }))

    return { positions: posArray, lines: lineArray, lineSegments: segments, dataPackets: packets }
  }, [])

  const dataGeoRef = useRef<THREE.BufferGeometry>(null)
  const initialDataPositions = useMemo(() => new Float32Array(dataPackets.length * 3), [dataPackets])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15
      groupRef.current.rotation.z = Math.sin(t * 0.1) * 0.1
    }

    // Animate the mobile data flowing along the lines
    if (dataGeoRef.current && dataPackets.length > 0 && lineSegments.length > 0) {
      const posAttr = dataGeoRef.current.attributes.position
      const positions = posAttr.array as Float32Array
      
      dataPackets.forEach((packet, i) => {
        packet.progress += packet.speed
        if (packet.progress > 1) {
          packet.progress = 0
          packet.lineIndex = Math.floor(Math.random() * lineSegments.length)
        }

        const line = lineSegments[packet.lineIndex]
        if (line) {
          const currentPos = new THREE.Vector3().copy(line.start).lerp(line.end, packet.progress)
          positions[i * 3] = currentPos.x
          positions[i * 3 + 1] = currentPos.y
          positions[i * 3 + 2] = currentPos.z
        }
      })
      
      posAttr.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* The Network Lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[lines, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#c9b99a" transparent opacity={0.6} />
      </lineSegments>

      {/* The Network Nodes */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#8b7355" 
          size={0.12} 
          sizeAttenuation={true} 
          transparent 
          opacity={1} 
        />
      </points>

      {/* The Mobile Data Packets */}
      <points>
        <bufferGeometry ref={dataGeoRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[initialDataPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#ffffff" 
          size={0.1} 
          sizeAttenuation={true} 
          transparent 
          opacity={0.9} 
          depthWrite={false}
        />
      </points>
      
      {/* Inner core - subtle reflection */}
      <mesh>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshStandardMaterial 
          color="#8b7355" 
          transparent 
          opacity={0.1} 
          roughness={0.8} 
        />
      </mesh>
    </group>
  )
}

export const Hero3D = () => {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 2]} gl={{ alpha: true }}>
        {/* Transparent background to match page */}

        
        <ambientLight intensity={1.5} color="#fff5e6" />
        <directionalLight position={[5, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-5, -10, -5]} intensity={1} color="#c9b99a" />
        <Environment preset="city" />

        <PresentationControls 
          global 
          rotation={[0, 0, 0]} 
          polar={[-Math.PI / 4, Math.PI / 4]} 
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <NetworkGlobe />
        </PresentationControls>

        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} color="#8b7355" frames={1} />
      </Canvas>
    </div>
  )
}
