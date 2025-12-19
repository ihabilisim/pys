
import { AppData, User, PolygonPoint, SiteIssue, PVLAStructure, PVLAFile, MachineryStat, Notification, ProgressRow } from '../types';
import { supabase } from './supabase';

// DİKKAT: Bu anahtarı değiştirmek LocalStorage'daki tüm veriyi siler.
// Eğer Supabase bağlı değilse, veriler sadece tarayıcıda bu anahtar altında tutulur.
const STORAGE_KEY = 'IHA_SIBIU_DATA_V4'; 

export const apiService = {
  // --- BAĞLANTI TESTİ ---
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!supabase) return { success: false, message: 'Supabase istemcisi oluşturulamadı (Config eksik).' };
    
    try {
        // Basit bir okuma isteği yaparak bağlantıyı ve tabloyu test et
        const { error } = await supabase.from('app_config').select('key').limit(1);
        
        if (error) {
            // Handle Service Unavailable / Schema Cache Error
            if (error.code === 'PGRST002' || (error as any).status === 503) {
                console.warn("Supabase 503 Error in Test Connection");
                return { success: false, message: 'Veritabanı servisi şu an meşgul veya başlatılıyor (503). Lütfen 15-20 saniye bekleyip tekrar deneyin.' };
            }

            // Handle Missing Table / Schema Cache Error
            if (error.code === 'PGRST205' || error.code === '42P01') {
                console.warn("Table not found (PGRST205/42P01). SQL migration needed.");
                return { success: false, message: "Bağlantı başarılı ancak tablolar eksik. Lütfen 'supabase_schema.sql' dosyasındaki kodları Supabase SQL Editor'de çalıştırın." };
            }

            console.error("Test Connection Error Details:", JSON.stringify(error, null, 2));
            return { success: false, message: `Bağlantı hatası: ${error.message} (Code: ${error.code || 'N/A'})` };
        }
        
        return { success: true, message: 'Veritabanı bağlantısı başarılı.' };
    } catch (e: any) {
        console.error("Test Connection Exception:", e);
        return { success: false, message: `Beklenmeyen hata: ${e.message}` };
    }
  },

  // --- DOSYA YÜKLEME (STORAGE) ---
  // Returns object with url or error message
  async uploadFile(file: File, bucket: string = 'app-assets', folder: string = 'general'): Promise<{ publicUrl: string | null; error: string | null }> {
    if (!supabase) {
        console.warn("⚠️ SUPABASE BAĞLANTISI YOK: Dosya yükleme simüle ediliyor. Gerçek bir sunucuya yüklenmedi.");
        return { publicUrl: URL.createObjectURL(file), error: null };
    }

    try {
        console.log(`Uploading to Supabase Storage [${bucket}]...`);
        
        // Dosya ismini benzersiz yap (çakışmayı önlemek için)
        const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
        const fileName = `${folder}/${Date.now()}_${cleanName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error("Supabase Upload Error:", uploadError);
            if (uploadError.message.includes('Bucket not found')) {
                return { publicUrl: null, error: `Bucket '${bucket}' bulunamadı. Lütfen Supabase panelinden oluşturun.` };
            }
            return { publicUrl: null, error: uploadError.message };
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        console.log("Upload Success:", data.publicUrl);
        return { publicUrl: data.publicUrl, error: null };

    } catch (error: any) {
        console.error("File Upload Exception:", error);
        return { publicUrl: null, error: error.message || "Bilinmeyen yükleme hatası" };
    }
  },

  // --- VERİ ÇEKME (LOAD) ---
  async fetchData(initialData: AppData): Promise<AppData> {
    if (!supabase) {
        const savedData = localStorage.getItem(STORAGE_KEY);
        return savedData ? { ...initialData, ...JSON.parse(savedData) } : initialData;
    }

    try {
        console.log("Fetching data from Supabase DB...");
        
        const [
            configRes, usersRes, pointsRes, issuesRes, 
            structRes, filesRes, machRes, notesRes, matrixRes
        ] = await Promise.all([
            supabase.from('app_config').select('*'),
            supabase.from('app_users').select('*'),
            supabase.from('survey_points').select('*'),
            supabase.from('site_issues').select('*'),
            supabase.from('pvla_structures').select('*'),
            supabase.from('pvla_files').select('*'),
            supabase.from('machinery').select('*'),
            supabase.from('notifications').select('*'),
            supabase.from('progress_matrix').select('*')
        ]);

        // Hata kontrolü
        const err = configRes.error || usersRes.error;
        if (err) {
             // 503 Service Unavailable
             if (err.code === 'PGRST002' || (err as any)?.status === 503) {
                 console.warn("Supabase Service Unavailable (503). Switching to offline mode.");
             } 
             // 404 Table Not Found (PGRST205 or 42P01)
             else if (err.code === 'PGRST205' || err.code === '42P01') {
                 console.warn("Tables missing in DB. Switching to offline mode until migration is run.");
             }
             else {
                 console.warn("Supabase Fetch Error:", err);
             }
             const savedData = localStorage.getItem(STORAGE_KEY);
             return savedData ? { ...initialData, ...JSON.parse(savedData) } : initialData;
        }

        // Config Mapping (JSON Blobs)
        const settings = configRes.data?.find(r => r.key === 'settings')?.value || initialData.settings;
        const menuConfig = configRes.data?.find(r => r.key === 'menu_config')?.value || initialData.menuConfig;
        const widgetsBase = configRes.data?.find(r => r.key === 'dashboard_widgets')?.value || initialData.dashboardWidgets;
        const timeline = configRes.data?.find(r => r.key === 'timeline')?.value || initialData.timelinePhases;
        const stocks = configRes.data?.find(r => r.key === 'stocks')?.value || initialData.stocks;
        const boq = configRes.data?.find(r => r.key === 'boq')?.value || initialData.boqItems;
        const infra = configRes.data?.find(r => r.key === 'infra')?.value || initialData.infraProjects;
        const shortcuts = configRes.data?.find(r => r.key === 'shortcuts')?.value || initialData.shortcuts;
        const slides = configRes.data?.find(r => r.key === 'slides')?.value || initialData.slides;
        const drone = configRes.data?.find(r => r.key === 'drone')?.value || initialData.droneFlights;
        const landXmlFiles = configRes.data?.find(r => r.key === 'landxml_files')?.value || initialData.landXmlFiles;
        const externalLayers = configRes.data?.find(r => r.key === 'external_layers')?.value || initialData.externalLayers;
        const utilityCategories = configRes.data?.find(r => r.key === 'utility_categories')?.value || initialData.utilityCategories;

        // Table Mapping with Auto-Seed Fallback
        const fetchedUsers = usersRes.data?.map((u: any) => ({
            id: u.id, username: u.username, password: u.password, fullName: u.full_name,
            jobTitle: u.job_title, email: u.email, phone: u.phone, address: u.address,
            role: u.role, permissions: u.permissions || []
        })) || [];
        const users: User[] = fetchedUsers.length > 0 ? fetchedUsers : initialData.users;

        const fetchedPoints = pointsRes.data?.map((p: any) => ({
            id: p.id, polygonNo: p.polygon_no, roadName: p.road_name, km: p.km, offset: p.offset,
            east: p.east, north: p.north, elevation: p.elevation, lat: p.lat, lng: p.lng,
            description: p.description, status: p.status
        })) || [];
        const polygonPoints: PolygonPoint[] = fetchedPoints.length > 0 ? fetchedPoints : initialData.polygonPoints;

        const fetchedIssues = issuesRes.data?.map((i: any) => ({
            id: i.id, type: i.type, status: i.status, lat: i.lat, lng: i.lng,
            description: i.description, photoUrl: i.photo_url, reportedDate: i.reported_date
        })) || [];
        const siteIssues: SiteIssue[] = fetchedIssues.length > 0 ? fetchedIssues : initialData.siteIssues;

        const fetchedStructs = structRes.data?.map((s: any) => ({
            id: s.id, name: s.name, type: s.type, km: s.km, path: s.path
        })) || [];
        const pvlaStructures: PVLAStructure[] = fetchedStructs.length > 0 ? fetchedStructs : initialData.pvlaStructures;

        const fetchedFiles = filesRes.data?.map((f: any) => ({
            id: f.id, name: f.name, type: f.type, structure_id: f.structureId,
            structure_name: f.structureName, date: f.date, size: f.size, path: f.path
        })) || [];
        const pvlaFiles: PVLAFile[] = fetchedFiles.length > 0 ? fetchedFiles : initialData.pvlaFiles;

        const fetchedMachinery = machRes.data?.map((m: any) => ({
            id: m.id, name: { tr: m.name_tr, en: m.name_en, ro: m.name_ro },
            total: m.total, active: m.active, maintenance: m.maintenance, icon: m.icon
        })) || [];
        const machineryStats: MachineryStat[] = fetchedMachinery.length > 0 ? fetchedMachinery : initialData.dashboardWidgets.machinery;

        const fetchedNotifs = notesRes.data?.map((n: any) => ({
            id: n.id, date: n.date, author: n.author, type: n.type,
            message: { tr: n.message_tr, en: n.message_en, ro: n.message_ro }
        })) || [];
        const notifs: Notification[] = fetchedNotifs.length > 0 ? fetchedNotifs : initialData.notifications;

        // Matrix with order_index support
        const fetchedMatrix = matrixRes.data?.map((m: any) => ({
            id: m.id, structureId: m.structure_id, location: m.location,
            foundationType: m.foundation_type, orderIndex: m.order_index, cells: m.cells
        })) || [];
        const matrixRows: ProgressRow[] = fetchedMatrix.length > 0 ? fetchedMatrix : initialData.progressMatrix;

        return {
            ...initialData,
            settings, menuConfig,
            dashboardWidgets: { ...widgetsBase, machinery: machineryStats },
            users, polygonPoints, siteIssues, pvlaStructures, pvlaFiles,
            notifications: notifs, progressMatrix: matrixRows, timelinePhases: timeline,
            stocks, boqItems: boq, infraProjects: infra, shortcuts, slides, droneFlights: drone,
            landXmlFiles, externalLayers, utilityCategories
        };

    } catch (error) {
        console.error("Supabase Fetch Error (Offline Mode Activated):", error);
        return initialData;
    }
  },

  // --- VERİ KAYDETME (SAVE) ---
  async saveData(data: AppData): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return { success: true };
    }

    try {
        const promises = [];

        // 1. Configs & Blobs (app_config)
        promises.push(supabase.from('app_config').upsert([
            { key: 'settings', value: data.settings },
            { key: 'menu_config', value: data.menuConfig },
            { key: 'dashboard_widgets', value: { ...data.dashboardWidgets, machinery: [] } },
            { key: 'timeline', value: data.timelinePhases },
            { key: 'stocks', value: data.stocks },
            { key: 'boq', value: data.boqItems },
            { key: 'infra', value: data.infraProjects },
            { key: 'shortcuts', value: data.shortcuts },
            { key: 'slides', value: data.slides },
            { key: 'drone', value: data.droneFlights },
            { key: 'landxml_files', value: data.landXmlFiles },
            { key: 'external_layers', value: data.externalLayers },
            { key: 'utility_categories', value: data.utilityCategories }
        ]));

        // 2. Relational Tables (Normalized Data)
        
        if (data.users.length > 0) {
            promises.push(supabase.from('app_users').upsert(data.users.map(u => ({
                id: u.id, username: u.username, password: u.password, full_name: u.fullName,
                job_title: u.jobTitle, email: u.email, phone: u.phone, address: u.address,
                role: u.role, permissions: u.permissions
            }))));
        }

        if (data.polygonPoints.length > 0) {
            promises.push(supabase.from('survey_points').upsert(data.polygonPoints.map(p => ({
                id: p.id, polygon_no: p.polygonNo, road_name: p.roadName, km: p.km, offset: p.offset,
                east: p.east, north: p.north, elevation: p.elevation, lat: p.lat, lng: p.lng,
                description: p.description, status: p.status
            }))));
        }

        if (data.siteIssues.length > 0) {
            promises.push(supabase.from('site_issues').upsert(data.siteIssues.map(i => ({
                id: i.id, type: i.type, status: i.status, lat: i.lat, lng: i.lng,
                description: i.description, photo_url: i.photoUrl, reported_date: i.reportedDate
            }))));
        }

        if (data.pvlaStructures.length > 0) {
            promises.push(supabase.from('pvla_structures').upsert(data.pvlaStructures.map(s => ({
                id: s.id, name: s.name, type: s.type, km: s.km, path: s.path
            }))));
        }

        if (data.pvlaFiles.length > 0) {
            promises.push(supabase.from('pvla_files').upsert(data.pvlaFiles.map(f => ({
                id: f.id, name: f.name, type: f.type, structure_id: f.structureId,
                structure_name: f.structureName, date: f.date, size: f.size, path: f.path
            }))));
        }

        if (data.dashboardWidgets.machinery.length > 0) {
            promises.push(supabase.from('machinery').upsert(data.dashboardWidgets.machinery.map(m => ({
                id: m.id, name_tr: m.name.tr, name_en: m.name.en, name_ro: m.name.ro,
                total: m.total, active: m.active, maintenance: m.maintenance, icon: m.icon
            }))));
        }

        if (data.notifications.length > 0) {
            promises.push(supabase.from('notifications').upsert(data.notifications.map(n => ({
                id: n.id, date: n.date, author: n.author, type: n.type,
                message_tr: n.message.tr, message_en: n.message.en, message_ro: n.message.ro
            }))));
        }

        if (data.progressMatrix.length > 0) {
            promises.push(supabase.from('progress_matrix').upsert(data.progressMatrix.map(m => ({
                id: m.id, structure_id: m.structureId, location: m.location,
                foundation_type: m.foundationType, order_index: m.orderIndex, cells: m.cells
            }))));
        }

        // Hata Kontrolü
        const results = await Promise.all(promises);
        const errors = results.filter(r => r.error);
        
        if (errors.length > 0) {
            const firstError = errors[0].error;
            
            // Check specifically for Service Unavailable (503) / PGRST002
            const isServiceUnavailable = errors.some(e => 
                e.error?.code === 'PGRST002' || 
                (e.error as any)?.status === 503
            );

            // Check specifically for Table Not Found (404) / PGRST205
            const isTableMissing = errors.some(e => 
                e.error?.code === 'PGRST205' || 
                e.error?.code === '42P01'
            );

            if (isServiceUnavailable) {
                console.warn("Supabase Service Unavailable (503). DB waking up.");
                return { success: false, error: 'Veritabanı servisi meşgul (503). İşlem sıraya alındı, birazdan tekrar deneyiniz.' };
            }

            if (isTableMissing) {
                console.warn("Missing Tables. Need SQL Migration.");
                return { success: false, error: 'Veritabanı tabloları eksik (PGRST205). Lütfen SQL kurulumunu yapınız.' };
            }

            console.error("Supabase Save Errors Details:", JSON.stringify(errors, null, 2));
            return { success: false, error: `${firstError?.message} (Code: ${firstError?.code})` || "Veritabanı yazma hatası" };
        }
        
        return { success: true };
    } catch (error: any) {
        console.error("Supabase Save Exception:", error);
        return { success: false, error: error.message };
    }
  },

  // --- İLK KURULUM (SEEDING) ---
  async seedDatabase(initialData: AppData): Promise<{ success: boolean; message: string }> {
    if (!supabase) return { success: false, message: 'Supabase bağlantısı yok.' };

    try {
        console.log("Seeding initial data...");
        // Retry logic for seeding in case the DB is waking up
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                const result = await this.saveData(initialData);
                if (result.success) {
                    return { success: true, message: 'Veritabanı başlangıç verileriyle başarıyla dolduruldu.' };
                }
                
                // If it's the specific 503 error, wait and retry
                if (result.error && result.error.includes('503')) {
                    attempts++;
                    console.log(`Seeding attempt ${attempts} failed (503). Retrying in 5s...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }
                
                return { success: false, message: `Veri yükleme hatası: ${result.error}` };
            } catch (e) {
                attempts++;
                if (attempts >= maxAttempts) throw e;
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        return { success: false, message: 'Veritabanına ulaşılamadı (Zaman aşımı).' };

    } catch (error: any) {
        return { success: false, message: error.message || 'Bilinmeyen hata' };
    }
  },

  // --- MIGRATION ---
  async migrateLocalToCloud(): Promise<{ success: boolean; message: string }> {
    const localDataJson = localStorage.getItem(STORAGE_KEY);
    if (!localDataJson) {
        return { success: false, message: 'Yerel veri bulunamadı (LocalStorage boş).' };
    }
    try {
        const localData: AppData = JSON.parse(localDataJson);
        const result = await this.saveData(localData);
        if (result.success) return { success: true, message: 'Tüm yerel veriler buluta aktarıldı.' };
        else return { success: false, message: `Aktarım hatası: ${result.error}` };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
  }
};
