import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import '../../types'; // Ensure global types are loaded

export const ConstructionElement = ({ position, args, color, onClick, label, type, rotation, polygonPoints }: any) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    useFrame(() => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = hovered ? 0.3 : 0;
            const targetScale = hovered ? 1.02 : 1;
            meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1));
        }
    });

    const geometry = useMemo(() => {
        // If polygon points exist, use extrusion (Custom Shape)
        if (polygonPoints && polygonPoints.length >= 3) {
            const shape = new THREE.Shape();
            
            // Points are typically {x, y}. In 3D we map them to X, Z plane usually for foundations
            // But here the component receives a local position.
            // We need to normalize points relative to the center or keep them as offsets.
            // Assumption: polygonPoints are offsets relative to 'position'. 
            // OR: If they are absolute coordinates, the caller should have set 'position' to 0,0,0
            
            // For simplicity in this visualization context, let's assume points are relative to the center 
            // OR we calculate the center from points and shift shape.
            
            // Let's assume polygonPoints are local [x, z] offsets.
            shape.moveTo(polygonPoints[0].x, polygonPoints[0].y);
            for (let i = 1; i < polygonPoints.length; i++) {
                shape.lineTo(polygonPoints[i].x, polygonPoints[i].y);
            }
            shape.closePath();

            // Height is usually passed in args. For Extrude, args is usually ignored or passed differently.
            // Let's assume args[1] (height) is the depth
            const height = args ? args[1] : 1; 
            
            return <extrudeGeometry args={[shape, { depth: height, bevelEnabled: false }]} />;
        }

        // Fallback to standard primitives
        if (type === 'cylinder') {
            return <cylinderGeometry args={args} />;
        }
        return <boxGeometry args={args} />;
    }, [type, args, polygonPoints]);

    // Adjust rotation for ExtrudeGeometry because it extrudes along Z by default, often we want Y (up)
    // If it's a polygon foundation, we usually draw it on X-Z plane and extrude Up (Y).
    // But THREE.Shape extrudes into Z. So rotate -90 X to make it flat on ground, then extrude up?
    // Actually simpler: Shape is X-Y. Extrude makes it X-Y-Z block.
    // If we want a flat footprint on ground extruded up:
    // Shape defined in X-Y. Rotate mesh -90 on X so shape is on X-Z plane. 
    const finalRotation = polygonPoints ? [-Math.PI / 2, 0, 0] : (rotation || [0, 0, 0]);

    return (
        <group position={position} rotation={finalRotation}>
            <mesh
                ref={meshRef}
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                {geometry}
                <meshStandardMaterial 
                    color={color} 
                    roughness={0.4} 
                    metalness={0.2}
                    emissive={color}
                    emissiveIntensity={0}
                />
            </mesh>
            {hovered && label && (
                <Billboard position={[0, (type === 'cylinder' ? args[2] : args[1])/2 + 1, 0]}>
                    <Text
                        fontSize={0.4}
                        color="white"
                        anchorX="center"
                        anchorY="bottom"
                        outlineWidth={0.04}
                        outlineColor="#000000"
                    >
                        {label}
                    </Text>
                </Billboard>
            )}
        </group>
    );
};