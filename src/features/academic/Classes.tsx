import React, { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, School, Users, MapPin, Hash, Edit, CalendarDays, Clock, Save, Trash2, X } from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
  year: number;
  room: string;
  shift: string;
  startTime: string;
  endTime: string;
  days: string[];
}

interface ScheduleSlot {
  day: string;
  period: number;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
}

export default function Classes() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [selectedClassForSchedule, setSelectedClassForSchedule] = useState<ClassData | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleSlot[]>([]);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    year: 2024, 
    room: '', 
    shift: '', 
    startTime: '', 
    endTime: '', 
    days: [] as string[] 
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      if (!res.ok) {
        console.error('Failed to fetch classes', res.status);
        return;
      }
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const openScheduleManager = async (c: ClassData) => {
    try {
      setSelectedClassForSchedule(c);
      const res = await fetch(`/api/schedules?classId=${c.id}`);
      if (!res.ok) {
        console.error('Failed to fetch schedules', res.status);
        return;
      }
      const data = await res.json();
      setScheduleData(data || []);
      setIsScheduleModalOpen(true);
    } catch (error) {
      console.error('Error opening schedule manager:', error);
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedClassForSchedule) return;
    const res = await fetch(`/api/schedules/${selectedClassForSchedule.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData),
    });
    if (res.ok) {
      setIsScheduleModalOpen(false);
    }
  };

  const updateSlot = (day: string, period: number, field: keyof ScheduleSlot, value: any) => {
    setScheduleData(prev => {
      const existingIdx = prev.findIndex(s => s.day === day && s.period === period);
      if (existingIdx >= 0) {
        const newData = [...prev];
        newData[existingIdx] = { ...newData[existingIdx], [field]: value };
        return newData;
      }
      return [...prev, { day, period, subject: '', teacher: '', startTime: '', endTime: '', [field]: value }];
    });
  };

  const getSlot = (day: string, period: number) => {
    return scheduleData.find(s => s.day === day && s.period === period) || { subject: '', teacher: '' };
  };

  const handleEdit = (c: ClassData) => {
    setEditingClass(c);
    setFormData({
      name: c.name,
      year: c.year,
      room: c.room,
      shift: c.shift || '',
      startTime: c.startTime || '',
      endTime: c.endTime || '',
      days: c.days || []
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingClass ? `/api/classes/${editingClass.id}` : '/api/classes';
    const method = editingClass ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsModalOpen(false);
      setEditingClass(null);
      resetForm();
      fetchClasses();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', year: 2024, room: '', shift: '', startTime: '', endTime: '', days: [] });
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day) 
        : [...prev.days, day]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Turmas & Salas</h2>
          <p className="text-sm text-slate-500">Gerenciamento de horários e alocação física</p>
        </div>
        <button 
          onClick={() => { setEditingClass(null); resetForm(); setIsModalOpen(true); }}
          className="bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nova Turma
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((c) => (
          <motion.div 
            key={c.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 group hover:shadow-md transition-shadow relative"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <School className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded text-slate-500 uppercase tracking-wider">{c.year}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                  c.shift === 'Manhã' ? 'bg-amber-50 text-amber-600' : 
                  c.shift === 'Tarde' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                }`}>
                  {c.shift || 'N/A'}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{c.name}</h3>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{c.room}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" />
                  <span>{c.startTime} - {c.endTime}</span>
                </div>
              </div>
              <div className="flex gap-1 mt-3">
                 {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                   <span key={d} className={`text-[9px] px-1.5 py-0.5 rounded ${c.days?.includes(d) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                     {d}
                   </span>
                 ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                 <Users className="w-4 h-4" />
                 <span>30 alunos</span>
               </div>
               <div className="flex items-center gap-2">
                 <button 
                  onClick={() => handleEdit(c)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Editar Turma"
                 >
                   <Edit className="w-4 h-4" />
                 </button>
                 <button 
                  onClick={() => openScheduleManager(c)}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                  title="Gerenciar Horários"
                 >
                   <CalendarDays className="w-4 h-4" />
                 </button>
                 <button className="text-indigo-600 text-xs font-bold hover:underline">Ver Diário</button>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Schedule Manager Modal */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsScheduleModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl p-10 max-h-[92vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                     <CalendarDays className="w-8 h-8" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Grade Horária: {selectedClassForSchedule?.name}</h3>
                      <p className="text-slate-500 font-medium text-sm">Defina até 10 períodos diários para esta turma</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={handleSaveSchedule}
                    className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-xs hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10 uppercase tracking-widest"
                   >
                     <Save className="w-4 h-4" /> Salvar Grade
                   </button>
                   <button 
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="p-3 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl transition-colors"
                   >
                     <X className="w-6 h-6" />
                   </button>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto custom-scrollbar overflow-y-auto pb-6">
                <table className="w-full border-collapse min-w-[1000px]">
                  <thead>
                    <tr>
                      <th className="sticky top-0 z-10 bg-white p-4 border-b border-slate-100 text-left w-20"></th>
                      {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map(day => (
                        <th key={day} className="sticky top-0 z-10 bg-white p-4 border-b border-slate-100 text-center font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }).map((_, periodIdx) => (
                      <tr key={periodIdx} className="group transition-colors hover:bg-slate-50/50">
                        <td className="p-4 border-b border-slate-50 text-center font-black text-slate-300 text-xs italic">
                          {periodIdx + 1}º
                        </td>
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex'].map(dayShort => {
                          const slot = getSlot(dayShort, periodIdx + 1);
                          return (
                            <td key={dayShort} className="p-2 border-b border-slate-50 min-w-[180px]">
                              <div className="space-y-2">
                                <select 
                                  value={slot.subject}
                                  onChange={e => updateSlot(dayShort, periodIdx + 1, 'subject', e.target.value)}
                                  className="w-full bg-slate-50 border-none rounded-xl text-[11px] font-black p-2 outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                  <option value="">Disciplina...</option>
                                  <option value="Português">Português</option>
                                  <option value="Matemática">Matemática</option>
                                  <option value="História">História</option>
                                  <option value="Geografia">Geografia</option>
                                  <option value="Biologia">Biologia</option>
                                  <option value="Física">Física</option>
                                  <option value="Química">Química</option>
                                  <option value="Inglês">Inglês</option>
                                  <option value="Artes">Artes</option>
                                  <option value="Ed. Física">Ed. Física</option>
                                </select>
                                <select 
                                  value={slot.teacher}
                                  onChange={e => updateSlot(dayShort, periodIdx + 1, 'teacher', e.target.value)}
                                  className="w-full bg-slate-50 border-none rounded-xl text-[10px] font-bold p-2 outline-none italic text-slate-500"
                                >
                                  <option value="">Professor...</option>
                                  <option value="Roberto Silva">Prof. Roberto Silva</option>
                                  <option value="Maria Oliveira">Profª Maria Oliveira</option>
                                  <option value="João Santos">Prof. João Santos</option>
                                  <option value="Fernanda Lima">Profª Fernanda Lima</option>
                                </select>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingClass ? 'Editar Turma' : 'Cadastrar Turma'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Turma *</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Ex: 9º Ano A"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ano Letivo *</label>
                  <input 
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sala / Ambiente *</label>
                  <input 
                    required
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    placeholder="Sala 101"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Período de Funcionamento</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Turno</label>
                    <select 
                      value={formData.shift} 
                      onChange={e => setFormData({...formData, shift: e.target.value})}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    >
                      <option value="">Selecione</option>
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noite">Noite</option>
                      <option value="Integral">Integral</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Início</label>
                    <input 
                      type="time" 
                      value={formData.startTime} 
                      onChange={e => setFormData({...formData, startTime: e.target.value})}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Término</label>
                    <input 
                      type="time" 
                      value={formData.endTime} 
                      onChange={e => setFormData({...formData, endTime: e.target.value})}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dias de Aula</label>
                 <div className="flex flex-wrap gap-2">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                      <div 
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          formData.days.includes(day) 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                 >
                   Cancelar
                 </button>
                 <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-xl active:scale-[0.98]">
                  {editingClass ? 'Salvar Alterações' : 'Criar Turma'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
