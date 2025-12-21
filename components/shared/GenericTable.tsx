
import React from 'react';
import { useUI } from '../../context/UIContext';
import { LocalizedString } from '../../types';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    width?: string;
}

interface GenericTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    keyField: keyof T;
    emptyMessage?: string;
}

export const GenericTable = <T extends { [key: string]: any }>({ 
    data, 
    columns, 
    onEdit, 
    onDelete, 
    keyField,
    emptyMessage 
}: GenericTableProps<T>) => {
    const { t } = useUI();

    return (
        <div className="bg-iha-800 rounded-2xl border border-iha-700 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-iha-900 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className={`p-4 ${col.width || ''} ${col.className || ''}`}>
                                {col.header}
                            </th>
                        ))}
                        {(onEdit || onDelete) && (
                            <th className="p-4 text-right">{t('common.actions')}</th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-iha-700">
                    {data.map((item) => (
                        <tr key={item[keyField]} className="hover:bg-iha-900/50 transition-colors group">
                            {columns.map((col, idx) => (
                                <td key={idx} className={`p-4 ${col.className || ''}`}>
                                    {typeof col.accessor === 'function' 
                                        ? col.accessor(item) 
                                        : (item[col.accessor] as React.ReactNode)
                                    }
                                </td>
                            ))}
                            {(onEdit || onDelete) && (
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        {onEdit && (
                                            <button onClick={() => onEdit(item)} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded transition-colors" title={t('common.edit')}>
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button onClick={() => { if(window.confirm(t('common.deleteConfirm'))) onDelete(item); }} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors" title={t('common.delete')}>
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="p-8 text-center text-slate-500 italic">
                                {emptyMessage || t('common.noDataInCategory')}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
