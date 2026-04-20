// --- 3. MULTI-ENSAMBLADOR (BLINDADO TÉCNICAMENTE) ---
'use client';
import React, { useMemo } from 'react';
import { useTubeStore } from '@/store/useTubeStore';
import TubeModel from './TubeModel';

export default function MultiTubeAssembler() {
    const { type, height } = useTubeStore();
    const H = Number(height); // Forza a número para evitar errores

    return useMemo(() => {
        // Ejemplo de 1P (Cargamos el TubeModel con la altura total H)
        if (type === '1P') {
            return <TubeModel h_custom={H} position={[0, 0, 0]} />;
        }

        // Ejemplo de 2P (Divide H en dos partes: Base y Tapa)
        if (type === '2P') {
            const hBase = H - 10;
            const hTapa = Math.min(30, hBase - 20);
            return (
                <group>
                    <TubeModel h_custom={hBase} position={[0, -hTapa / 2, 0]} />
                    <TubeModel h_custom={hTapa} position={[0, hBase / 2, 0]} isInternal={true} />
                </group>
            );
        }

        return <TubeModel h_custom={H} position={[0, 0, 0]} />;
    }, [type, H]);
}