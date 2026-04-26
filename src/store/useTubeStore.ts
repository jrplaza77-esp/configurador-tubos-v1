import { create } from 'zustand';
import { CONFIG_1_PIEZA } from '@/config/tubesConfig';

interface TubeState {
    type: string;
    arMode: boolean;
    diameter: string;
    height: number;
    topCap: string;
    bottomCap: string;
    plasticColor: string;
    activePanel: string;
    isSectionActive: boolean;
    isDarkMode: boolean;
    isDesignOpen: boolean;
    isExploded: boolean;
    studioMode: boolean;
    userDesign: string | null;
    userDesignDisc: string | null;
    designHeight: number | null;
    tubeColor: string;
    discColor: string;

    lightIntensity: number;
    spotLightIntensity: number;
    envIntensity: number;

    designMode: 'AUTO' | 'MANUAL';
    designScale: number;
    designOffsetX: number;
    designOffsetY: number;
    
    designDiscMode: 'AUTO' | 'MANUAL';
    designDiscScale: number;
    designDiscOffsetX: number;
    designDiscOffsetY: number;

    setDimensions: (d: string, h: number) => void;
    setCaps: (top: string, bottom: string) => void;
    setPlasticColor: (color: string) => void;
    setActivePanel: (panel: string) => void;
    setSectionActive: (val: boolean) => void;
    setType: (t: string) => void;
    setArMode: (val: boolean) => void;
    toggleDarkMode: () => void;
    toggleStudioMode: () => void;
    setStudioMode: (val: boolean) => void;
    // 🟢 NUEVAS ACCIONES
    setIsDesignOpen: (val: boolean) => void;
    setIsExploded: (val: boolean) => void;
    setUserDesign: (url: string | null) => void;
    setUserDesignDisc: (url: string | null) => void;
    setTubeColor: (color: string) => void;
    setDiscColor: (color: string) => void;
    
    setLightIntensity: (val: number) => void;
    setSpotLightIntensity: (val: number) => void;
    setEnvIntensity: (val: number) => void;

    floorColorDay: string;
    floorColorNight: string;
    setFloorColorDay: (color: string) => void;
    setFloorColorNight: (color: string) => void;

    setDesignMode: (mode: 'AUTO' | 'MANUAL') => void;
    setDesignScale: (val: number) => void;
    setDesignOffsetX: (val: number) => void;
    setDesignOffsetY: (val: number) => void;

    setDesignDiscMode: (mode: 'AUTO' | 'MANUAL') => void;
    setDesignDiscScale: (val: number) => void;
    setDesignDiscOffsetX: (val: number) => void;
    setDesignDiscOffsetY: (val: number) => void;
}

export const useTubeStore = create<TubeState>((set) => ({
    type: '1P',
    arMode: false,
    diameter: '60',
    height: 100,
    topCap: 'NONE',
    bottomCap: 'NONE',
    plasticColor: 'BLACK',
    activePanel: 'MEDIDAS',
    isSectionActive: false,
    isDarkMode: true,
    isDesignOpen: false,
    isExploded: false,
    studioMode: false,
    userDesign: null,
    userDesignDisc: null,
    designHeight: null,
    tubeColor: '#C5A16F', // Kraft
    discColor: '#111111', // Negro

    lightIntensity: 0.7,
    spotLightIntensity: 2.5,
    envIntensity: 0.3,

    floorColorDay: '#A0A0A0',
    floorColorNight: '#1a1d21',

    designMode: 'AUTO',
    designScale: 1,
    designOffsetX: 0,
    designOffsetY: 0,
    
    designDiscMode: 'AUTO',
    designDiscScale: 1,
    designDiscOffsetX: 0,
    designDiscOffsetY: 0,

    setActivePanel: (panel) => set({ activePanel: panel }),
    setSectionActive: (val) => set({ isSectionActive: val }),
    setPlasticColor: (color) => set({ plasticColor: color }),
    setType: (t) => set({ type: t }),
    setArMode: (val) => set({ arMode: val }),
    setIsDesignOpen: (val) => set({ isDesignOpen: val }),
    setIsExploded: (val) => set({ isExploded: val }),
    setUserDesign: (url) => set((state) => ({ userDesign: url, designHeight: url ? state.height : null })),
    setUserDesignDisc: (url) => set({ userDesignDisc: url }),
    setTubeColor: (color) => set({ tubeColor: color }),
    setDiscColor: (color) => set({ discColor: color }),
    
    setLightIntensity: (val) => set({ lightIntensity: val }),
    setSpotLightIntensity: (val) => set({ spotLightIntensity: val }),
    setEnvIntensity: (val) => set({ envIntensity: val }),

    setFloorColorDay: (color) => set({ floorColorDay: color }),
    setFloorColorNight: (color) => set({ floorColorNight: color }),

    setDesignMode: (mode) => set({ designMode: mode }),
    setDesignScale: (val) => set({ designScale: val }),
    setDesignOffsetX: (val) => set({ designOffsetX: val }),
    setDesignOffsetY: (val) => set({ designOffsetY: val }),

    setDesignDiscMode: (mode) => set({ designDiscMode: mode }),
    setDesignDiscScale: (val) => set({ designDiscScale: val }),
    setDesignDiscOffsetX: (val) => set({ designDiscOffsetX: val }),
    setDesignDiscOffsetY: (val) => set({ designDiscOffsetY: val }),

    setDimensions: (d, h) => set((state) => {
        let top = state.topCap;
        let bottom = state.bottomCap;
        
        let isDiameterChange = state.diameter !== d;
        let updates: any = { diameter: d };

        if (isDiameterChange) {
            top = "NONE";
            bottom = "NONE";
            updates.topCap = top;
            updates.bottomCap = bottom;
            updates.userDesign = null;
            updates.userDesignDisc = null;
            updates.designHeight = null;
            updates.tubeColor = '#C5A16F';
        } else {
            if (!CONFIG_1_PIEZA[d]?.top.includes(top)) top = "NONE";
            if (!CONFIG_1_PIEZA[d]?.bottom.includes(bottom)) bottom = "NONE";
            updates.topCap = top;
            updates.bottomCap = bottom;
        }

        const bordon = top.includes('BORDON') || bottom.includes('BORDON');
        const maxH = (bordon || bottom === 'SELLADO') ? 300 : 600;
        updates.height = Math.min(Math.max(h, 25), maxH);

        return updates;
    }),

    setCaps: (top, bottom) => set((state) => {
        if (top.includes('BORDON') && bottom.includes('BORDON')) return {};
        const bordon = top.includes('BORDON') || bottom.includes('BORDON');
        const maxH = (bordon || bottom === 'SELLADO') ? 300 : 600;
        return { topCap: top, bottomCap: bottom, height: Math.min(state.height, maxH) };
    }),

    toggleDarkMode: () => set((state) => ({ 
        isDarkMode: !state.isDarkMode,
        lightIntensity: !state.isDarkMode ? 0.7 : 0.8,
        envIntensity: !state.isDarkMode ? 0.3 : 0.6
    })),
    toggleStudioMode: () => set((state) => ({ studioMode: !state.studioMode })),
    setStudioMode: (val) => set({ studioMode: val }),
}));