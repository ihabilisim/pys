
import React from 'react';
import { CrossSectionModal } from '../../components/Analytics';

interface KmChainageProps {
    selectedKm: string | null;
    onClose: () => void;
}

export const KmChainageModal: React.FC<KmChainageProps> = ({ selectedKm, onClose }) => {
    if (!selectedKm) return null;

    return (
        <CrossSectionModal km={selectedKm} onClose={onClose} />
    );
};
