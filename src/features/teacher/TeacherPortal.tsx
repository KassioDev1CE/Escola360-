import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, UserCheck, FileText, Calendar, Plus, Clock, Save, ChevronRight } from 'lucide-react';

export default function TeacherPortal() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'grades' | 'content'>('attendance');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Professor */}
      <aside className="w-64 bg-slate-900 p-6 flex flex-col text-slate-400">
        <div className="flex items-center gap-3 text-white mb-10 pb-6 border-b border-white/10">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">P</div>
          <span className="font-bold tracking-tight">Área do Docente</span>
        </div>

        <nav className="space-y-1 flex-1">
          <TeacherNavItem active={activeTab === 'attendance'} label="Frequência" icon={<UserCheck className="w-4 h-4" />} onClick={() => setActiveTab('attendance')} />
          <TeacherNavItem active={activeTab === 'grades'} label="Notas e Avaliações" icon={<FileText className="w-4 h-4" />} onClick={() => setActiveTab('grades')} />
          <TeacherNavItem active={activeTab === 'content'} label="Conteúdo / Plano" icon={<BookOpen className="w-4 h-4" />} onClick={() => setActiveTab('content')} />
        </nav>

        <button 
          onClick={() => window.location.reload()}
          className="mt-auto py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all"
        >
          Sair do Portal
        </button>
      </aside>

      {/* Main Teacher Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
           <div>
              <h2 className="text-2xl font-bold text-slate-800">Olá, Prof. Roberto</h2>
              <p className="text-sm text-slate-500">9º Ano A • Geografia • Terça-feira, 28 Abr</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-600">
                <Clock className="w-4 h-4 text-blue-500" />
                Próxima Aula: 14h30
              </div>
           </div>
        </header>

        {activeTab === 'attendance' && <AttendanceView />}
        {activeTab === 'content' && <LessonPlanView />}
        {activeTab === 'grades' && (
          <div className="p-20 text-center">
            <h3 className="text-slate-400 font-medium">Módulo de Notas em Desenvolvimento</h3>
          </div>
        )}
      </main>
    </div>
  );
}

function TeacherNavItem({ active, icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function AttendanceView() {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/students').then(res => res.json()).then(data => setStudents(data.slice(0, 5)));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-end">
        <div className="space-y-2">
           <label className="text-[10px] font-bold text-slate-400 uppercase">Selecione a Turma</label>
           <div className="flex items-center gap-2">
              <select className="bg-slate-50 border-none rounded-lg text-sm font-bold p-2">
                <option>9º Ano A</option>
                <option>1º Ano Médio</option>
              </select>
              <select className="bg-slate-50 border-none rounded-lg text-sm font-bold p-2">
                <option>1º Tempo (07:30 - 08:20)</option>
                <option>2º Tempo (08:20 - 09:10)</option>
              </select>
           </div>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2">
          <Save className="w-4 h-4" /> Finalizar Chamada
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
              <th className="px-6 py-4">Estudante</th>
              <th className="px-6 py-4 text-center">Status de Frequência</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map(s => (
              <tr key={s.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">{s.name.charAt(0)}</div>
                    <span className="text-sm font-bold text-slate-700">{s.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex justify-center gap-2">
                      <button className="px-4 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all">Presente</button>
                      <button className="px-4 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100 hover:bg-rose-600 hover:text-white transition-all">Falta</button>
                      <button className="px-4 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-bold border border-amber-100">Justificado</button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LessonPlanView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" /> Registrar Aula
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Data da Atividade</label>
            <input type="date" className="w-full mt-1 p-2 bg-slate-50 border-none rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Conteúdo Trabalhado / Título</label>
            <input placeholder="Ex: Dinâmica das Populações" className="w-full mt-1 p-2 bg-slate-50 border-none rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição Detalhada</label>
            <textarea rows={4} className="w-full mt-1 p-2 bg-slate-50 border-none rounded-lg text-sm" placeholder="O que foi abordado em sala..." />
          </div>
          <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all">
            Salvar no Diário
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 ml-2">Histórico Recente</h3>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                 <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Placas Tectônicas</p>
                <p className="text-[10px] text-slate-400">24 de Abril • 9º Ano A</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}
