'use client';
import React, { useState } from 'react';
import { useTubeStore } from '@/store/useTubeStore';
import { X, Upload, Trash2, Download, Circle } from 'lucide-react';
import { MEDIDAS_BASE } from '@/config/tubesConfig';

export default function DesignConfigurator() {
    const { 
        isDesignOpen, setIsDesignOpen, diameter, height, topCap, bottomCap, 
        setUserDesign, userDesign, setUserDesignDisc, userDesignDisc,
        designMode, setDesignMode, designScale, setDesignScale, 
        designOffsetX, setDesignOffsetX, designOffsetY, setDesignOffsetY,
        designDiscMode, setDesignDiscMode, designDiscScale, setDesignDiscScale, 
        designDiscOffsetX, setDesignDiscOffsetX, designDiscOffsetY, setDesignDiscOffsetY
    } = useTubeStore() as any;
    const [isDiscTemplate, setIsDiscTemplate] = useState(false);

    const currentMode = isDiscTemplate ? designDiscMode : designMode;
    const currentScale = isDiscTemplate ? designDiscScale : designScale;
    const currentOffsetX = isDiscTemplate ? designDiscOffsetX : designOffsetX;
    const currentOffsetY = isDiscTemplate ? designDiscOffsetY : designOffsetY;

    if (!isDesignOpen) return null;

    // --- 📏 PARÁMETROS TÉCNICOS ARPLAST ---
    const EXTRA = 15;
    const D = Number(diameter);
    
    // Obtenemos los datos directamente de la base de datos de Arplast
    const medidas = MEDIDAS_BASE[String(diameter)] || MEDIDAS_BASE['60'];
    const SOLAPE = medidas.solape;

    const tieneTop = topCap.includes('BORDON');
    const tieneBot = bottomCap.includes('BORDON');

    // Desarrollo Tubo
    const anchoTotal = medidas.desarrollo;
    const anchoUtil = anchoTotal - SOLAPE;
    const altoTotal = height + (tieneTop ? EXTRA : 0) + (tieneBot ? EXTRA : 0);

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Url = event.target?.result as string;
                if (isDiscTemplate) {
                    setUserDesignDisc(base64Url);
                } else {
                    setUserDesign(base64Url);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const downloadTemplate = () => {
        let svgContent = '';
        if (isDiscTemplate) {
            svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${D} ${D}" width="${D}mm" height="${D}mm">
                <!-- Fondo del disco -->
                <circle cx="${D/2}" cy="${D/2}" r="${D/2}" fill="#856a4d" />
                <!-- Zona visible -->
                <circle cx="${D/2}" cy="${D/2}" r="${(D/2) - 4}" fill="none" stroke="#00ff00" stroke-width="0.5" stroke-dasharray="2,2" />
                <text x="${D/2}" y="${D/2}" font-family="Arial" font-size="2" fill="#00ff00" text-anchor="middle" alignment-baseline="middle">ZONA VISIBLE (Ø${D-8}mm)</text>
            </svg>`;
        } else {
            svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${anchoTotal} ${altoTotal}" width="${anchoTotal}mm" height="${altoTotal}mm">
                <!-- Fondo plancha -->
                <rect width="${anchoTotal}" height="${altoTotal}" fill="#856a4d" />
                <!-- Solape -->
                <rect x="${anchoTotal - SOLAPE}" y="0" width="${SOLAPE}" height="${altoTotal}" fill="rgba(255,0,0,0.2)" />
                <line x1="${anchoTotal - SOLAPE}" y1="0" x2="${anchoTotal - SOLAPE}" y2="${altoTotal}" stroke="red" stroke-width="0.5" />
                
                <!-- Reservas superior e inferior -->
                ${tieneTop ? `<rect x="0" y="0" width="${anchoTotal}" height="${EXTRA}" fill="rgba(0,255,0,0.2)" /><line x1="0" y1="${EXTRA}" x2="${anchoTotal}" y2="${EXTRA}" stroke="green" stroke-width="0.5" stroke-dasharray="2,2"/>` : ''}
                ${tieneBot ? `<rect x="0" y="${altoTotal - EXTRA}" width="${anchoTotal}" height="${EXTRA}" fill="rgba(0,255,0,0.2)" /><line x1="0" y1="${altoTotal - EXTRA}" x2="${anchoTotal}" y2="${altoTotal - EXTRA}" stroke="green" stroke-width="0.5" stroke-dasharray="2,2"/>` : ''}
                
                <!-- Zona frontal centrada -->
                <g transform="translate(${anchoUtil/2 - D/2}, 0)">
                    <line x1="0" y1="0" x2="0" y2="${altoTotal}" stroke="white" stroke-opacity="0.4" stroke-width="0.5" />
                    <line x1="${D}" y1="0" x2="${D}" y2="${altoTotal}" stroke="white" stroke-opacity="0.4" stroke-width="0.5" />
                    <text x="${D/2}" y="${altoTotal/2}" font-family="Arial" font-size="4" fill="white" fill-opacity="0.6" text-anchor="middle" alignment-baseline="middle" transform="rotate(-90 ${D/2} ${altoTotal/2})">VISTA FRONTAL ${D}mm</text>
                </g>
            </svg>`;
        }

        const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Plantilla_Arplast_${isDiscTemplate ? 'Disco' : 'Tubo'}_D${D}.svg`;
        link.click();
    };

    const currentDesign = isDiscTemplate ? userDesignDisc : userDesign;

    return (
        <div className="fixed inset-0 z-[100] bg-black/98 flex flex-col animate-in fade-in duration-300">
            {/* HEADER */}
            <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 border-b border-white/10 bg-black">
                <div className="flex items-center gap-6">
                    <div>
                        <h2 className="text-white text-xl font-bold uppercase tracking-tighter italic text-green-500">Plantilla Técnica Arplast</h2>
                        <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1 font-bold">
                            Plancha Real: <span className="text-white">
                                {isDiscTemplate ? `Ø${D}mm (Círculo)` : `${anchoTotal.toFixed(1)}mm x ${altoTotal}mm`}
                            </span>
                        </p>
                    </div>

                    {/* SELECTOR TUBO / DISCO */}
                    <div className="flex bg-white/5 border border-white/10 rounded-lg p-1 ml-2">
                        <button 
                            onClick={() => setIsDiscTemplate(false)}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${!isDiscTemplate ? 'bg-green-500 text-black' : 'text-white/50 hover:text-white'}`}>
                            Tubo
                        </button>
                        <button 
                            onClick={() => setIsDiscTemplate(true)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${isDiscTemplate ? 'bg-green-500 text-black' : 'text-white/50 hover:text-white'}`}>
                            <Circle size={12} /> Disco
                        </button>
                    </div>
                </div>
                
                <div className="flex gap-4 w-full sm:w-auto">
                    <button onClick={downloadTemplate} className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
                        <Download size={16} /> Descargar
                    </button>
                    <button onClick={() => setIsDesignOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white bg-white/5"><X size={24} /></button>
                </div>
            </div>

            {/* ÁREA DE VISUALIZACIÓN */}
            <div className="flex-1 flex items-center justify-center p-10 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px] overflow-auto">
                {isDiscTemplate ? (
                    <div className="relative shadow-2xl bg-[#856a4d] flex items-center justify-center border-2 border-white/20 rounded-full overflow-hidden"
                        style={{
                            width: 'min(90vw, 60vh)',
                            aspectRatio: '1 / 1'
                        }}
                    >
                        {currentDesign && <img src={currentDesign} className="absolute inset-0 w-full h-full object-cover" />}

                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            {/* ZONA VISIBLE (Margen de 4mm -> -8mm en diámetro total) */}
                            <div className="border border-dashed border-green-400 rounded-full flex items-center justify-center bg-green-500/5"
                                style={{
                                    width: `${((D - 8) / D) * 100}%`,
                                    height: `${((D - 8) / D) * 100}%`
                                }}>
                                <span className="text-[10px] sm:text-xs text-green-300 font-black uppercase px-2 py-1 bg-black/40 rounded-md backdrop-blur-sm">
                                    Zona Visible (Ø {D - 8}mm)
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative shadow-2xl bg-[#856a4d] overflow-hidden border-2 border-white/20"
                        style={{
                            width: 'min(95%, 1000px)',
                            aspectRatio: `${anchoTotal} / ${altoTotal}`,
                        }}
                    >
                        {currentDesign && <img src={currentDesign} className="absolute inset-0 w-full h-full object-cover" />}

                        {/* --- MARCAS TÉCNICAS TUBO --- */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Solape (9mm) */}
                            <div className="absolute top-0 right-0 bottom-0 border-l border-red-500 bg-red-500/10 flex items-center justify-center"
                                style={{ width: `${(SOLAPE / anchoTotal) * 100}%` }}>
                                <span className="rotate-90 text-[8px] text-red-400 font-black tracking-widest uppercase">Pestaña Solape</span>
                            </div>

                            {/* ÁREA FRONTAL (D) */}
                            <div className="absolute top-0 bottom-0 border-x-2 border-white/40 bg-white/5"
                                style={{
                                    left: `${((anchoUtil / 2 - D / 2) / anchoTotal) * 100}%`,
                                    width: `${(D / anchoTotal) * 100}%`
                                }}>
                                <div className="absolute -top-6 left-0 right-0 text-center text-[9px] text-white/60 font-black uppercase">
                                    Vista Frontal {D}mm
                                </div>
                            </div>

                            {/* Zonas de Bordón (15mm) */}
                            {tieneTop && (
                                <div className="absolute top-0 left-0 right-0 border-b border-dashed border-green-500 bg-green-500/10 flex items-center justify-center"
                                    style={{ height: `${(EXTRA / altoTotal) * 100}%` }}>
                                    <span className="text-[9px] text-green-300 font-black uppercase">Reserva Bordón Superior (15mm)</span>
                                </div>
                            )}
                            {tieneBot && (
                                <div className="absolute bottom-0 left-0 right-0 border-t border-dashed border-green-500 bg-green-500/10 flex items-center justify-center"
                                    style={{ height: `${(EXTRA / altoTotal) * 100}%` }}>
                                    <span className="text-[9px] text-green-300 font-black uppercase">Reserva Bordón Inferior (15mm)</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER - ZONA DE CARGA Y EDICIÓN MODO MANUAL */}
            <div className="p-6 md:p-8 flex flex-col items-center gap-6 bg-black/90 backdrop-blur-xl border-t border-white/10 w-full relative z-[110]">
                
                {/* 1. SECCIÓN PRINCIPAL: BOTONES DE CARGA Y ELIMINAR */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
                    <label className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 md:px-10 md:py-3.5 rounded-full font-bold uppercase text-[10px] md:text-xs cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xl w-auto">
                        <Upload size={16} className="md:w-[18px] md:h-[18px]" /> Subir Arte Final {isDiscTemplate ? 'Disco' : 'Tubo'}
                        <input type="file" hidden onChange={handleImage} accept="image/jpeg, image/png, .jpg, .png, .jpeg" />
                    </label>
                    {currentDesign && (
                        <button onClick={() => isDiscTemplate ? setUserDesignDisc(null) : setUserDesign(null)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-6 py-2.5 md:px-8 md:py-3.5 rounded-full font-bold uppercase text-[10px] md:text-xs transition-all flex items-center justify-center gap-2 w-auto">
                            <Trash2 size={16} className="md:w-[18px] md:h-[18px]" /> Eliminar Diseño
                        </button>
                    )}
                </div>
                
                <span className="text-[9px] text-white/50 uppercase font-bold tracking-widest text-center mt-[-10px]">
                    Subir archivos en <strong className="text-white">JPG</strong> ó <strong className="text-white">PNG</strong> para mayor calidad.
                </span>

                {/* 2. SECCIÓN DE EDICIÓN AVANZADA (MODO MANUAL/AUTO) */}
                {currentDesign && (
                    <div className="w-full max-w-3xl flex flex-col items-center gap-4 border-t border-white/10 pt-4">
                        
                        <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                            <button onClick={() => isDiscTemplate ? setDesignDiscMode('AUTO') : setDesignMode('AUTO')} className={`px-5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${currentMode === 'AUTO' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white'}`}>Ajuste Automático</button>
                            <button onClick={() => isDiscTemplate ? setDesignDiscMode('MANUAL') : setDesignMode('MANUAL')} className={`px-5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${currentMode === 'MANUAL' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white'}`}>Transformación Manual</button>
                        </div>

                        {currentMode === 'MANUAL' && (
                            <div className="flex flex-col sm:flex-row gap-6 w-full justify-between items-center text-xs text-white/80 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex flex-col w-full">
                                    <div className="flex justify-between font-bold text-[9px] tracking-widest uppercase mb-1">
                                        <span>Escala</span> <span className="text-green-400">x{currentScale.toFixed(2)}</span>
                                    </div>
                                    <input type="range" min="0.1" max="5" step="0.01" value={currentScale} onChange={(e) => isDiscTemplate ? setDesignDiscScale(Number(e.target.value)) : setDesignScale(Number(e.target.value))} className="accent-green-500 w-full h-1" />
                                </div>
                                <div className="flex flex-col w-full">
                                    <div className="flex justify-between font-bold text-[9px] tracking-widest uppercase mb-1">
                                        <span>Desfase H (Offset X)</span> <span className="text-green-400">{currentOffsetX.toFixed(2)}</span>
                                    </div>
                                    <input type="range" min="-1" max="1" step="0.01" value={currentOffsetX} onChange={(e) => isDiscTemplate ? setDesignDiscOffsetX(Number(e.target.value)) : setDesignOffsetX(Number(e.target.value))} className="accent-green-500 w-full h-1" />
                                </div>
                                <div className="flex flex-col w-full">
                                    <div className="flex justify-between font-bold text-[9px] tracking-widest uppercase mb-1">
                                        <span>Desfase V (Offset Y)</span> <span className="text-green-400">{currentOffsetY.toFixed(2)}</span>
                                    </div>
                                    <input type="range" min="-1" max="1" step="0.01" value={currentOffsetY} onChange={(e) => isDiscTemplate ? setDesignDiscOffsetY(Number(e.target.value)) : setDesignOffsetY(Number(e.target.value))} className="accent-green-500 w-full h-1" />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}