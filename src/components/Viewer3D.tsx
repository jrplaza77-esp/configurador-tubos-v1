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
    const { isDarkMode, height, studioMode, arMode, lightIntensity, spotLightIntensity, envIntensity } = useTubeStore() as any;
    const centerY = (height * 0.1) / 2;

    const bgColor = isDarkMode 
        ? (studioMode ? '#000000' : '#050505') 
        : (studioMode ? '#f0f0f0' : '#ffffff');

    return (
        <div className="w-full h-full">
            <Canvas shadows gl={{ localClippingEnabled: true, antialias: true, preserveDrawingBuffer: true, alpha: true }}>
                {!arMode && <color attach="background" args={[bgColor]} />}

                {/* Cámara con posición inicial coherente */}
                <PerspectiveCamera makeDefault position={[0, centerY + 10, 70]} fov={35} />

                <CameraController />

                <ambientLight intensity={lightIntensity} />
                <spotLight 
                    position={[-30, 60, 40]} 
                    angle={studioMode ? 0.3 : 0.5} 
                    penumbra={studioMode ? 0.2 : 1} 
                    intensity={studioMode ? spotLightIntensity * 25 : spotLightIntensity} 
                    distance={studioMode ? 200 : 0}
                    castShadow 
                />
                <pointLight position={[20, -10, 10]} intensity={studioMode ? 0.5 : 0.1} />

                <Suspense fallback={null}>
                    <Environment preset="studio" environmentIntensity={envIntensity} />
                    <MultiTubeAssembler />

                    {studioMode && !arMode && (
                        <group position={[0, -centerY, 0]}>
                            {/* Plano de Reflexión Tipo Estudio Infinito */}
                            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                                <planeGeometry args={[500, 500]} />
                                <MeshReflectorMaterial
                                    blur={studioMode ? [0, 0] : [300, 100]} // Reflejo nítido tipo espejo en Realismo
                                    resolution={2048}
                                    mixBlur={0} // Sin difuminar en realismo, reflejo exacto 
                                    mixStrength={isDarkMode ? 40 : 25}
                                    roughness={0.0} // PBR puro espejo
                                    color={isDarkMode ? "#222222" : "#eae6e1"} // Blanco hueso en modo luz
                                    metalness={isDarkMode ? 0.5 : 0.2}
                                    mirror={1}
                                    depthScale={1}
                                    minDepthThreshold={0.9}
                                    maxDepthThreshold={1}
                                />
                            </mesh>
                            
                            {/* Sombras de Contacto Básicas */}
                            <ContactShadows resolution={1024} scale={150} position={[0, 0, 0]} blur={2} opacity={isDarkMode ? 0.9 : 0.5} far={35} color={isDarkMode ? "#000000" : "#222222"} />
                        </group>
                    )}
                </Suspense>

                {/* Inicializamos el target en el centro del tubo */}
                <OrbitControls
                    makeDefault
                    minDistance={10}
                    maxDistance={200}
                    target={[0, centerY, 0]}
                    maxPolarAngle={studioMode ? Math.PI / 2 - 0.05 : Math.PI}
                />
            </Canvas>
        </div>
    );
}