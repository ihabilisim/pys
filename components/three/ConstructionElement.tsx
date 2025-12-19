
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

export const ConstructionElement = ({ position, args, color, onClick, label, type, rotation }: any) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    // Hover animasyonu
    useFrame((state) => {
        if (meshRef.current && hovered) {
            meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1.02, 0.1));
        } else if (meshRef.current) {
            meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1, 0.1));
        }
    });

    const geometry = type === 'cylinder' 
        ? <cylinderGeometry args={args} /> 
        : <boxGeometry args={args} />;

    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
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
                    emissive={hovered ? color : '#000000'}
                    emissiveIntensity={hovered ? 0.3 : 0}
                />
            </mesh>
            {hovered && (
                <Billboard position={[0, (type === 'cylinder' ? args[2] : args[1])/2 + 0.5, 0]}>
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