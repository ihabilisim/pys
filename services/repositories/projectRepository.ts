
import { supabase } from '../supabase';
import { StockItem, BoQItem, ShortcutItem, InfrastructureProject, SliderItem, TimelinePhase } from '../../types';
import { logError } from '../dbUtils';

export const projectRepository = {
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
  }
};
