
import React from 'react';
import { CrossSectionModal } from '../../components/modals/CrossSectionModal';
import { ChainageMarker } from '../../types';

interface KmChainageProps {
    selectedMarker: ChainageMarker | null;
    onClose: () => void;
}

export const KmChainageModal: React.FC<KmChainageProps> = ({ selectedMarker, onClose }) => {
    if (!selectedMarker) return null;

    return (
        <CrossSectionModal marker={selectedMarker} onClose={onClose} />
    );
};
