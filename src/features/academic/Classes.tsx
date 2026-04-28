import React, { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Plus, School, Users, MapPin, Hash, Edit } from 'lucide-react';

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

export default function Classes() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
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
    const res = await fetch('/api/classes');
    const data = await res.json();
    setClasses(data);
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
                 <button className="text-indigo-600 text-xs font-bold hover:underline">Ver Diário</button>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

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
