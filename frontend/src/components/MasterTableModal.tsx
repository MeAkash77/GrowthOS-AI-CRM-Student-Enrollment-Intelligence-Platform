import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    X, 
    Plus, 
    Trash2, 
    Save, 
    Database, 
    AlertCircle, 
    Check, 
    ChevronRight, 
    ChevronLeft,
    Type,
    Copy,
    Maximize2,
    Minimize2,
    Search,
    Wand2,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '@/services/ai.service';

interface MasterTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMoveToDashboard: (data: any[]) => void;
}

const MASTER_TABLE_COLUMNS = [
    'account_id', 'account_name', 'website', 'industry', 'sub_industry', 'market_segment', 'business_model', 'hq', 'founded_year', 'employee_count', 'public_company', 'description', 'market_positioning', 'product_name', 'use_case', 'tech_stack', 'customer_segment', 'partnership', 'competitor', 'funding_total',
    'contact_id', 'contact_name', 'contact_role', 'contact_department', 'contact_linkedin', 'contact_email', 'contact_phone', 'contact_type', 'influence_level',
    'lead_score', 'lead_id', 'lead_target_role', 'lead_department', 'lead_priority', 'lead_reason',
    'deal_id', 'deal_name', 'deal_stage', 'deal_value', 'deal_probability', 'deal_owner', 'associated_contacts',
    'activity_id', 'activity_type', 'activity_lead', 'activity_sales_rep', 'activity_outcome', 'activity_notes',
    'interaction_id', 'interaction_contact', 'interaction_channel', 'interaction_summary', 'interaction_sentiment',
    'call_id', 'call_contact', 'call_duration', 'call_outcome', 'call_notes',
    'email_id', 'email_contact', 'email_subject', 'email_direction', 'email_summary',
    'sales_insight_pain_points', 'sales_insight_opportunities', 'sales_insight_value_prop', 'sales_insight_pitch',
    'market_analysis_industry', 'market_analysis_trends', 'market_analysis_opportunities', 'market_analysis_competitors',
    'outreach_strategy_target_roles', 'outreach_strategy_channels', 'outreach_strategy_messaging',
    'lead_discovery_target_roles', 'lead_discovery_team_size', 'lead_discovery_departments',
    'ai_summary_account_value', 'ai_summary_deal_potential', 'ai_summary_best_entry', 'ai_summary_next_step'
];

const REQUIRED_FIELDS = ['account_name', 'contact_name', 'contact_email', 'lead_id', 'deal_id'];

const MasterTableModal: React.FC<MasterTableModalProps> = ({ isOpen, onClose, onMoveToDashboard }) => {
    const [data, setData] = useState<any[]>([]);
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
        MASTER_TABLE_COLUMNS.reduce((acc, col) => ({ ...acc, [col]: 150 }), {})
    );
    const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null);
    const [wrapText, setWrapText] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ row: number; message: string; type: 'error' | 'warning' }[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const tableRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize with 10 empty rows or load from localStorage
    useEffect(() => {
        if (isOpen) {
            const savedDraft = localStorage.getItem('master_table_draft');
            if (savedDraft) {
                try {
                    setData(JSON.parse(savedDraft));
                } catch (e) {
                    const emptyRows = Array(10).fill({}).map(() => 
                        MASTER_TABLE_COLUMNS.reduce((acc, col) => ({ ...acc, [col]: '' }), {})
                    );
                    setData(emptyRows);
                }
            } else {
                const emptyRows = Array(10).fill({}).map(() => 
                    MASTER_TABLE_COLUMNS.reduce((acc, col) => ({ ...acc, [col]: '' }), {})
                );
                setData(emptyRows);
            }
        }
    }, [isOpen]);

    // Save to localStorage on change
    useEffect(() => {
        if (data.length > 0) {
            localStorage.setItem('master_table_draft', JSON.stringify(data));
        }
    }, [data]);

    const handleCellChange = (rowIdx: number, col: string, value: string) => {
        const newData = [...data];
        newData[rowIdx] = { ...newData[rowIdx], [col]: value };
        setData(newData);
    };

    const addRow = () => {
        const newRow = MASTER_TABLE_COLUMNS.reduce((acc, col) => ({ ...acc, [col]: '' }), {});
        setData([...data, newRow]);
    };

    const deleteRow = (idx: number) => {
        const newData = [...data];
        newData.splice(idx, 1);
        setData(newData);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        if (editingCell) return; // Let the default input paste handle it

        e.preventDefault();
        const clipboardData = e.clipboardData.getData('text/plain');
        const rows = clipboardData.split(/\r?\n/).filter(row => row.trim() !== '');
        
        if (rows.length === 0) return;

        const startRow = selectedCell?.row || 0;
        const startColIdx = MASTER_TABLE_COLUMNS.indexOf(selectedCell?.col || MASTER_TABLE_COLUMNS[0]);

        const newData = [...data];
        
        rows.forEach((row, i) => {
            const cells = row.split('\t');
            const targetRowIdx = startRow + i;
            
            // Add new rows if needed
            if (!newData[targetRowIdx]) {
                newData[targetRowIdx] = MASTER_TABLE_COLUMNS.reduce((acc, col) => ({ ...acc, [col]: '' }), {});
            }

            cells.forEach((cell, j) => {
                const targetColIdx = startColIdx + j;
                if (targetColIdx < MASTER_TABLE_COLUMNS.length) {
                    const colName = MASTER_TABLE_COLUMNS[targetColIdx];
                    newData[targetRowIdx] = { ...newData[targetRowIdx], [colName]: cell.trim() };
                }
            });
        });

        setData(newData);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!selectedCell || editingCell) return;

        const { row, col } = selectedCell;
        const colIdx = MASTER_TABLE_COLUMNS.indexOf(col);

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (row > 0) setSelectedCell({ row: row - 1, col });
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (row < data.length - 1) setSelectedCell({ row: row + 1, col });
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (colIdx > 0) setSelectedCell({ row, col: MASTER_TABLE_COLUMNS[colIdx - 1] });
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (colIdx < MASTER_TABLE_COLUMNS.length - 1) setSelectedCell({ row, col: MASTER_TABLE_COLUMNS[colIdx + 1] });
                break;
            case 'Tab':
                e.preventDefault();
                if (e.shiftKey) {
                    if (colIdx > 0) setSelectedCell({ row, col: MASTER_TABLE_COLUMNS[colIdx - 1] });
                    else if (row > 0) setSelectedCell({ row: row - 1, col: MASTER_TABLE_COLUMNS[MASTER_TABLE_COLUMNS.length - 1] });
                } else {
                    if (colIdx < MASTER_TABLE_COLUMNS.length - 1) setSelectedCell({ row, col: MASTER_TABLE_COLUMNS[colIdx + 1] });
                    else if (row < data.length - 1) setSelectedCell({ row: row + 1, col: MASTER_TABLE_COLUMNS[0] });
                }
                break;
            case 'Enter':
                e.preventDefault();
                setEditingCell(selectedCell);
                break;
            case 'Backspace':
            case 'Delete':
                if (!editingCell) {
                    handleCellChange(row, col, '');
                }
                break;
            default:
                // Start editing on any character key
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    setEditingCell(selectedCell);
                }
                break;
        }
    };

    const runValidation = async () => {
        setIsValidating(true);
        const errors: { row: number; message: string; type: 'error' | 'warning' }[] = [];

        // Basic validation
        data.forEach((row, idx) => {
            const hasData = Object.values(row).some(v => v !== '');
            if (!hasData) return;

            REQUIRED_FIELDS.forEach(field => {
                if (!row[field]) {
                    errors.push({ row: idx + 1, message: `Row ${idx + 1}: ${field} is required.`, type: 'error' });
                }
            });

            // Email validation
            if (row.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.contact_email)) {
                errors.push({ row: idx + 1, message: `Row ${idx + 1}: Invalid email format.`, type: 'error' });
            }

            // Numeric validations
            if (row.deal_value && isNaN(Number(row.deal_value))) {
                errors.push({ row: idx + 1, message: `Row ${idx + 1}: Deal value must be numeric.`, type: 'error' });
            }
            if (row.deal_probability && (isNaN(Number(row.deal_probability)) || Number(row.deal_probability) < 0 || Number(row.deal_probability) > 100)) {
                errors.push({ row: idx + 1, message: `Row ${idx + 1}: Probability must be between 0-100.`, type: 'error' });
            }
        });

        // AI Validation pass for first 5 non-empty rows (to avoid overloading)
        const nonEmptyRows = data.filter(row => Object.values(row).some(v => v !== '')).slice(0, 10);
        if (nonEmptyRows.length > 0) {
            try {
                const aiCheck = await aiService.chat([
                    { 
                        id: 'system-1', 
                        role: 'system', 
                        content: 'You are a data validation assistant. Check this CRM data for potential errors like typos in emails, invalid domains, or inconsistencies. Return a concise list of warnings.' 
                    },
                    { 
                        id: 'user-1', 
                        role: 'user', 
                        content: `Check these rows for errors: ${JSON.stringify(nonEmptyRows)}` 
                    }
                ]);
                
                if (aiCheck.content) {
                    // We just add the AI feedback as warnings
                    errors.push({ row: 0, message: "AI Insights: " + aiCheck.content, type: 'warning' });
                }
            } catch (e) {
                console.error("AI validation failed", e);
            }
        }

        setValidationErrors(errors);
        setIsValidating(false);
    };

    const handleMoveToDashboard = () => {
        const validData = data.filter(row => row.account_name && row.contact_name);
        if (validData.length === 0) {
            alert("Please enter at least one valid record with account name and contact name.");
            return;
        }
        onMoveToDashboard(validData);
    };

    const handleResize = (col: string, e: React.MouseEvent) => {
        const startX = e.pageX;
        const startWidth = columnWidths[col];

        const onMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = Math.max(50, startWidth + (moveEvent.pageX - startX));
            setColumnWidths(prev => ({ ...prev, [col]: newWidth }));
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='fixed inset-0 z-[100] bg-white flex flex-col'
            >
                {/* Header */}
                <div className='h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white sticky top-0 z-50'>
                    <div className='flex items-center gap-4'>
                        <button 
                            onClick={onClose}
                            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                        >
                            <X className='w-5 h-5 text-gray-500' />
                        </button>
                        <h2 className='text-lg font-bold text-gray-900'>Master Table Creator</h2>
                        <div className='h-6 w-[1px] bg-gray-200 mx-2' />
                        <div className='flex items-center gap-2'>
                            <button 
                                onClick={addRow}
                                className='flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all'
                            >
                                <Plus className='w-3.5 h-3.5' />
                                Add Row
                            </button>
                            <button 
                                onClick={() => setWrapText(!wrapText)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${wrapText ? 'bg-[#2ECC71] text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                <Type className='w-3.5 h-3.5' />
                                Wrap Text
                            </button>
                            <button 
                                onClick={runValidation}
                                disabled={isValidating}
                                className='flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F8F0] hover:bg-[#D4F1E0] text-[#2ECC71] rounded-lg text-xs font-bold transition-all disabled:opacity-50'
                            >
                                {isValidating ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : <Wand2 className='w-3.5 h-3.5' />}
                                AI Validate
                            </button>
                        </div>
                    </div>

                    <div className='flex items-center gap-3'>
                        <button 
                            onClick={() => {
                                setIsSaving(true);
                                setTimeout(() => setIsSaving(false), 1000);
                            }}
                            className='flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all'
                        >
                            {isSaving ? <Check className='w-4 h-4 text-[#2ECC71]' /> : <Save className='w-4 h-4' />}
                            Save Draft
                        </button>
                        <button 
                            onClick={handleMoveToDashboard}
                            className='flex items-center gap-2 px-6 py-2 bg-[#2ECC71] hover:bg-[#27AE60] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#2ECC71]/20'
                        >
                            <Database className='w-4 h-4' />
                            Move to Dashboard
                        </button>
                    </div>
                </div>

                {/* Validation Sidebar / Notification */}
                {validationErrors.length > 0 && (
                    <div className='bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-start gap-4'>
                        <AlertCircle className='w-5 h-5 text-amber-500 shrink-0 mt-0.5' />
                        <div className='flex-1 max-h-24 overflow-y-auto custom-scrollbar'>
                            <p className='text-sm font-bold text-amber-900 mb-1'>Validation Messages:</p>
                            <ul className='text-xs text-amber-800 space-y-1'>
                                {validationErrors.map((err, i) => (
                                    <li key={i} className='flex items-center gap-2'>
                                        <span className={`w-1.5 h-1.5 rounded-full ${err.type === 'error' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                        {err.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button 
                            onClick={() => setValidationErrors([])}
                            className='text-amber-500 hover:text-amber-700'
                        >
                            <X className='w-4 h-4' />
                        </button>
                    </div>
                )}

                {/* Table Container */}
                <div 
                    ref={tableRef}
                    className='flex-1 overflow-auto custom-scrollbar relative'
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    onPaste={handlePaste}
                >
                    <table className='border-collapse table-fixed w-full' style={{ minWidth: Object.values(columnWidths).reduce((a, b) => a + b, 0) }}>
                        <thead className='sticky top-0 z-20'>
                            <tr className='bg-gray-100'>
                                <th className='w-12 border border-gray-200 text-[10px] font-bold text-gray-400 bg-gray-50' />
                                {MASTER_TABLE_COLUMNS.map((col) => (
                                    <th 
                                        key={col}
                                        style={{ width: columnWidths[col] }}
                                        className='relative border border-gray-200 px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none'
                                    >
                                        <div className='truncate pr-2'>{col.replace(/_/g, ' ')}</div>
                                        <div 
                                            className='absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#2ECC71] transition-colors'
                                            onMouseDown={(e) => handleResize(col, e)}
                                        />
                                    </th>
                                ))}
                                <th className='w-12 border border-gray-200 bg-gray-50' />
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIdx) => (
                                <tr key={rowIdx} className='hover:bg-gray-50 transition-colors'>
                                    <td className='border border-gray-200 text-center text-[10px] font-bold text-gray-400 bg-gray-50'>
                                        {rowIdx + 1}
                                    </td>
                                    {MASTER_TABLE_COLUMNS.map((col) => {
                                        const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === col;
                                        const isEditing = editingCell?.row === rowIdx && editingCell?.col === col;
                                        
                                        return (
                                            <td 
                                                key={col}
                                                onClick={() => {
                                                    setSelectedCell({ row: rowIdx, col });
                                                    setEditingCell(null);
                                                }}
                                                onDoubleClick={() => setEditingCell({ row: rowIdx, col })}
                                                className={`border border-gray-200 p-0 relative h-10 ${isSelected ? 'ring-2 ring-inset ring-[#2ECC71]' : ''}`}
                                            >
                                                {isEditing ? (
                                                    <input
                                                        autoFocus
                                                        value={typeof row[col] === 'object' ? JSON.stringify(row[col]) : row[col]}
                                                        onChange={(e) => handleCellChange(rowIdx, col, e.target.value)}
                                                        onBlur={() => setEditingCell(null)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') setEditingCell(null);
                                                            if (e.key === 'Escape') setEditingCell(null);
                                                        }}
                                                        className='absolute inset-0 w-full h-full px-3 py-2 text-sm focus:outline-none'
                                                    />
                                                ) : (
                                                    <div className={`px-3 py-2 text-sm text-gray-700 w-full h-full ${wrapText ? 'whitespace-normal' : 'truncate'}`}>
                                                        {typeof row[col] === 'string' || typeof row[col] === 'number' 
                                                            ? row[col] 
                                                            : (row[col] ? JSON.stringify(row[col]) : '')}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className='border border-gray-200 p-0'>
                                        <button 
                                            onClick={() => deleteRow(rowIdx)}
                                            className='w-full h-full flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors'
                                        >
                                            <Trash2 className='w-4 h-4' />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer / Info */}
                    <div className='sticky left-0 bottom-0 bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest z-30'>
                        <div>{data.length} Rows • {MASTER_TABLE_COLUMNS.length} Columns</div>
                        <div>Keyboard: Arrows to move • Enter to edit • Ctrl+V to paste</div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MasterTableModal;
