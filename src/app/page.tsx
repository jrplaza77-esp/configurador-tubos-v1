'use client';
import React, { useEffect, useState } from 'react';
import { useTubeStore } from '@/store/useTubeStore';
import Administrator from '@/components/Administrator';
import DesignConfigurator from '@/components/DesignConfigurator';
import { MEDIDAS_BASE, CONFIG_1_PIEZA } from '@/config/tubesConfig';
import { Box, Ruler, Settings, Square, Palette, Layout, Scissors, Layers, Sun, Moon, Sparkles, Camera, Save, FolderOpen, List, Scan } from 'lucide-react';
import Viewer3D from '@/components/Viewer3D';

export default function ArplastApp() {
  // 1. ESTADOS DEL STORE (CEREBRO DE LA APLICACIÓN)
  const {
    type, diameter, height, isAdminMode, isDarkMode, isSectionActive, isExploded, studioMode,
    toggleDarkMode, activePanel, setActivePanel, setAdminMode, setSectionActive, setIsExploded, toggleStudioMode,
    setIsDesignOpen, // 🟢 Nueva acción para abrir el diseño
    topCap, bottomCap, arMode, setArMode, setType,
    lightIntensity, setLightIntensity, spotLightIntensity, setSpotLightIntensity, envIntensity, setEnvIntensity, setStudioMode
  } = useTubeStore() as any;

  const handleCapturePhoto = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      alert("No se pudo capturar la imagen. Asegúrate de que el modelo 3D esté visible.");
      return;
    }
    const imgData = canvas.toDataURL('image/png');
    const img = new window.Image();
    img.src = imgData;
    img.onload = () => {
      const newCanvas = document.createElement('canvas');
      const ctx = newCanvas.getContext('2d');
      if (!ctx) return;
      const width = img.width;
      const textHeight = 120;
      newCanvas.width = width;
      newCanvas.height = img.height + textHeight;
      
      // Fondo blanco en lugar de transparente para PDF/PNG limpios
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, img.height + textHeight);
      ctx.drawImage(img, 0, 0);
      
      // Fondo gris claro para el resumen
      ctx.fillStyle = '#f9f9f9';
      ctx.fillRect(0, img.height, width, textHeight);
      
      // Texto del resumen
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Resumen del Proyecto', width / 2, img.height + 35);
      
      ctx.font = '18px sans-serif';
      const text1 = `Diámetro: ${diameter} mm  |  Altura: ${height} mm`;
      const text2 = `Tapa Superior: ${topCap?.replace(/_/g, ' ')}  |  Tapa Inferior: ${bottomCap?.replace(/_/g, ' ')}`;
      ctx.fillText(text1, width / 2, img.height + 70);
      ctx.fillText(text2, width / 2, img.height + 95);
      
      const link = document.createElement('a');
      link.download = `Vista_Arplast_${Date.now()}.png`;
      link.href = newCanvas.toDataURL('image/png');
      link.click();
    };
  };

  const handleSaveProject = () => {
    const defaultName = `proyecto_arplast_${Date.now()}`;
    const filename = window.prompt("Introduce un nombre para guardar el proyecto:", defaultName);
    if (!filename) return; // Si cancela, no guarda nada

    const state = useTubeStore.getState() as any;
    const stateToSave = {
      diameter: state.diameter,
      height: state.height,
      topCap: state.topCap,
      bottomCap: state.bottomCap,
      plasticColor: state.plasticColor,
      userDesign: state.userDesign,
      userDesignDisc: state.userDesignDisc,
      tubeColor: state.tubeColor,
      discColor: state.discColor,
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateToSave, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${filename}.json`;
    a.click();
  };

  const handleOpenProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        useTubeStore.setState(json);
      } catch (err) {
        console.error("Error validando el proyecto", err);
        alert("Error cargando el archivo del proyecto.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 2. CONTROL DE MONTAJE (EVITA ERRORES DE CARGA EN EL NAVEGADOR)
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="bg-[#050505] h-screen" />;

  const formatFriendlyType = (t: string) => {
    const names: Record<string, string> = {
      '1P': '1 Pieza', '2P': '2 Piezas', '3P': '3 Piezas', 'MIXTO': 'Mixto'
    };
    return names[t] || t;
  };

  return (
    // 3. CONTENEDOR PRINCIPAL
    <main className={`flex flex-col md:flex-row w-full h-screen overflow-hidden transition-colors duration-500 font-sans 
      ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#F2F2F2] text-black'}`}>

      {/* 4. VISOR 3D (ARRIBA EN MÓVIL, 70% IZQ EN PC) */}
      <div className="relative w-full h-[60vh] md:h-screen md:w-[70%] flex-shrink-0 flex items-center justify-center border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10">
        
        {/* LOGO Y DATOS FLOTANTES */}
        <div className="absolute top-6 left-6 z-20 flex flex-col items-start pointer-events-none">
          <div className="bg-white px-3 py-2 rounded-xl mb-3 shadow-md border border-black/5">
            <img src="/logo.png" alt="Arplast" className="h-4 w-auto object-contain" />
          </div>
          <div className={`flex gap-3 text-[10px] font-black tracking-widest uppercase
            ${isDarkMode ? 'text-white/70' : 'text-black/60'}`}>
            <span className="text-[#008234]">{formatFriendlyType(type)}</span>
            <span>Ø {diameter}</span>
            <span>H {height} MM</span>
          </div>
        </div>

        {/* BOTONES DE VISTA FLOTANTES */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">
          <div className="relative group/type">
             <ViewButton label="TIPO" icon={<List size={20} />} isDarkMode={isDarkMode} isTop />
             <div className={`absolute top-0 left-14 hidden group-hover/type:flex flex-col gap-1 p-2 rounded-xl border shadow-xl ${isDarkMode ? 'bg-[#1A1A1A] border-white/10' : 'bg-white border-black/10'}`}>
               <button onClick={() => setType('1P')} className={`text-[10px] font-bold px-3 py-2 rounded-lg text-left whitespace-nowrap hover:bg-[#008234] hover:text-white ${type === '1P' ? 'text-[#008234]' : (isDarkMode ? 'text-white' : 'text-black')}`}>Tubo 1 Pieza</button>
               <button onClick={() => setType('2P')} className={`text-[10px] font-bold px-3 py-2 rounded-lg text-left whitespace-nowrap hover:bg-[#008234] hover:text-white ${type === '2P' ? 'text-[#008234]' : (isDarkMode ? 'text-white' : 'text-black')}`}>Tubo 2 Piezas</button>
               <button onClick={() => setType('3P')} className={`text-[10px] font-bold px-3 py-2 rounded-lg text-left whitespace-nowrap hover:bg-[#008234] hover:text-white ${type === '3P' ? 'text-[#008234]' : (isDarkMode ? 'text-white' : 'text-black')}`}>Tubo 3 Piezas</button>
               <button onClick={() => setType('MIXTO')} className={`text-[10px] font-bold px-3 py-2 rounded-lg text-left whitespace-nowrap hover:bg-[#008234] hover:text-white ${type === 'MIXTO' ? 'text-[#008234]' : (isDarkMode ? 'text-white' : 'text-black')}`}>Tubo Mixto</button>
             </div>
          </div>
          <ViewButton label="CÁMARA AR" icon={<Scan size={20} />} active={arMode} isRed={arMode} onClick={() => setArMode(!arMode)} isDarkMode={isDarkMode} isTop />
          <ViewButton label="FOTO" icon={<Camera size={20} />} onClick={handleCapturePhoto} isDarkMode={isDarkMode} isTop />
          <ViewButton label="GUARDAR" icon={<Save size={20} />} onClick={handleSaveProject} isDarkMode={isDarkMode} isTop />
          <div className="relative">
            <input type="file" accept=".json" style={{ display: 'none' }} id="project-upload" onChange={handleOpenProject} />
            <ViewButton label="ABRIR" icon={<FolderOpen size={20} />} onClick={() => document.getElementById('project-upload')?.click()} isDarkMode={isDarkMode} isTop />
          </div>

          <div className={`h-px w-6 mx-auto my-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />

          <ViewButton
            label="SECCIÓN"
            icon={<Scissors size={20} />}
            view="section"
            isRed
            active={isSectionActive}
            onClick={() => setSectionActive(!isSectionActive)}
            isDarkMode={isDarkMode}
          />

          <div className={`h-px w-6 mx-auto my-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />

          <ViewButton label="ALZADO" icon={<Square size={20} />} view="front" isDarkMode={isDarkMode} />
          <ViewButton label="PLANTA" icon={<Box size={20} />} view="top" isDarkMode={isDarkMode} />
          <ViewButton label="PERFIL" icon={<Layout size={20} />} view="side" isDarkMode={isDarkMode} />
          <ViewButton label="EXPLOSIÓN" icon={<Layers size={20} />} active={isExploded} onClick={() => setIsExploded(!isExploded)} isDarkMode={isDarkMode} />
        </div>

        {/* 7. VISOR 3D LIMITADO AL CONTENEDOR */}
        <div className="w-full h-full absolute inset-0 -z-10">
           {arMode && <ARCameraBackground />}
        </div>
        <div className="w-full h-full absolute inset-0"> 
           <Viewer3D />
        </div>
      </div>

      {/* 8. PANEL DE CONFIGURACIÓN (ABAJO EN MÓVIL, 30% DER EN PC) */}
      <div className={`w-full h-[40vh] md:h-screen md:w-[30%] flex flex-col shadow-2xl z-50 transition-colors
        ${isDarkMode ? 'bg-[#121212]' : 'bg-white'}`}>
        
        {/* ÁREA DE PANELES SCROLLABLE */}
        <div className="flex-1 overflow-y-auto w-full">
           <PanelsContainer />
        </div>

        {/* 9. DOCK BAR (SIEMPRE VISIBLE AL FONDO O ARRIBA DEL PANEL) */}
        <div className={`flex justify-around items-center p-3 sm:p-4 border-t flex-shrink-0 transition-colors
          ${isDarkMode ? 'border-white/10 bg-[#0A0A0A]' : 'border-black/5 bg-gray-50'}`}>
           <DockButton active={activePanel === 'MEDIDAS'} onClick={() => setActivePanel('MEDIDAS')} icon={<Ruler size={22} />} label="Medidas" isDarkMode={isDarkMode} />
           <DockButton active={activePanel === 'PIEZAS'} onClick={() => setActivePanel('PIEZAS')} icon={<Settings size={22} />} label="Piezas" isDarkMode={isDarkMode} />
           <DockButton active={activePanel === 'COLORES'} onClick={() => setActivePanel('COLORES')} icon={<Palette size={22} />} label="Colores" isDarkMode={isDarkMode} />
           
           <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
           
           <button onClick={() => setIsDesignOpen(true)} className="flex flex-col items-center gap-1 transition-all group">
             <div className={`w-6 h-6 border-2 rounded-sm flex items-center justify-center text-[10px] font-black italic transition-colors
               ${isDarkMode ? 'border-white/40 text-white/40 group-hover:text-green-500 group-hover:border-green-500' : 'border-black/40 text-black/40 group-hover:text-green-600 group-hover:border-green-600'}`}>
               ART
             </div>
             <span className={`text-[7px] uppercase font-black tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>Diseño</span>
           </button>

           <button onClick={toggleDarkMode} className="flex flex-col items-center gap-1 transition-all group">
             <div className={isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 group-hover:text-black'}>
               {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
             </div>
             <span className={`text-[7px] uppercase font-black tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>Luz</span>
           </button>

           <button onClick={() => {
             setActivePanel('ESTUDIO');
           }} className="flex flex-col items-center gap-1 transition-all group">
             <div className={activePanel === 'ESTUDIO' || studioMode ? 'text-green-500' : (isDarkMode ? 'text-zinc-600 group-hover:text-white' : 'text-zinc-400 group-hover:text-black')}>
               <Sparkles size={22} />
             </div>
             <span className={`text-[7px] uppercase font-black tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>Estudio</span>
           </button>
        </div>
      </div>

      {/* 10. OVERLAY DE ADMINISTRACIÓN */}
      {activePanel === 'ADMIN' && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-10">
          <div className="relative w-full max-w-6xl h-[85vh] bg-[#0A0A0A] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
            <button onClick={() => setActivePanel('NONE')} className="absolute top-6 right-8 z-[110] bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all">
              Cerrar Panel [X]
            </button>
            <div className="flex-1 overflow-auto p-10">
              <Administrator />
            </div>
          </div>
        </div>
      )}

      {/* 11. 🟢 CONFIGURADOR DE DISEÑO (MODAL) */}
      <DesignConfigurator />
    </main>
  );
}

// --- FUNCIONES AUXILIARES (COMPLEMENTOS DEL DISEÑO) ---

function ViewButton({ label, icon, view, isRed, disabled, isDarkMode, active, onClick, isTop }: any) {
  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    } else {
      window.dispatchEvent(new CustomEvent('changeView', { detail: view }));
    }
  };

  const buttonClasses = isRed
    ? (active ? 'bg-red-500 text-white border-red-600' : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20')
    : isTop 
      ? (isDarkMode ? 'bg-[#2A2A2A] border-white/20 text-white/70 hover:text-white' : 'bg-[#E5E5E5] border-black/20 text-black/70 hover:text-black')
      : (isDarkMode ? 'bg-[#1A1A1A] border-white/10 text-white/40 hover:text-[#008234]' : 'bg-white border-black/10 text-black/40 hover:text-[#008234]');

  return (
    <div className="relative flex items-center group">
      <button
        onClick={handleClick}
        className={`p-3 rounded-full transition-all border shadow-lg ${disabled ? 'opacity-10 cursor-not-allowed' : 'active:scale-95'} ${buttonClasses}`}
      >
        {icon}
      </button>
      <span className="absolute left-14 px-3 py-1 bg-[#008234] text-white text-[9px] font-black rounded-md z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">{label}</span>
    </div>
  );
}

function DockButton({ active, onClick, icon, label, isDarkMode }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-[#008234]' : (isDarkMode ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black')}`}>
      {icon}
      <span className="text-[7px] uppercase font-black tracking-widest">{label}</span>
    </button>
  );
}

function ColorPickerInput({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    return (
        <div className="relative overflow-hidden w-11 h-[52px] rounded-xl border border-black/10 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center">
            {/* Fondo de esmalte de colores para indicar que es un selector */}
            <div className="absolute inset-0 rounded-xl" style={{ 
                background: 'conic-gradient(from 180deg at 50% 50%, #ff0000 0%, #ff8000 12.5%, #ffff00 25%, #00ff00 37.5%, #00ffff 50%, #0000ff 62.5%, #8000ff 75%, #ff00ff 87.5%, #ff0000 100%)',
                opacity: 0.8
            }} />
            <div className="absolute inset-[3px] rounded-lg bg-white/10 backdrop-blur-sm pointer-events-none" />
            <div className="absolute inset-[6px] rounded-md pointer-events-none shadow-sm border border-black/20" style={{ backgroundColor: value }} />
            <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute w-[300%] h-[300%] -top-full -left-full opacity-0 cursor-pointer" />
        </div>
    );
}

function ColorPreset({ color, label, active, onClick, isDarkMode }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all hover:scale-105 active:scale-95 ${active ? 'border-[#008234] ring-1 ring-[#008234] bg-[#008234]/10 shadow-sm' : (isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5')}`}>
      <div className="w-8 h-8 rounded-lg shadow-inner border border-black/10" style={{ backgroundColor: color }} />
      <span className={`text-[8px] mt-1.5 font-black uppercase tracking-wider ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{label}</span>
    </button>
  );
}

function PanelsContainer() {
  const { activePanel, diameter, height, setDimensions, topCap, bottomCap, setCaps, plasticColor, setPlasticColor, isDarkMode, tubeColor, setTubeColor, discColor, setDiscColor, studioMode, setStudioMode, lightIntensity, setLightIntensity, spotLightIntensity, setSpotLightIntensity, envIntensity, setEnvIntensity, userDesign, designHeight } = useTubeStore() as any;
  if (activePanel === 'NONE' || activePanel === 'ADMIN') return null;

  const selectClass = `w-full rounded-xl p-3 text-xs outline-none border transition-all ${isDarkMode ? 'bg-[#1A1A1A] text-white border-white/10' : 'bg-gray-50 text-black border-black/10'}`;
  const maxH = (topCap === 'BORDON' || bottomCap === 'BORDON' || bottomCap === 'SELLADO' || topCap === 'BORDON_DISCO') ? 300 : 600;

  return (
    <div className={`w-full p-6 animate-in fade-in duration-300`}>

      <h3 className="text-[10px] text-[#008234] font-black uppercase tracking-widest mb-6 border-b border-black/5 pb-4">{activePanel}</h3>

      {activePanel === 'MEDIDAS' ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] text-[#008234] uppercase font-bold px-1">Diámetro Nominal</span>
            <select value={diameter} onChange={(e) => setDimensions(e.target.value, height)} className={selectClass}>
              {Object.keys(MEDIDAS_BASE).map(d => <option key={d} value={d}>Ø {d} mm</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-[9px] font-bold px-1">
              <span className={isDarkMode ? 'text-white/40' : 'text-black/40'}>ALTURA TOTAL</span>
              <span className="text-[#008234]">{height} mm</span>
            </div>
            <input type="range" min="25" max={maxH} value={height} onChange={(e) => setDimensions(diameter, Number(e.target.value))} className="accent-[#008234] cursor-pointer w-full" />
            <div className="flex justify-between text-[7px] opacity-30 font-bold px-1">
              <span>MIN 25mm</span>
              <span>MAX {maxH}mm</span>
            </div>
            {userDesign && designHeight !== null && height !== designHeight && (
              <span className="text-[10px] text-yellow-500 font-bold uppercase mt-1">⚠️ Precaución: Diseño Deformado</span>
            )}
          </div>
        </div>
      ) : activePanel === 'PIEZAS' ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-[9px] text-[#008234] uppercase font-bold px-1">Tapa Superior</span>
            <select value={topCap} onChange={(e) => setCaps(e.target.value, bottomCap)} className={selectClass}>
              {CONFIG_1_PIEZA[diameter]?.top.map((cap: string) => (
                <option key={cap} value={cap}>
                  {cap === 'NONE' ? 'Corte Recto' : 
                   cap === 'CORCHO' ? 'Tapa Corcho' :
                   cap === 'BORDON' ? 'Bordón' :
                   cap === 'BORDON_DISCO' ? 'Bordón + Disco' :
                   cap === 'PLASTICO' ? 'Tapa Plástico' :
                   cap === 'METAL' ? 'Tapa Metal' :
                   cap === 'TERMO' ? 'Tapa Termo' : cap}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-3 pt-4 border-t border-black/5">
            <span className="text-[9px] text-[#008234] uppercase font-bold px-1">Base Inferior</span>
            <select value={bottomCap} onChange={(e) => setCaps(topCap, e.target.value)} className={selectClass}>
              {CONFIG_1_PIEZA[diameter]?.bottom.map((cap: string) => (
                <option key={cap} value={cap}>
                  {cap === 'NONE' ? 'Corte Recto' : 
                   cap === 'SELLADO' ? 'Fondo Sellado' :
                   cap === 'BORDON_DISCO' ? 'Bordón + Disco' :
                   cap === 'PLASTICO' ? 'Tapa Plástico' :
                   cap === 'METAL' ? 'Tapa Metal' :
                   cap === 'BORDON' ? 'Bordón' :
                   cap === 'TERMO' ? 'Tapa Termo' : cap}
                </option>
              ))}
            </select>
          </div>
          
          {(topCap.includes('PLASTICO') || bottomCap.includes('PLASTICO') || topCap.includes('TERMO') || bottomCap.includes('TERMO')) && (
            <div className="flex items-center justify-between mt-2 px-1 pt-4 border-t border-black/5">
              <span className="text-[9px] text-[#008234] uppercase font-bold">
                {topCap.includes('TERMO') && !topCap.includes('PLASTICO') ? 'Color Tapa Termo:' : 'Color Tapas Plástico:'}
              </span>
              <div className="flex gap-3">
                <button onClick={() => setPlasticColor('BLACK')} className={`w-6 h-6 rounded-full border-2 transition-all ${plasticColor === 'BLACK' ? 'border-[#008234] scale-125' : 'border-transparent'} bg-black shadow-md`} />
                <button onClick={() => setPlasticColor('WHITE')} className={`w-6 h-6 rounded-full border-2 transition-all ${plasticColor === 'WHITE' ? 'border-[#008234] scale-125' : 'border-transparent'} bg-white shadow-md`} />
              </div>
            </div>
          )}
        </div>
      ) : activePanel === 'COLORES' ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-[9px] text-[#008234] uppercase font-bold px-1">Color del Tubo</span>
            <div className="flex gap-2 px-1 py-1">
              <ColorPreset color="#C5A16F" label="Kraft" active={tubeColor === '#C5A16F'} onClick={() => setTubeColor('#C5A16F')} isDarkMode={isDarkMode} />
              <ColorPreset color="#111111" label="Negro" active={tubeColor === '#111111'} onClick={() => setTubeColor('#111111')} isDarkMode={isDarkMode} />
              <ColorPreset color="#FFFFFF" label="Blanco" active={tubeColor === '#FFFFFF'} onClick={() => setTubeColor('#FFFFFF')} isDarkMode={isDarkMode} />
              
              <div className="w-[1px] bg-black/10 mx-1 my-2" />
              
              <ColorPickerInput value={tubeColor} onChange={setTubeColor} />
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-4 border-t border-black/5">
            <span className="text-[9px] text-[#008234] uppercase font-bold px-1">Color del Disco</span>
            <div className="flex gap-2 px-1 py-1">
              <ColorPreset color="#C5A16F" label="Kraft" active={discColor === '#C5A16F'} onClick={() => setDiscColor('#C5A16F')} isDarkMode={isDarkMode} />
              <ColorPreset color="#111111" label="Negro" active={discColor === '#111111'} onClick={() => setDiscColor('#111111')} isDarkMode={isDarkMode} />
              <ColorPreset color="#FFFFFF" label="Blanco" active={discColor === '#FFFFFF'} onClick={() => setDiscColor('#FFFFFF')} isDarkMode={isDarkMode} />

              <div className="w-[1px] bg-black/10 mx-1 my-2" />

              <ColorPickerInput value={discColor} onChange={setDiscColor} />
            </div>
          </div>
        </div>
      ) : activePanel === 'ESTUDIO' ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <span className="text-[9px] text-[#008234] uppercase font-bold">Suelo Reflectante</span>
            <button onClick={() => setStudioMode(!studioMode)} className={`w-10 h-5 rounded-full relative transition-all ${studioMode ? 'bg-[#008234]' : 'bg-gray-300 dark:bg-zinc-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-[2px] transition-all`} style={{ left: studioMode ? '22px' : '2px' }} />
            </button>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-[9px] font-bold px-1">
              <span className={isDarkMode ? 'text-white/40' : 'text-black/40'}>BRILLO GENERAL</span>
              <span className="text-[#008234]">{Math.round(lightIntensity * 100)}%</span>
            </div>
            <input type="range" min="0" max="2" step="0.1" value={lightIntensity} onChange={(e) => setLightIntensity(Number(e.target.value))} className="accent-[#008234] cursor-pointer w-full" />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-[9px] font-bold px-1">
              <span className={isDarkMode ? 'text-white/40' : 'text-black/40'}>FOCO PRINCIPAL</span>
              <span className="text-[#008234]">{Math.round(spotLightIntensity * 100)}%</span>
            </div>
            <input type="range" min="0" max="3" step="0.1" value={spotLightIntensity} onChange={(e) => setSpotLightIntensity(Number(e.target.value))} className="accent-[#008234] cursor-pointer w-full" />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-[9px] font-bold px-1">
              <span className={isDarkMode ? 'text-white/40' : 'text-black/40'}>REFLEXIÓN ENTORNO</span>
              <span className="text-[#008234]">{Math.round(envIntensity * 100)}%</span>
            </div>
            <input type="range" min="0" max="2" step="0.1" value={envIntensity} onChange={(e) => setEnvIntensity(Number(e.target.value))} className="accent-[#008234] cursor-pointer w-full" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ARCameraBackground() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch(err => {
            console.error("Error accessing camera:", err);
            setError(true);
        });
    } else {
        setError(true);
    }

    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
        }
    };
  }, []);

  if (error) {
      return <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white z-0 text-xs font-bold uppercase tracking-widest">Cámara no disponible / Permiso Denegado</div>;
  }

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
      autoPlay
      playsInline
      muted
    />
  );
}