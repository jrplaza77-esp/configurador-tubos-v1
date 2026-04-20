'use client';
import React from 'react';
import { useTubeStore } from '@/store/useTubeStore';
import { MEDIDAS_BASE } from '@/config/tubesConfig'; // <-- Actualizado a MEDIDAS_BASE

export default function Administrator() {
    // Sacamos las funciones nuevas del store
    const {
        type, setType,
        diameter,
        height, setDimensions,
        topCap, bottomCap, setCaps,
        isSectionActive, setSectionActive
    } = useTubeStore() as any;

    return (
        <div className="p-4 bg-black/50 text-white rounded-lg backdrop-blur-md border border-white/10">
            <h2 className="text-xl font-bold mb-4">Configuración Técnica</h2>

            {/* Selector de Diámetro */}
            <div className="mb-4">
                <label className="block text-xs uppercase opacity-50 mb-1">Diámetro Nominal</label>
                <select
                    value={diameter}
                    onChange={(e) => setDimensions(e.target.value, height)}
                    className="w-full bg-white/10 p-2 rounded border border-white/20"
                >
                    {Object.keys(MEDIDAS_BASE).map(d => (
                        <option key={d} value={d} className="bg-zinc-900">Ø {d}</option>
                    ))}
                </select>
            </div>

            {/* Selector de Altura (con las reglas del PDF) */}
            <div className="mb-4">
                <label className="block text-xs uppercase opacity-50 mb-1">
                    Altura (H): {height}mm
                </label>
                <input
                    type="range"
                    min="25"
                    max={(topCap === 'BORDON' || bottomCap === 'BORDON' || bottomCap === 'SELLADO') ? 300 : 600}
                    value={height}
                    onChange={(e) => setDimensions(diameter, Number(e.target.value))}
                    className="w-full accent-white"
                />
            </div>

            {/* Tipo de Tubo */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                {['1P', '2P', '3P', 'MIXTO'].map(t => (
                    <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`p-2 rounded text-xs ${type === t ? 'bg-white text-black' : 'bg-white/10'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Botón de Sección */}
            <button
                onClick={() => setSectionActive(!isSectionActive)}
                className={`w-full p-2 rounded mb-4 border transition-colors ${isSectionActive ? 'bg-red-500/20 border-red-500' : 'border-white/20'}`}
            >
                {isSectionActive ? 'Desactivar Corte' : 'Ver Sección de Corte'}
            </button>

            <div className="text-[10px] opacity-40 text-center">
                ARPLAST - SOFTWARE DE DISEÑO V2
            </div>
        </div>
    );
}