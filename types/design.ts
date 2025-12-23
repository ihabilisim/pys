
export interface MasterAlignment {
    id: string;
    name: string;
    description: string | null;
    filePath: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface AlignmentPoint {
    id: string;
    alignmentId: string;
    km: number;
    x: number;
    y: number;
    zRed: number | null; // Kırmızı Kot
    zBlack: number | null; // Siyah Kot
    superelevation: number | null;
    bearing: number | null;
}
