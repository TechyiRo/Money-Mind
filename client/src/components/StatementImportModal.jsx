import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Check, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { suggestCategory, parseSMS } from '../utils/txParser';

export default function StatementImportModal({ onClose, onSuccess }) {
  const { user, updateProfile } = useAuth();
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [pasteText, setPasteText] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'paste'

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const isCsv = selectedFile.name.endsWith('.csv');
    const isPdf = selectedFile.name.endsWith('.pdf');

    if (!isCsv && !isPdf) {
      return toast.error('Please upload a CSV or PDF file.');
    }
    setFile(selectedFile);
    if (isCsv) parseCSV(selectedFile);
    else parsePDF(selectedFile);
  };

  const handleManualPaste = () => {
    if (!pasteText.trim()) return toast.error('Please paste some text first.');
    const transactions = processRawTextToTxs(pasteText);
    setData(transactions);
    if (transactions.length === 0) {
      toast.error('Could not find transactions in the pasted text.');
    } else {
      toast.success(`Found ${transactions.length} transactions!`);
      setFile({ name: 'Manual Paste' }); 
    }
  };

  const parsePDF = async (file) => {
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedarray = new Uint8Array(e.target.result);
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        const pdf = await pdfjsLib.getDocument(typedarray).promise;

        let fullText = '';
        toast.loading(`Analyzing ${pdf.numPages} pages...`, { id: 'pdf-load' });

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // CRITICAL FIX: Sort text items by vertical position (Y), then horizontal (X)
          // This ensures that table rows are reconstructed correctly regardless of extraction order
          const sortedItems = textContent.items.sort((a, b) => {
            const yA = a.transform[5];
            const yB = b.transform[5];
            if (Math.abs(yA - yB) > 2) return yB - yA; // Sort by Y descending (top to bottom)
            return a.transform[4] - b.transform[4]; // If Y is same, sort by X ascending (left to right)
          });

          let lastY, text = '';
          for (let item of sortedItems) {
            if (lastY !== undefined && Math.abs(lastY - item.transform[5]) > 2) {
              text += '\n';
            }
            text += item.str + ' ';
            lastY = item.transform[5];
          }

          fullText += text + '\n';
        }

        toast.dismiss('pdf-load');
        const transactions = processRawTextToTxs(fullText);
        setData(transactions);

        if (transactions.length === 0) {
          toast.error('No clear transactions detected. Try Smart Sync for specific lines.');
        } else {
          toast.success(`Extracted ${transactions.length} items from ${pdf.numPages} pages! 🚀`);
        }
      } catch (err) {
        console.error(err);
        toast.dismiss('pdf-load');
        toast.error('PDF parsing failed. Is it password protected?');
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processRawTextToTxs = (text) => {
    const txs = [];
    const cleanText = text.replace(/Â/g, '').replace(/\u00A0/g, ' '); 
    
    // Step 1: Flexible Date Splitting (Handles "02 Mar, 2026" AND "Mar 15, 2026")
    const blocks = cleanText.split(/(\d{1,2}\s\w{3,9},?\s\d{4}|\w{3,9}\s\d{1,2},?\s\d{4})/g);
    
    for (let i = 1; i < blocks.length; i += 2) {
      const dateStr = blocks[i].trim();
      let content = blocks[i + 1] || '';
      
      const timeMatch = content.match(/\b(\d{1,2}:\d{2}\s?[AP]M)\b/i);
      const timeStr = timeMatch ? timeMatch[1] : '12:00 PM';

      // Step 2: Extract the BOLD Text (Primary Transaction Line)
      // PhonePe layout: First line is the Bold Title, subsequent lines are Metadata IDs
      const contentLines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      // We look for a line that isn't just Time or 'Date' or empty
      let rawDesc = 'Imported Transaction';
      if (contentLines.length > 0) {
        // Skip the time line if it's there
        const candidateLine = contentLines[0].toLowerCase().includes(':') && contentLines[0].includes(' ') ? (contentLines[1] || contentLines[0]) : contentLines[0];
        
        // Scrub common footers from the bold line if they bled in
        rawDesc = candidateLine
          .split(/Transaction ID|UTR No|Credited to|Debited from|Paid by/i)[0]
          .replace(/\b\d{1,2}:\d{2}(?:\s?[AP]M)?\b/gi, '')
          .trim()
          .substring(0, 100);
      }
      
      // Step 3: Segment Header Area for Amount detection
      const headerArea = content.split('\n').slice(0, 5).join(' ');
      
      // Step 4: Amount Extraction (Supporting ₹, INR, rs.)
      const amountCandidateRegex = /(?:₹|INR|rs\.|rs)\s*([0-9,]+(?:\.\d{2})?)/gi;
      let amtMatch;
      let bestAmount = null;

      while ((amtMatch = amountCandidateRegex.exec(headerArea)) !== null) {
        const valStr = amtMatch[1].replace(/,/g, '');
        const val = parseFloat(valStr);
        if (val > 0 && valStr.length !== 4 && valStr.length < 10) {
          bestAmount = val;
          break; 
        }
      }

      // Step 5: Income vs Expense detection
      let type = 'expense';
      const lowercaseContent = content.toLowerCase();
      if (lowercaseContent.includes('received from') || 
          lowercaseContent.includes('credit') || 
          lowercaseContent.includes('credited to')) {
        type = 'income';
      }

      if (bestAmount) {
        // CLEAN THE NAME: Specifically remove "Credit", "Debit", "INR", and the amount from the name
        const cleanName = (rawDesc || 'Imported Transaction')
          .replace(/Credit|Debit|INR|₹|rs\.?/gi, '')
          .replace(/[0-9,.]+/g, '') 
          .replace(/\s+/g, ' ')
          .trim();

        // FILTER: Keep only realistic transaction amounts (Skip opening/closing balance totals)
        const isBalanceLine = cleanName.toLowerCase().includes('balance') || 
                            cleanName.toLowerCase().includes('total');
        
        if (!isBalanceLine) {
          txs.push({
            id: txs.length,
            date: formatDate(dateStr),
            time: timeStr,
            dateTime: combineDateTime(dateStr, timeStr),
            description: cleanName || 'Imported Pulse',
            amount: bestAmount,
            type,
            category: suggestCategory(cleanName),
            selected: true
          });
        }
      }
    }

    // fallback: if gpay block strategy failed, try generic regex patterns for any missing lines
    const p1 = /(\d{1,2}[-\/ ]\w{1,3}[,-\/ ]\d{2,4})\s+([\w\s\/.\-*#]+?)\s+([₹rs. ]*[0-9,]+(?:\.[0-9]{2})?)\s*(DR|CR|Debit|Credit)?/gi;
    let match;
    while ((match = p1.exec(text)) !== null) {
      const rawDate = match[1];
      const rawDesc = match[2].trim();
      const amount = Math.abs(parseFloat(match[3].replace(/[₹rs.,\s]/gi, '')));
      
      // Only add if not already captured by the block logic
      const isDuplicate = txs.some(t => t.description.toLowerCase().includes(rawDesc.toLowerCase().substring(0, 5)) && t.amount === amount);
      
      if (!isDuplicate && !isNaN(amount) && amount > 0 && amount < 5000000) {
        txs.push({ id: txs.length, date: formatDate(rawDate), time: '12:00 PM', dateTime: formatDate(rawDate), description: rawDesc, amount, type: 'expense', category: suggestCategory(rawDesc), selected: true });
      }
    }

    return txs;
  };

  const combineDateTime = (datePart, timePart) => {
    const date = formatDate(datePart); 
    const timeMatch = timePart.match(/(\d+):(\d+)\s*([AP]M)/i);
    if (!timeMatch) return date;
    
    let [_, hours, mins, period] = timeMatch;
    hours = parseInt(hours);
    if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
    
    return `${date}T${hours.toString().padStart(2, '0')}:${mins}:00`;
  };

  const formatDate = (rawDate) => {
    const cleanDate = rawDate.replace(/[\/ ]/g, '-').replace(/--/g, '-').replace(/,/g, '');
    
    // Handle "Mar-15-2026" or "15-Mar-2026"
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    let d, m, y;

    const parts = cleanDate.split('-');
    if (parts.length < 3) return new Date().toISOString().split('T')[0];

    // Check if middle part is month or first part is month
    if (isNaN(parts[0])) { // Format: Mar-15-2026
       m = parts[0]; d = parts[1]; y = parts[2];
    } else { // Format: 15-Mar-2026
       d = parts[0]; m = parts[1]; y = parts[2];
    }

    d = d.padStart(2, '0');
    if (isNaN(m)) {
      const monthIdx = months.findIndex(name => m.toLowerCase().includes(name));
      m = monthIdx !== -1 ? (monthIdx + 1).toString().padStart(2, '0') : '01';
    } else {
      m = m.padStart(2, '0');
    }

    if (y.length === 2) y = '20' + y;
    return `${y}-${m}-${d}`;
  };

  const parseCSV = (file) => {
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = text.split('\n').map(row => row.split(','));

        // Basic mapping logic (Assumes headers like Date, Description, Amount)
        // We'll look for column indices
        const headers = rows[0].map(h => h.toLowerCase().trim().replace(/"/g, ''));
        const dateIdx = headers.findIndex(h => h.includes('date'));
        const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('narrow') || h.includes('particulars'));
        const amtIdx = headers.findIndex(h => h.includes('amount') || h.includes('amt') || h.includes('value'));
        const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('cr/dr'));

        if (dateIdx === -1 || descIdx === -1 || amtIdx === -1) {
          throw new Error('Could not find mandatory columns (Date, Description, Amount).');
        }

        const parsedData = rows.slice(1)
          .filter(row => row.length >= 3 && row[dateIdx] && row[amtIdx])
          .map((row, index) => {
            const description = row[descIdx]?.replace(/"/g, '').trim() || 'Imported Transaction';
            const rawAmount = row[amtIdx]?.replace(/"/g, '').trim();
            const amount = Math.abs(parseFloat(rawAmount));

            // Guess type
            let type = 'expense';
            if (typeIdx !== -1) {
              const typeVal = row[typeIdx].toLowerCase();
              if (typeVal.includes('cr') || typeVal.includes('income')) type = 'income';
            } else if (parseFloat(rawAmount) > 0 && headers[amtIdx].includes('credit')) {
              type = 'income';
            }

            // Standardize Date
            let date = new Date().toISOString().split('T')[0];
            const rawDate = row[dateIdx].replace(/"/g, '').trim();
            const dateMatch = rawDate.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/);
            if (dateMatch) {
              let d = dateMatch[1].padStart(2, '0');
              let m = dateMatch[2].padStart(2, '0');
              let y = dateMatch[3];
              if (y.length === 2) y = '20' + y;
              date = `${y}-${m}-${d}`;
            }

            return {
              id: index,
              date,
              description,
              amount,
              type,
              category: suggestCategory(description),
              selected: true
            };
          });

        setData(parsedData);
      } catch (err) {
        toast.error(err.message || 'Failed to parse CSV');
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const selectedTxs = data.filter(t => t.selected).map(tx => ({
      ...tx,
      date: tx.dateTime || tx.date // Use exact dateTime for the backend
    }));

    if (selectedTxs.length === 0) return toast.error('Select at least one transaction.');

    try {
      setIsSaving(true);
      const res = await api.post('/transactions/bulk', { transactions: selectedTxs });
      
      // Explicit synchronization confirmation for the user
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-black text-emerald-500">SYSTEM SYNC COMPLETE 🚀</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {selectedTxs.length} Transactions Ingested. Dashboard, Budgets & Intelligence recalibrated.
          </span>
        </div>,
        { duration: 4000 }
      );

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.details?.[0] || err.response?.data?.error || 'Bulk Import Failed';
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelect = (id) => {
    setData(prev => prev.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };

  const updateCategory = (id, cat) => {
    setData(prev => prev.map(t => t.id === id ? { ...t, category: cat } : t));
  };

  const updateTxField = (id, field, value) => {
    setData(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-[#0b0b0b] border border-white/10 w-full max-w-5xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] relative"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Smart Bulk Ingester</h2>
                <p className="text-xs text-slate-500">Fast-track your financial records</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!file ? (
              <div className="space-y-6">
                <div className="flex p-1 bg-white/5 rounded-2xl">
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'upload' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
                  >
                    Upload File
                  </button>
                  <button 
                    onClick={() => setActiveTab('paste')}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'paste' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
                  >
                    Smart Paste
                  </button>
                </div>

                {activeTab === 'upload' ? (
                  <div
                    className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-amber-500/30 transition-all group cursor-pointer relative overflow-hidden"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv,.pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                    />
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform relative z-0">
                      <Upload className="text-slate-400 group-hover:text-amber-500" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1 relative z-0">Choose PDF or CSV Statement</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black relative z-0">Drag and drop supported</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea 
                      placeholder="Paste your statement text here (Copy from Google Pay/Bank PDF)..."
                      className="w-full h-48 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm text-white outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-none font-medium placeholder:text-slate-600"
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                    />
                    <button 
                      onClick={handleManualPaste}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/5"
                    >
                      Extract from Text
                      <Check size={18} className="text-amber-500" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">
                  <div className="flex items-center gap-2">
                    Record Analysis ({data.length})
                  </div>
                  <button onClick={() => { setFile(null); setData([]); setPasteText(''); }} className="text-amber-500 hover:underline">Reset</button>
                </div>
                
                <div className="bg-black/20 border border-white/5 rounded-[2.5rem] overflow-hidden">
                   <table className="w-full text-left border-collapse table-fixed">
                      <thead>
                         <tr className="border-b border-white/5 bg-white/5">
                            <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest w-[5%]">Sel</th>
                            <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest w-[15%]">Timestamp</th>
                            <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest w-[40%]">Particulars</th>
                            <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest w-[20%]">Category</th>
                            <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest text-right w-[20%]">Amount</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {data.map((tx) => (
                            <tr key={tx.id} className={`transition-colors ${tx.selected ? 'bg-white/[0.02]' : 'opacity-20'}`}>
                               <td className="p-4">
                                  <input type="checkbox" checked={tx.selected} onChange={() => toggleSelect(tx.id)} className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-amber-500 focus:ring-amber-500 cursor-pointer" />
                               </td>
                               <td className="p-4 overflow-hidden">
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                     <input type="date" value={tx.date} onChange={(e) => updateTxField(tx.id, 'date', e.target.value)} className="bg-transparent border-none p-0 text-xs font-bold text-white outline-none w-full" />
                                     <span className="text-[10px] font-bold text-slate-500 truncate">{tx.time}</span>
                                  </div>
                               </td>
                               <td className="p-4 overflow-hidden">
                                  <div className="min-w-0">
                                    <input 
                                      type="text" 
                                      value={tx.description} 
                                      onChange={(e) => updateTxField(tx.id, 'description', e.target.value)} 
                                      className="bg-transparent border-none p-0 text-xs font-bold text-white w-full outline-none focus:text-amber-500 transition-colors truncate"
                                      title={tx.description}
                                    />
                                  </div>
                               </td>
                               <td className="p-4 overflow-hidden">
                                  <select 
                                    value={tx.category} 
                                    onChange={(e) => {
                                      if (e.target.value === 'ADD_NEW') {
                                        const newCat = prompt('Enter New Segment Name:');
                                        if (newCat && newCat.trim()) {
                                          const finalCat = newCat.trim();
                                          // Update user profile with new category
                                          const existing = user.customCategories || [];
                                          if (!existing.includes(finalCat)) {
                                            const updated = [...existing, finalCat];
                                            updateProfile({ customCategories: updated });
                                          }
                                          updateCategory(tx.id, finalCat);
                                        }
                                      } else {
                                        updateCategory(tx.id, e.target.value);
                                      }
                                    }} 
                                    className="bg-white/5 border-none text-[9px] font-black uppercase tracking-widest text-amber-500 rounded-lg py-1 px-3 w-full truncate"
                                  >
                                     {[
                                       'Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Salary', 'Investment', 'Other',
                                       ...(user.customCategories || [])
                                     ].map(cat => <option key={cat} value={cat} className="bg-neutral-900">{cat}</option>)}
                                     <option value="ADD_NEW" className="bg-amber-500 text-black font-black">+ Create New Segment</option>
                                  </select>
                               </td>
                               <td className="p-4 text-right overflow-hidden">
                                  <div className="flex flex-col items-end gap-0.5 min-w-0">
                                     <div className={`flex items-center gap-1 font-black justify-end w-full ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        <span className="text-[10px] opacity-70">₹</span>
                                        <input type="number" value={tx.amount} onChange={(e) => updateTxField(tx.id, 'amount', parseFloat(e.target.value) || 0)} className="bg-transparent border-none p-0 w-full text-right text-xs font-black outline-none" />
                                     </div>
                                     <span className={`text-[8px] font-black uppercase px-1 rounded bg-white/5 truncate ${tx.type === 'income' ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>{tx.type}</span>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
            )}
          </div>

          {file && (
            <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-xl shrink-0">
              <button
                onClick={handleImport}
                disabled={isSaving}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-[#0d0d0d] font-black rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isSaving ? 'Processing Bulk Ingestion...' : `Authorize Import (${data.filter(t=>t.selected).length} Items)`}
                <ChevronRight size={18} strokeWidth={3} />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
