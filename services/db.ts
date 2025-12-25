
import { supabase } from './supabase';
// @FIX: Import PVLAStructure to use its type.
import { AppData, PVLAStructure } from '../types';
import { userService } from './userService';
import { structureService } from './structureService';
import { logError } from './dbUtils';

// Import Repositories
import { adminRepository } from './repositories/adminRepository';
import { projectRepository } from './repositories/projectRepository';
import { mapRepository } from './repositories/mapRepository';
import { pvlaRepository } from './repositories/pvlaRepository';
import { siteRepository } from './repositories/siteRepository';

export const dbService = {
  // Re-export repository methods for backward compatibility
  ...adminRepository,
  ...projectRepository,
  ...mapRepository,
  ...pvlaRepository,
  ...siteRepository,

  // --- CORE METHODS ---
  
  async fetchData(initialData: AppData): Promise<AppData> {
    if (!supabase) return initialData;
    try {
        const [
            users, changelogs, drones, pvlaFiles, matrix, issues, machinery, notifs, 
            menuStruct, structTypes, mapData, matrixColumns, pvlaIndices, utilityCats, mapLayers, designLayers,
            stocks, boq, shortcuts, slides, timeline, infra,
            // @FIX: Fetch pvlaStructures data.
            pvlaStructures
        ] = await Promise.all([
            userService.fetchUsers(), 
            siteRepository.fetchChangelogs(), 
            siteRepository.fetchDroneFlights(), 
            pvlaRepository.fetchPVLAFiles(), 
            pvlaRepository.fetchMatrix(), 
            siteRepository.fetchSiteIssues(), 
            siteRepository.fetchMachinery(), 
            siteRepository.fetchNotifications(), 
            adminRepository.fetchMenuStructure(), 
            structureService.fetchStructureTypes(), 
            mapRepository.fetchMapData(), 
            pvlaRepository.fetchMatrixColumns(), 
            pvlaRepository.fetchPvlaIndices(), 
            mapRepository.fetchUtilityCategories(), 
            mapRepository.fetchMapLayers(), 
            mapRepository.fetchDesignLayers(),
            projectRepository.fetchStocks(), 
            projectRepository.fetchBoQ(), 
            projectRepository.fetchShortcuts(), 
            projectRepository.fetchSlides(), 
            projectRepository.fetchTimeline(), 
            projectRepository.fetchInfraProjects(),
            // @FIX: Call the fetch function for pvla_structures.
            pvlaRepository.fetchPvlaStructures()
        ]);
        const { data: configData } = await supabase.from('app_config').select('*');
        const newData: AppData = { 
            ...initialData, 
            users: users.length > 0 ? users : initialData.users, 
            changelog: changelogs, 
            droneFlights: drones, 
            pvlaFiles: pvlaFiles, 
            progressMatrix: matrix, 
            siteIssues: issues, 
            notifications: notifs, 
            menuStructure: menuStruct,
            mapNotes: mapData.notes,
            sitePhotos: mapData.photos,
            matrixColumns: matrixColumns, 
            pvlaIndices: pvlaIndices,
            // @FIX: Populate pvlaStructures in the application data.
            pvlaStructures: pvlaStructures,
            utilityCategories: utilityCats,
            externalLayers: mapLayers,
            designLayers: designLayers,
            stocks: stocks,
            boqItems: boq,
            shortcuts: shortcuts,
            slides: slides,
            timelinePhases: timeline,
            infraProjects: infra
        };
        if (machinery.length > 0) newData.dashboardWidgets.machinery = machinery;
        if (configData) { 
            configData.forEach(row => { 
                const val = row.value; 
                switch (row.key) { 
                    case 'dashboard_widgets': const sqlMachinery = machinery.length > 0 ? machinery : (val.machinery || []); newData.dashboardWidgets = { ...val, machinery: sqlMachinery }; break; 
                    case 'settings': newData.settings = val; break; 
                    case 'land_xml_files': newData.landXmlFiles = val; break; 
                    case 'chainage_markers': newData.chainageMarkers = val; break; 
                } 
            }); 
        }
        return newData;
    } catch (e) { 
        console.warn("Main Data Load Error (Offline?):", e); 
        return initialData; 
    }
  },

  async saveData(data: AppData): Promise<boolean> {
      if (!supabase) return false;
      try {
          const upserts = [ 
              { key: 'dashboard_widgets', value: data.dashboardWidgets as any }, 
              { key: 'settings', value: data.settings as any }, 
              { key: 'land_xml_files', value: data.landXmlFiles as any }, 
              { key: 'chainage_markers', value: data.chainageMarkers as any }
          ];
          const { error } = await supabase.from('app_config').upsert(upserts, { onConflict: 'key' });
          if (error) logError('saveData', error);
          return !error;
      } catch (e) { logError('saveData_ex', e); return false; } 
  }, 
};
