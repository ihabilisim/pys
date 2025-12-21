
import { supabase } from './supabase';
import { 
    AppData, PolygonPoint, ChainageMarker, User, PVLAFile, SiteIssue, Notification, MapNote, SitePhoto, MenuItemConfig,
    TimelinePhase, StockItem, BoQItem, InfrastructureProject, ShortcutItem, SliderItem, DroneFlight, LandXMLFile, AppSettings, MenuConfig, ChangelogEntry,
    StructureType, StructureMain, StructureGroup, StructureElement, ElementCoordinates
} from '../types';
import { SURVEY_POLYGONS } from '../data/survey/PoligonList';

// Helper UUID
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const dbService = {
  // --- POLIGON HELPER ---
  mapPolygonFromDB(p: any): PolygonPoint {
      return {
        id: String(p.id), 
        polygonNo: p.polygon_no, 
        roadName: p.road_name || '',
        km: p.km || '', 
        offset: String(p.offset_val || ''),
        east: String(p.east), 
        north: String(p.north), 
        elevation: String(p.elevation), 
        lat: String(p.lat || ''), 
        lng: String(p.lng || ''), 
        description: p.description || '', 
        status: p.status as any
      };
  },

  // --- STRUCTURE 3D MONITORING METHODS ---

  async fetchStructureTypes(): Promise<StructureType[]> {
      if (!supabase) return [];
      const { data, error } = await supabase.from('structure_types').select('*');
      
      if(error) { 
          // Check for common errors to suppress initial setup noise
          const isMissing = error.code === '42P01' || error.code === 'PGRST200' || error.message?.includes('Could not find the table');
          const isPerm = error.code === '42501' || error.message?.includes('permission denied');
          
          if (!isMissing && !isPerm) {
              console.error("Structure Types Error:", error.message || JSON.stringify(error));
          }
          return []; 
      }
      return data.map((t: any) => ({
          id: t.id,
          code: t.code,
          name: { tr: t.name_tr, en: t.name_en, ro: t.name_ro },
          icon: t.icon
      }));
  },

  async addStructureType(type: Omit<StructureType, 'id'>): Promise<StructureType | null> {
      if (!supabase) return null;
      const { data, error } = await supabase.from('structure_types').insert({
          id: generateUUID(),
          code: type.code,
          name_tr: type.name.tr,
          name_en: type.name.en,
          name_ro: type.name.ro,
          icon: type.icon
      }).select().single();
      
      if(error) {
          console.error("Add Structure Type Error:", error.message || JSON.stringify(error));
          return null;
      }
      return { id: data.id, code: data.code, name: { tr: data.name_tr, en: data.name_en, ro: data.name_ro }, icon: data.icon };
  },

  async updateStructureType(id: string, type: Partial<StructureType>): Promise<boolean> {
      if (!supabase) return false;
      const payload: any = {};
      if (type.code) payload.code = type.code;
      if (type.icon) payload.icon = type.icon;
      if (type.name?.tr) payload.name_tr = type.name.tr;
      if (type.name?.en) payload.name_en = type.name.en;
      if (type.name?.ro) payload.name_ro = type.name.ro;

      const { error } = await supabase.from('structure_types').update(payload).eq('id', id);
      if (error) {
          console.error("Update Structure Type Error:", error.message);
          return false;
      }
      return true;
  },

  async deleteStructureType(id: string): Promise<boolean> {
      if (!supabase) return false;
      const { error } = await supabase.from('structure_types').delete().eq('id', id);
      if (error) {
          console.error("Delete Structure Type Error:", error.message);
          return false;
      }
      return true;
  },

  async fetchStructuresFull(): Promise<any[]> {
      if (!supabase) return [];
      
      // Helper to fetch safely without throwing on missing table or permission error
      const safeFetch = async (table: string, order?: string) => {
          let query = supabase.from(table).select('*');
          if (order) query = query.order(order);
          const { data, error } = await query;
          
          if (error) {
              const isMissing = error.code === '42P01' || error.code === 'PGRST200' || error.message?.includes('Could not find the table');
              const isPerm = error.code === '42501' || error.message?.includes('permission denied');
              if (!isMissing && !isPerm) {
                  console.error(`Fetch ${table} Error:`, error.message || JSON.stringify(error));
              }
              return [];
          }
          return data || [];
      };

      const [mainData, groupsData, elementsData, coordsData] = await Promise.all([
          safeFetch('structures_main'),
          safeFetch('structure_groups', 'order_index'),
          safeFetch('structure_elements'),
          safeFetch('element_coordinates')
      ]);

      const structures = mainData.map((s:any) => ({
          id: s.id, typeId: s.type_id, code: s.code, name: s.name, kmStart: s.km_start, kmEnd: s.km_end, groups: []
      }));

      const groups = groupsData.map((g:any) => ({
          id: g.id, structureId: g.structure_id, name: g.name, groupType: g.group_type, orderIndex: g.order_index, elements: []
      }));

      const elements = elementsData.map((e:any) => ({
          id: e.id, groupId: e.group_id, name: e.name, elementClass: e.element_class, coordinates: null
      }));

      const coords = coordsData;

      // Link Tree
      elements.forEach((el: any) => {
          const c = coords.find((c:any) => c.element_id === el.id);
          if(c) {
              el.coordinates = {
                  id: c.id, elementId: c.element_id, shape: c.shape,
                  coords: { x: c.coords_x, y: c.coords_y, z: c.coords_z },
                  dimensions: { d1: c.dim_1, d2: c.dim_2, d3: c.dim_3 },
                  rotation: { x: c.rot_x, y: c.rot_y, z: c.rot_z }
              };
          }
          const parentGroup = groups.find((g:any) => g.id === el.groupId);
          if(parentGroup) parentGroup.elements.push(el);
      });

      groups.forEach((g: any) => {
          const parentStruct = structures.find((s:any) => s.id === g.structureId);
          if(parentStruct) parentStruct.groups.push(g);
      });

      return structures;
  },

  async addStructure(s: Omit<StructureMain, 'id'>): Promise<string | null> {
      if(!supabase) return null;
      const id = generateUUID();
      const { error } = await supabase.from('structures_main').insert({
          id, type_id: s.typeId, code: s.code, name: s.name, km_start: s.kmStart, km_end: s.kmEnd
      });
      if (error) console.error("Add Structure Error:", error.message || JSON.stringify(error));
      return error ? null : id;
  },

  async addGroup(g: Omit<StructureGroup, 'id'>): Promise<string | null> {
      if(!supabase) return null;
      const id = generateUUID();
      const { error } = await supabase.from('structure_groups').insert({
          id, structure_id: g.structureId, name: g.name, group_type: g.groupType, order_index: g.orderIndex
      });
      if (error) console.error("Add Group Error:", error.message || JSON.stringify(error));
      return error ? null : id;
  },

  async addElement(e: Omit<StructureElement, 'id'>, coords?: Omit<ElementCoordinates, 'id'|'elementId'>): Promise<string | null> {
      if(!supabase) return null;
      const elId = generateUUID();
      
      const { error: elError } = await supabase.from('structure_elements').insert({
          id: elId, group_id: e.groupId, name: e.name, element_class: e.elementClass
      });
      
      if(elError) {
          console.error("Add Element Error:", elError.message || JSON.stringify(elError));
          return null;
      }

      if(coords) {
          const cId = generateUUID();
          const { error: coordError } = await supabase.from('element_coordinates').insert({
              id: cId, element_id: elId, shape: coords.shape,
              coords_x: coords.coords.x, coords_y: coords.coords.y, coords_z: coords.coords.z,
              dim_1: coords.dimensions.d1, dim_2: coords.dimensions.d2, dim_3: coords.dimensions.d3,
              rot_x: coords.rotation.x, rot_y: coords.rotation.y, rot_z: coords.rotation.z
          });
          if(coordError) console.error("Add Coordinates Error:", coordError.message || JSON.stringify(coordError));
      }
      return elId;
  },

  async deleteStructure(id: string) {
      if(!supabase) return;
      await supabase.from('structures_main').delete().eq('id', id);
  },

  // --- MENU HELPERS (STRICT DB MODE) ---
  
  async fetchRawMenuItems(): Promise<any[]> {
      if (!supabase) return [];
      const { data, error } = await supabase.from('app_menu').select('*').order('order_index', { ascending: true });
      
      if (error) {
          const isMissing = error.code === '42P01' || error.code === 'PGRST200' || error.message?.includes('Could not find the table');
          if(!isMissing) {
             console.warn("Menu DB Read Warning:", error.message || JSON.stringify(error));
          }
          return [];
      }
      return data || [];
  },

  async fetchMenuStructure(): Promise<{ structure: MenuItemConfig[], config: MenuConfig }> {
      const rawItems = await this.fetchRawMenuItems();
      
      if (rawItems.length === 0) return { structure: [], config: {} };

      const dynamicConfig: MenuConfig = {};
      rawItems.forEach(item => {
          dynamicConfig[item.id] = {
              tr: item.label_tr || '',
              en: item.label_en || '',
              ro: item.label_ro || ''
          };
      });

      const buildTree = (parentId: string | null): MenuItemConfig[] => {
          return rawItems
              .filter((row: any) => row.parent_id === parentId)
              .map((row: any) => ({
                  id: row.id,
                  icon: row.icon,
                  visible: row.visible,
                  order: row.order_index,
                  label: { tr: row.label_tr, en: row.label_en, ro: row.label_ro },
                  children: buildTree(row.id)
              }));
      };

      return {
          structure: buildTree(null),
          config: dynamicConfig
      };
  },

  async saveMenuStructure(menuTree: MenuItemConfig[]): Promise<boolean> {
      if (!supabase) return false;

      try {
          const flatList: any[] = [];
          const traverse = (nodes: MenuItemConfig[], parentId: string | null) => {
              nodes.forEach((node, index) => {
                  flatList.push({
                      id: node.id,
                      label_tr: node.label.tr,
                      label_en: node.label.en,
                      label_ro: node.label.ro,
                      icon: node.icon,
                      visible: node.visible,
                      parent_id: parentId || null, 
                      order_index: index
                  });
                  if (node.children && node.children.length > 0) {
                      traverse(node.children, node.id);
                  }
              });
          };
          traverse(menuTree, null);

          if (flatList.length > 0) {
              const { error } = await supabase.from('app_menu').upsert(flatList, { onConflict: 'id' });
              if (error && error.code !== '42501') {
                  console.error("Menu Upsert Error:", error.message || JSON.stringify(error));
                  return false;
              }
          }

          const currentIds = flatList.map(i => String(i.id)); 
          const { data: existing, error: fetchError } = await supabase.from('app_menu').select('id');
          
          if (!fetchError && existing) {
              const dbIds = existing.map((r: any) => String(r.id));
              const toDelete = dbIds.filter(id => !currentIds.includes(id));
              
              if (toDelete.length > 0) {
                  await supabase.from('app_menu').update({ parent_id: null }).in('id', toDelete);
                  await supabase.from('app_menu').delete().in('id', toDelete);
              }
          }

          return true;
      } catch (e: any) {
          console.error("Menu Table Save Failed:", e.message || JSON.stringify(e));
          return false;
      }
  },

  // --- LAZY LOAD FETCHERS ---
  
  async fetchPVLAFiles(structureId?: string): Promise<PVLAFile[]> {
      if (!supabase) return [];
      let query = supabase.from('pvla_files').select('*');
      if (structureId) query = query.eq('structure_id', structureId);
      
      const { data, error } = await query.order('date', { ascending: false });
      if (error) { console.error("PVLA Fetch Error:", error.message || JSON.stringify(error)); return []; }
      
      return data.map((f: any) => ({
          id: f.id, name: f.name, type: f.type, structureId: f.structure_id,
          structureName: f.structure_name, date: f.date, size: f.size, path: f.path
      }));
  },

  async fetchSiteIssues(): Promise<SiteIssue[]> {
      if (!supabase) return [];
      const { data, error } = await supabase.from('site_issues').select('*').order('reported_date', { ascending: false });
      if (error) return [];
      return data.map((i: any) => ({
          id: i.id, type: i.type, status: i.status, lat: i.lat, lng: i.lng,
          description: i.description, photoUrl: i.photo_url, reportedDate: i.reported_date
      }));
  },

  async fetchNotifications(limit: number = 20): Promise<Notification[]> {
      if (!supabase) return [];
      const { data, error } = await supabase.from('notifications').select('*').order('date', { ascending: false }).limit(limit);
      if (error) return [];
      return data.map((n: any) => ({
          id: n.id, date: n.date, author: n.author, type: n.type,
          message: { tr: n.message_tr, en: n.message_en, ro: n.message_ro }
      }));
  },

  async fetchMapData(): Promise<{ notes: MapNote[], photos: SitePhoto[] }> {
      if (!supabase) return { notes: [], photos: [] };
      const [notesRes, photosRes] = await Promise.all([
          supabase.from('map_notes').select('*'),
          supabase.from('site_photos').select('*') 
      ]);
      
      const notes = (notesRes.data || []).map((n:any) => ({
          id: n.id, lat: n.lat, lng: n.lng, text: n.text, author: n.author, date: n.date
      }));
      
      const photos: SitePhoto[] = []; 

      return { notes, photos };
  },

  // --- MAP & POLYGON FETCHERS ---
  
  async getAllPolygons(): Promise<PolygonPoint[]> {
      if (!supabase) return [];
      const { data, error } = await supabase.from('survey_points').select('*');
      if (error) { console.error("Polygon Fetch Error:", error.message || JSON.stringify(error)); return []; }
      return data.map(this.mapPolygonFromDB);
  },

  async getPolygonsPaginated(page: number, limit: number, search: string = ''): Promise<{ data: PolygonPoint[], count: number }> {
      if (!supabase) return { data: [], count: 0 };

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
          .from('survey_points')
          .select('*', { count: 'exact' })
          .range(from, to)
          .order('polygon_no', { ascending: true });

      if (search) {
          query = query.or(`polygon_no.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
          console.error('Pagination Fetch Error:', error.message || JSON.stringify(error));
          return { data: [], count: 0 };
      }

      return {
          data: data.map(this.mapPolygonFromDB),
          count: count || 0
      };
  },

  // --- CRUD OPERATIONS ---
  async upsertPolygon(point: Omit<PolygonPoint, 'id'> & { id?: string }): Promise<PolygonPoint | null> {
      if (!supabase) return null;
      const targetId = point.id || generateUUID();
      const dbPayload = {
          id: targetId,
          polygon_no: point.polygonNo,
          road_name: point.roadName || null,
          km: point.km || null,
          offset_val: point.offset || null, 
          east: point.east,
          north: point.north,
          elevation: point.elevation,
          lat: point.lat || null,
          lng: point.lng || null,
          description: point.description || '',
          status: point.status || 'ACTIVE'
      };
      const { data, error } = await supabase.from('survey_points').upsert(dbPayload).select().single();
      if (error) { console.error("Upsert Error:", error.message || JSON.stringify(error)); return null; }
      return this.mapPolygonFromDB(data);
  },

  async deletePolygon(id: string): Promise<boolean> {
      if (!supabase) return true;
      const { error } = await supabase.from('survey_points').delete().eq('id', id);
      if (error) { console.error("Delete Error:", error.message || JSON.stringify(error)); return false; }
      return true;
  },

  async bulkInsertPolygons(points: Omit<PolygonPoint, 'id'>[]): Promise<boolean> {
      if (!supabase) return false;
      const dbPayloads = points.map(point => ({
          id: generateUUID(), 
          polygon_no: point.polygonNo,
          road_name: point.roadName || null,
          km: point.km || null,
          offset_val: point.offset || null,
          east: point.east,
          north: point.north,
          elevation: point.elevation,
          lat: point.lat || null,
          lng: point.lng || null,
          description: point.description || '',
          status: point.status || 'ACTIVE'
      }));
      const { error } = await supabase.from('survey_points').insert(dbPayloads);
      return !error;
  },

  async loadDemoPolygons(): Promise<boolean> {
      if (!supabase) return false;
      const { error: deleteError } = await supabase.from('survey_points').delete().not('id', 'is', null);
      if (deleteError) await supabase.from('survey_points').delete().neq('polygon_no', '___'); 
      const demoPoints = SURVEY_POLYGONS.map(({ id, ...rest }) => rest);
      return await this.bulkInsertPolygons(demoPoints);
  },

  async bulkInsertChainage(markers: Omit<ChainageMarker, 'id'>[]): Promise<boolean> {
      if (!supabase) return false;
      try {
          const { data: existingData } = await supabase.from('app_config').select('value').eq('key', 'chainage_markers').single();
          const currentMarkers = existingData?.value || [];
          const newMarkers = markers.map(m => ({ ...m, id: generateUUID() }));
          const { error } = await supabase.from('app_config').upsert({ key: 'chainage_markers', value: [...currentMarkers, ...newMarkers] });
          if(error) throw error;
          return true;
      } catch (e) { return false; }
  },

  // --- OPTIMIZED INITIAL FETCH ---
  async fetchData(initialData: AppData): Promise<AppData> {
    if (!supabase) return initialData;

    try {
        // Execute queries independently to prevent full fail
        const safeFetch = async (table: string, order?: string) => {
            let query = supabase.from(table).select('*');
            if(order) query = query.order(order);
            const { data, error } = await query;
            
            if(error) {
                const isMissing = error.code === '42P01' || error.code === 'PGRST200' || error.message?.includes('Could not find the table');
                const isPerm = error.code === '42501' || error.message?.includes('permission denied');
                if(!isMissing && !isPerm) {
                    console.error(`Fetch ${table} Error:`, error.message || JSON.stringify(error));
                }
                return [];
            }
            return data || [];
        }

        const [
            configData, usersData, structData, machData, matrixData, changelogData
        ] = await Promise.all([
            safeFetch('app_config'),
            safeFetch('app_users'),
            safeFetch('structures_main'),
            safeFetch('machinery'),
            safeFetch('progress_matrix'),
            supabase.from('changelogs').select('*').order('release_date', { ascending: false }).then(r => r.data || [])
        ]);

        const dbSettings = (configData.find((r:any) => r.key === 'settings')?.value as unknown as AppSettings);
        const settings = dbSettings ? { ...initialData.settings, ...dbSettings } : initialData.settings;
        if (!settings.smtp) settings.smtp = initialData.settings.smtp;

        const { structure: menuStructure, config: menuConfig } = await this.fetchMenuStructure();

        const timeline = (configData.find((r:any) => r.key === 'timeline')?.value as unknown as TimelinePhase[]) || [];
        const stocks = (configData.find((r:any) => r.key === 'stocks')?.value as unknown as StockItem[]) || [];
        const boq = (configData.find((r:any) => r.key === 'boq')?.value as unknown as BoQItem[]) || [];
        const infra = (configData.find((r:any) => r.key === 'infra')?.value as unknown as InfrastructureProject[]) || [];
        const shortcuts = (configData.find((r:any) => r.key === 'shortcuts')?.value as unknown as ShortcutItem[]) || [];
        const slides = (configData.find((r:any) => r.key === 'slides')?.value as unknown as SliderItem[]) || [];
        const drone = (configData.find((r:any) => r.key === 'drone')?.value as unknown as DroneFlight[]) || [];
        const landXmlFiles = (configData.find((r:any) => r.key === 'landxml_files')?.value as unknown as LandXMLFile[]) || [];
        const chainageMarkers = (configData.find((r:any) => r.key === 'chainage_markers')?.value as unknown as ChainageMarker[]) || [];
        
        const changelog: ChangelogEntry[] = changelogData.map((log: any) => ({
            id: log.id,
            version: log.version,
            date: log.release_date,
            type: log.type,
            title: { tr: log.title_tr, en: log.title_en, ro: log.title_ro },
            changes: log.changes || []
        }));

        const users: User[] = usersData.map((u: any) => ({
            id: u.id, username: u.username, password: u.password, fullName: u.full_name,
            jobTitle: u.job_title, email: u.email, phone: u.phone, address: u.address,
            avatarUrl: u.avatar_url, role: u.role, permissions: u.permissions || []
        }));

        const polygonPoints: PolygonPoint[] = []; 

        const pvlaStructures = structData.map((s: any) => ({
            id: s.id, 
            name: s.name, 
            type: s.code.startsWith('C') || s.code.startsWith('P') || s.code.startsWith('DG') ? 'Culvert' : 'Bridge', 
            km: `KM ${s.km_start || 0}+${s.km_end || 0}`, 
            path: ''
        }));

        const machineryStats = machData.map((m: any) => ({
            id: m.id, name: { tr: m.name_tr, en: m.name_en, ro: m.name_ro },
            total: m.total, active: m.active, maintenance: m.maintenance, icon: m.icon
        }));

        const matrixRows = matrixData.map((m: any) => ({
            id: m.id, structureId: m.structure_id, location: m.location,
            foundationType: m.foundation_type, orderIndex: m.order_index, cells: m.cells
        }));

        const baseWidgets = configData.find((r:any) => r.key === 'dashboard_widgets')?.value || initialData.dashboardWidgets;
        const dashboardWidgets = { ...baseWidgets, machinery: machineryStats.length > 0 ? machineryStats : baseWidgets.machinery };

        return {
            ...initialData,
            settings, 
            menuConfig: Object.keys(menuConfig).length > 0 ? menuConfig : initialData.menuConfig,
            menuStructure: menuStructure.length > 0 ? menuStructure : initialData.menuStructure,
            dashboardWidgets,
            users: users.length > 0 ? users : initialData.users,
            polygonPoints, pvlaStructures, progressMatrix: matrixRows, timelinePhases: timeline,
            stocks, boqItems: boq, infraProjects: infra, shortcuts, slides, 
            droneFlights: drone, landXmlFiles, chainageMarkers, changelog,
            pvlaFiles: [], siteIssues: [], notifications: [], mapNotes: [], sitePhotos: [], externalLayers: []
        };

    } catch (error) {
        console.error("Supabase Fetch Error:", error);
        return initialData;
    }
  },

  async saveData(data: AppData): Promise<boolean> {
    if (!supabase) return true;
    try {
        await this.saveMenuStructure(data.menuStructure);

        if (data.changelog && data.changelog.length > 0) {
            const changelogPayload = data.changelog.map(log => ({
                id: log.id,
                version: log.version,
                release_date: log.date,
                type: log.type,
                title_tr: log.title.tr,
                title_en: log.title.en,
                title_ro: log.title.ro,
                changes: log.changes
            }));
            const { error: clError } = await supabase.from('changelogs').upsert(changelogPayload);
            if (clError && clError.code !== '42501') console.error("Changelog Save Error:", clError.message || JSON.stringify(clError));
        }

        const configPayload: { key: string; value: any }[] = [
            { key: 'settings', value: data.settings },
            { key: 'dashboard_widgets', value: { ...data.dashboardWidgets, machinery: [] } }, 
            { key: 'timeline', value: data.timelinePhases },
            { key: 'stocks', value: data.stocks },
            { key: 'boq', value: data.boqItems },
            { key: 'infra', value: data.infraProjects },
            { key: 'shortcuts', value: data.shortcuts },
            { key: 'slides', value: data.slides },
            { key: 'drone', value: data.droneFlights },
            { key: 'landxml_files', value: data.landXmlFiles },
            { key: 'chainage_markers', value: data.chainageMarkers }
        ];
        
        await supabase.from('app_config').upsert(configPayload);
        return true;
    } catch (error: any) { 
        console.error("Supabase Save Error:", error.message || JSON.stringify(error)); 
        return false; 
    }
  }
};
