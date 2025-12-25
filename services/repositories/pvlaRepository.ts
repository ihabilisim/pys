
import { supabase } from '../supabase';
import { PVLAFile, MatrixColumn, PVLAIndexConfig, ProgressRow, PVLAStructure, MatrixCell } from '../../types';
import { logError } from '../dbUtils';

const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const pvlaRepository = {
  // --- PVLA FILES ---
  async fetchPVLAFiles(structureId?: string): Promise<PVLAFile[]> { if(!supabase) return []; try { let query = supabase.from('pvla_files').select('*').order('date', { ascending: false }); if(structureId) query = query.eq('structure_id', structureId); const { data, error } = await query; if(error) { logError("pvla_files", error); return []; } return data.map((f: any) => ({ id: f.id, name: f.name, type: f.type, structureId: f.structure_id, structureName: f.structure_name, date: f.date, size: f.size, path: f.path })); } catch(e) { logError('pvla_files_ex', e); return []; } },
  async addPVLAFile(f: Omit<PVLAFile, 'id'>): Promise<PVLAFile | null> { if(!supabase) return null; const { data, error } = await supabase.from('pvla_files').insert({ name: f.name, type: f.type, structure_id: f.structureId, structure_name: f.structureName, date: f.date, size: f.size, path: f.path }).select().single(); return error ? null : { id: data.id, name: data.name, type: data.type, structureId: data.structure_id, structureName: data.structure_name, date: data.date, size: data.size, path: data.path }; },
  async deletePVLAFile(id: string): Promise<boolean> { if(!supabase) return false; const { error } = await supabase.from('pvla_files').delete().eq('id', id); if (error) logError('deletePVLAFile', error); return !error; },
  
  // --- MATRIX COLUMNS ---
  async fetchMatrixColumns(): Promise<{ Bridge: MatrixColumn[]; Culvert: MatrixColumn[] }> { 
      const columns = { Bridge: [] as MatrixColumn[], Culvert: [] as MatrixColumn[] }; 
      if (!supabase) return columns; 
      try { 
          const { data, error } = await supabase.from('pvla_matrix_columns').select('*').order('order_index', { ascending: true }); 
          if (error) { logError("pvla_matrix_columns", error); return columns; } 
          
          const sortedData = (data || []).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));

          sortedData.forEach((col: any) => { 
              const mappedCol: MatrixColumn = { 
                  id: col.id, 
                  name: { tr: col.name_tr, en: col.name_en, ro: col.name_ro }, 
                  group: { tr: col.group_tr, en: col.group_en, ro: col.group_ro }, 
                  type: col.col_type, 
                  orderIndex: col.order_index || 0
              }; 
              const type = (col.type || '').toLowerCase();
              if (type === 'bridge') columns.Bridge.push(mappedCol); 
              else if (type === 'culvert') columns.Culvert.push(mappedCol); 
          }); 
          return columns; 
      } catch(e) { logError('pvla_matrix_columns_ex', e); return columns; } 
  },
  
  async addMatrixColumn(type: 'Bridge'|'Culvert', col: MatrixColumn): Promise<MatrixColumn | null> { 
      if (!supabase) return null; 
      const { data, error } = await supabase.from('pvla_matrix_columns').insert({ 
          id: generateUUID(),
          type, 
          name_tr: col.name.tr, name_en: col.name.en, name_ro: col.name.ro, 
          group_tr: col.group.tr, group_en: col.group.en, group_ro: col.group.ro, 
          col_type: col.type, 
          order_index: col.orderIndex ?? 99 
      }).select().single(); 
      if (error) { logError('addMatrixColumn', error); return null; } 
      return { id: data.id, name: { tr: data.name_tr, en: data.name_en, ro: data.name_ro }, group: { tr: data.group_tr, en: data.group_en, ro: data.group_ro }, type: data.col_type, orderIndex: data.order_index }; 
  },
  
  async updateMatrixColumn(id: string, col: Partial<MatrixColumn>): Promise<boolean> { 
      if (!supabase) return false; 
      const payload: any = { col_type: col.type }; 
      if (col.name) { payload.name_tr = col.name.tr; payload.name_en = col.name.en; payload.name_ro = col.name.ro; } 
      if (col.group) { payload.group_tr = col.group.tr; payload.group_en = col.group.en; payload.group_ro = col.group.ro; } 
      if (col.orderIndex !== undefined) { payload.order_index = col.orderIndex; } 
      const { error } = await supabase.from('pvla_matrix_columns').update(payload).eq('id', id); 
      if (error) logError('updateMatrixColumn', error); 
      return !error; 
  },
  
  async deleteMatrixColumn(id: string): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('pvla_matrix_columns').delete().eq('id', id); if (error) logError('deleteMatrixColumn', error); return !error; },
  async fetchPvlaIndices(): Promise<{ Bridge: PVLAIndexConfig; Culvert: PVLAIndexConfig }> { const indices = { Bridge: { title: { tr: '', en: '', ro: '' }, description: { tr: '', en: '', ro: '' }, fileUrl: '#', lastUpdated: '-' }, Culvert: { title: { tr: '', en: '', ro: '' }, description: { tr: '', en: '', ro: '' }, fileUrl: '#', lastUpdated: '-' } }; if (!supabase) return indices; try { const { data, error } = await supabase.from('pvla_indices').select('*'); if (error) { logError("pvla_indices", error); return indices; } (data || []).forEach((idx: any) => { if (idx.type === 'Bridge' || idx.type === 'Culvert') { indices[idx.type as 'Bridge' | 'Culvert'] = { title: { tr: idx.title_tr, en: idx.title_en, ro: idx.title_ro }, description: { tr: idx.desc_tr, en: idx.desc_en, ro: idx.desc_ro }, fileUrl: idx.file_url || '#', lastUpdated: idx.last_updated || '-' }; } }); return indices; } catch(e) { logError('pvla_indices_ex', e); return indices; } },
  async updatePvlaIndex(type: 'Bridge'|'Culvert', config: Partial<PVLAIndexConfig>): Promise<boolean> { if (!supabase) return false; const payload: any = { file_url: config.fileUrl, last_updated: config.lastUpdated }; if (config.title) { payload.title_tr = config.title.tr; payload.title_en = config.title.en; payload.title_ro = config.title.ro; } if (config.description) { payload.desc_tr = config.description.tr; payload.desc_en = config.description.en; payload.desc_ro = config.description.ro; } const { error } = await supabase.from('pvla_indices').upsert({ type, ...payload }, { onConflict: 'type' }); if (error) logError('updatePvlaIndex', error); return !error; },
  
  // --- NEW MATRIX LOGIC (RELATIONAL) ---
  
  async fetchMatrix(): Promise<ProgressRow[]> { 
      if(!supabase) return []; 
      try { 
          // 1. Fetch ALL Structure Groups (This is our Master List - The "Rows")
          const { data: groups, error: groupsError } = await supabase.from('structure_groups').select('*').order('order_index');
          if(groupsError && groupsError.code !== 'PGRST200') { logError('fetchMatrix groups', groupsError); return []; }

          // 2. Fetch ALL Structure Mains
          const { data: structures, error: structError } = await supabase.from('structures_main').select('id, code, name');
          if(structError && structError.code !== 'PGRST200') { logError('fetchMatrix structures', structError); }

          // 3. Fetch ALL Progress Items
          const { data: items, error: itemsError } = await supabase.from('progress_items').select('*');
          if(itemsError && itemsError.code !== 'PGRST200' && itemsError.code !== '42P01') { logError('fetchMatrix items', itemsError); }

          // 4. Combine
          return (groups || []).map((group: any) => {
              const struct = structures?.find(s => s.id === group.structure_id);
              
              const cells: Record<string, MatrixCell> = {};
              
              if (items) {
                  const groupItems = items.filter((i: any) => i.structure_group_id === group.id);
                  groupItems.forEach((item: any) => {
                      cells[item.matrix_column_id] = {
                          code: item.reference_code || '-',
                          status: item.status || 'EMPTY',
                          fileUrl: item.file_url,
                          lastUpdated: item.updated_at
                      };
                  });
              }

              return { 
                  id: group.id, // Using Group ID as Row ID
                  structureId: struct?.id || group.structure_id,
                  structureGroupId: group.id,
                  location: group.name,
                  foundationType: group.group_type,
                  orderIndex: group.order_index, 
                  direction: group.direction || 'C', 
                  cells: cells
              };
          }).sort((a: any, b: any) => (a.orderIndex || 0) - (b.order_index || 0)); 

      } catch(e) { 
          logError('fetchMatrix_relational_ex', e); return []; 
      } 
  },

  async addMatrixRow(row: ProgressRow): Promise<boolean> { 
      return true; // No-op
  },

  async deleteMatrixRow(id: string): Promise<boolean> { 
      return true; // No-op
  },

  async updateMatrixCell(structureGroupId: string, colId: string, cellData: any): Promise<boolean> { 
      if(!supabase) return false; 
      
      try {
          const payload = {
              structure_group_id: structureGroupId,
              matrix_column_id: colId,
              status: cellData.status,
              reference_code: cellData.code,
              file_url: cellData.fileUrl,
              updated_at: new Date().toISOString()
          };

          const { error } = await supabase.from('progress_items').upsert(payload, { onConflict: 'structure_group_id, matrix_column_id' });
          if (error) { logError('updateMatrixCell_relational', error); return false; }
          return true;
      } catch(e) { logError('updateMatrixCell_ex', e); return false; }
  },

  // NEW: Bulk update for Excel import
  async bulkUpdateMatrixCells(updates: { structureGroupId: string, colId: string, status: string, code?: string }[]): Promise<boolean> {
      if (!supabase || updates.length === 0) return true;

      try {
          const payload = updates.map(u => ({
              structure_group_id: u.structureGroupId,
              matrix_column_id: u.colId,
              status: u.status,
              reference_code: u.code,
              updated_at: new Date().toISOString()
          }));

          const { error } = await supabase.from('progress_items').upsert(payload, { onConflict: 'structure_group_id, matrix_column_id' });
          if (error) {
              logError('bulkUpdateMatrixCells', error);
              return false;
          }
          return true;
      } catch (e) {
          logError('bulkUpdateMatrixCells_ex', e);
          return false;
      }
  },
  
  // Kept for legacy compatibility if needed
  async fetchPvlaStructures(): Promise<PVLAStructure[]> {
      if (!supabase) return [];
      try {
          const { data, error } = await supabase.from('pvla_structures').select('*');
          if (error && error.code !== 'PGRST200' && error.code !== '42P01') { logError("pvla_structures", error); }
          return (data || []).map((s: any) => ({ id: s.id, name: s.name, km: s.km, type: s.type, path: s.path }));
      } catch (e) { logError('fetchPvlaStructures_ex', e); return []; }
  },
};
