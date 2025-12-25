
import { supabase } from '../supabase';
import { DroneFlight, MachineryStat, SiteIssue, ChangelogEntry, Notification, UserNotification, FeedbackSubmission } from '../../types';
import { logError } from '../dbUtils';

export const siteRepository = {
  // --- DRONE ---
  async fetchDroneFlights(): Promise<DroneFlight[]> { if(!supabase) return []; try { const { data, error } = await supabase.from('drone_flights').select('*').order('date', { ascending: false }); if(error) { logError("drone_flights", error); return []; } return (data || []).map((d: any) => ({ id: d.id, date: d.date, youtubeId: d.youtube_id, location: d.location || '', thumbnailUrl: d.thumbnail_url, title: { tr: d.title_tr, en: d.title_en, ro: d.title_ro } })); } catch(e) { logError('drone_flights_ex', e); return []; } },
  
  /* Fix: Corrected property access from d.youtube_id to d.youtubeId and d.thumbnail_url to d.thumbnailUrl */
  async addDroneFlight(d: Omit<DroneFlight, 'id'>): Promise<DroneFlight | null> { if(!supabase) return null; const { data, error } = await supabase.from('drone_flights').insert({ title_tr: d.title.tr, title_en: d.title.en, title_ro: d.title.ro, date: d.date, youtube_id: d.youtubeId, location: d.location, thumbnail_url: d.thumbnailUrl }).select().single(); if (error) { logError('addDroneFlight', error); return null; } return { id: data.id, date: data.date, youtubeId: data.youtube_id, location: data.location, thumbnailUrl: data.thumbnail_url, title: { tr: data.title_tr, en: data.title_en, ro: data.title_ro } }; },
  
  async updateDroneFlight(id: string, d: Partial<DroneFlight>): Promise<boolean> { if(!supabase) return false; const payload: any = { date: d.date, youtube_id: d.youtubeId, location: d.location, thumbnail_url: d.thumbnailUrl }; if(d.title) { payload.title_tr = d.title.tr; payload.title_en = d.title.en; payload.title_ro = d.title.ro; } const { error } = await supabase.from('drone_flights').update(payload).eq('id', id); if (error) logError('updateDroneFlight', error); return !error; },
  async deleteDroneFlight(id: string): Promise<boolean> { if(!supabase) return false; const { error } = await supabase.from('drone_flights').delete().eq('id', id); if (error) logError('deleteDroneFlight', error); return !error; },
  
  // --- MACHINERY ---
  async fetchMachinery(): Promise<MachineryStat[]> { if(!supabase) return []; try { const { data, error } = await supabase.from('machinery').select('*'); if(error) { logError("machinery", error); return []; } return (data || []).map((m: any) => ({ id: m.id, total: m.total, active: m.active, maintenance: m.maintenance, icon: m.icon, name: { tr: m.name_tr, en: m.name_en, ro: m.name_ro } })); } catch(e) { logError('machinery_ex', e); return []; } },
  async addMachinery(m: Omit<MachineryStat, 'id'>): Promise<MachineryStat | null> { if(!supabase) return null; const { data, error } = await supabase.from('machinery').insert({ name_tr: m.name.tr, name_en: m.name.en, name_ro: m.name.ro, total: m.total, active: m.active, maintenance: m.maintenance, icon: m.icon }).select().single(); if (error) { logError('addMachinery', error); return null; } return { id: data.id, total: data.total, active: data.active, maintenance: data.maintenance, icon: data.icon, name: { tr: data.name_tr, en: data.name_en, ro: data.name_ro } }; },
  async deleteMachinery(id: string): Promise<boolean> { if(!supabase) return false; const { error } = await supabase.from('machinery').delete().eq('id', id); if (error) logError('deleteMachinery', error); return !error; },
  
  // --- SITE ISSUES ---
  async fetchSiteIssues(): Promise<SiteIssue[]> { if (!supabase) return []; try { const { data, error } = await supabase.from('site_issues').select('*').order('created_at', { ascending: false }); if (error) { logError("site_issues", error); return []; } return data.map((i: any) => ({ id: i.id, type: i.type, status: i.status, lat: i.lat, lng: i.lng, description: i.description || '', photoUrl: i.photo_url, reported_date: i.reported_date, assignedTo: i.author || 'Admin' })); } catch(e) { logError('site_issues_ex', e); return []; } },
  async addSiteIssue(issue: Partial<SiteIssue>): Promise<SiteIssue | null> { if (!supabase) return null; const payload: any = { type: issue.type, status: issue.status, lat: issue.lat, lng: issue.lng, description: issue.description, photo_url: issue.photoUrl }; if (issue.reportedDate) payload.reported_date = issue.reportedDate; const { data, error } = await supabase.from('site_issues').insert(payload).select().single(); if (error) { logError('addSiteIssue', error); return null; } return { id: data.id, type: data.type, status: data.status, lat: data.lat, lng: data.lng, description: data.description, photoUrl: data.photo_url, reportedDate: data.reported_date, assignedTo: data.author || issue.assignedTo }; },
  async updateSiteIssue(id: string, issue: Partial<SiteIssue>): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('site_issues').update({ status: issue.status, description: issue.description }).eq('id', id); if (error) logError('updateSiteIssue', error); return !error; },
  async deleteSiteIssue(id: string): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('site_issues').delete().eq('id', id); if (error) logError('deleteSiteIssue', error); return !error; },
  
  // --- CHANGELOGS (MULTI-LANG) ---
  async fetchChangelogs(): Promise<ChangelogEntry[]> { if (!supabase) return []; try { const { data, error } = await supabase.from('changelogs').select('*').order('release_date', { ascending: false }); if (error) { logError("changelogs", error); return []; } return (data || []).map((c: any) => { const legacyChanges = Array.isArray(c.changes) ? c.changes : []; const trChanges = (c.changes_tr && c.changes_tr.length > 0) ? c.changes_tr : legacyChanges; return { id: c.id, version: c.version, date: c.release_date, type: c.type, title: { tr: c.title_tr, en: c.title_en, ro: c.title_ro }, changes: { tr: trChanges, en: c.changes_en || [], ro: c.changes_ro || [] } }; }); } catch(e) { logError('changelogs_ex', e); return []; } },
  async addChangelog(entry: Omit<ChangelogEntry, 'id'>): Promise<ChangelogEntry | null> { if (!supabase) return null; const payload = { version: entry.version, release_date: entry.date, type: entry.type, title_tr: entry.title.tr, title_en: entry.title.en, title_ro: entry.title.ro, changes_tr: entry.changes.tr, changes_en: entry.changes.en, changes_ro: entry.changes.ro, changes: entry.changes.tr }; const { data, error } = await supabase.from('changelogs').insert(payload).select().single(); if (error) { logError('addChangelog', error); return null; } return { id: data.id, version: data.version, date: data.release_date, type: data.type, title: { tr: data.title_tr, en: data.title_en, ro: data.title_ro }, changes: { tr: data.changes_tr, en: data.changes_en, ro: data.changes_ro } }; },
  async updateChangelog(id: string, entry: Partial<ChangelogEntry>): Promise<boolean> { if (!supabase) return false; const payload: any = { version: entry.version, release_date: entry.date, type: entry.type }; if (entry.title) { payload.title_tr = entry.title.tr; payload.title_en = entry.title.en; payload.title_ro = entry.title.ro; } if (entry.changes) { payload.changes_tr = entry.changes.tr; payload.changes_en = entry.changes.en; payload.changes_ro = entry.changes.ro; payload.changes = entry.changes.tr; } const { error } = await supabase.from('changelogs').update(payload).eq('id', id); if (error) logError('updateChangelog', error); return !error; },
  async deleteChangelog(id: string): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('changelogs').delete().eq('id', id); if (error) logError('deleteChangelog', error); return !error; },

  // --- FEEDBACK SYSTEM ---
  async submitFeedback(f: { fullName: string, subject: string, content: string, email?: string, phone?: string }): Promise<boolean> {
      if(!supabase) return false;
      const { error } = await supabase.from('feedback_submissions').insert({
          full_name: f.fullName,
          subject: f.subject,
          content: f.content,
          email: f.email,
          phone: f.phone
      });
      if (error) {
          logError('submitFeedback', error);
      }
      return !error;
  },

  async fetchFeedbacks(): Promise<FeedbackSubmission[]> {
      if(!supabase) return [];
      const { data, error } = await supabase.from('feedback_submissions').select('*').order('created_at', { ascending: false });
      if (error) { logError('fetchFeedbacks', error); return []; }
      return (data || []).map((f: any) => ({
          id: f.id,
          fullName: f.full_name,
          email: f.email,
          phone: f.phone,
          subject: f.subject,
          content: f.content,
          status: f.status,
          createdAt: f.created_at
      }));
  },

  async updateFeedbackStatus(id: string, status: FeedbackSubmission['status']): Promise<boolean> {
      if(!supabase) return false;
      const { error } = await supabase.from('feedback_submissions').update({ status }).eq('id', id);
      return !error;
  },

  async deleteFeedback(id: string): Promise<boolean> {
      if(!supabase) return false;
      const { error } = await supabase.from('feedback_submissions').delete().eq('id', id);
      return !error;
  },

  // --- SYSTEM NOTIFICATIONS ---
  async fetchNotifications(): Promise<Notification[]> { if (!supabase) return []; try { const { data, error } = await supabase.from('system_notifications').select('*').order('date', { ascending: false }); if (error) { logError("system_notifications", error); return []; } return (data || []).map((n: any) => ({ id: String(n.id), date: n.date, author: n.author, type: n.type, message: { tr: n.message_tr || '', en: n.message_en || '', ro: n.message_ro || '' } })); } catch(e) { logError('system_notifications_ex', e); return []; } },
  async addNotification(note: Omit<Notification, 'id'>): Promise<Notification | null> { if (!supabase) return null; const { data, error } = await supabase.from('system_notifications').insert({ date: note.date, author: note.author, type: note.type, message_tr: note.message.tr, message_en: note.message.en, message_ro: note.message.ro }).select().single(); return error ? null : { id: String(data.id), date: data.date, author: data.author, type: data.type, message: { tr: data.message_tr, en: data.message_en, ro: data.message_ro } }; },
  async updateNotification(id: string, note: Partial<Notification>): Promise<boolean> { if (!supabase) return false; const payload: any = { author: note.author, type: note.type, date: note.date }; if(note.message) { payload.message_tr = note.message.tr; payload.message_en = note.message.en; payload.message_ro = note.message.ro; } const { error } = await supabase.from('system_notifications').update(payload).eq('id', id); return !error; },
  async deleteNotification(id: string): Promise<boolean> { if (!supabase) return false; const { error } = await supabase.from('system_notifications').delete().eq('id', id); return !error; },

  // --- USER NOTIFICATIONS ---
  async fetchUserNotifications(userId: string): Promise<UserNotification[]> { if (!supabase) return []; try { const { data, error } = await supabase.from('user_notifications').select('*').eq('user_id', userId).eq('is_read', false).order('created_at', { ascending: false }); if (error) { if(error.code !== '42P01') logError("user_notifications", error); return []; } return (data || []).map((n: any) => ({ id: n.id, userId: n.user_id, type: n.type, title: n.title, message: n.message, link: n.link, isRead: n.is_read, createdAt: n.created_at })); } catch (e) { logError('fetchUserNotifications_ex', e); return []; } },
  async addUserNotification(notif: Omit<UserNotification, 'id' | 'createdAt' | 'isRead'>): Promise<void> { if (!supabase) return; const { error } = await supabase.from('user_notifications').insert({ user_id: notif.userId, type: notif.type, title: notif.title, message: notif.message, link: notif.link, is_read: false }); if (error && error.code !== '42P01') logError("addUserNotification", error); },
  async markNotificationRead(id: string): Promise<void> { if (!supabase) return; await supabase.from('user_notifications').update({ is_read: true }).eq('id', id); },
  async markAllNotificationsRead(userId: string): Promise<void> { if (!supabase) return; await supabase.from('user_notifications').update({ is_read: true }).eq('user_id', userId); }
};
