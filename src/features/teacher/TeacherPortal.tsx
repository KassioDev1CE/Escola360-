import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  UserCheck, 
  FileText, 
  Calendar, 
  Plus, 
  Clock, 
  Save, 
  ChevronRight, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  AlertCircle,
  LogOut
} from 'lucide-react';

interface TeacherPortalProps {
  onLogout?: () => void;
}

export default function TeacherPortal({ onLogout }: TeacherPortalProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'grades' | 'content' | 'dashboard'>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
      {/* Sidebar Professor - Brutalist Dark Design */}
      <aside className="w-72 bg-[#0F172A] p-6 flex flex-col text-slate-400 shrink-0">
        <div className="flex items-center gap-4 text-white mb-10 pb-8 border-b border-white/5">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/20">
            P
          </div>
          <div>
            <span className="block font-black text-lg tracking-tighter leading-tight italic">EDUQUEST</span>
            <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Docente Pro</span>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <div className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">Principal</div>
          <TeacherNavItem active={activeTab === 'dashboard'} label="Dashboard" icon={<LayoutGrid className="w-4 h-4" />} onClick={() => setActiveTab('dashboard')} />
          <TeacherNavItem active={activeTab === 'attendance'} label="Diário / Frequência" icon={<UserCheck className="w-4 h-4" />} onClick={() => setActiveTab('attendance')} />
          <TeacherNavItem active={activeTab === 'content'} label="Planos de Aula" icon={<BookOpen className="w-4 h-4" />} onClick={() => setActiveTab('content')} />
          
          <div className="px-4 py-2 mt-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">Avaliação</div>
          <TeacherNavItem active={activeTab === 'grades'} label="Notas e Médias" icon={<FileText className="w-4 h-4" />} onClick={() => setActiveTab('grades')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="bg-white/5 p-4 rounded-2xl mb-4 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-700"></div>
              <div>
                <p className="text-xs font-bold text-white">Prof. Roberto Silva</p>
                <p className="text-[10px] text-slate-500 italic">Geografia / História</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair do Portal
            </button>
          </div>
        </div>
      </aside>

      {/* Main Teacher Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-8 py-6 border-b border-slate-200/60 flex justify-between items-center">
           <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {activeTab === 'dashboard' ? 'Visão Geral' : 
                 activeTab === 'attendance' ? 'Diário de Classe' :
                 activeTab === 'content' ? 'Planejamento' : 'Avaliações'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                 <p className="text-[10px] font-black text-slate-400 uppercase">Status do Período</p>
                 <p className="text-xs font-bold text-emerald-600">2º Bimestre Ativo</p>
              </div>
              <div className="h-10 w-px bg-slate-200"></div>
              <div className="flex items-center gap-3 bg-slate-900 px-5 py-3 rounded-2xl shadow-xl shadow-slate-900/10 transition-transform hover:scale-105 cursor-pointer">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-white text-xs font-black">PRÓX. AULA: 14:30</span>
              </div>
           </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <TeacherDashboard />}
              {activeTab === 'attendance' && <AttendanceView />}
              {activeTab === 'content' && <LessonPlanView />}
              {activeTab === 'grades' && (
                <div className="bg-white p-20 rounded-3xl border border-slate-200 text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700">Módulo de Lançamento de Notas</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">Este módulo será liberado pela secretaria acadêmica a partir do dia 15/05 para o fechamento do bimestre.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function TeacherNavItem({ active, icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all relative group ${
        active 
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
          : 'hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
        {icon}
      </div>
      {label}
      {active && (
        <motion.div 
          layoutId="active-pill" 
          className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"
        />
      )}
    </button>
  );
}

function TeacherDashboard() {
  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TeacherStatCard label="Aulas Hoje" value="06" sub="04 Realizadas" color="bg-blue-600" />
        <TeacherStatCard label="Faltas Registradas" value="12" sub="Abaixo da média" color="bg-rose-500" />
        <TeacherStatCard label="Turmas Ativas" value="04" sub="9º A, 9º B, 1º EM, 2º EM" color="bg-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" /> CRONOGRAMA DE HOJE
                </h3>
             </div>
             <div className="space-y-4">
                <ScheduleItem time="07:30 - 08:20" title="Geografia Física" classId="9º Ano A" status="done" />
                <ScheduleItem time="08:20 - 09:10" title="Geografia Física" classId="9º Ano A" status="done" />
                <ScheduleItem time="09:10 - 10:00" title="Geopolítica" classId="1º Ano EM" status="done" />
                <ScheduleItem time="10:20 - 11:10" title="Geopolítica" classId="1º Ano EM" status="done" />
                <ScheduleItem time="14:30 - 15:20" title="Plantão de Dúvidas" classId="Livre" status="pending" />
             </div>
           </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0F172A] p-6 rounded-3xl text-white shadow-2xl">
            <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Lembretes</h4>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-4">
                 <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500"></div>
                 <p className="text-xs font-medium leading-relaxed">Entregar diários do 9º B até amanhã às 17h para conferência.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-4">
                 <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500"></div>
                 <p className="text-xs font-medium leading-relaxed">Conselho de Classe agendado para o dia 22/05 - Prepare os relatórios.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherStatCard({ label, value, sub, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform`}></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <div className="flex items-end gap-3">
        <h4 className="text-4xl font-black text-slate-800 tracking-tighter">{value}</h4>
        <span className="text-[10px] font-bold text-slate-500 mb-2">{sub}</span>
      </div>
    </div>
  );
}

function ScheduleItem({ time, title, classId, status }: any) {
  return (
    <div className={`p-4 rounded-2xl border flex items-center justify-between group transition-all ${
      status === 'done' ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm hover:border-blue-400'
    }`}>
      <div className="flex items-center gap-6">
        <div className="w-24">
          <p className="text-[10px] font-black text-slate-400">{time}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{title}</p>
          <p className="text-[10px] font-medium text-slate-500">{classId}</p>
        </div>
      </div>
      {status === 'done' ? (
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase">
          <CheckCircle2 className="w-3 h-3" /> Finalizada
        </div>
      ) : (
        <div className="text-blue-600/20 group-hover:text-blue-600 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}

function AttendanceView() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/students').then(res => res.json()).then(data => setStudents(data.slice(0, 8)));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-8 border-b border-slate-100">
          <div className="space-y-4 flex-1 w-full">
            <h3 className="text-lg font-black text-slate-800">Lançamento de Frequência</h3>
            <div className="flex flex-wrap gap-3">
                <div className="min-w-[140px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Turma</label>
                  <select className="w-full bg-slate-100 border-none rounded-xl text-xs font-bold p-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                    <option>9º Ano A</option>
                    <option>1º Ano EM</option>
                  </select>
                </div>
                <div className="min-w-[200px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Tempo / Horário</label>
                  <select className="w-full bg-slate-100 border-none rounded-xl text-xs font-bold p-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                    <option>1º Tempo (07:30 - 08:20)</option>
                    <option>2º Tempo (08:20 - 09:10)</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Pesquisar Aluno</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Nome ou RA..." 
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20" 
                    />
                  </div>
                </div>
            </div>
          </div>
          <button className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-xs hover:bg-black transition-all flex items-center gap-2 shadow-2xl shadow-slate-900/10">
            <Save className="w-4 h-4" /> SALVAR CHAMADA
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(s => (
            <StudentAttendanceCard key={s.id} student={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentAttendanceCard({ student }: any) {
  const [status, setStatus] = useState<'p' | 'f' | 'j' | null>(null);

  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      status === 'p' ? 'bg-emerald-50/30 border-emerald-100 shadow-inner' : 
      status === 'f' ? 'bg-rose-50/30 border-rose-100 shadow-inner' :
      status === 'j' ? 'bg-amber-50/30 border-amber-100 shadow-inner' :
      'bg-slate-50/30 border-slate-100 shadow-sm'
    }`}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-colors ${
          status === 'p' ? 'bg-emerald-500 text-white' : 
          status === 'f' ? 'bg-rose-500 text-white' :
          status === 'j' ? 'bg-amber-500 text-white' : 'bg-white text-slate-400'
        }`}>
          {student.name.charAt(0)}
        </div>
        <div className="flex-1 truncate">
           <p className="text-xs font-black text-slate-800 truncate">{student.name}</p>
           <p className="text-[9px] font-bold text-slate-400 italic">RA: {student.ra}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
         <AttendanceBtn active={status === 'p'} label="PRES" color="bg-emerald-500" onClick={() => setStatus('p')} />
         <AttendanceBtn active={status === 'f'} label="FALT" color="bg-rose-500" onClick={() => setStatus('f')} />
         <AttendanceBtn active={status === 'j'} label="JUST" color="bg-amber-500" onClick={() => setStatus('j')} />
      </div>
    </div>
  );
}

function AttendanceBtn({ active, label, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`py-2 rounded-xl text-[9px] font-black transition-all border ${
        active 
          ? `${color} text-white border-transparent shadow-lg shadow-current/20` 
          : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  );
}

function LessonPlanView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-8">
            <Plus className="w-5 h-5 text-blue-500" /> NOVO REGISTRO DE AULA
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Data</label>
              <input type="date" className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Turma / Carga Horária</label>
              <div className="flex gap-2">
                 <select className="flex-1 p-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-slate-100">
                    <option>9º Ano A</option>
                    <option>1º Ano EM</option>
                 </select>
                 <select className="w-20 p-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-slate-100 text-center">
                    <option>1h</option>
                    <option>2h</option>
                 </select>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block ml-1 text-nowrap">Título do Conteúdo / BNCC</label>
            <input placeholder="Ex: [EF09GE01] Causas e consequências da fragmentação da URSS" className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-black outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div className="mb-8">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block ml-1">Desenvolvimento e Recursos</label>
            <textarea rows={6} className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-medium leading-relaxed outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500/20" placeholder="Descreva os tópicos abordados, metodologias e materiais utilizados..." />
          </div>
          <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10 uppercase tracking-widest">
            Protocolar no Diário Oficial
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-slate-800 text-sm tracking-tight uppercase">Últimos Registros</h3>
          <div className="flex gap-1">
             <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"><List className="w-3.5 h-3.5" /></button>
             <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400"><Filter className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 group cursor-pointer hover:border-blue-400 transition-all hover:shadow-xl hover:shadow-blue-500/5">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
               <span className="text-[10px] font-black">2{i}</span>
               <span className="text-[8px] font-black uppercase">ABR</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-slate-800 line-clamp-1">Dinâmica das Placas Tectônicas</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">9º Ano A • Geografia</p>
              <div className="mt-3 flex items-center gap-2">
                 <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-full border border-emerald-100">VALIDADO</span>
                 <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded-full border border-blue-100 italic">2 HORAS-AULA</span>
              </div>
            </div>
          </div>
        ))}
        <button className="w-full py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">
          Ver Todo o Histórico
        </button>
      </div>
    </div>
  );
}
