
declare const L: any;

export const mapUtils = {
  // Survey Point / Stake Style Icon
  createPolygonIcon: (label: string, isSelected: boolean) => L.divIcon({
    className: 'custom-poly-icon',
    html: `
      <div class="group relative flex flex-col items-center transition-all duration-300 ${isSelected ? 'z-[100] scale-125' : 'z-[10] hover:scale-110 hover:z-[50]'}">
        <!-- Label Box -->
        <div class="px-2 py-1 rounded shadow-lg border border-white/20 backdrop-blur-sm flex flex-col items-center justify-center min-w-[36px]
          ${isSelected 
            ? 'bg-blue-600 text-white shadow-blue-900/50' 
            : 'bg-iha-900/90 text-emerald-400 shadow-black/50'}">
          <span class="text-[10px] font-black tracking-wider leading-none">${label}</span>
        </div>
        
        <!-- Stake/Pole -->
        <div class="w-0.5 h-3 ${isSelected ? 'bg-blue-500' : 'bg-slate-400'}"></div>
        
        <!-- Ground Point -->
        <div class="w-2 h-2 rounded-full border border-white/50 shadow-sm ${isSelected ? 'bg-blue-500' : 'bg-white'}"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 38], // Anchored at the bottom point
    popupAnchor: [0, -40]
  }),

  createChainageIcon: (km: string) => L.divIcon({
    className: 'custom-km-icon',
    html: `<div style="background:rgba(15,23,42,0.9);backdrop-filter:blur(4px);color:#e2e8f0;border:1px solid rgba(59,130,246,0.5);border-left:3px solid #3b82f6;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:700;font-family:monospace;text-align:center;box-shadow:0 4px 6px -1px rgba(0,0,0,0.5);min-width:50px;display:flex;align-items:center;justify-content:center;transform:translateY(-50%);">${km}</div>`,
    iconSize: [60, 20],
    iconAnchor: [30, 10]
  }),

  // New Animated User Location Icon
  userLocationIcon: L.divIcon({
    className: 'custom-user-icon',
    html: `
        <div class="relative flex items-center justify-center w-12 h-12">
            <!-- Pulsing Ring -->
            <span class="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-20 animate-ping"></span>
            
            <!-- Outer Circle -->
            <div class="relative flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-xl border-2 border-blue-600 z-10">
                <!-- Person Icon -->
                <span class="material-symbols-outlined text-blue-600 text-lg">person_pin_circle</span>
            </div>
            
            <!-- Direction Arrow (Decorative) -->
            <div class="absolute -bottom-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600 z-0"></div>
        </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 42] // Anchored at the bottom arrow
  }),

  flagIcon: L.divIcon({ 
    className: 'custom-flag-icon', 
    html: `<div class="filter drop-shadow-lg transform hover:-translate-y-1 transition-transform"><span class="material-symbols-outlined text-red-500 text-3xl">flag</span></div>`, 
    iconSize: [32, 32], 
    iconAnchor: [6, 28] 
  }),

  noteIcon: L.divIcon({ 
    className: 'custom-note-icon', 
    html: `<div class="filter drop-shadow-lg transform hover:-translate-y-1 transition-transform"><span class="material-symbols-outlined text-yellow-400 text-3xl">sticky_note_2</span></div>`, 
    iconSize: [32, 32], 
    iconAnchor: [16, 16] 
  }),

  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
};
