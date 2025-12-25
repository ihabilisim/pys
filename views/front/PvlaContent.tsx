
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { MatrixCell, MatrixStatus, LocalizedString, MatrixColumn, ProgressRow } from '../../types';
import { ThreeDModel } from '../../components/ThreeDModel';
import { apiService } from '../../services/api';
import { pvlaRepository } from '../../services/repositories/pvlaRepository'; // Direct import for bulk op
import { PvlaImportModal } from './modals/PvlaImportModal';

// ... ICONS ...
const BridgeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V12h21v-1.854a.75.75 0 0 0-1.08-.673L13.5 13.96a2.5 2.5 0 0 1-3 0L2.58 9.473a.75.75 0 0 0-1.08.673Z" />
        <path d="M12 2a.75.75 0 0 1 .75.75V7a.75.75 0 0 1-1.5 0V2.75A.75.75 0 0 1 12 2Z" />
    </svg>
);

const CulvertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152 1.063 1.95 1.95 0 0 0 1.88 3.011 2.036 2.036 0 0 0 1.291-.592 1.408 1.408 0 0 1 1.838 1.838 2.036 2.036 0 0 0-.592 1.291c0-1.306-1.498-1.88-3.011-1.88a.75.75 0 0 0-1.063 1.152 7.547 7.547 0 0 1 1.705 1.715 9.742 9.742 0 0 0 6.176-3.539.75.75 0 0 0-.136-1.071 9.742 9.742 0 0 0-3.539-6.176 7.547 7.547 0 0 1-1.715 1.705.75.75 0 0 0 1.152-1.063 1.95 1.95 0 0 0-1.88-3.011 2.036 2.036 0 0 0-1.291.592 1.408 1.408 0 0 1-1.838-1.838 2.036 2.036 0 0 0 .592-1.291c0-1.306-1.498-1.88-3.011-1.88a.75.75 0 0 0-1.063 1.152 7.547 7.547 0 0 1 1.705 1.715 9.742 9.742 0 0 0 6.176 3.539Z" clipRule="evenodd" />
        <path d="M6 15a6 6 0 1 0 12 0 6 6 0 0 0-12 0Z" />
    </svg>
);

const STATUS_CONFIG: Record<MatrixStatus, { bg: string, text: string, border: string, glow: string }> = {
    EMPTY: { bg: 'bg-transparent', text: 'text-slate-600', border: 'border-slate-800', glow: '' },
    PREPARING: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500', glow: 'shadow-[0_0_8px_rgba(234,179,8,0.2)]' },
    PENDING: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.3)]' },
    SIGNED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.2)]' },
    REJECTED: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500', glow: 'shadow-[0_0_8px_rgba(239,68,68,0.2)]' }
};

const STATUS_LABELS: Record<MatrixStatus, LocalizedString> = {
    EMPTY: { tr: 'Başlanmadı', en: 'Not Started', ro: 'Neînceput' },
    PREPARING: { tr: 'Hazırlanıyor', en: 'Preparing', ro: 'În Pregătire' },
    PENDING: { tr: 'Onay Bekliyor', en: 'Pending', ro: 'În Așteptare' },
    SIGNED: { tr: 'İmzalandı', en: 'Signed', ro: 'Semnat' },
    REJECTED: { tr: 'Reddedildi', en: 'Rejected', ro: 'Respins' }
};

const MatrixRowItem = React.memo(({ row, columns, onCellClick, canEdit }: { 
    row: ProgressRow, 
    columns: MatrixColumn[], 
    onCellClick: (rowId: string, colId: string, cell: MatrixCell) => void,
    canEdit: boolean
}) => {
    return (
        <tr className="hover:bg-white/5 transition-colors group border-b border-slate-800/50">
            {/* 1. KONUM (Fixed Left: 0, Width: 70px) */}
            <td className="sticky left-0 z-10 border-r border-slate-800 p-2 font-black text-white text-center bg-[#0f172a] min-w-[70px] max-w-[70px] text-[10px]">
                {row.location}
            </td>

            {/* 2. DIRECTION (Fixed Left: 70px, Width: 40px) */}
            <td className="sticky left-[70px] z-10 border-r border-slate-800 p-2 text-center bg-[#0f172a] min-w-[40px] max-w-[40px]">
                <span className={`text-[9px] font-extrabold ${row.direction === 'L' ? 'text-blue-400' : row.direction === 'R' ? 'text-orange-400' : 'text-slate-600'}`}>
                    {row.direction || '-'}
                </span>
            </td>
            
            {/* 3. TIP (Fixed Left: 110px, Width: 70px) - Has Shadow */}
            <td className="sticky left-[110px] z-10 border-r border-slate-800 p-2 text-center text-slate-400 font-mono bg-[#0f172a] min-w-[70px] max-w-[70px] text-[9px] shadow-[4px_0_10px_-4px_rgba(0,0,0,0.5)] truncate" title={row.foundationType || ''}>
                {row.foundationType || '-'}
            </td>

            {/* DYNAMIC COLUMNS */}
            {columns.map(col => {
                const cell = row.cells ? row.cells[col.id] : null;
                const safeStatus = (cell && STATUS_CONFIG[cell.status]) ? cell.status : 'EMPTY';
                const statusStyle = STATUS_CONFIG[safeStatus];
                const cellCode = cell && cell.code && cell.code !== '-' ? cell.code : '---';
                const clickPayload = cell || { code: '', status: 'EMPTY' };

                return (
                    <td key={col.id} className="border-r border-slate-800/50 p-2 text-center align-middle min-w-[110px]">
                        <div 
                            onClick={() => onCellClick(row.id, col.id, clickPayload)}
                            className={`w-full h-8 rounded text-[10px] font-bold font-mono flex items-center justify-center gap-1 cursor-pointer transition-all border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text} ${statusStyle.glow} ${canEdit ? 'hover:scale-105' : ''}`}
                        >
                            {cellCode}
                            {cell && cell.status === 'SIGNED' && <span className="material-symbols-outlined text-[12px]">check_circle</span>}
                        </div>
                    </td>
                );
            })}
        </tr>
    );
}, (prev, next) => prev.row === next.row && prev.columns === next.columns && prev.canEdit === next.canEdit);

export const PvlaContent: React.FC = () => {
  const { data, struct, updateMatrixCell, addPVLAFile, deletePVLAFile, loadPvlaFiles, loadMatrixRows } = useData();
  const { language, t, showToast, activeTab, setActiveTab } = useUI();
  const { currentUser } = useAuth();
  
  const [pvlaTab, setPvlaTab] = useState<'MATRIX' | 'FILES' | '3D'>('MATRIX');
  const [pvlaTypeFilter, setPvlaTypeFilter] = useState<'Bridge' | 'Culvert'>('Bridge'); 
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  
  // Modal Selection State
  const [selectedCell, setSelectedCell] = useState<{ rowId: string, colId: string, cell: MatrixCell } | null>(null);
  
  // Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [sidebarSearch, setSidebarSearch] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  useEffect(() => {
    struct.loadStructures();
    struct.loadTypes();
    loadMatrixRows();
  }, []);

  useEffect(() => {
      if (activeTab === 'pvla-matrix') setPvlaTab('MATRIX');
      else if (activeTab === 'pvla-files') setPvlaTab('FILES');
      else if (activeTab === 'pvla-3d') setPvlaTab('3D');
  }, [activeTab]);

  React.useEffect(() => {
      if (!selectedStructureId && struct.structures.length > 0) {
          const typeCodeToFind = pvlaTypeFilter === 'Bridge' ? 'POD' : 'DG';
          const first = struct.structures.find(s => s.typeCode === typeCodeToFind);
          if (first) setSelectedStructureId(first.id);
      }
  }, [pvlaTypeFilter, struct.structures, selectedStructureId]);

  React.useEffect(() => {
      if (pvlaTab === 'FILES' && selectedStructureId) {
          const fetchFiles = async () => {
              setIsLoadingFiles(true);
              await loadPvlaFiles(selectedStructureId);
              setIsLoadingFiles(false);
          };
          fetchFiles();
      }
  }, [pvlaTab, selectedStructureId]);

  const canEditMatrix = currentUser && (currentUser.role === 'admin' || currentUser.permissions.includes('manage_quality'));
  const canManageFiles = currentUser && (currentUser.role === 'admin' || currentUser.permissions.includes('manage_files'));

  const handleCellClick = useCallback((rowId: string, colId: string, cell: MatrixCell) => {
      if (!currentUser || !canEditMatrix) {
          showToast(t('common.noPermission'), 'error');
          return;
      }
      setSelectedCell({ rowId, colId, cell });
  }, [currentUser, canEditMatrix, showToast]);
  
  const filteredMatrixRows = useMemo((): ProgressRow[] => {
    if (!selectedStructureId) return [];
    return data.progressMatrix.filter(row => row.structureId === selectedStructureId);
  }, [selectedStructureId, data.progressMatrix]);

  const activeColumns = useMemo(() => {
      const cols = data.matrixColumns ? [...data.matrixColumns[pvlaTypeFilter]] : [];
      return cols.sort((a, b) => (a.orderIndex || 999) - (b.orderIndex || 999));
  }, [data.matrixColumns, pvlaTypeFilter]);

  const upsertCellData = (cellUpdate: Partial<MatrixCell>) => {
      if (!selectedCell) return;
      
      const { rowId: structureGroupId, colId } = selectedCell;
      updateMatrixCell(structureGroupId, colId, { ...selectedCell.cell, ...cellUpdate });

      setSelectedCell(null);
      showToast(t('common.update'), 'success');
  };

  // --- BULK IMPORT HANDLER ---
  const handleBulkImport = async (updates: { rowId: string, colId: string, status: MatrixStatus, code: string }[]) => {
      if (updates.length === 0) return;
      showToast(`${updates.length} hücre güncelleniyor...`, 'info');
      
      const mappedUpdates = updates.map(u => ({
          structureGroupId: u.rowId, // rowId is mapped to structureGroupId in our view logic
          colId: u.colId,
          status: u.status,
          code: u.code // Explicitly passing code
      }));

      const success = await pvlaRepository.bulkUpdateMatrixCells(mappedUpdates);
      
      if (success) {
          await loadMatrixRows(); // Refresh data to show changes
          showToast('Matris başarıyla güncellendi.', 'success');
      } else {
          showToast('Güncelleme sırasında hata oluştu.', 'error');
      }
  };

  // ... (Existing handlers: handleMatrixStatusChange, handleCodeChange, handleFileUpload, handleDrag, handleDrop) ...
  const handleMatrixStatusChange = (status: MatrixStatus) => { upsertCellData({ status, lastUpdated: new Date().toISOString().split('T')[0] }); };
  const handleCodeChange = (newCode: string) => { if (!selectedCell) return; setSelectedCell(prev => prev ? { ...prev, cell: { ...prev.cell, code: newCode } } : null); };
  const handleCodeSave = () => { if (!selectedCell) return; upsertCellData({ code: selectedCell.cell.code }); };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0] && selectedCell) { const file = e.target.files[0]; const structure = struct.structures.find(s => s.id === selectedStructureId); showToast('Dosya yükleniyor...', 'info'); const safeStructName = structure?.name.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown'; const folderPath = `pvla/${structure?.typeCode === 'POD' ? 'Bridge' : 'Culvert'}/${safeStructName}/signed`; const { publicUrl, error } = await apiService.uploadFile(file, 'app-assets', folderPath); if (error) { showToast(`HATA: ${error}`, 'error'); } else if (publicUrl) { addPVLAFile({ name: file.name, type: structure?.typeCode === 'POD' ? 'Bridge' : 'Culvert', structureId: selectedStructureId!, structureName: structure?.name || 'Unknown', date: new Date().toISOString().split('T')[0], size: (file.size / 1024 / 1024).toFixed(2) + ' MB', path: publicUrl }); upsertCellData({ fileUrl: publicUrl, status: 'SIGNED' }); showToast(t('common.upload')); setSelectedCell(null); } } };
  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setDragActive(true); else if (e.type === "dragleave") setDragActive(false); };
  const handleDrop = async (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (!canManageFiles || !selectedStructureId) { showToast(t('pvla.selectStructure'), 'error'); return; } const structure = struct.structures.find(s => s.id === selectedStructureId); if (e.dataTransfer.files && e.dataTransfer.files[0]) { setIsUploading(true); const files: File[] = Array.from(e.dataTransfer.files); let successCount = 0; for (const file of files) { const safeStructName = structure?.name.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown'; const folderPath = `pvla/${structure?.typeCode === 'POD' ? 'Bridge' : 'Culvert'}/${safeStructName}`; showToast(`${file.name} yükleniyor...`, 'info'); const { publicUrl, error } = await apiService.uploadFile(file, 'app-assets', folderPath); if (error) { showToast(`HATA (${file.name}): ${error}`, 'error'); } else if (publicUrl) { addPVLAFile({ name: file.name, type: structure?.typeCode === 'POD' ? 'Bridge' : 'Culvert', structureId: selectedStructureId!, structureName: structure?.name || 'Unknown', date: new Date().toISOString().split('T')[0], size: (file.size / (1024 * 1024)).toFixed(2) + ' MB', path: publicUrl }); successCount++; } } setIsUploading(false); if (successCount > 0) showToast(t('common.upload')); } };

  const currentMatrixType = pvlaTypeFilter;
  const structureTypeCode = currentMatrixType === 'Bridge' ? 'POD' : 'DG';
  const sidebarStructures = struct.structures.filter(s => s.typeCode === structureTypeCode && (s.name.toLowerCase().includes(sidebarSearch.toLowerCase()) || s.code.toLowerCase().includes(sidebarSearch.toLowerCase())));
  const selectedStructure = struct.structures.find(s => s.id === selectedStructureId);
  
  const headerGroups = useMemo(() => {
      const groups: { name: string; span: number }[] = [];
      if (activeColumns.length === 0) return groups;

      let currentGroup = activeColumns[0].group[language];
      let currentSpan = 0;

      activeColumns.forEach(col => {
          const gName = col.group[language];
          if (gName !== currentGroup) {
              groups.push({ name: currentGroup, span: currentSpan });
              currentGroup = gName;
              currentSpan = 1;
          } else {
              currentSpan++;
          }
      });
      groups.push({ name: currentGroup, span: currentSpan });
      return groups;
  }, [activeColumns, language]);

  const filteredFiles = data.pvlaFiles; 

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div onClick={() => { setPvlaTypeFilter('Bridge'); setSelectedStructureId(null); }} className={`relative overflow-hidden rounded-3xl p-6 border cursor-pointer transition-all duration-300 group ${pvlaTypeFilter === 'Bridge' ? 'border-blue-500/50 bg-gradient-to-br from-blue-900/40 to-slate-900/60 shadow-lg' : 'border-white/5 bg-slate-900/40 hover:bg-slate-800/50'}`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] z-0"></div>
                <div className="absolute -right-8 -bottom-8 text-blue-500/10 z-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-48 h-48"><path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V12h21v-1.854a.75.75 0 0 0-1.08-.673L13.5 13.96a2.5 2.5 0 0 1-3 0L2.58 9.473a.75.75 0 0 0-1.08.673Z" /><path d="M12 2a.75.75 0 0 1 .75.75V7a.75.75 0 0 1-1.5 0V2.75A.75.75 0 0 1 12 2Z" /></svg>
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div><p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 transition-colors ${pvlaTypeFilter === 'Bridge' ? 'text-blue-300' : 'text-slate-500'}`}>{t('pvla.index')}</p><h2 className="text-3xl font-bold text-white tracking-tight">Bridges</h2></div>
                    <div className="flex items-center gap-2 mt-4"><span className={`w-2 h-2 rounded-full ${pvlaTypeFilter === 'Bridge' ? 'bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-slate-600'}`}></span><p className={`text-xs font-medium ${pvlaTypeFilter === 'Bridge' ? 'text-blue-100' : 'text-slate-500'}`}>PVLA Index</p></div>
                </div>
            </div>
            <div onClick={() => { setPvlaTypeFilter('Culvert'); setSelectedStructureId(null); }} className={`relative overflow-hidden rounded-3xl p-6 border cursor-pointer transition-all duration-300 group ${pvlaTypeFilter === 'Culvert' ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-900/40 to-slate-900/60 shadow-lg' : 'border-white/5 bg-slate-900/40 hover:bg-slate-800/50'}`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] z-0"></div>
                <div className="absolute -right-8 -bottom-8 text-emerald-500/10 z-0 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-48 h-48"><path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152 1.063 1.95 1.95 0 0 0 1.88 3.011 2.036 2.036 0 0 0-1.291-.592 1.408 1.408 0 0 1 1.838 1.838 2.036 2.036 0 0 0-.592 1.291c0-1.306-1.498-1.88-3.011-1.88a.75.75 0 0 0-1.063 1.152 7.547 7.547 0 0 1 1.705 1.715 9.742 9.742 0 0 0 6.176-3.539Z" clipRule="evenodd" /><path d="M6 15a6 6 0 1 0 12 0 6 6 0 0 0-12 0Z" /></svg>
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div><p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 transition-colors ${pvlaTypeFilter === 'Culvert' ? 'text-emerald-300' : 'text-slate-500'}`}>{t('pvla.index')}</p><h2 className="text-3xl font-bold text-white tracking-tight">Culverts</h2></div>
                    <div className="flex items-center gap-2 mt-4"><span className={`w-2 h-2 rounded-full ${pvlaTypeFilter === 'Culvert' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></span><p className={`text-xs font-medium ${pvlaTypeFilter === 'Culvert' ? 'text-emerald-100' : 'text-slate-500'}`}>PVLA Index</p></div>
                </div>
            </div>
        </div>

        {/* ... Tab Navigation ... */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="flex gap-2 bg-slate-900/60 backdrop-blur-xl p-1.5 rounded-2xl w-fit border border-white/5">
                <button onClick={() => setPvlaTab('MATRIX')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${pvlaTab === 'MATRIX' ? 'bg-white/10 text-white shadow-inner border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><span className="material-symbols-outlined text-lg">grid_on</span> {t('pvla.tabs.matrix')}</button>
                <button onClick={() => setPvlaTab('FILES')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${pvlaTab === 'FILES' ? 'bg-white/10 text-white shadow-inner border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><span className="material-symbols-outlined text-lg">folder_open</span> {t('pvla.tabs.files')}</button>
                <button onClick={() => setPvlaTab('3D')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${pvlaTab === '3D' ? 'bg-white/10 text-white shadow-inner border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><span className="material-symbols-outlined text-lg">view_in_ar</span> 3D Digital Twin</button>
            </div>
            {pvlaTab === 'MATRIX' && (<div className="hidden md:flex items-center gap-4 bg-slate-900/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/5"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.6)]"></div><span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Signed</span></div><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.6)]"></div><span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Pending</span></div><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.6)]"></div><span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Preparing</span></div></div>)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[750px]">
            {/* SOL SIDEBAR: YAPI LİSTESİ */}
            <div className="lg:col-span-1 bg-slate-950/50 backdrop-blur-xl rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-xl transition-all">
                {/* ... Sidebar Code Same ... */}
                <div className="flex border-b border-white/5 bg-black/20 p-1.5 gap-1">
                    <button onClick={() => { setPvlaTypeFilter('Bridge'); setSelectedStructureId(null); }} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${pvlaTypeFilter === 'Bridge' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>BRIDGES</button>
                    <button onClick={() => { setPvlaTypeFilter('Culvert'); setSelectedStructureId(null); }} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${pvlaTypeFilter === 'Culvert' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>CULVERTS</button>
                </div>
                <div className="p-3 border-b border-white/5 bg-white/5 backdrop-blur-sm">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-sm">search</span>
                        <input type="text" placeholder={t('common.search')} value={sidebarSearch} onChange={(e) => setSidebarSearch(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/20 transition-all focus:bg-black/40" />
                    </div>
                </div>
                <div className="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1 relative">
                    {sidebarStructures.map(s => (<div key={s.id} onClick={() => setSelectedStructureId(s.id)} className={`p-3 rounded-xl cursor-pointer flex justify-between items-center group transition-all duration-200 border ${selectedStructureId === s.id ? 'bg-white/10 border-white/10 text-white shadow-lg backdrop-blur-md' : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}><div><span className="text-xs font-bold block">{s.code} - {s.name}</span><span className="text-[9px] opacity-60 font-mono tracking-wider">KM {s.kmStart} - {s.kmEnd}</span></div>{selectedStructureId === s.id && <span className="material-symbols-outlined text-sm opacity-80 animate-in slide-in-from-left-2">arrow_forward_ios</span>}</div>))}
                </div>
            </div>

            {/* ANA İÇERİK ALANI */}
            <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/5 flex flex-col overflow-hidden relative shadow-xl">
                {/* 1. MATRIX GÖRÜNÜMÜ */}
                {pvlaTab === 'MATRIX' && (
                    selectedStructure ? (
                        <>
                            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-500 ${pvlaTypeFilter === 'Bridge' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-blue-500/20' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/20'}`}>{pvlaTypeFilter === 'Bridge' ? <BridgeIcon /> : <CulvertIcon />}</div>
                                    <div><h3 className="text-white font-bold text-2xl tracking-tight drop-shadow-md">{selectedStructure.code} - {selectedStructure.name}</h3><div className="flex items-center gap-3 mt-1"><span className="text-[10px] font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/5">KM {selectedStructure.kmStart} - {selectedStructure.kmEnd}</span><span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Progress Matrix</span></div></div>
                                </div>
                                <div className="flex gap-2">
                                    {canEditMatrix && (
                                        <button onClick={() => setIsImportModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500 transition-all flex items-center gap-2 shadow-lg">
                                            <span className="material-symbols-outlined text-sm">table_view</span> Excel'den Yükle
                                        </button>
                                    )}
                                    <button className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold border border-white/5 transition-all flex items-center gap-2 hover:border-white/20 hover:shadow-lg">
                                        <span className="material-symbols-outlined text-sm">download</span> {t('common.excel')}
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto custom-scrollbar relative bg-slate-900/20">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 z-20 shadow-2xl">
                                        {/* ... Header Groups ... */}
                                        <tr className="bg-[#020617] backdrop-blur-xl">
                                            <th className="sticky left-0 z-30 p-3 border-r border-slate-800 min-w-[70px] max-w-[70px] text-[10px] text-slate-400 uppercase font-black text-center tracking-wider bg-[#0f172a]">KONUM</th>
                                            <th className="sticky left-[70px] z-30 p-3 border-r border-slate-800 min-w-[40px] max-w-[40px] text-[10px] text-slate-400 uppercase font-black text-center tracking-wider bg-[#0f172a]">YÖN</th>
                                            <th className="sticky left-[110px] z-30 p-3 border-r border-slate-800 min-w-[70px] max-w-[70px] text-[10px] text-slate-400 uppercase font-black text-center tracking-wider bg-[#0f172a] shadow-[4px_0_10px_-4px_rgba(0,0,0,0.5)]">TİP</th>
                                            {headerGroups.map((group, idx) => (
                                                <th key={idx} colSpan={group.span} className="text-slate-300 border-r border-slate-800 text-[10px] uppercase font-bold py-3 tracking-widest bg-slate-900 border-b border-slate-700">
                                                    {group.name}
                                                </th>
                                            ))}
                                        </tr>
                                        <tr className="bg-slate-900/90 backdrop-blur-xl">
                                            <th className="sticky left-0 z-30 border-r border-slate-800 h-8 bg-[#0f172a] min-w-[70px]"></th>
                                            <th className="sticky left-[70px] z-30 border-r border-slate-800 h-8 bg-[#0f172a] min-w-[40px]"></th>
                                            <th className="sticky left-[110px] z-30 border-r border-slate-800 h-8 bg-[#0f172a] min-w-[70px] shadow-[4px_0_10px_-4px_rgba(0,0,0,0.5)]"></th>
                                            {activeColumns.map(col => (
                                                <th key={col.id} className="p-2 border-r border-slate-800 min-w-[110px] text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950 border-b border-slate-800">
                                                    {col.name[language]}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs">
                                        {filteredMatrixRows.map(row => (
                                            <MatrixRowItem key={row.id} row={row} columns={activeColumns} onCellClick={handleCellClick} canEdit={canEditMatrix || false} />
                                        ))}
                                    </tbody>
                                </table>
                                {filteredMatrixRows.length === 0 && (
                                    <div className="p-12 text-center flex flex-col items-center justify-center h-64 opacity-50">
                                        <span className="material-symbols-outlined text-5xl mb-3 text-slate-600">table_rows</span>
                                        <p className="text-slate-400 font-bold mb-1">Matris Satırı Bulunamadı</p>
                                        <p className="text-xs text-slate-500">Bu yapı için tanımlanmış grup/aks verisi yok.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 bg-white/5 backdrop-blur-sm"><div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-2xl border border-white/5"><span className="material-symbols-outlined text-4xl opacity-50">touch_app</span></div><p className="text-lg font-medium opacity-50">{t('pvla.selectStructure')}</p></div>
                    )
                )}

                {/* 2. DOSYA YÖNETİMİ GÖRÜNÜMÜ */}
                {pvlaTab === 'FILES' && (
                    <div className="flex flex-col h-full">
                        {/* ... Existing File Manager Logic ... */}
                        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
                            <div><h3 className="text-white font-bold text-xl flex items-center gap-3"><span className={`p-2 rounded-xl bg-white/5 border border-white/10 shadow-lg ${pvlaTypeFilter === 'Bridge' ? 'text-blue-400' : 'text-emerald-400'}`}><span className="material-symbols-outlined">folder</span></span>{selectedStructure ? selectedStructure.name : t('pvla.allSignedFiles')}</h3>{selectedStructure && <p className="text-xs text-slate-500 mt-1 pl-12">{t('pvla.filesInStructure')}</p>}</div>
                            {selectedStructure && canManageFiles && (
                                <div 
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} 
                                    className={`relative px-6 py-3 rounded-xl border-2 border-dashed transition-all duration-300 flex items-center gap-3 cursor-pointer overflow-hidden group ${dragActive ? 'border-blue-500 bg-blue-500/10 scale-105' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                                >
                                    {isUploading ? (
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-blue-500 animate-spin">sync</span>
                                            <p className="text-xs font-bold text-white uppercase">Yükleniyor...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-400 transition-colors">cloud_upload</span>
                                            <div><p className="text-xs font-bold text-white uppercase">{t('pvla.dragDrop')}</p><p className="text-[9px] text-slate-500">{t('pvla.clickSelect')}</p></div>
                                            <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { if (e.target.files && e.target.files[0] && e.target.files.length > 0) { handleDrop({ dataTransfer: { files: e.target.files } } as any); } }} />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {isLoadingFiles ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                    <span className="material-symbols-outlined text-4xl animate-spin mb-4 text-blue-500">sync</span>
                                    <p>{t('common.loading')}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {filteredFiles.map(file => (
                                            <div key={file.id} className="group relative bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-black/30">
                                                <div className="flex justify-between items-start mb-3"><div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"><span className="material-symbols-outlined">picture_as_pdf</span></div>{canManageFiles && (<button onClick={() => deletePVLAFile(file.id)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-lg">delete</span></button>)}</div>
                                                <h4 className="text-sm font-bold text-white mb-1 truncate" title={file.name}>{file.name}</h4><p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">{file.size} • {file.date}</p>{!selectedStructure && (<div className="text-[10px] text-blue-400 mb-3 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 truncate">{file.structureName}</div>)}<a href={file.path} target="_blank" rel="noopener noreferrer" className="block w-full py-2 bg-white/5 hover:bg-blue-600 hover:text-white text-slate-400 text-center rounded-lg text-xs font-bold transition-all border border-white/5 hover:border-blue-500">{t('common.download')}</a>
                                            </div>
                                        ))}
                                    </div>
                                    {filteredFiles.length === 0 && (<div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50"><span className="material-symbols-outlined text-6xl mb-4">folder_off</span><p>{t('pvla.noFiles')}</p></div>)}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. 3D MODEL GÖRÜNÜMÜ */}
                {pvlaTab === '3D' && (
                    <div className="flex-1 flex flex-col h-full relative min-h-[500px]">
                        {selectedStructureId ? (
                            <div className="relative w-full h-full">
                                <div className="absolute top-4 right-4 z-10">
                                    <div className="bg-iha-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-xs font-bold text-white uppercase tracking-wider">LIVE TWIN</span>
                                    </div>
                                </div>
                                <ThreeDModel 
                                    rows={filteredMatrixRows} 
                                    columns={activeColumns} 
                                    onElementClick={handleCellClick} 
                                    language={language} 
                                />
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 bg-white/5 backdrop-blur-sm">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center mb-6 shadow-2xl border border-white/5 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="material-symbols-outlined text-6xl opacity-50 group-hover:scale-110 transition-transform duration-500">view_in_ar</span>
                                </div>
                                <p className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-1">{t('pvla.selectStructure')}</p>
                                <p className="text-xs text-slate-500">(3D Digital Twin)</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {selectedCell && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-slate-900/80 backdrop-blur-2xl w-full max-w-sm rounded-3xl border border-white/10 p-6 shadow-2xl relative ring-1 ring-white/10">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl pointer-events-none"></div>
                    <button onClick={() => setSelectedCell(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"><span className="material-symbols-outlined">close</span></button>
                    <div className="text-center mb-6 relative z-10">
                        <span className="inline-block px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs font-mono text-slate-400 mb-2">{filteredMatrixRows.find(r => r.id === selectedCell.rowId)?.location}</span>
                        <h3 className="text-xl font-bold text-white">{t('common.manufacturingStatus')}</h3>
                    </div>
                    
                    {/* INPUT FIELD FOR CODE */}
                    <div className="mb-6 relative z-10">
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">qr_code</span> {t('common.referenceCode')}
                        </label>
                        <input 
                            value={selectedCell.cell.code} 
                            onChange={(e) => handleCodeChange(e.target.value)} 
                            onBlur={handleCodeSave}
                            placeholder="Örn: 2D-1/T"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono text-center font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner text-lg placeholder-white/20" 
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-2 mb-6 relative z-10">
                        {(Object.keys(STATUS_LABELS) as MatrixStatus[]).map(status => (
                            <button key={status} onClick={() => handleMatrixStatusChange(status)} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 group ${selectedCell.cell.status === status ? `bg-white/10 border-white/20 text-white shadow-lg` : `bg-transparent border-white/5 text-slate-400 hover:bg-white/5 hover:text-white`}`}><span className="text-sm font-bold tracking-wide">{STATUS_LABELS[status][language]}</span><div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] transition-transform group-hover:scale-125 ${STATUS_CONFIG[status].text}`}></div></button>
                        ))}
                    </div>
                    {selectedCell.cell.status === 'SIGNED' && (
                        <div className="border-t border-white/10 pt-4 relative z-10">
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t('common.uploadSignedDoc')}</label>
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6"><span className="material-symbols-outlined text-slate-500 group-hover:text-blue-400 mb-1 transition-colors">cloud_upload</span><p className="text-[10px] text-slate-500 group-hover:text-blue-300 transition-colors">{t('common.orSelect')}</p></div>
                                <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                            </label>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- BULK IMPORT MODAL --- */}
        <PvlaImportModal 
            isOpen={isImportModalOpen} 
            onClose={() => setIsImportModalOpen(false)}
            onSave={handleBulkImport}
            visibleRows={filteredMatrixRows}
            visibleColumns={activeColumns}
        />
    </div>
  );
};
