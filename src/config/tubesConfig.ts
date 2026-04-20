// DATOS TÉCNICOS ARPLAST - REVISADOS SEGÚN TABLA
export const MEDIDAS_BASE: Record<string, any> = {
    "60": { int: 60.4, ext: 63.2, desarrollo: 208, solape: 9 },
    "63": { int: 63.5, ext: 66.4, desarrollo: 218, solape: 9 },
    "80": { int: 80.5, ext: 83.3, desarrollo: 270, solape: 9 },
    "85": { int: 85.0, ext: 87.8, desarrollo: 285, solape: 9 },
    "100": { int: 100.5, ext: 103.9, desarrollo: 336, solape: 9 },
    "105": { int: 104.9, ext: 108.3, desarrollo: 350, solape: 9 },
    "125": { int: 125.5, ext: 128.3, desarrollo: 412, solape: 9 },
    "130": { int: 130.0, ext: 133.8, desarrollo: 430, solape: 9 }
};

export const CONFIG_1_PIEZA: Record<string, { top: string[], bottom: string[] }> = {
    "60": { 
        top: ["BORDON", "BORDON_DISCO", "NONE", "CORCHO", "METAL", "PLASTICO"], 
        bottom: ["BORDON_DISCO", "NONE", "SELLADO", "METAL", "PLASTICO"] 
    },
    "63": { 
        top: ["BORDON", "BORDON_DISCO", "NONE", "CORCHO", "METAL"], 
        bottom: ["BORDON_DISCO", "NONE", "SELLADO", "METAL"] 
    },
    "80": { 
        top: ["BORDON", "BORDON_DISCO", "NONE", "CORCHO", "METAL", "PLASTICO"], 
        bottom: ["BORDON_DISCO", "NONE", "SELLADO", "METAL", "PLASTICO"] 
    },
    "85": { 
        top: ["BORDON", "BORDON_DISCO", "NONE", "CORCHO"], 
        bottom: ["BORDON_DISCO", "NONE"] 
    },
    "100": { 
        top: ["BORDON", "BORDON_DISCO", "NONE", "CORCHO", "METAL", "PLASTICO"], 
        bottom: ["BORDON_DISCO", "NONE", "SELLADO", "METAL", "PLASTICO"] 
    },
    "105": { 
        top: ["BORDON", "BORDON_DISCO", "NONE", "CORCHO"], 
        bottom: ["BORDON_DISCO", "NONE"] 
    },
    "125": { 
        top: ["BORDON", "BORDON_DISCO", "NONE", "CORCHO"], 
        bottom: ["BORDON_DISCO", "NONE"] 
    },
    "130": { 
        top: ["BORDON", "BORDON_DISCO", "NONE", "CORCHO", "TERMO"], 
        bottom: ["BORDON_DISCO", "NONE", "TERMO"] 
    },
};

export const BORDON_CONSTANTS = {
    ALTURA: 8.6,
    GROSOR: 1.4,
    RADIO_CORONA: 2.5
};