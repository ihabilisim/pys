
import { supabase } from '../supabase';
import { UserGroup, MenuItemConfig } from '../../types';
import { logError } from '../dbUtils';
import { DEFAULT_MENU_STRUCTURE } from '../../data/Settings';

export const adminRepository = {
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

  // --- MENU STRUCTURE ---
  async fetchMenuStructure(): Promise<MenuItemConfig[]> { 
      if (!supabase) return DEFAULT_MENU_STRUCTURE; 
      try { 
          const { data, error } = await supabase.from('app_menu').select('*').order('order_index'); 
          if (error) { logError("app_menu", error); return DEFAULT_MENU_STRUCTURE; } 
          if (!data) return DEFAULT_MENU_STRUCTURE; 
          
          const nodes: Record<string, MenuItemConfig> = {}; 
          const tree: MenuItemConfig[] = []; 
          
          (data || []).forEach(row => { 
              nodes[row.id] = { id: row.id, label: { tr: row.label_tr, en: row.label_en, ro: row.label_ro }, icon: row.icon, visible: row.visible, order: row.order_index, children: [] }; 
          }); 
          
          (data || []).forEach(row => { 
              if (row.parent_id && nodes[row.parent_id]) { 
                  nodes[row.parent_id].children?.push(nodes[row.id]); 
              } else { 
                  tree.push(nodes[row.id]); 
              } 
          }); 
          
          const sortRecursive = (items: MenuItemConfig[]) => { 
              items.sort((a, b) => a.order - b.order); 
              items.forEach(i => { if (i.children) sortRecursive(i.children); }); 
          }; 
          sortRecursive(tree); 
          return tree; 
      } catch(e) { 
          logError('app_menu_ex', e); return DEFAULT_MENU_STRUCTURE; 
      } 
  },

  async saveMenuStructure(menuTree: MenuItemConfig[]): Promise<boolean> { 
      if (!supabase) return false; 
      const rows: any[] = []; 
      const processNode = (node: MenuItemConfig, parentId: string | null, index: number) => { 
          rows.push({ id: node.id, label_tr: node.label.tr, label_en: node.label.en, label_ro: node.label.ro, icon: node.icon, visible: node.visible, parent_id: parentId, order_index: index }); 
          if (node.children) { node.children.forEach((child, idx) => processNode(child, node.id, idx)); } 
      }; 
      menuTree.forEach((node, idx) => processNode(node, null, idx)); 
      
      try { 
          const { data: currentItems } = await supabase.from('app_menu').select('id'); 
          if (currentItems) { 
              const newIds = new Set(rows.map(r => r.id)); 
              const idsToDelete = currentItems.filter(item => !newIds.has(item.id)).map(item => item.id); 
              if (idsToDelete.length > 0) { await supabase.from('app_menu').delete().in('id', idsToDelete); } 
          } 
          const { error } = await supabase.from('app_menu').upsert(rows); 
          if (error) logError('saveMenuStructure', error); 
          return !error; 
      } catch (e) { return false; } 
  },
  
  async updateMenuLabel(key: string, label: any): Promise<boolean> { return true; }
};
