'use client';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera, MeshReflectorMaterial, ContactShadows } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { useTubeStore } from '@/store/useTubeStore';
import MultiTubeAssembler from './MultiTubeAssembler';

function CameraController() {
    const { camera, controls } = useThree() as any;
    const { height } = useTubeStore() as any;

    // Calculamos el centro vertical del tubo (SC = 0.1)
    const centerY = (height * 0.1) / 2;

    useEffect(() => {
        const handleView = (e: any) => {
            const view = e.detail;

            // 1. Obligamos a los controles a mirar al centro del objeto
            if (controls) {
                controls.target.set(0, centerY, 0);
            }

            // 2. Reposicionamos la cámara según la vista (ajustando distancias)
            if (view === 'front') {
                camera.position.set(0, centerY, 60); // ALZADO
            } else if (view === 'top') {
                camera.position.set(0, centerY + 80, 0); // PLANTA
            } else if (view === 'side') {
                camera.position.set(60, centerY, 0); // PERFIL
            }

            // 3. Mirar al objetivo y refrescar controles
            camera.lookAt(0, centerY, 0);
            if (controls) controls.update();
        };

        window.addEventListener('changeView', handleView);
        return () => window.removeEventListener('changeView', handleView);
    }, [camera, controls, centerY]);

    return null;
}

export default function Viewer3D() {
    const { isDarkMode, height, studioMode, arMode, lightIntensity, spotLightIntensity, envIntensity, activePanel } = useTubeStore() as any;
    const centerY = (height * 0.1) / 2;

    const isRealismActive = activePanel === 'ESTUDIO' && studioMode;

    // Colores del fondo estrictos
    let bgColor = '#F5F5F5'; // Día (Blanco roto) en todos los modos
    if (isDarkMode) {
        bgColor = isRealismActive ? '#212529' : '#000000';
    }

    return (
        <div className="w-full h-full">
            <Canvas shadows gl={{ localClippingEnabled: true, antialias: true, preserveDrawingBuffer: true, alpha: true }}>
                {!arMode && <color attach="background" args={[bgColor]} />}

                <PerspectiveCamera makeDefault position={[0, centerY + 10, 70]} fov={35} />

                <CameraController />

                <ambientLight intensity={0.7} />
                <directionalLight position={[15, 20, 20]} intensity={2.5} castShadow />

                <Suspense fallback={null}>
                    <Environment preset="studio" environmentIntensity={isRealismActive ? envIntensity : 1.0} />
                    
                    <MultiTubeAssembler />

                    {!arMode && isRealismActive && (
                        <group position={[0, -centerY, 0]}>
                            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                                <planeGeometry args={[500, 500]} />
                                <MeshReflectorMaterial
                                    blur={[300, 100]}
                                    resolution={1024}
                                    mixBlur={0.5}
                                    mixStrength={isDarkMode ? 20 : 30}
                                    roughness={isDarkMode ? 0.15 : 0.2}
                                    depthScale={1.2}
                                    minDepthThreshold={0.4}
                                    maxDepthThreshold={1.4}
                                    color={isDarkMode ? "#1a1d21" : "#A0A0A0"}
                                    metalness={0.5}
                                    mirror={isDarkMode ? 0.35 : 0.3}
                                />
                            </mesh>
                            
                            <ContactShadows resolution={1024} scale={50} position={[0, 0, 0]} blur={2.5} opacity={isDarkMode ? 0.4 : 0.8} far={1.5} color="#000000" />
                        </group>
                    )}
                </Suspense>

                {/* Inicializamos el target en el centro del tubo */}
                <OrbitControls
                    makeDefault
                    minDistance={10}
                    maxDistance={200}
                    target={[0, centerY, 0]}
                    maxPolarAngle={(!arMode && isRealismActive) ? Math.PI / 2 - 0.05 : Math.PI}
                />
            </Canvas>
        </div>
    );
}