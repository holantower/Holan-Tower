import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Search, CheckCircle2, XCircle, Clock, Users, Home, PieChart, CalendarDays, TrendingUp, Wallet, ArrowUpRight, ListFilter, RefreshCw, Lock, Unlock, Edit3, Save, X, Grid, Calendar as CalendarIcon, DollarSign, Check } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { TRANSLATIONS, FLAT_OWNERS } from '../constants';

// কনফিগারেশন: ২৭টি ইউনিট (ফ্লোর ২ থেকে ১০)
const FLOORS = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const UNITS_PER_FLOOR = ['A', 'B', 'C'];
const ALL_UNITS = FLOORS.flatMap(f => UNITS_PER_FLOOR.map(u => `${f}${u}`));

// English months array to map logic consistently, UI will use translated array
const MONTHS_LOGIC = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

type Status = 'PAID' | 'DUE' | 'UPCOMING';

interface MonthlyRecord {
  month: string;
  monthIndex: number;
  date: string;
  amount: number;
  due: number;
  status: Status;
}

interface PaymentData {
  id?: number;
  unit_text: string;
  month_name: string;
  year_num: number;
  amount: number;
  due: number;
  paid_date: string;
}

interface ServiceChargeViewProps {
  lang?: 'bn' | 'en';
  selectedUnit: string | null;
  onUnitSelect: (unit: string | null) => void;
  showSummaryList: boolean;
  onSummaryToggle: (show: boolean) => void;
}

export const ServiceChargeView: React.FC<ServiceChargeViewProps> = ({ 
  lang = 'bn',
  selectedUnit,
  onUnitSelect,
  showSummaryList,
  onSummaryToggle
}) => {
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Supabase State
  const [dbData, setDbData] = useState<PaymentData[]>([]);
  const [unitsInfo, setUnitsInfo] = useState<Record<string, { is_occupied: boolean, note: string }>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [useMock, setUseMock] = useState<boolean>(false);

  // Admin State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [processingUpdate, setProcessingUpdate] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>('');

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editModalData, setEditModalData] = useState({
    unit: '',
    month: '',
    year: 2026,
    amount: 2000,
    due: 0,
    day: '1',
    monthName: 'জানুয়ারি',
    yearVal: '2026',
    isDateEnabled: true,
    status: 'PAID' as 'PAID' | 'DUE' | 'UPCOMING',
    isOccupied: true 
  });

  const t = TRANSLATIONS[lang];

  // Fetch data from Supabase
  const fetchData = async (showLoading = true, fetchUnitsInfo = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data: payData, error: payError } = await supabase
        .from('payments')
        .select('*')
        .eq('year_num', selectedYear);

      if (payError) throw payError;
      if (payData) setDbData(payData as PaymentData[]);

      if (fetchUnitsInfo) {
        const { data: uData, error: uError } = await supabase
          .from('units_info')
          .select('*');
        
        if (!uError && uData) {
            const mapping: Record<string, { is_occupied: boolean, note: string }> = {};
            uData.forEach((u: any) => {
                const key = u.year_num ? `${u.unit_text}-${u.year_num}` : u.unit_text;
                mapping[key] = { is_occupied: u.is_occupied, note: u.note || '' };
            });
            setUnitsInfo(mapping);
        }
      }
      setUseMock(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setUseMock(true);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const handleLogin = () => {
    if (pinInput === '1234') { 
      setIsAdmin(true);
      setShowLogin(false);
      setPinInput('');
    } else {
      alert('PIN Error!');
    }
  };

  const handleToggleOccupancy = async (unit: string | null) => {
    if (!unit || !isAdmin || processingUpdate) return;
    setProcessingUpdate(true);
    const yearKey = `${unit}-${selectedYear}`;
    const isOccupiedDefault = unit.slice(-1) !== 'B';
    const currentInfo = unitsInfo[yearKey] || unitsInfo[unit] || { is_occupied: isOccupiedDefault, note: '' };
    const newVal = !currentInfo.is_occupied;

    try {
        await supabase.from('units_info').upsert({ unit_text: unit, is_occupied: newVal, note: currentInfo.note, year_num: selectedYear }, { onConflict: 'unit_text,year_num' });
        await fetchData(false, true);
    } catch (err) {
        console.error("Error updating occupancy:", err);
    } finally {
        setProcessingUpdate(false);
    }
  };

  const startEditing = (unit: string, month: string) => {
    if (!isAdmin) return;
    const existing = dbData.find(d => d.unit_text === unit && d.month_name === month && d.year_num === selectedYear);
    setEditModalData({
      unit,
      month,
      year: selectedYear,
      amount: existing?.amount || 2000,
      due: existing?.due || 0,
      day: existing?.paid_date?.split(' ')[0] || '1',
      monthName: existing?.paid_date?.split(' ')[1] || month,
      yearVal: existing?.paid_date?.split(' ')[2] || selectedYear.toString(),
      isDateEnabled: !!existing?.paid_date,
      status: existing ? (existing.amount > 0 ? 'PAID' : (existing.due > 0 ? 'DUE' : 'UPCOMING')) : 'DUE',
      isOccupied: true
    });
    setIsEditModalOpen(true);
  };

  const handleModalSave = async () => {
    if (processingUpdate) return;
    setProcessingUpdate(true);
    const { unit, month, year, amount, due, day, monthName, yearVal, isDateEnabled, status } = editModalData;
    const paidDate = (isDateEnabled && status !== 'UPCOMING') ? `${day} ${monthName} ${yearVal}` : '';

    try {
      await supabase.from('payments').upsert({
        unit_text: unit,
        month_name: month,
        year_num: year,
        amount: status === 'UPCOMING' ? 0 : amount,
        due: status === 'UPCOMING' ? 0 : due,
        paid_date: paidDate
      }, { onConflict: 'unit_text,month_name,year_num' });
      await fetchData(false, false); 
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessingUpdate(false);
    }
  };

  const getUnitData = (unit: string): MonthlyRecord[] => {
    return MONTHS_LOGIC.map((month, index) => {
      const paymentRecord = dbData.find(d => d.unit_text === unit && d.month_name === month && d.year_num === selectedYear);
      const displayMonth = t.months[index];
      if (paymentRecord) {
        return {
          month: displayMonth,
          monthIndex: index,
          date: paymentRecord.paid_date || '-',
          amount: paymentRecord.amount,
          due: paymentRecord.due,
          status: paymentRecord.amount > 0 ? 'PAID' : (paymentRecord.due > 0 ? 'DUE' : 'UPCOMING')
        };
      }
      return { month: displayMonth, monthIndex: index, date: '-', amount: 0, due: 2000, status: 'DUE' };
    });
  };

  const allUnitsSummary = useMemo(() => {
    return ALL_UNITS.map(unit => {
        const records = getUnitData(unit);
        const collected = records.reduce((sum, r) => sum + (r.status === 'PAID' ? r.amount : 0), 0);
        const due = records.reduce((sum, r) => sum + r.due, 0);
        return { unit, collected, due };
    });
  }, [selectedYear, dbData, unitsInfo, lang]);

  const grandTotalCollected = allUnitsSummary.reduce((acc, curr) => acc + curr.collected, 0);
  const grandTotalDue = allUnitsSummary.reduce((acc, curr) => acc + curr.due, 0);

  const filteredUnitsData = allUnitsSummary.filter(data => 
    data.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedUnit) {
    const currentIndex = ALL_UNITS.indexOf(selectedUnit);
    const prevUnit = currentIndex > 0 ? ALL_UNITS[currentIndex - 1] : null;
    const nextUnit = currentIndex < ALL_UNITS.length - 1 ? ALL_UNITS[currentIndex + 1] : null;
    const records = getUnitData(selectedUnit);
    const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
    const totalDue = records.reduce((sum, r) => sum + r.due, 0);
    const yearKey = `${selectedUnit}-${selectedYear}`;
    const isOccupied = unitsInfo[yearKey]?.is_occupied ?? unitsInfo[selectedUnit]?.is_occupied ?? (selectedUnit.slice(-1) !== 'B'); 
    const unitNote = unitsInfo[yearKey]?.note || unitsInfo[selectedUnit]?.note || '';

    return (
      <div className="pb-24 bg-slate-50 dark:bg-slate-900 min-h-screen">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between px-4 py-3">
                 <button onClick={() => onUnitSelect(null)} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold">
                  <ArrowLeft size={20} /> <span>{t.back}</span>
                </button>
                <button onClick={() => isAdmin ? setIsAdmin(false) : setShowLogin(true)} className="p-2 text-slate-400">
                  {isAdmin ? <Unlock size={18} /> : <Lock size={18} />}
                </button>
            </div>
            <div className="flex items-center justify-between px-6 py-3">
                 <button onClick={() => prevUnit && onUnitSelect(prevUnit)} disabled={!prevUnit} className="p-2 text-slate-400"><ChevronLeft size={32} /></button>
                 <div className="text-center">
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white">{selectedUnit}</h2>
                    <p className="text-sm font-bold text-indigo-600">{FLAT_OWNERS.find(f => f.flat === selectedUnit)?.name || 'Unknown'}</p>
                 </div>
                 <button onClick={() => nextUnit && onUnitSelect(nextUnit)} disabled={!nextUnit} className="p-2 text-slate-400"><ChevronRight size={32} /></button>
            </div>
        </div>

        <div className="p-4 space-y-4">
            <div className="bg-indigo-600 rounded-2xl p-4 grid grid-cols-3 gap-2 divide-x divide-white/20 text-white shadow-lg">
                <div className="text-center">
                    <p className="text-[10px] opacity-80 uppercase mb-1">{t.occupancy}</p>
                    <p className="text-xs font-bold">{isOccupied ? t.occupied : t.vacant}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] opacity-80 uppercase mb-1">{t.totalAmount}</p>
                    <p className="font-bold">৳ {totalAmount.toLocaleString()}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] opacity-80 uppercase mb-1">{t.totalDue}</p>
                    <p className="font-bold">৳ {totalDue.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr className="border-b border-slate-100 dark:border-slate-600">
                            <th className="py-3 pl-3 text-left font-bold text-slate-500">{t.monthDate}</th>
                            <th className="py-3 text-center font-bold text-slate-500">{t.amount}</th>
                            <th className="py-3 pr-3 text-right font-bold text-slate-500">{t.status}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {records.map((r, idx) => (
                          <tr key={idx} onClick={() => isAdmin && startEditing(selectedUnit, MONTHS_LOGIC[r.monthIndex])} className="active:bg-slate-50">
                              <td className="py-3 pl-3">
                                  <div className="font-bold text-slate-800 dark:text-white">{r.month}</div>
                                  <div className="text-[10px] text-slate-400">{r.date}</div>
                              </td>
                              <td className="py-3 text-center font-semibold">৳{r.amount || r.due}</td>
                              <td className="py-3 pr-3 text-right">
                                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${r.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                      {r.status === 'PAID' ? t.paid : t.due}
                                  </span>
                              </td>
                          </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="flex justify-between items-center py-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t.serviceCharge}</h2>
        <button onClick={() => isAdmin ? setIsAdmin(false) : setShowLogin(true)} className="p-2 text-slate-400">
          {isAdmin ? <Unlock size={18} /> : <Lock size={18} />}
        </button>
      </div>

      {showSummaryList ? (
        <div className="space-y-4">
             <button onClick={() => onSummaryToggle(false)} className="flex items-center gap-2 text-slate-600 font-bold mb-4"><ArrowLeft size={20} /> {t.back}</button>
             <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="grid grid-cols-3 divide-x divide-white/20">
                    <div className="pr-4"><p className="text-[10px] opacity-80 uppercase mb-1">Units</p><p className="text-lg font-bold">{ALL_UNITS.length}</p></div>
                    <div className="px-4 text-center"><p className="text-[10px] opacity-80 uppercase mb-1">Collected</p><p className="text-lg font-bold">৳ {grandTotalCollected.toLocaleString()}</p></div>
                    <div className="pl-4 text-right"><p className="text-[10px] opacity-80 uppercase mb-1">Due</p><p className="text-lg font-bold">৳ {grandTotalDue.toLocaleString()}</p></div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-100 dark:border-slate-600"><th className="p-3 text-left">Unit</th><th className="p-3 text-center">Collected</th><th className="p-3 text-right">Due</th></tr></thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredUnitsData.map((data, idx) => (
                            <tr key={idx} onClick={() => onUnitSelect(data.unit)} className="active:bg-slate-50">
                                <td className="p-3 font-bold">{data.unit}</td>
                                <td className="p-3 text-center">৳{data.collected}</td>
                                <td className="p-3 text-right text-red-500 font-bold">৳{data.due}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      ) : (
        <div className="space-y-6">
            <div onClick={() => onSummaryToggle(true)} className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg cursor-pointer active:scale-95 transition-all">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><Wallet size={18} /> {t.allUnitsCalc}</h3>
                <div className="grid grid-cols-3 divide-x divide-white/20">
                    <div className="pr-4"><p className="text-[10px] opacity-80 uppercase mb-1">All</p><p className="text-lg font-bold">27</p></div>
                    <div className="px-4 text-center"><p className="text-[10px] opacity-80 uppercase mb-1">Collected</p><p className="text-lg font-bold">৳ {grandTotalCollected.toLocaleString()}</p></div>
                    <div className="pl-4 text-right"><p className="text-[10px] opacity-80 uppercase mb-1">Due</p><p className="text-lg font-bold">৳ {grandTotalDue.toLocaleString()}</p></div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {ALL_UNITS.map((u) => (
                <button key={u} onClick={() => onUnitSelect(u)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center shadow-sm active:scale-95 transition-all">
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{u}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{FLAT_OWNERS.find(f => f.flat === u)?.name.split(' ')[1] || '-'}</span>
                </button>
                ))}
            </div>
        </div>
      )}
      {showLogin && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs">
            <h3 className="text-lg font-bold mb-4">Admin Login</h3>
            <input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-4 py-3 mb-4 text-center text-2xl tracking-widest font-bold" placeholder="••••" maxLength={4} />
            <button onClick={handleLogin} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl">Login</button>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Update Payment</h3>
            <div className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['PAID', 'DUE', 'UPCOMING'].map(s => (
                  <button key={s} onClick={() => setEditModalData({...editModalData, status: s as Status})} className={`flex-1 py-2 text-xs font-bold rounded-lg ${editModalData.status === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{s}</button>
                ))}
              </div>
              <input type="number" value={editModalData.amount} onChange={(e) => setEditModalData({...editModalData, amount: Number(e.target.value)})} className="w-full bg-slate-50 border rounded-xl p-3 font-bold" placeholder="Amount" />
              <div className="flex gap-2">
                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button onClick={handleModalSave} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
