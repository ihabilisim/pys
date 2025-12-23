import { supabase } from './supabase';
import { 
    StructureType, StructureMain, StructureGroup, StructureElement, ElementCoordinates, StructureLayer, StructureSurface, StructureTreeItem 
} from '../types';

export const structureService = {
  // --- 8. STRUCTURE INVENTORY & EARTHWORKS ---
  async fetchStructureTypes(): Promise<StructureType[]> {
      if (!supabase) return [];
      const { data, error } = await supabase.from('structure_types').select('*').order('name_tr');
      if (error && error.code !== 'PGRST200') return [];
      return (data || []).map((t: any) => ({ id: t.id, code: t.code, name: { tr: t.name_tr, en: t.name_en, ro: t.name_ro }, icon: t.icon }));
  },

  async addStructureType(type: Omit<StructureType, 'id'>): Promise<StructureType | null> {
      if (!supabase) return null;
      const { data, error } = await supabase.from('structure_types').insert({ code: type.code, name_tr: type.name.tr, name_en: type.name.en, name_ro: type.name.ro, icon: type.icon }).select().single();
      return error ? null : { id: data.id, code: data.code, name: { tr: data.name_tr, en: data.name_en, ro: data.name_ro }, icon: data.icon };
  },

  async updateStructureType(id: string, type: Partial<StructureType>): Promise<boolean> {
      if (!supabase) return false;
      const payload: any = { code: type.code, icon: type.icon };
      if (type.name) { payload.name_tr = type.name.tr; payload.name_en = type.name.en; payload.name_ro = type.name.ro; }
      const { error } = await supabase.from('structure_types').update(payload).eq('id', id);
      return !error;
  },

  async deleteStructureType(id: string): Promise<boolean> {
      if (!supabase) return false;
      const { error } = await supabase.from('structure_types').delete().eq('id', id);
      return !error;
  },

  async fetchStructuresFull(): Promise<StructureTreeItem[]> {
      if (!supabase) return [];
      try {
          const { data: mains, error: mainError } = await supabase.from('structures_main').select('*');
          if (mainError && mainError.code !== 'PGRST200') console.error("Error fetching structures_main:", mainError.message);

          const { data: groups, error: groupError } = await supabase.from('structure_groups').select('*').order('order_index');
          if (groupError && groupError.code !== 'PGRST200') console.error("Error fetching structure_groups:", groupError.message);

          const { data: elems, error: elemError } = await supabase.from('structure_elements').select('*');
          if (elemError && elemError.code !== 'PGRST200') console.error("Error fetching structure_elements:", elemError.message);

          const { data: coords, error: coordError } = await supabase.from('element_coordinates').select('*');
          if (coordError && coordError.code !== 'PGRST200') console.error("Error fetching element_coordinates:", coordError.message);

          const { data: surfaces, error: surfError } = await supabase.from('structure_surfaces').select('*');
          if (surfError) { 
              if(surfError.code !== '42P01' && surfError.code !== 'PGRST200') {
                  console.error("Error fetching structure_surfaces:", surfError.message);
              }
          }

          if (!mains) return [];
          const result: StructureTreeItem[] = mains.map((m: any) => ({ id: m.id, typeId: m.type_id, code: m.code, name: m.name, kmStart: m.km_start, kmEnd: m.km_end, isSplit: m.is_split, groups: [], surfaces: [], typeCode: '' }));
          const { data: typeData } = await supabase.from('structure_types').select('id, code');
          if (typeData) { result.forEach(r => { const t = typeData.find(td => td.id === r.typeId); if(t) r.typeCode = t.code; }); }
          groups?.forEach((g: any) => { const parent = result.find(m => m.id === g.structure_id); if (parent) { parent.groups.push({ id: g.id, structureId: g.structure_id, name: g.name, groupType: g.group_type, direction: g.direction, orderIndex: g.order_index, elements: [] }); } });
          elems?.forEach((e: any) => { for (const struct of result) { const group = struct.groups.find(g => g.id === e.group_id); if (group) { const coord = coords?.find((c: any) => c.element_id === e.id); group.elements.push({ id: e.id, groupId: e.group_id, name: e.name, elementClass: e.element_class, coordinates: coord ? { id: coord.id, elementId: e.id, shape: coord.shape, coords: { x: coord.coords_x, y: coord.coords_y, z: coord.coords_z }, dimensions: { d1: coord.dim_1, d2: coord.dim_2, d3: coord.dim_3 }, rotation: { x: coord.rot_x, y: coord.rot_y, z: coord.rot_z }, polygonPoints: coord.polygon_points, slope: coord.slope } : undefined }); break; } } });
          surfaces?.forEach((s: any) => { const parent = result.find(m => m.id === s.structure_id); if (parent) { if (!parent.surfaces) parent.surfaces = []; parent.surfaces.push({ id: s.id, structureId: s.structure_id, layerId: s.layer_id, fileUrl: s.file_url, geojson: s.geojson, updatedAt: s.created_at }); } });
          return result;
      } catch (e) { console.error("Structure Fetch Error", e); return []; }
  },

  async addStructure(s: Omit<StructureMain, 'id'>): Promise<string | null> {
      if (!supabase) return null;
      const { data, error } = await supabase.from('structures_main').insert({ type_id: s.typeId, code: s.code, name: s.name, km_start: s.kmStart, km_end: s.kmEnd, is_split: s.isSplit }).select().single();
      return error ? null : data.id;
  },

  async deleteStructure(id: string): Promise<boolean> {
      if (!supabase) return false;
      const { error } = await supabase.from('structures_main').delete().eq('id', id);
      return !error;
  },

  async addGroup(g: Omit<StructureGroup, 'id'>): Promise<string | null> {
      if (!supabase) return null;
      const { data, error } = await supabase.from('structure_groups').insert({ structure_id: g.structureId, name: g.name, group_type: g.groupType, direction: g.direction, order_index: g.orderIndex }).select().single();
      return error ? null : data.id;
  },

  async updateGroup(id: string, group: Partial<StructureGroup>): Promise<boolean> {
      if (!supabase) return false;
      const payload: any = { name: group.name, group_type: group.groupType, direction: group.direction, order_index: group.orderIndex };
      const { error } = await supabase.from('structure_groups').update(payload).eq('id', id);
      return !error;
  },

  async deleteGroup(id: string): Promise<boolean> {
      if (!supabase) return false;
      const { error } = await supabase.from('structure_groups').delete().eq('id', id);
      return !error;
  },

  async addElement(e: Omit<StructureElement, 'id'>, coords: Omit<ElementCoordinates, 'id' | 'elementId'>): Promise<string | null> {
      if (!supabase) return null;
      const { data: elemData, error: elemError } = await supabase.from('structure_elements').insert({ group_id: e.groupId, name: e.name, element_class: e.elementClass }).select().single();
      if (elemError || !elemData) return null;
      const { error: coordError } = await supabase.from('element_coordinates').insert({ element_id: elemData.id, shape: coords.shape, coords_x: coords.coords.x, coords_y: coords.coords.y, coords_z: coords.coords.z, dim_1: coords.dimensions.d1, dim_2: coords.dimensions.d2, dim_3: coords.dimensions.d3, rot_x: coords.rotation.x, rot_y: coords.rotation.y, rot_z: coords.rotation.z, polygon_points: coords.polygonPoints, slope: coords.slope });
      return coordError ? null : elemData.id;
  },

  async updateElement(id: string, elem: Partial<StructureElement>, coords?: Partial<ElementCoordinates>): Promise<boolean> {
      if (!supabase) return false;
      if (elem.name || elem.elementClass) { await supabase.from('structure_elements').update({ name: elem.name, element_class: elem.elementClass }).eq('id', id); }
      if (coords) {
          const coordPayload: any = { shape: coords.shape, coords_x: coords.coords?.x, coords_y: coords.coords?.y, coords_z: coords.coords?.z, dim_1: coords.dimensions?.d1, dim_2: coords.dimensions?.d2, dim_3: coords.dimensions?.d3, rot_x: coords.rotation?.x, rot_y: coords.rotation?.y, rot_z: coords.rotation?.z, polygon_points: coords.polygonPoints, slope: coords.slope };
          const { data: existing } = await supabase.from('element_coordinates').select('id').eq('element_id', id).single();
          if (existing) { await supabase.from('element_coordinates').update(coordPayload).eq('element_id', id); } else { await supabase.from('element_coordinates').insert({ element_id: id, ...coordPayload }); }
      }
      return true;
  },

  async deleteElement(id: string): Promise<boolean> {
      if (!supabase) return false;
      const { error } = await supabase.from('structure_elements').delete().eq('id', id);
      return !error;
  },

  async fetchStructureLayers(): Promise<StructureLayer[]> {
      if (!supabase) return [];
      const { data, error } = await supabase.from('structure_layers').select('*').order('order_index');
      if (error) {
          if (error.code !== '42P01' && error.code !== 'PGRST200') {
              console.error("Error fetching layers:", error.message);
          }
          return [];
      }
      return (data || []).map((l: any) => ({ id: l.id, name: { tr: l.name_tr, en: l.name_en, ro: l.name_ro }, orderIndex: l.order_index }));
  },

  async addStructureLayer(layer: Omit<StructureLayer, 'id'>): Promise<StructureLayer | null> {
      if (!supabase) return null;
      const { data, error } = await supabase.from('structure_layers').insert({ name_tr: layer.name.tr, name_en: layer.name.en, name_ro: layer.name.ro, order_index: layer.orderIndex }).select().single();
      if (error) {
          console.error("Error adding layer:", error.message);
          return null;
      }
      return { id: data.id, name: { tr: data.name_tr, en: data.name_en, ro: data.name_ro }, orderIndex: data.order_index };
  },

  async deleteStructureLayer(id: string): Promise<boolean> {
      if (!supabase) return false;
      const { error } = await supabase.from('structure_layers').delete().eq('id', id);
      return !error;
  },

  async addStructureSurface(surface: Omit<StructureSurface, 'id' | 'updatedAt'>): Promise<StructureSurface | null> {
      if (!supabase) return null;
      const { data, error } = await supabase.from('structure_surfaces').insert({ structure_id: surface.structureId, layer_id: surface.layerId, file_url: surface.fileUrl, geojson: surface.geojson }).select().single();
      if (error) {
          console.error("Error adding surface:", error.message);
          return null;
      }
      return { id: data.id, structureId: data.structure_id, layerId: data.layer_id, fileUrl: data.file_url, geojson: data.geojson, updatedAt: data.created_at };
  },

  async deleteStructureSurface(id: string): Promise<boolean> {
      if (!supabase) return false;
      const { error } = await supabase.from('structure_surfaces').delete().eq('id', id);
      return !error;
  }
};