
import { supabase } from './supabase';
import { 
    AppData, PolygonPoint, Notification, MapNote, SitePhoto, MenuItemConfig,
    DroneFlight, ChangelogEntry, PVLAStructure, PVLAFile, ProgressRow, MachineryStat, SiteIssue, MatrixColumn, PVLAIndexConfig,
    UtilityCategory, ExternalMapLayer, DesignLayer, StockItem, BoQItem, ShortcutItem, SliderItem, TimelinePhase, InfrastructureProject,
    UserGroup
} from '../types';
import { SURVEY_POLYGONS } from '../data/survey/PoligonList';
import { DEMO_ISSUES } from '../data/SiteIssues';
import { DEMO_DRONE_FLIGHTS } from '../data/DroneFlights';
import { DEFAULT_MENU_STRUCTURE, DEMO_UTILITY_CATS } from '../data/Settings';

// Import split services to use in fetchData aggregation
import { userService } from './userService';
import { structureService } from './structureService';

// Helper for standardized error logging
const logError = (context: string, error: any) => {
    if (!error) return;
    
    const msg = error.message || (typeof error === 'string' ? error : '');

    // PGRST200: Okuma başarılı ama veri yok (genellikle hata sayılmaz)
    if (error.code === 'PGRST200') return; 

    // Network / Connection Error
    // "TypeError: Failed to fetch" is commonly returned by Supabase JS on network failure
    if (msg.includes('Failed to fetch') || msg.includes('Network request failed') || msg.includes('connection error')) {
        console.warn(`[Offline/Network] Could not fetch ${context}. Using local/demo data.`);
        return;
    }

    // 42P01: Postgres "Table does not exist" hatası
    // PostgREST "Could not find the table in the schema cache" hatası
    const isMissingTable = error.code === '42P01' || 
                           msg.includes('Could not find the table') ||
                           msg.includes('schema cache');

    if (isMissingTable) {
        // Konsol kirliliğini önlemek için uyarı seviyesinde basıyoruz
        console.warn(`[Supabase Setup Needed] '${context}' tablosu bulunamadı. Lütfen Ayarlar > Genel sekmesinden Master SQL kurulumunu yapın.`);
        return;
    }

    console.error(`DB Error (${context}):`, msg || error);
};

export const dbService = {
  // --- USER GROUPS ---
  async fetchUserGroups(): Promise<UserGroup[]> {
      if (!supabase) return [];
      try {
          const { data, error } = await supabase.from('user_groups').select('*').order('name_tr');
          if (error) { logError('user_groups', error); return []; }
          return (data || []).map((g: any) => ({
              id: g.id,
              name: { tr: g.name_tr, en: g.name_en, ro: g.name_ro },
              color: g.color,
              icon: g.icon,
              permissions: g.permissions || []
          }));
      } catch (e) { logError('user_groups_ex', e); return []; }
  },

  async addUserGroup(g: Omit<UserGroup, 'id'>): Promise<UserGroup | null> {
      if (!supabase) return null;
      const { data, error } = await supabase.from('user_groups').insert({
          name_tr: g.name.tr, name_en: g.name.en, name_ro: g.name.ro,
          color: g.color, icon: g.icon, permissions: g.permissions
      }).select().single();
      
      if (error) { logError('addUserGroup', error); return null; }
      return { 
          id: data.id, 
          name: { tr: data.name_tr, en: data.name_en, ro: data.name_ro }, 
          color: data.color, 
          icon: data.icon, 
          permissions: data.permissions 
      };
  },

  async updateUserGroup(id: string, g: Partial<UserGroup>): Promise<boolean> {
      if (!supabase) return false;
      const payload: any = { color: g.color, icon: g.icon, permissions: g.permissions };
      if (g.name) {
          payload.name_tr = g.name.tr;
          payload.name_en = g.name.en;
          payload.name_ro = g.name.ro;
      }
      const { error } = await supabase.from('user_groups').update(payload).eq('id', id);
      if (error) logError('updateUserGroup', error);
      return !error;
  },

  async deleteUserGroup(id: string): Promise<boolean> {
      if (!supabase) return false;
      const { error } = await supabase.from('user_groups').delete().eq('id', id);
      if (error) logError('deleteUserGroup', error);
      return !error;
  },

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

  // --- MATERIAL STOCKS ---
  async fetchStocks(): Promise<StockItem[]> {
      if (!supabase) return [];
      try {
          const { data, error } = await supabase.from('material_stocks').select('*');
          if (error) { logError('material_stocks', error); return []; }
          return (data || []).map((s: any) => ({ id: s.id, name: { tr: s.name_tr, en: s.name_en, ro: s.name_ro }, currentQuantity: s.current_qty, criticalLevel: s.critical_lvl, unit: s.unit, icon: s.icon }));
      } catch (e) { logError('material_stocks_ex', e); return []; }
  },
  async addStock(s: Omit<StockItem, 'id'>): Promise<StockItem | null> {
      if(!supabase) return null;
      const { data, error } = await supabase.from('material_stocks').insert({ name_tr: s.name.tr, name_en: s.name.en, name_ro: s.name.ro, current_qty: s.currentQuantity, critical_lvl: s.criticalLevel, unit: s.unit, icon: s.icon }).select().single();
      if (error) { logError('addStock', error); return null; }
      return { id: data.id, name: { tr: data.name_tr, en: data.name_en, ro: data.name_ro }, currentQuantity: data.current_qty, criticalLevel: data.critical_lvl, unit: data.unit, icon: data.icon };
  },
  async updateStock(id: string, s: Partial<StockItem>): Promise<boolean> {
      if(!supabase) return false;
      const payload: any = { current_qty: s.currentQuantity, critical_lvl: s.criticalLevel };
      if(s.name) { payload.name_tr = s.name.tr; payload.name_en = s.name.en; payload.name_ro = s.name.ro; }
      const { error } = await supabase.from('material_stocks').update(payload).eq('id', id);
      if (error) logError('updateStock', error);
      return !error;
  },
  async deleteStock(id: string): Promise<boolean> {
      if(!supabase) return false;
      const { error } = await supabase.from('material_stocks').delete().eq('id', id);
      if (error) logError('deleteStock', error);
      return !error;
  },

  // --- BOQ ITEMS ---
  async fetchBoQ(): Promise<BoQItem[]> {
      if (!supabase) return [];
      try {
          const { data, error } = await supabase.from('contract_boq').select('*').order('code');
          if(error) { logError('contract_boq', error); return []; }
          return (data || []).map((b: any) => ({ id: b.id, code: b.code, name: { tr: b.name_tr, en: b.name_en, ro: b.name_ro }, totalQuantity: b.total_qty, completedQuantity: b.completed_qty, unit: b.unit }));
      } catch (e) { logError('contract_boq_ex', e); return []; }
  },
  async addBoQ(b: Omit<BoQItem, 'id'>): Promise<BoQItem | null> {
      if(!supabase) return null;
      const { data, error } = await supabase.from('contract_boq').insert({ code: b.code, name_tr: b.name.tr, name_en: b.name.en, name_ro: b.name.ro, total_qty: b.totalQuantity, completed_qty: b.completedQuantity, unit: b.unit }).select().single();
      if (error) { logError('addBoQ', error); return null; }
      return { id: data.id, code: data.code, name: { tr: data.name_tr, en: data.name_en, ro: data.name_ro }, totalQuantity: data.total_qty, completedQuantity: data.completed_qty, unit: data.unit };
  },
  async updateBoQ(id: string, b: Partial<BoQItem>): Promise<boolean> {
      if(!supabase) return false;
      const payload: any = { completed_qty: b.completedQuantity };
      if(b.totalQuantity) payload.total_qty = b.totalQuantity;
      const { error } = await supabase.from('contract_boq').update(payload).eq('id', id);
      if (error) logError('updateBoQ', error);
      return !error;
  },
  async deleteBoQ(id: string): Promise<boolean> {
      if(!supabase) return false;
      const { error } = await supabase.from('contract_boq').delete().eq('id', id);
      if (error) logError('deleteBoQ', error);
      return !error;
  },

  // --- SHORTCUTS ---
  async fetchShortcuts(): Promise<ShortcutItem[]> {
      if (!supabase) return [];
      try {
          const { data, error } = await supabase.from('project_shortcuts').select('*');
          if(error) { logError('project_shortcuts', error); return []; }
          return (data || []).map((s: any) => ({ id: s.id, name: { tr: s.name_tr, en: s.name_en, ro: s.name_ro }, description: { tr: s.desc_tr, en: s.desc_en, ro: s.desc_ro }, type: s.type, sourceType: s.source_type, pathOrUrl: s.path_url, revisionDate: s.revision_date }));
      } catch (e) { logError('project_shortcuts_ex', e); return []; }
  },
  async addShortcut(s: Omit<ShortcutItem, 'id'>): Promise<ShortcutItem | null> {
      if(!supabase) return null;
      const { data, error } = await supabase.from('project_shortcuts').insert({ name_tr: s.name.tr, name_en: s.name.en, name_ro: s.name.ro, desc_tr: s.description.tr, desc_en: s.description.en, desc_ro: s.description.ro, type: s.type, source_type: s.sourceType, path_url: s.pathOrUrl, revision_date: s.revisionDate }).select().single();
      if (error) { logError('addShortcut', error); return null; }
      return { id: data.id, name: { tr: data.name_tr, en: data.name_en, ro: data.name_ro }, description: { tr: data.desc_tr, en: data.desc_en, ro: data.desc_ro }, type: data.type, sourceType: data.source_type, pathOrUrl: data.path_url, revisionDate: data.revision_date };
  },
  async updateShortcut(id: string, s: Partial<ShortcutItem>): Promise<boolean> {
      if(!supabase) return false;
      const payload: any = { path_url: s.pathOrUrl, revision_date: s.revisionDate, type: s.type, source_type: s.sourceType };
      if(s.name) { payload.name_tr = s.name.tr; payload.name_en = s.name.en; payload.name_ro = s.name.ro; }
      if(s.description) { payload.desc_tr = s.description.tr; payload.desc_en = s.description.en; payload.desc_ro = s.description.ro; }
      const { error } = await supabase.from('project_shortcuts').update(payload).eq('id', id);
      if (error) logError('updateShortcut', error);
      return !error;
  },
  async deleteShortcut(id: string): Promise<boolean> {
      if(!supabase) return false;
      const { error } = await supabase.from('project_shortcuts').delete().eq('id', id);
      if (error) logError('deleteShortcut', error);
      return !error;
  },

  // --- INFRA PROJECTS ---
  async fetchInfraProjects(): Promise<InfrastructureProject[]> {
      if (!supabase) return [];
      try {
          const { data, error } = await supabase.from('infra_projects').select('*');
          if (error) { logError('infra_projects', error); return []; }
          return (data || []).map((p: any) => ({ id: p.id, name: { tr: p.name_tr, en: p.name_en, ro: p.name_ro }, description: { tr: p.desc_tr, en: p.desc_en, ro: p.desc_ro }, link: p.link }));
      } catch (e) { logError('infra_projects_ex', e); return []; }
  },
  async addInfraProject(p: Omit<InfrastructureProject, 'id'>): Promise<InfrastructureProject | null> {
      if(!supabase) return null;
      const { data, error } = await supabase.from('infra_projects').insert({ name_tr: p.name.tr, name_en: p.name.en, name_ro: p.name.ro, desc_tr: p.description.tr, desc_en: p.description.en, desc_ro: p.description.ro, link: p.link }).select().single();
      if (error) { logError('addInfraProject', error); return null; }
      return { id: data.id, name: { tr: data.name_tr, en: data.name_en, ro: data.name_ro }, description: { tr: data.desc_tr, en: data.desc_en, ro: data.desc_ro }, link: data.link };
  },
  async updateInfraProject(id: string, p: Partial<InfrastructureProject>): Promise<boolean> {
      if(!supabase) return false;
      const payload: any = { link: p.link };
      if(p.name) { payload.name_tr = p.name.tr; payload.name_en = p.name.en; payload.name_ro = p.name.ro; }
      if(p.description) { payload.desc_tr = p.description.tr; payload.desc_en = p.description.en; payload.desc_ro = p.description.ro; }
      const { error } = await supabase.from('infra_projects').update(payload).eq('id', id);
      if (error) logError('updateInfraProject', error);
      return !error;
  },
  async deleteInfraProject(id: string): Promise<boolean> {
      if(!supabase) return false;
      const { error } = await supabase.from('infra_projects').delete().eq('id', id);
      if (error) logError('deleteInfraProject', error);
      return !error;
  },

  // --- SLIDES ---
  async fetchSlides(): Promise<SliderItem[]> {
      if(!supabase) return [];
      try {
          const { data, error } = await supabase.from('project_slides').select('*').order('order_index');
          if(error) { logError('project_slides', error); return []; }
          return (data || []).map((s: any) => ({ id: s.id, image: s.image_url, title: { tr: s.title_tr, en: s.title_en, ro: s.title_ro }, subtitle: { tr: s.subtitle_tr, en: s.subtitle_en, ro: s.subtitle_ro }, tag: s.tag }));
      } catch (e) { logError('project_slides_ex', e); return []; }
  },
  async addSlide(s: Omit<SliderItem, 'id'>): Promise<SliderItem | null> {
      if(!supabase) return null;
      const { data, error } = await supabase.from('project_slides').insert({ image_url: s.image, title_tr: s.title.tr, title_en: s.title.en, title_ro: s.title.ro, subtitle_tr: s.subtitle.tr, subtitle_en: s.subtitle.en, subtitle_ro: s.subtitle.ro, tag: s.tag, order_index: 99 }).select().single();
      if (error) { logError('addSlide', error); return null; }
      return { id: data.id, image: data.image_url, title: { tr: data.title_tr, en: data.title_en, ro: data.title_ro }, subtitle: { tr: data.subtitle_tr, en: data.subtitle_en, ro: data.subtitle_ro }, tag: data.tag };
  },
  async updateSlide(id: string, s: Partial<SliderItem>): Promise<boolean> {
      if(!supabase) return false;
      const payload: any = { image_url: s.image, tag: s.tag };
      if(s.title) { payload.title_tr = s.title.tr; payload.title_en = s.title.en; payload.title_ro = s.title.ro; }
      if(s.subtitle) { payload.subtitle_tr = s.subtitle.tr; payload.subtitle_en = s.subtitle.en; payload.subtitle_ro = s.subtitle.ro; }
      const { error } = await supabase.from('project_slides').update(payload).eq('id', id);
      if (error) logError('updateSlide', error);
      return !error;
  },
  async deleteSlide(id: string): Promise<boolean> {
      if(!supabase) return false;
      const { error } = await supabase.from('project_slides').delete().eq('id', id);
      if (error) logError('deleteSlide', error);
      return !error;
  },

  // --- TIMELINE ---
  async fetchTimeline(): Promise<TimelinePhase[]> {
      if(!supabase) return [];
      try {
          const { data, error } = await supabase.from('project_timeline').select('*').order('start_date');
          if(error) { logError('project_timeline', error); return []; }
          return (data || []).map((t: any) => ({ id: t.id, label: { tr: t.label_tr, en: t.label_en, ro: t.label_ro }, status: t.status, percentage: t.percentage, startDate: t.start_date, endDate: t.end_date, startKm: t.start_km, endKm: t.end_km }));
      } catch (e) { logError('project_timeline_ex', e); return []; }
  },
  async addTimelinePhase(t: Omit<TimelinePhase, 'id'>): Promise<TimelinePhase | null> {
      if(!supabase) return null;
      const { data, error } = await supabase.from('project_timeline').insert({ label_tr: t.label.tr, label_en: t.label.en, label_ro: t.label.ro, status: t.status, percentage: t.percentage, start_date: t.startDate, end_date: t.endDate, start_km: t.startKm, end_km: t.endKm }).select().single();
      if (error) { logError('addTimelinePhase', error); return null; }
      return { id: data.id, label: { tr: data.label_tr, en: data.label_en, ro: data.label_ro }, status: data.status, percentage: data.percentage, startDate: data.start_date, endDate: data.end_date, startKm: data.start_km, endKm: data.end_km };
  },
  async updateTimelinePhase(id: number, t: Partial<TimelinePhase>): Promise<boolean> {
      if(!supabase) return false;
      const payload: any = { status: t.status, percentage: t.percentage, start_date: t.startDate, end_date: t.endDate, start_km: t.startKm, end_km: t.endKm };
      if(t.label) { payload.label_tr = t.label.tr; payload.label_en = t.label.en; payload.label_ro = t.label.ro; }
      const { error } = await supabase.from('project_timeline').update(payload).eq('id', id);
      if (error) logError('updateTimelinePhase', error);
      return !error;
  },
  async deleteTimelinePhase(id: number): Promise<boolean> {
      if(!supabase) return false;
      const { error } = await supabase.from('project_timeline').delete().eq('id', id);
      if (error) logError('deleteTimelinePhase', error);
      return !error;
  },

  // --- UTILITIES & LAYERS ---
  async fetchUtilityCategories(): Promise<UtilityCategory[]> { if (!supabase) return DEMO_UTILITY_CATS; try { const { data, error } = await supabase.from('utility_categories').select('*').order('name_tr'); if (error) { logError("utility_categories", error); return DEMO_UTILITY_CATS; } return (data || []).map((c: any) => ({ id: c.id, name: { tr: c.name_tr, en: c.name_en || '', ro: c.name_ro || '' }, color: c.color })); } catch(e) { logError('utility_categories_ex', e); return DEMO_UTILITY_CATS; } },
  async addUtilityCategory(cat: Omit<UtilityCategory, 'id'>): Promise<UtilityCategory | null> { if (!supabase) return null; const { data, error } = await supabase.from('utility_categories').insert({ name_tr: cat.name.tr, name_en: cat.name.en, name_ro: cat.name.ro, color: cat.color }).select().single(); return error ? null : { id: data.id, name: { tr: data.name_tr, en: data.name_en || '', ro: data.name_ro || '' }, color: data.color }; },
  async deleteUtilityCategory(id: string): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('utility_categories').delete().eq('id', id); return !error; },
  async fetchMapLayers(): Promise<ExternalMapLayer[]> { if (!supabase) return []; try { const { data, error } = await supabase.from('utility_layers').select('*'); if (error) { logError("utility_layers", error); return []; } return (data || []).map((l: any) => ({ id: l.id, name: l.name, category: l.category_id, type: 'GEOJSON', data: l.data, color: l.color, opacity: l.opacity, isVisible: l.is_visible, url: l.file_url, addedDate: l.created_at ? new Date(l.created_at).toISOString().split('T')[0] : '' })); } catch(e) { logError('utility_layers_ex', e); return []; } },
  async addMapLayer(layer: Omit<ExternalMapLayer, 'id' | 'addedDate'>): Promise<ExternalMapLayer | null> { if (!supabase) return null; const { data, error } = await supabase.from('utility_layers').insert({ name: layer.name, category_id: layer.category, type: 'GEOJSON', data: layer.data, color: layer.color, opacity: layer.opacity, is_visible: layer.isVisible, file_url: layer.url }).select().single(); return error ? null : { id: data.id, name: data.name, category: data.category_id, type: 'GEOJSON', data: data.data, color: data.color, opacity: data.opacity, isVisible: data.is_visible, url: data.file_url, addedDate: new Date(data.created_at).toISOString().split('T')[0] }; },
  async deleteMapLayer(id: string): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('utility_layers').delete().eq('id', id); return !error; },
  async toggleMapLayer(id: string, isVisible: boolean): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('utility_layers').update({ is_visible: isVisible }).eq('id', id); return !error; },
  async fetchDesignLayers(): Promise<DesignLayer[]> { if (!supabase) return []; try { const { data, error } = await supabase.from('design_layers').select('*'); if (error) { logError("design_layers", error); return []; } return (data || []).map((l: any) => ({ id: l.id, name: l.name, type: 'GEOJSON', data: l.data, color: l.color, opacity: l.opacity, isVisible: l.is_visible, createdAt: l.created_at })); } catch(e) { logError('design_layers_ex', e); return []; } },
  async addDesignLayer(layer: Omit<DesignLayer, 'id' | 'createdAt'>): Promise<DesignLayer | null> { if (!supabase) return null; const { data, error } = await supabase.from('design_layers').insert({ name: layer.name, type: 'GEOJSON', data: layer.data, color: layer.color, opacity: layer.opacity, is_visible: layer.isVisible }).select().single(); return error ? null : { id: data.id, name: data.name, type: data.type, data: data.data, color: data.color, opacity: data.opacity, isVisible: data.is_visible, createdAt: data.created_at }; },
  async deleteDesignLayer(id: string): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('design_layers').delete().eq('id', id); return !error; },
  
  // --- NOTIFICATIONS ---
  async fetchNotifications(): Promise<Notification[]> { if (!supabase) return []; try { const { data, error } = await supabase.from('system_notifications').select('*').order('date', { ascending: false }); if (error) { logError("system_notifications", error); return []; } return (data || []).map((n: any) => ({ id: String(n.id), date: n.date, author: n.author, type: n.type, message: { tr: n.message_tr || '', en: n.message_en || '', ro: n.message_ro || '' } })); } catch(e) { logError('system_notifications_ex', e); return []; } },
  async addNotification(note: Omit<Notification, 'id'>): Promise<Notification | null> { if (!supabase) return null; const { data, error } = await supabase.from('system_notifications').insert({ date: note.date, author: note.author, type: note.type, message_tr: note.message.tr, message_en: note.message.en, message_ro: note.message.ro }).select().single(); return error ? null : { id: String(data.id), date: data.date, author: data.author, type: data.type, message: { tr: data.message_tr, en: data.message_en, ro: data.message_ro } }; },
  async updateNotification(id: string, note: Partial<Notification>): Promise<boolean> { if (!supabase) return false; const payload: any = { author: note.author, type: note.type, date: note.date }; if(note.message) { payload.message_tr = note.message.tr; payload.message_en = note.message.en; payload.message_ro = note.message.ro; } const { error } = await supabase.from('system_notifications').update(payload).eq('id', id); return !error; },
  async deleteNotification(id: string): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('system_notifications').delete().eq('id', id); return !error; },
  
  // --- PVLA ---
  async fetchPvlaStructures(): Promise<PVLAStructure[]> { if(!supabase) return []; try { const { data, error } = await supabase.from('pvla_structures').select('*').order('name', { ascending: true }); if(error) { logError("pvla_structures", error); return []; } return (data || []).map((s: any) => ({ id: s.id, name: s.name, km: s.km, type: s.type, path: s.path })); } catch(e) { logError('pvla_structures_ex', e); return []; } },
  async addPvlaStructure(s: Omit<PVLAStructure, 'id'>): Promise<PVLAStructure | null> { if(!supabase) return null; const { data, error } = await supabase.from('pvla_structures').insert(s).select().single(); return error ? null : { id: data.id, name: data.name, km: data.km, type: data.type, path: data.path }; },
  async deletePvlaStructure(id: string): Promise<boolean> { if(!supabase) return false; const { error } = await supabase.from('pvla_structures').delete().eq('id', id); return !error; },
  async fetchPVLAFiles(structureId?: string): Promise<PVLAFile[]> { if(!supabase) return []; try { let query = supabase.from('pvla_files').select('*').order('date', { ascending: false }); if(structureId) query = query.eq('structure_id', structureId); const { data, error } = await query; if(error) { logError("pvla_files", error); return []; } return data.map((f: any) => ({ id: f.id, name: f.name, type: f.type, structureId: f.structure_id, structureName: f.structure_name, date: f.date, size: f.size, path: f.path })); } catch(e) { logError('pvla_files_ex', e); return []; } },
  async addPVLAFile(f: Omit<PVLAFile, 'id'>): Promise<PVLAFile | null> { if(!supabase) return null; const { data, error } = await supabase.from('pvla_files').insert({ name: f.name, type: f.type, structure_id: f.structureId, structure_name: f.structureName, date: f.date, size: f.size, path: f.path }).select().single(); return error ? null : { id: data.id, name: data.name, type: data.type, structureId: data.structure_id, structureName: data.structure_name, date: data.date, size: data.size, path: data.path }; },
  async deletePVLAFile(id: string): Promise<boolean> { if(!supabase) return false; const { error } = await supabase.from('pvla_files').delete().eq('id', id); return !error; },
  async fetchMatrixColumns(): Promise<{ Bridge: MatrixColumn[]; Culvert: MatrixColumn[] }> { const columns = { Bridge: [] as MatrixColumn[], Culvert: [] as MatrixColumn[] }; if (!supabase) return columns; try { const { data, error } = await supabase.from('pvla_matrix_columns').select('*').order('order_index'); if (error) { logError("pvla_matrix_columns", error); return columns; } (data || []).forEach((col: any) => { const mappedCol: MatrixColumn = { id: col.id, name: { tr: col.name_tr, en: col.name_en, ro: col.name_ro }, group: { tr: col.group_tr, en: col.group_en, ro: col.group_ro }, type: col.col_type }; if (col.type === 'Bridge') columns.Bridge.push(mappedCol); else if (col.type === 'Culvert') columns.Culvert.push(mappedCol); }); return columns; } catch(e) { logError('pvla_matrix_columns_ex', e); return columns; } },
  async addMatrixColumn(type: 'Bridge'|'Culvert', col: MatrixColumn): Promise<MatrixColumn | null> { if (!supabase) return null; const { data, error } = await supabase.from('pvla_matrix_columns').insert({ id: col.id, type, name_tr: col.name.tr, name_en: col.name.en, name_ro: col.name.ro, group_tr: col.group.tr, group_en: col.group.en, group_ro: col.group.ro, col_type: col.type }).select().single(); if (error) { logError('addMatrixColumn', error); return null; } return { id: data.id, name: { tr: data.name_tr, en: data.name_en, ro: data.name_ro }, group: { tr: data.group_tr, en: data.group_en, ro: data.group_ro }, type: data.col_type }; },
  async updateMatrixColumn(id: string, col: Partial<MatrixColumn>): Promise<boolean> { if (!supabase) return false; const payload: any = { col_type: col.type }; if (col.name) { payload.name_tr = col.name.tr; payload.name_en = col.name.en; payload.name_ro = col.name.ro; } if (col.group) { payload.group_tr = col.group.tr; payload.group_en = col.group.en; payload.group_ro = col.group.ro; } const { error } = await supabase.from('pvla_matrix_columns').update(payload).eq('id', id); if (error) logError('updateMatrixColumn', error); return !error; },
  async deleteMatrixColumn(id: string): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('pvla_matrix_columns').delete().eq('id', id); if (error) logError('deleteMatrixColumn', error); return !error; },
  async fetchPvlaIndices(): Promise<{ Bridge: PVLAIndexConfig; Culvert: PVLAIndexConfig }> { const indices = { Bridge: { title: { tr: '', en: '', ro: '' }, description: { tr: '', en: '', ro: '' }, fileUrl: '#', lastUpdated: '-' }, Culvert: { title: { tr: '', en: '', ro: '' }, description: { tr: '', en: '', ro: '' }, fileUrl: '#', lastUpdated: '-' } }; if (!supabase) return indices; try { const { data, error } = await supabase.from('pvla_indices').select('*'); if (error) { logError("pvla_indices", error); return indices; } (data || []).forEach((idx: any) => { if (idx.type === 'Bridge' || idx.type === 'Culvert') { indices[idx.type as 'Bridge' | 'Culvert'] = { title: { tr: idx.title_tr, en: idx.title_en, ro: idx.title_ro }, description: { tr: idx.desc_tr, en: idx.desc_en, ro: idx.desc_ro }, fileUrl: idx.file_url || '#', lastUpdated: idx.last_updated || '-' }; } }); return indices; } catch(e) { logError('pvla_indices_ex', e); return indices; } },
  async updatePvlaIndex(type: 'Bridge'|'Culvert', config: Partial<PVLAIndexConfig>): Promise<boolean> { if (!supabase) return false; const payload: any = { file_url: config.fileUrl, last_updated: config.lastUpdated }; if (config.title) { payload.title_tr = config.title.tr; payload.title_en = config.title.en; payload.title_ro = config.title.ro; } if (config.description) { payload.desc_tr = config.description.tr; payload.desc_en = config.description.en; payload.desc_ro = config.description.ro; } const { error } = await supabase.from('pvla_indices').upsert({ type, ...payload }, { onConflict: 'type' }); if (error) logError('updatePvlaIndex', error); return !error; },
  async fetchMatrix(): Promise<ProgressRow[]> { if(!supabase) return []; try { const { data, error } = await supabase.from('progress_matrix').select('*').order('order_index'); if(error) { logError("progress_matrix", error); return []; } return (data || []).map((r: any) => ({ id: r.id, structureId: r.structure_id, location: r.location, foundationType: r.foundation_type, orderIndex: r.order_index, cells: r.cells || {} })); } catch(e) { logError('progress_matrix_ex', e); return []; } },
  async addMatrixRow(row: ProgressRow): Promise<boolean> { if(!supabase) return false; const { error } = await supabase.from('progress_matrix').insert({ id: row.id, structure_id: row.structureId, location: row.location, foundation_type: row.foundationType, order_index: row.orderIndex, cells: row.cells }); if (error) logError('addMatrixRow', error); return !error; },
  async deleteMatrixRow(id: string): Promise<boolean> { if(!supabase) return false; const { error } = await supabase.from('progress_matrix').delete().eq('id', id); if (error) logError('deleteMatrixRow', error); return !error; },
  async updateMatrixCell(rowId: string, cells: any): Promise<boolean> { if(!supabase) return false; const { error } = await supabase.from('progress_matrix').update({ cells: cells }).eq('id', rowId); if (error) logError('updateMatrixCell', error); return !error; },
  
  // --- DRONE, MACHINERY, ISSUES ---
  async fetchDroneFlights(): Promise<DroneFlight[]> { if(!supabase) return DEMO_DRONE_FLIGHTS; try { const { data, error } = await supabase.from('drone_flights').select('*').order('date', { ascending: false }); if(error) { logError("drone_flights", error); return DEMO_DRONE_FLIGHTS; } return (data || []).map((d: any) => ({ id: d.id, date: d.date, youtubeId: d.youtube_id, location: d.location || '', thumbnailUrl: d.thumbnail_url, title: { tr: d.title_tr, en: d.title_en, ro: d.title_ro } })); } catch(e) { logError('drone_flights_ex', e); return DEMO_DRONE_FLIGHTS; } },
  async addDroneFlight(d: Omit<DroneFlight, 'id'>): Promise<DroneFlight | null> { if(!supabase) return null; const { data, error } = await supabase.from('drone_flights').insert({ title_tr: d.title.tr, title_en: d.title.en, title_ro: d.title.ro, date: d.date, youtube_id: d.youtubeId, location: d.location, thumbnail_url: d.thumbnailUrl }).select().single(); if (error) { logError('addDroneFlight', error); return null; } return { id: data.id, date: data.date, youtubeId: data.youtube_id, location: data.location, thumbnailUrl: data.thumbnail_url, title: { tr: data.title_tr, en: data.title_en, ro: data.title_ro } }; },
  async updateDroneFlight(id: string, d: Partial<DroneFlight>): Promise<boolean> { if(!supabase) return false; const payload: any = { date: d.date, youtube_id: d.youtubeId, location: d.location, thumbnail_url: d.thumbnailUrl }; if(d.title) { payload.title_tr = d.title.tr; payload.title_en = d.title.en; payload.title_ro = d.title.ro; } const { error } = await supabase.from('drone_flights').update(payload).eq('id', id); if (error) logError('updateDroneFlight', error); return !error; },
  async deleteDroneFlight(id: string): Promise<boolean> { if(!supabase) return false; const { error } = await supabase.from('drone_flights').delete().eq('id', id); if (error) logError('deleteDroneFlight', error); return !error; },
  async fetchMachinery(): Promise<MachineryStat[]> { if(!supabase) return []; try { const { data, error } = await supabase.from('machinery').select('*'); if(error) { logError("machinery", error); return []; } return (data || []).map((m: any) => ({ id: m.id, total: m.total, active: m.active, maintenance: m.maintenance, icon: m.icon, name: { tr: m.name_tr, en: m.name_en, ro: m.name_ro } })); } catch(e) { logError('machinery_ex', e); return []; } },
  async addMachinery(m: Omit<MachineryStat, 'id'>): Promise<MachineryStat | null> { if(!supabase) return null; const { data, error } = await supabase.from('machinery').insert({ name_tr: m.name.tr, name_en: m.name.en, name_ro: m.name.ro, total: m.total, active: m.active, maintenance: m.maintenance, icon: m.icon }).select().single(); if (error) { logError('addMachinery', error); return null; } return { id: data.id, total: data.total, active: data.active, maintenance: data.maintenance, icon: data.icon, name: { tr: data.name_tr, en: data.name_en, ro: data.name_ro } }; },
  async deleteMachinery(id: string): Promise<boolean> { if(!supabase) return false; const { error } = await supabase.from('machinery').delete().eq('id', id); if (error) logError('deleteMachinery', error); return !error; },
  async fetchSiteIssues(): Promise<SiteIssue[]> { if (!supabase) return DEMO_ISSUES; try { const { data, error } = await supabase.from('site_issues').select('*').order('created_at', { ascending: false }); if (error) { logError("site_issues", error); return DEMO_ISSUES; } return data.map((i: any) => ({ id: i.id, type: i.type, status: i.status, lat: i.lat, lng: i.lng, description: i.description || '', photoUrl: i.photo_url, reported_date: i.reported_date, assignedTo: i.author || 'Admin' })); } catch(e) { logError('site_issues_ex', e); return DEMO_ISSUES; } },
  async addSiteIssue(issue: Partial<SiteIssue>): Promise<SiteIssue | null> { if (!supabase) return null; const payload: any = { type: issue.type, status: issue.status, lat: issue.lat, lng: issue.lng, description: issue.description, photo_url: issue.photoUrl }; if (issue.reportedDate) payload.reported_date = issue.reportedDate; const { data, error } = await supabase.from('site_issues').insert(payload).select().single(); if (error) { logError('addSiteIssue', error); return null; } return { id: data.id, type: data.type, status: data.status, lat: data.lat, lng: data.lng, description: data.description, photoUrl: data.photo_url, reportedDate: data.reported_date, assignedTo: data.author || issue.assignedTo }; },
  async updateSiteIssue(id: string, issue: Partial<SiteIssue>): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('site_issues').update({ status: issue.status, description: issue.description }).eq('id', id); if (error) logError('updateSiteIssue', error); return !error; },
  async deleteSiteIssue(id: string): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('site_issues').delete().eq('id', id); if (error) logError('deleteSiteIssue', error); return !error; },
  async fetchChangelogs(): Promise<ChangelogEntry[]> { if (!supabase) return []; try { const { data, error } = await supabase.from('changelogs').select('*').order('release_date', { ascending: false }); if (error) { logError("changelogs", error); return []; } return (data || []).map((c: any) => ({ id: c.id, version: c.version, date: c.release_date, type: c.type, title: { tr: c.title_tr, en: c.title_en, ro: c.title_ro }, changes: c.changes || [] })); } catch(e) { logError('changelogs_ex', e); return []; } },
  async addChangelog(entry: Omit<ChangelogEntry, 'id'>): Promise<ChangelogEntry | null> { if (!supabase) return null; const payload = { version: entry.version, release_date: entry.date, type: entry.type, title_tr: entry.title.tr, title_en: entry.title.en, title_ro: entry.title.ro, changes: entry.changes }; const { data, error } = await supabase.from('changelogs').insert(payload).select().single(); if (error) { logError('addChangelog', error); return null; } return { id: data.id, version: data.version, date: data.release_date, type: data.type, title: { tr: data.title_tr, en: data.title_en, ro: data.title_ro }, changes: data.changes }; },
  async updateChangelog(id: string, entry: Partial<ChangelogEntry>): Promise<boolean> { if (!supabase) return false; const payload: any = { version: entry.version, release_date: entry.date, type: entry.type, changes: entry.changes }; if (entry.title) { payload.title_tr = entry.title.tr; payload.title_en = entry.title.en; payload.title_ro = entry.title.ro; } const { error } = await supabase.from('changelogs').update(payload).eq('id', id); if (error) logError('updateChangelog', error); return !error; },
  async deleteChangelog(id: string): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('changelogs').delete().eq('id', id); if (error) logError('deleteChangelog', error); return !error; },
  async fetchMenuStructure(): Promise<MenuItemConfig[]> { if (!supabase) return DEFAULT_MENU_STRUCTURE; try { const { data, error } = await supabase.from('app_menu').select('*').order('order_index'); if (error) { logError("app_menu", error); return DEFAULT_MENU_STRUCTURE; } if (!data) return DEFAULT_MENU_STRUCTURE; const nodes: Record<string, MenuItemConfig> = {}; const tree: MenuItemConfig[] = []; (data || []).forEach(row => { nodes[row.id] = { id: row.id, label: { tr: row.label_tr, en: row.label_en, ro: row.label_ro }, icon: row.icon, visible: row.visible, order: row.order_index, children: [] }; }); (data || []).forEach(row => { if (row.parent_id && nodes[row.parent_id]) { nodes[row.parent_id].children?.push(nodes[row.id]); } else { tree.push(nodes[row.id]); } }); const sortRecursive = (items: MenuItemConfig[]) => { items.sort((a, b) => a.order - b.order); items.forEach(i => { if (i.children) sortRecursive(i.children); }); }; sortRecursive(tree); return tree; } catch(e) { logError('app_menu_ex', e); return DEFAULT_MENU_STRUCTURE; } },
  async saveMenuStructure(menuTree: MenuItemConfig[]): Promise<boolean> { if (!supabase) return false; const rows: any[] = []; const processNode = (node: MenuItemConfig, parentId: string | null, index: number) => { rows.push({ id: node.id, label_tr: node.label.tr, label_en: node.label.en, label_ro: node.label.ro, icon: node.icon, visible: node.visible, parent_id: parentId, order_index: index }); if (node.children) { node.children.forEach((child, idx) => processNode(child, node.id, idx)); } }; menuTree.forEach((node, idx) => processNode(node, null, idx)); try { const { data: currentItems } = await supabase.from('app_menu').select('id'); if (currentItems) { const newIds = new Set(rows.map(r => r.id)); const idsToDelete = currentItems.filter(item => !newIds.has(item.id)).map(item => item.id); if (idsToDelete.length > 0) { await supabase.from('app_menu').delete().in('id', idsToDelete); } } const { error } = await supabase.from('app_menu').upsert(rows); if (error) logError('saveMenuStructure', error); return !error; } catch (e) { return false; } },
  async fetchMapData(): Promise<{ notes: MapNote[], photos: SitePhoto[] }> { if (!supabase) return { notes: [], photos: [] }; try { const { data: noteData, error: noteError } = await supabase.from('map_notes').select('*'); if(noteError) logError("map_notes", noteError); const { data: photoData, error: photoError } = await supabase.from('site_photos').select('*'); if(photoError) logError("site_photos", photoError); const notes = (noteData || []).map((n: any) => ({ id: n.id, lat: n.lat, lng: n.lng, text: n.text, author: n.author || '', date: n.date, privacy: n.privacy })); const photos = (photoData || []).map((p: any) => ({ id: p.id, lat: p.lat, lng: p.lng, url: p.url, description: { tr: p.description_tr || '', en: p.description_en || '', ro: p.description_ro || '' }, date: p.date, uploadedBy: p.uploaded_by })); return { notes, photos }; } catch(e) { logError('map_data_ex', e); return { notes: [], photos: [] }; } },
  async addMapNote(note: Omit<MapNote, 'id'>, userId: string): Promise<MapNote | null> { if (!supabase) return null; const { data, error } = await supabase.from('map_notes').insert({ lat: note.lat, lng: note.lng, text: note.text, author: userId, date: note.date, privacy: note.privacy || 'public' }).select().single(); if(error) { logError("map_notes", error); return null; } return { id: data.id, lat: data.lat, lng: data.lng, text: data.text, author: data.author || '', date: data.date, privacy: data.privacy }; },
  async deleteMapNote(id: string): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('map_notes').delete().eq('id', id); if (error) logError('deleteMapNote', error); return !error; },
  async addSitePhoto(photo: Omit<SitePhoto, 'id'>, userId: string): Promise<SitePhoto | null> { if (!supabase) return null; const { data, error } = await supabase.from('site_photos').insert({ lat: photo.lat, lng: photo.lng, url: photo.url, description_tr: photo.description.tr, description_en: photo.description.en, description_ro: photo.description.ro, date: photo.date, uploaded_by: userId }).select().single(); if (error) { logError('addSitePhoto', error); return null; } return { id: data.id, lat: data.lat, lng: data.lng, url: data.url, description: { tr: data.description_tr, en: data.description_en, ro: data.description_ro }, date: data.date, uploadedBy: data.uploaded_by }; },
  async deleteSitePhoto(id: string): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('site_photos').delete().eq('id', id); if (error) logError('deleteSitePhoto', error); return !error; },
  async fetchData(initialData: AppData): Promise<AppData> {
    if (!supabase) return initialData;
    try {
        const [
            users, changelogs, drones, pvlaStructs, pvlaFiles, matrix, issues, machinery, notifs, 
            menuStruct, structTypes, mapData, matrixColumns, pvlaIndices, utilityCats, mapLayers, designLayers,
            stocks, boq, shortcuts, slides, timeline, infra
        ] = await Promise.all([
            userService.fetchUsers(), this.fetchChangelogs(), this.fetchDroneFlights(), this.fetchPvlaStructures(), 
            this.fetchPVLAFiles(), this.fetchMatrix(), this.fetchSiteIssues(), this.fetchMachinery(), this.fetchNotifications(), 
            this.fetchMenuStructure(), structureService.fetchStructureTypes(), this.fetchMapData(), this.fetchMatrixColumns(), 
            this.fetchPvlaIndices(), this.fetchUtilityCategories(), this.fetchMapLayers(), this.fetchDesignLayers(),
            this.fetchStocks(), this.fetchBoQ(), this.fetchShortcuts(), this.fetchSlides(), this.fetchTimeline(), this.fetchInfraProjects()
        ]);
        const { data: configData } = await supabase.from('app_config').select('*');
        const newData: AppData = { 
            ...initialData, 
            users: users.length > 0 ? users : initialData.users, 
            changelog: changelogs, 
            droneFlights: drones, 
            pvlaStructures: pvlaStructs, 
            pvlaFiles: pvlaFiles, 
            progressMatrix: matrix, 
            siteIssues: issues, 
            notifications: notifs, 
            menuStructure: menuStruct,
            mapNotes: mapData.notes,
            sitePhotos: mapData.photos,
            matrixColumns: matrixColumns, 
            pvlaIndices: pvlaIndices,
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
        // Log aggregations error but return minimal structure so app doesn't crash
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
  async getPolygonsPaginated(page: number, limit: number, search: string): Promise<{ data: PolygonPoint[], count: number }> { if (!supabase) return { data: [], count: 0 }; try { let query = supabase.from('survey_points').select('*', { count: 'exact' }); if (search) query = query.or(`polygon_no.ilike.%${search}%,description.ilike.%${search}%`); const from = (page - 1) * limit; const to = from + limit - 1; const { data, error, count } = await query.range(from, to).order('polygon_no', { ascending: true }); if (error) { logError('getPolygonsPaginated', error); return { data: [], count: 0 }; } return { data: (data || []).map(this.mapPolygonFromDB), count: count || 0 }; } catch(e) { logError('getPolygonsPaginated_ex', e); return { data: [], count: 0 }; } },
  async getAllPolygons(): Promise<PolygonPoint[]> { if (!supabase) return []; try { const { data, error } = await supabase.from('survey_points').select('*'); if (error) { logError('getAllPolygons', error); return []; } return data ? data.map(this.mapPolygonFromDB) : []; } catch(e) { logError('getAllPolygons_ex', e); return []; } },
  async loadDemoPolygons(): Promise<boolean> { if (!supabase) return false; try { await supabase.from('survey_points').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
  const payload = SURVEY_POLYGONS.map(p => ({ polygon_no: p.polygonNo, road_name: p.roadName, km: p.km, offset_val: p.offset, east: p.east, north: p.north, elevation: p.elevation, lat: p.lat, lng: p.lng, description: p.description, status: p.status })); const { error } = await supabase.from('survey_points').insert(payload); if (error) logError('loadDemoPolygons', error); return !error; } catch(e) { logError('loadDemoPolygons_ex', e); return false; } },
  async upsertPolygon(point: any): Promise<PolygonPoint | null> { if(!supabase) return null; const payload = { polygon_no: point.polygonNo, road_name: point.roadName, km: point.km, offset_val: point.offset, east: point.east, north: point.north, elevation: point.elevation, lat: point.lat, lng: point.lng, description: point.description, status: point.status }; if(point.id && point.id.length > 20) (payload as any).id = point.id; const {data, error} = await supabase.from('survey_points').upsert(payload).select().single(); if (error) { logError('upsertPolygon', error); return null; } return error ? null : this.mapPolygonFromDB(data); },
  async deletePolygon(id: string): Promise<boolean> { if(!supabase) return false; const {error} = await supabase.from('survey_points').delete().eq('id', id); if (error) logError('deletePolygon', error); return !error; },
  async bulkInsertPolygons(points: any[]): Promise<boolean> { if(!supabase) return false; const payload = points.map(p => ({ polygon_no: p.polygonNo, road_name: p.roadName, km: p.km, offset_val: p.offset, east: p.east, north: p.north, elevation: p.elevation, lat: p.lat, lng: p.lng, description: p.description, status: p.status })); const {error} = await supabase.from('survey_points').insert(payload); if (error) logError('bulkInsertPolygons', error); return !error; },
  async bulkInsertChainage(markers: any[]): Promise<boolean> { return true; },
  async updateMenuLabel(key: string, label: any): Promise<boolean> { return true; }
};
