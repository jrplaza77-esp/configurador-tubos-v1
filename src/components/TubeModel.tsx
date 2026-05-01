import React, { useMemo, useState, useEffect, Suspense, useRef } from 'react';
import * as THREE from 'three';
import { useTexture, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useTubeStore } from '@/store/useTubeStore';
import { MEDIDAS_BASE } from '@/config/tubesConfig';

const SC = 0.1;
const BORDON_H = 8.6;

const AJUSTE: Record<string, Record<string, any>> = {
    '60': {
        METAL: { x: 0, z: 0, p: -6.0, r: 0, s: 0.1055 },
        PLASTICO: { x: 0, z: 0, p: -15.0, r: 0, s: 0.1045 },
        SELLADO: { x: 0, z: 0, p: -2.0, r: 180, s: 0.1085 },
        DISCO: { x: 0, z: 0, p: -9.3, r: 90, s: 0.1 },
        CORCHO: { x: 0, z: 0, p: 7.0, r: 180, s: 0.105 },
        TERMO: { x: 0, z: 0, p: 0.0, r: 0, s: 0.105 }
    },
    '63': {
        METAL: { x: 0, z: 0, p: 1.75, r: 180, s: 0.1055 },
        PLASTICO: { x: 0, z: 0, p: -15.0, r: 0, s: 0.1045 },
        SELLADO: { x: 0, z: 0, p: -2.0, r: 180, s: 0.1085 },
        DISCO: { x: 0, z: 0, p: -9.3, r: 90, s: 0.1 },
        CORCHO: { x: 0, z: 0, p: 7.0, r: 180, s: 0.105 },
        TERMO: { x: 0, z: 0, p: 0.0, r: 0, s: 0.105 }
    },
    '80': {
        METAL: { x: 0, z: 0, p: 1.75, r: 180, s: 0.1055 },
        PLASTICO: { x: 0, z: 0, p: -15.0, r: 0, s: 0.1045 },
        SELLADO: { x: 0, z: 0, p: -2.0, r: 180, s: 0.1066 },
        DISCO: { x: 0, z: 0, p: -9.3, r: 90, s: 0.1 },
        CORCHO: { x: 0, z: 0, p: 7, r: 180, s: 0.104 },
        TERMO: { x: 0, z: 0, p: 0.0, r: 0, s: 0.105 }
    },
    '85': {
        METAL: { x: 0, z: 0, p: -6.0, r: 0, s: 0.1055 },
        PLASTICO: { x: 0, z: 0, p: -15.0, r: 0, s: 0.1045 },
        SELLADO: { x: 0, z: 0, p: 1.0, r: 180, s: 0.1085 },
        DISCO: { x: 0, z: 0, p: -9.3, r: 90, s: 0.1 },
        CORCHO: { x: 0, z: 0, p: 7, r: 180, s: 0.1028 },
        TERMO: { x: 0, z: 0, p: 0.0, r: 0, s: 0.105 }
    },
    '100': {
        METAL: { x: 0, z: 0, p: 1.5, r: 180, s: 0.1030 }, // Ajustes específicos para Ø100
        PLASTICO: { x: 0, z: 51.25, p: -6.7, r: 270, s: 0.1026 },
        SELLADO: { x: 0, z: 0, p: -2.0, r: 180, s: 0.1058 },
        DISCO: { x: 0, z: 0, p: -9.3, r: 90, s: 0.1 },
        CORCHO: { x: 0, z: 0, p: 7.0, r: 180, s: 0.103 },
        TERMO: { x: 0, z: 0, p: 0.0, r: 0, s: 0.105 }
    },
    '105': {
        METAL: { x: 0, z: 0, p: -6.0, r: 0, s: 0.1055 },
        PLASTICO: { x: 0, z: 0, p: -15.0, r: 0, s: 0.1045 },
        SELLADO: { x: 0, z: 0, p: 1.0, r: 180, s: 0.1085 },
        DISCO: { x: 0, z: 0, p: -9.3, r: 90, s: 0.1 },
        CORCHO: { x: 0, z: 0, p: 7, r: 180, s: 0.1028 },
        TERMO: { x: 0, z: 0, p: 0.0, r: 0, s: 0.105 }
    },
    '125': {
        METAL: { x: 0, z: 0, p: -6.0, r: 0, s: 0.1055 },
        PLASTICO: { x: 0, z: 0, p: -15.0, r: 0, s: 0.1045 },
        SELLADO: { x: 0, z: 0, p: 1.0, r: 180, s: 0.1085 },
        DISCO: { x: 0, z: 0, p: -9.3, r: 90, s: 0.1 },
        CORCHO: { x: 0, z: 0, p: 7, r: 180, s: 0.1028 },
        TERMO: { x: 0, z: 0, p: 0.0, r: 0, s: 0.105 }
    },
    '130': {
        METAL: { x: 0, z: 0, p: -6.0, r: 0, s: 0.1055 },
        PLASTICO: { x: 0, z: 0, p: -15.0, r: 0, s: 0.1045 },
        SELLADO: { x: 0, z: 0, p: 1.0, r: 180, s: 0.1085 },
        DISCO: { x: 0, z: 0, p: -9.3, r: 90, s: 0.1 },
        CORCHO: { x: 0, z: 0, p: 7, r: 180, s: 0.1025 },
        TERMO: { x: 0, z: 0, p: 1.2, r: 180, s: 0.104 }
    }
};

// --- DYNAMIC EXPLODABLE GROUP ---
function ExplodableGroup({ isExploded, explodeOffset, children, basePos = [0, 0, 0] }: any) {
    const groupRef = useRef<THREE.Group>(null);
    useFrame(() => {
        if (!groupRef.current) return;
        const targetY = basePos[1] + (isExploded ? explodeOffset : 0);
        groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;
    });
    return <group ref={groupRef} position={basePos}>{children}</group>;
}

// --- UTILIDAD DE CARGA SEGURA DE MODELOS SEGÚN SU DISPONIBILIDAD ---
const AVAILABLE_CAPS: Record<string, string[]> = {
    disco: ['60'],
    fondo_sel: ['60', '80', '100'],
    tapa_corcho: ['60', '63', '80', '85', '100', '105', '125', '130'],
    tapa_metal: ['60', '63', '80', '100'],
    tapa_plastico: ['60', '80', '100'],
    tapa_termo: ['130']
};

const getCapUrl = (D: string, type: string) => {
    const list = AVAILABLE_CAPS[type];
    if (!list) return `/models/caps/60_${type}.glb`;
    const validD = list.includes(D) ? D : list[0];
    return `/models/caps/${validD}_${type}.glb`;
};

// --- 📦 COMPONENTE: CARGADOR DE TAPAS ---
function LegoPiece({ url, pos, targetDiam, adj, rot = [0, 0, 0], capColor, isBottom, customTex, kraftTex, isRealismActive }: any) {
    const { scene } = useGLTF(url) as any;
    const isCorcho = url.includes('corcho');

    const [corkTex, setCorkTex] = useState<THREE.Texture | null>(null);

    // Cargamos la textura de corcho solo si la URL es de corcho (Equivalente seguro a useTexture condicional)
    useEffect(() => {
        if (isCorcho) {
            new THREE.TextureLoader().load('/cork_hd.png', (tex) => {
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(2, 2);
                tex.colorSpace = THREE.SRGBColorSpace;
                setCorkTex(tex);
            });
        }
    }, [isCorcho]);

    const model = useMemo(() => {
        const group = new THREE.Group();
        const clone = scene.clone(true);
        const isMetal = url.includes('metal') || url.includes('sel');
        const isDisco = url.includes('disco') || url.includes('sel');

        clone.traverse((child: any) => {
            if (child.isMesh) {
                const isKraft = isDisco && capColor === '#C5A16F';
                
                let activeTex = (customTex && isDisco) ? customTex : (isCorcho ? corkTex : (isKraft ? kraftTex : null));
                if (isKraft && activeTex) {
                    activeTex = activeTex.clone();
                    activeTex.needsUpdate = true;
                    // Ajuste de escala (UVs) para que el grano del papel se vea natural
                    const reps = targetDiam / 47;
                    activeTex.repeat.set(reps, reps);
                }

                const parsedHex = new THREE.Color(capColor || '#111111');
                
                let finalColor = parsedHex;
                let finalMetalness = 0.0;
                let finalRoughness = 0.4;
                let finalEnvMap = 1.0;

                if (isCorcho) {
                    finalMetalness = 0.0;
                    finalRoughness = 1.0;
                    finalEnvMap = 1.0;
                } else if (isKraft) {
                    finalMetalness = 0.0;
                    finalRoughness = 0.8;
                    finalEnvMap = 0.1;
                } else if (isMetal) {
                    finalColor = new THREE.Color('#e0e0e0');
                    finalMetalness = 0.75;
                    finalRoughness = 0.35;
                    finalEnvMap = 1.5;
                } else if (activeTex) {
                    finalColor = new THREE.Color('#FFFFFF');
                }

                const mat = new THREE.MeshPhysicalMaterial({
                    color: finalColor,
                    metalness: finalMetalness,
                    roughness: finalRoughness,
                    envMapIntensity: finalEnvMap,
                    side: THREE.DoubleSide,
                    map: activeTex
                });

                const matWhite = new THREE.MeshStandardMaterial({
                    color: '#FFFFFF',
                    roughness: 0.9,
                    metalness: 0.0,
                    side: THREE.DoubleSide
                });



                // Asignar mapeo UV en plano local (X y Z) para discos o Cilíndrico Seguro para corcho
                if (isDisco || isCorcho) {

                    // 0. Horneado (Baking) de matrices anidadas
                    // Modelos como el 63 fueron exportados de Blender con 'Z-Up' (Rotation X = -90 en el nodo).
                    // Para que nuestra matemática UV funcione garantizando que el "Arriba" es la 'Y', 
                    // extraemos la transformación real en el espacio del objeto padre (TubeModel) y la horneamos.
                    clone.updateMatrixWorld(true);

                    let geometry = child.geometry.clone();
                    // Horneamos la transformación del nodo (incluyendo su -90 grados u offsets) en el modelo físico
                    geometry.applyMatrix4(child.matrixWorld);

                    // Reseteamos el transform del nodo para que no lo rote por segunda vez en el render
                    child.position.set(0, 0, 0);
                    child.rotation.set(0, 0, 0);
                    child.scale.set(1, 1, 1);
                    child.updateMatrix();

                    if (isCorcho) {
                        geometry = geometry.toNonIndexed(); // Necesario para iterar triángulo a triángulo y fixear costuras
                    }
                    geometry.computeBoundingBox();
                    geometry.computeVertexNormals();
                    const b = geometry.boundingBox;
                    const xSize = b.max.x - b.min.x;
                    const ySize = b.max.y - b.min.y;
                    const zSize = b.max.z - b.min.z;
                    const posAttrib = geometry.attributes.position;
                    const uvs = new Float32Array(posAttrib.count * 2);

                    if (isCorcho) {
                        // Offset paramétrico para centrar la rotación cilíndrica a la mitad del objeto
                        const cxOffset = b.min.x + xSize / 2;
                        const czOffset = b.min.z + zSize / 2;

                        for (let i = 0; i < posAttrib.count; i += 3) {
                            let isSide = false;
                            const us = [0, 0, 0];
                            const vs = [0, 0, 0];

                            // 1. Obtener los 3 vértices del triángulo de corcho
                            const p0x = posAttrib.getX(i), p0y = posAttrib.getY(i), p0z = posAttrib.getZ(i);
                            const p1x = posAttrib.getX(i + 1), p1y = posAttrib.getY(i + 1), p1z = posAttrib.getZ(i + 1);
                            const p2x = posAttrib.getX(i + 2), p2y = posAttrib.getY(i + 2), p2z = posAttrib.getZ(i + 2);

                            // 2. Calcular la Normal Geométrica de toda la CARA (Producto cruzado)
                            // Ignoramos las normales suavizadas de los vértices que interpolaban erróneamente en los bordes
                            const e1x = p1x - p0x, e1y = p1y - p0y, e1z = p1z - p0z;
                            const e2x = p2x - p0x, e2y = p2y - p0y, e2z = p2z - p0z;
                            const nx = e1y * e2z - e1z * e2y;
                            const ny = e1z * e2x - e1x * e2z;
                            const nz = e1x * e2y - e1y * e2x;
                            const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
                            const faceNy = Math.abs(ny / (length || 1));

                            // Si la cara en su conjunto apunta hacia arriba/abajo
                            const isTriangleTop = faceNy > 0.5;

                            for (let j = 0; j < 3; j++) {
                                const idx = i + j;
                                const px = posAttrib.getX(idx);
                                const py = posAttrib.getY(idx);
                                const pz = posAttrib.getZ(idx);

                                if (isTriangleTop) {
                                    // Matemáticas para la Tapa plana Superior/Inferior
                                    us[j] = (px - b.min.x) / xSize;
                                    vs[j] = (pz - b.min.z) / zSize;
                                } else {
                                    isSide = true;
                                    // Borde curvo cilíndrico (Convertir coordenadas cartesianas a polares)
                                    const angle = Math.atan2(pz - czOffset, px - cxOffset);
                                    let u = (angle + Math.PI) / (Math.PI * 2);
                                    u = u * Math.PI; // Mantiene el aspecto mapeando el perímetro total real
                                    let v = (py - b.min.y) / xSize; // Divisor basado en xSize bloqueando aspecto 1:1!
                                    us[j] = u;
                                    vs[j] = v;
                                }
                            }

                            // Evitar el mega-estiramiento cuando el vértice envuelve de -PI a +PI en la matriz polar
                            if (isSide) {
                                const maxU = Math.max(us[0], us[1], us[2]);
                                const minU = Math.min(us[0], us[1], us[2]);
                                // Si la anchura de un solo triángulo abarca más del cuádruple de lo normal, es la fisura de empate
                                if (maxU - minU > Math.PI * 0.5) {
                                    for (let j = 0; j < 3; j++) {
                                        if (us[j] < Math.PI * 0.5) us[j] += Math.PI; // Coser la brecha matemáticamente
                                    }
                                }
                            }

                            for (let j = 0; j < 3; j++) {
                                uvs[(i + j) * 2] = us[j];
                                uvs[(i + j) * 2 + 1] = vs[j];
                            }
                        }
                    } else {
                        // isDisco
                        const isXZ = zSize > ySize;
                        
                        const index = geometry.getIndex();
                        const triCount = index ? index.count / 3 : posAttrib.count / 3;
                        
                        geometry.clearGroups();
                        const p0 = new THREE.Vector3();
                        const p1 = new THREE.Vector3();
                        const p2 = new THREE.Vector3();
                        const cb = new THREE.Vector3();
                        const ab = new THREE.Vector3();

                        for (let i = 0; i < triCount; i++) {
                            const i3 = i * 3;
                            const a = index ? index.getX(i3) : i3;
                            const b = index ? index.getX(i3 + 1) : i3 + 1;
                            const c = index ? index.getX(i3 + 2) : i3 + 2;

                            p0.fromBufferAttribute(posAttrib, a);
                            p1.fromBufferAttribute(posAttrib, b);
                            p2.fromBufferAttribute(posAttrib, c);

                            cb.subVectors(p2, p1);
                            ab.subVectors(p0, p1);
                            cb.cross(ab);
                            cb.normalize();

                            // Normal is cb
                            let isOutside = false;
                            if (isXZ) {
                                if (cb.y < -0.5) isOutside = true;
                            } else {
                                if (cb.z < -0.5) isOutside = true;
                            }

                            geometry.addGroup(i3, 3, isOutside ? 0 : 1);
                        }

                        for (let i = 0; i < posAttrib.count; i++) {
                            const px = posAttrib.getX(i);
                            const py = posAttrib.getY(i);
                            const pz = posAttrib.getZ(i);

                            uvs[i * 2] = (px - b.min.x) / xSize;
                            if (isXZ) {
                                uvs[i * 2 + 1] = 1.0 - ((pz - b.min.z) / zSize);
                            } else {
                                uvs[i * 2 + 1] = 1.0 - ((py - b.min.y) / ySize);
                            }
                        }
                    }

                    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
                    geometry.attributes.uv.needsUpdate = true;
                    child.geometry = geometry;
                }

                if (isDisco) {
                    child.material = [mat, matWhite];
                } else {
                    child.material = mat;
                }
            }
        });

        const box = new THREE.Box3().setFromObject(clone);
        const size = new THREE.Vector3();
        box.getSize(size);
        const scaleFactor = (targetDiam / size.x) * adj.s;
        clone.scale.set(scaleFactor, scaleFactor, scaleFactor);

        const center = new THREE.Vector3();
        box.getCenter(center);

        // Discos y Fondos Sellados suelen modelarse "de pie" (Y=0, rotados a Z), para que puedan rotarse bien 
        // 180º o 270º necesitan desplazarse de su 'center.y' estricto en la malla matemática original
        const isCentradoOrigin = url.includes('disco') || url.includes('sel');
        clone.position.set(-center.x * scaleFactor, isCentradoOrigin ? -center.y * scaleFactor : -box.min.y * scaleFactor, -center.z * scaleFactor);

        group.add(clone);
        return group;
    }, [scene, targetDiam, adj, url, capColor, customTex, isCorcho, corkTex, kraftTex, isRealismActive]);

    const rad = (d: number) => d * (Math.PI / 180);
    return (
        <primitive
            object={model}
            position={[(pos[0] + adj.x) * SC, (pos[1] + (isBottom ? -adj.p : adj.p)) * SC, (pos[2] + adj.z) * SC]}
            rotation={[rot[0] + rad(adj.r), rot[1], rot[2]]}
        />
    );
}

export function Sistema1Pieza({ height: h_custom, position = [0, 0, 0] }: any) {
    const { activePanel, studioMode, diameter: storeDiameter, height: storeHeight, topCap, bottomCap, userDesign, isSectionActive, plasticColor, tubeColor, discColor, isExploded } = useTubeStore() as any;

    const isRealismActive = activePanel === 'ESTUDIO' && studioMode;

    const capHex = plasticColor === 'WHITE' ? '#FFFFFF' : '#111111';

    const height = Number(h_custom || storeHeight || 100);
    const D = String(storeDiameter || '60');
    const D_num = Number(D);

    // Configuración de referencia dinámica según el diámetro
    const medidas = MEDIDAS_BASE[D] || MEDIDAS_BASE['60'];
    const ro = medidas.ext / 2;
    const ri = medidas.int / 2;
    const t = (medidas.ext - medidas.int) / 2;
    const ra = ri - 4.1;

    // 1. Textura Kraft Nativa
    const kraftTex = useTexture('/kraft.jpg');
    kraftTex.wrapS = kraftTex.wrapT = THREE.RepeatWrapping;
    kraftTex.repeat.set(4, height / 40);

    // 2. Geometría Centrada
    const tubeData = useMemo(() => {
        const HH = height / 2;
        const cx1 = (ro + ra) / 2;
        const rx1 = (ro - ra - t) / 2;
        const ry1 = 2.5 - t / 2;
        const cy1 = HH - 2.5;
        const r_tuck = 1.1 + t / 2;
        const ccx2 = (ra + t / 2) + r_tuck;
        const ccy2 = HH - BORDON_H + r_tuck + t / 2;

        const oPts = []; const iPts = [];
        const tieneSup = topCap?.toLowerCase().includes('bordon');
        const tieneInf = bottomCap?.toLowerCase().includes('bordon');

        if (tieneInf) {
            const tmpO = []; const tmpI = [];
            for (let i = 1; i <= 20; i++) {
                const a = (i / 20) * Math.PI;
                tmpO.push(new THREE.Vector2(cx1 + (rx1 + t / 2) * Math.cos(a), -(cy1 + (ry1 + t / 2) * Math.sin(a))));
                tmpI.push(new THREE.Vector2(cx1 + (rx1 - t / 2) * Math.cos(a), -(cy1 + (ry1 - t / 2) * Math.sin(a))));
            }
            for (let i = 1; i <= 10; i++) {
                const a = Math.PI + (i / 10) * (Math.PI / 2);
                tmpO.push(new THREE.Vector2(ccx2 + (r_tuck + t / 2) * Math.cos(a), -(ccy2 + (r_tuck + t / 2) * Math.sin(a))));
                tmpI.push(new THREE.Vector2(ccx2 + (r_tuck - t / 2) * Math.cos(a), -(ccy2 + (r_tuck - t / 2) * Math.sin(a))));
            }
            for (let i = tmpO.length - 1; i >= 0; i--) oPts.push(tmpO[i]);
            for (let i = tmpI.length - 1; i >= 0; i--) iPts.push(tmpI[i]);
        } else {
            oPts.push(new THREE.Vector2(ro, -HH));
            iPts.push(new THREE.Vector2(ri, -HH));
        }

        const yTopBody = tieneSup ? cy1 : HH;
        oPts.push(new THREE.Vector2(ro, yTopBody));
        iPts.push(new THREE.Vector2(ri, yTopBody));

        if (tieneSup) {
            for (let i = 1; i <= 20; i++) {
                const a = (i / 20) * Math.PI;
                oPts.push(new THREE.Vector2(cx1 + (rx1 + t / 2) * Math.cos(a), cy1 + (ry1 + t / 2) * Math.sin(a)));
                iPts.push(new THREE.Vector2(cx1 + (rx1 - t / 2) * Math.cos(a), cy1 + (ry1 - t / 2) * Math.sin(a)));
            }
            for (let i = 1; i <= 10; i++) {
                const a = Math.PI + (i / 10) * (Math.PI / 2);
                oPts.push(new THREE.Vector2(ccx2 + (r_tuck + t / 2) * Math.cos(a), ccy2 + (r_tuck + t / 2) * Math.sin(a)));
                iPts.push(new THREE.Vector2(ccx2 + (r_tuck - t / 2) * Math.cos(a), ccy2 + (r_tuck - t / 2) * Math.sin(a)));
            }
        } else {
            oPts.push(new THREE.Vector2(ro, HH));
            iPts.push(new THREE.Vector2(ri, HH));
        }

        const pts = [...oPts];
        for (let i = iPts.length - 1; i >= 0; i--) pts.push(iPts[i]);
        pts.push(oPts[0].clone());

        const lengths = [0]; let totalL = 0; let baseLength = 0;
        for (let i = 1; i < oPts.length; i++) {
            totalL += oPts[i].distanceTo(oPts[i - 1]);
            lengths.push(totalL);
            if (tieneInf && i === 29) {
                baseLength = totalL;
            }
        }

        return { pts, oPtsLength: oPts.length, lengths, totalL, tieneSup, tieneInf, baseLength };
    }, [height, topCap, bottomCap, ro, ri, ra]);

    const geometry = useMemo(() => {
        const segments = 64;
        const geo = new THREE.LatheGeometry(tubeData.pts, segments);
        geo.computeVertexNormals();
        geo.clearGroups();

        let faceIndex = 0;
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < tubeData.pts.length - 1; j++) {
                geo.addGroup(faceIndex * 6, 6, j < tubeData.oPtsLength - 1 ? 0 : 1);
                faceIndex++;
            }
        }

        const uv = geo.attributes.uv;
        const texHeight = height + (tubeData.tieneSup ? 15 : 0) + (tubeData.tieneInf ? 15 : 0);

        for (let i = 0; i <= segments; i++) {
            for (let j = 0; j < tubeData.pts.length; j++) {
                const idx = i * tubeData.pts.length + j;
                if (j < tubeData.oPtsLength) {
                    let unrolled = tubeData.lengths[j];
                    if (tubeData.tieneInf) {
                        unrolled += (15 - tubeData.baseLength);
                    }
                    uv.setY(idx, unrolled / texHeight);
                } else {
                    uv.setY(idx, 0);
                }
            }
        }
        uv.needsUpdate = true;
        return geo;
    }, [tubeData, height]);

    // 3. Materiales (Definiciones corregidas)
    const extMat = useMemo(() => {
        const isKraft = (!userDesign && tubeColor === '#C5A16F');
        return new THREE.MeshPhysicalMaterial({
            color: userDesign ? "#FFFFFF" : tubeColor,
            map: isKraft ? kraftTex : null,
            side: THREE.FrontSide,
            metalness: 0.0,
            roughness: isKraft ? 0.8 : 0.9,
            envMapIntensity: isKraft ? 0.1 : 1.0,
            clearcoat: 0.0,
            clippingPlanes: isSectionActive ? [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)] : []
        });
    }, [kraftTex, userDesign, isSectionActive, tubeColor]);

    const intMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: "#FFFFFF",
        emissive: "#FFFFFF",
        emissiveIntensity: 0.15,
        side: THREE.FrontSide,
        clippingPlanes: isSectionActive ? [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)] : []
    }), [isSectionActive]);

    const [textureMap, setTextureMap] = useState<THREE.Texture | null>(null);
    const { designMode, designScale, designOffsetX, designOffsetY } = useTubeStore() as any;

    useEffect(() => {
        if (!userDesign) { setTextureMap(null); return; }
        new THREE.TextureLoader().load(userDesign, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            setTextureMap(tex);
        });
    }, [userDesign]);

    useEffect(() => {
        if (!textureMap) return;
        const D_str = String(storeDiameter || '60');
        const medidas = MEDIDAS_BASE[D_str] || MEDIDAS_BASE['60'];
        const totalW = medidas.desarrollo;
        const solape = medidas.solape || 9.0;
        const circ = totalW - solape;
        
        textureMap.center.set(0.5, 0.5);

        if (designMode === 'AUTO') {
            textureMap.repeat.set(circ / totalW, 1);
            textureMap.offset.set(0.5 * (solape / totalW), 0);
        } else {
            textureMap.repeat.set((circ / totalW) / designScale, 1 / designScale);
            textureMap.offset.set((0.5 * (solape / totalW)) - designOffsetX, designOffsetY);
        }
        textureMap.needsUpdate = true;
    }, [textureMap, storeDiameter, designMode, designScale, designOffsetX, designOffsetY]);

    const { userDesignDisc, designDiscMode, designDiscScale, designDiscOffsetX, designDiscOffsetY } = useTubeStore() as any;
    const [discTexMap, setDiscTexMap] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        if (!userDesignDisc) { setDiscTexMap(null); return; }
        new THREE.TextureLoader().load(userDesignDisc, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            setDiscTexMap(tex);
        });
    }, [userDesignDisc]);

    useEffect(() => {
        if (!discTexMap || !discTexMap.image) return;
        
        const image = discTexMap.image as any;
        const aspect = image.width / image.height;
        let baseRepeatX = 1;
        let baseRepeatY = 1;

        if (aspect > 1) {
            baseRepeatX = 1 / aspect;
        } else {
            baseRepeatY = aspect; 
        }

        if (designDiscMode === 'AUTO') {
            discTexMap.repeat.set(baseRepeatX, baseRepeatY);
            discTexMap.offset.set((1 - baseRepeatX) / 2, (1 - baseRepeatY) / 2);
        } else {
            discTexMap.repeat.set(baseRepeatX / designDiscScale, baseRepeatY / designDiscScale);
            discTexMap.offset.set(((1 - (baseRepeatX / designDiscScale)) / 2) - designDiscOffsetX, ((1 - (baseRepeatY / designDiscScale)) / 2) - designDiscOffsetY);
        }
        discTexMap.needsUpdate = true;
    }, [discTexMap, designDiscMode, designDiscScale, designDiscOffsetX, designDiscOffsetY]);

    const sectionCutsGeo = useMemo(() => {
        if (!isSectionActive || !tubeData?.pts?.length) return null;
        const shape = new THREE.Shape();
        shape.moveTo(tubeData.pts[0].x, tubeData.pts[0].y);
        for (let i = 1; i < tubeData.pts.length; i++) {
            shape.lineTo(tubeData.pts[i].x, tubeData.pts[i].y);
        }
        return new THREE.ShapeGeometry(shape);
    }, [tubeData, isSectionActive]);

    const getCapColor = (capType: string) => {
        if (capType === 'PLASTICO' || capType === 'TERMO') return capHex;
        if (capType === 'METAL' && (D_num === 63 || D_num === 80)) return capHex; // Usamos el color de plástico para la lógica de Negro/Níquel
        return discColor;
    };

    return (
        <group position={[position[0] * SC, position[1] * SC, position[2] * SC]}>
            <Suspense fallback={null}>
                <mesh geometry={geometry} rotation={[0, Math.PI, 0]} scale={[SC, SC, SC]} castShadow receiveShadow>
                    <primitive object={extMat} attach="material-0" />
                    <primitive object={intMat} attach="material-1" />
                </mesh>

                {textureMap && (
                    <mesh geometry={geometry} rotation={[0, Math.PI, 0]} scale={[SC, SC, SC]}>
                        <meshStandardMaterial
                            attach="material-0"
                            map={textureMap}
                            transparent={true}
                            polygonOffset={true}
                            polygonOffsetFactor={-1}
                            clippingPlanes={isSectionActive ? [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)] : []}
                            onBeforeCompile={(shader) => {
                                shader.fragmentShader = shader.fragmentShader.replace(
                                    '#include <map_fragment>',
                                    `
                                    #include <map_fragment>
                                    #ifdef USE_MAP
                                        if (vMapUv.x < 0.0 || vMapUv.x > 1.0 || vMapUv.y < 0.0 || vMapUv.y > 1.0) {
                                            diffuseColor.a = 0.0;
                                        }
                                    #endif
                                    `
                                );
                            }}
                        />
                        <meshStandardMaterial attach="material-1" visible={false} />
                    </mesh>
                )}

                {sectionCutsGeo && isSectionActive && (
                    <group scale={[SC, SC, SC]} rotation={[0, Math.PI, 0]}>
                        <mesh geometry={sectionCutsGeo}>
                            <meshBasicMaterial color="#FFFFFF" side={THREE.DoubleSide} />
                        </mesh>
                        <mesh geometry={sectionCutsGeo} rotation={[0, Math.PI, 0]}>
                            <meshBasicMaterial color="#FFFFFF" side={THREE.DoubleSide} />
                        </mesh>
                    </group>
                )}

                <ExplodableGroup isExploded={isExploded} explodeOffset={30 * SC} basePos={[0, (height / 2) * SC, 0]}>
                    {topCap === 'METAL' && <LegoPiece url={getCapUrl(D, 'tapa_metal')} targetDiam={D_num} adj={AJUSTE[D]?.METAL || AJUSTE['60'].METAL} pos={[0, 0, 0]} capColor={getCapColor(topCap)} isRealismActive={isRealismActive} />}
                    {topCap === 'PLASTICO' && <LegoPiece url={getCapUrl(D, 'tapa_plastico')} targetDiam={D_num} adj={AJUSTE[D]?.PLASTICO || AJUSTE['60'].PLASTICO} pos={[0, 0, 0]} capColor={getCapColor(topCap)} isRealismActive={isRealismActive} />}
                    {topCap === 'BORDON_DISCO' && <LegoPiece url={getCapUrl(D, 'disco')} targetDiam={D_num} adj={AJUSTE[D]?.DISCO || AJUSTE['60'].DISCO} pos={[0, 0, 0]} capColor={discColor} customTex={discTexMap} kraftTex={kraftTex} isRealismActive={isRealismActive} />}
                    {topCap === 'CORCHO' && <LegoPiece url={getCapUrl(D, 'tapa_corcho')} targetDiam={D_num} adj={AJUSTE[D]?.CORCHO || AJUSTE['60'].CORCHO} pos={[0, 0, 0]} capColor="#D2A679" isRealismActive={isRealismActive} />}
                    {topCap === 'TERMO' && <LegoPiece url={getCapUrl(D, 'tapa_termo')} targetDiam={D_num} adj={AJUSTE[D]?.TERMO || AJUSTE['60'].TERMO} pos={[0, 0, 0]} capColor={getCapColor(topCap)} isRealismActive={isRealismActive} />}
                </ExplodableGroup>

                <ExplodableGroup isExploded={isExploded} explodeOffset={-30 * SC} basePos={[0, -(height / 2) * SC, 0]}>
                    {bottomCap === 'METAL' && <LegoPiece url={getCapUrl(D, 'tapa_metal')} targetDiam={D_num} adj={AJUSTE[D]?.METAL || AJUSTE['60'].METAL} pos={[0, 0, 0]} rot={[Math.PI, 0, 0]} isBottom={true} capColor={getCapColor(bottomCap)} isRealismActive={isRealismActive} />}
                    {bottomCap === 'PLASTICO' && <LegoPiece url={getCapUrl(D, 'tapa_plastico')} targetDiam={D_num} adj={AJUSTE[D]?.PLASTICO || AJUSTE['60'].PLASTICO} pos={[0, 0, 0]} rot={[Math.PI, 0, 0]} capColor={getCapColor(bottomCap)} isBottom={true} isRealismActive={isRealismActive} />}
                    {bottomCap === 'BORDON_DISCO' && <LegoPiece url={getCapUrl(D, 'disco')} targetDiam={D_num} adj={AJUSTE[D]?.DISCO || AJUSTE['60'].DISCO} pos={[0, 0, 0]} rot={[Math.PI, 0, 0]} capColor={discColor} isBottom={true} customTex={discTexMap} kraftTex={kraftTex} isRealismActive={isRealismActive} />}
                    {bottomCap === 'SELLADO' && <LegoPiece url={getCapUrl(D, 'fondo_sel')} targetDiam={D_num} adj={AJUSTE[D]?.SELLADO || AJUSTE['60'].SELLADO} pos={[0, 0, 0]} rot={[Math.PI, 0, 0]} isBottom={true} customTex={discTexMap} capColor={discColor} kraftTex={kraftTex} isRealismActive={isRealismActive} />}
                    {bottomCap === 'TERMO' && <LegoPiece url={getCapUrl(D, 'tapa_termo')} targetDiam={D_num} adj={AJUSTE[D]?.TERMO || AJUSTE['60'].TERMO} pos={[0, 0, 0]} rot={[Math.PI, 0, 0]} isBottom={true} capColor={getCapColor(bottomCap)} isRealismActive={isRealismActive} />}
                </ExplodableGroup>
            </Suspense>
        </group>
    );
}

export default function TubeModel(props: any) {
    return <Sistema1Pieza {...props} />;
}