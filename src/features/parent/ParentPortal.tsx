import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  AlertCircle, 
  MessageSquare, 
  ChevronRight, 
  Hash,
  LogOut,
  User,
  MapPin,
  Clock
} from 'lucide-react';
import { firebaseService } from '../../lib/firebaseService';

interface ParentPortalProps {
  onLogout?: () => void;
  user?: any;
}

export default function ParentPortal({ onLogout, user }: ParentPortalProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<any>({});
  const [subjects, setSubjects] = useState<any[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

  React.useEffect(() => {
    const unsubStudents = firebaseService.subscribeToStudents("cm_school_123", (allStudents) => {
      const matches = allStudents.filter((s: any) => s.guardianCpf === user?.cpf);
      setStudents(matches);
      if (matches.length > 0 && !selectedStudent) {
        setSelectedStudent(matches[0]);
      }
      setLoading(false);
    });

    const unsubSchedules = firebaseService.subscribeToSchedules("cm_school_123", (allSchedules) => {
      setSchedules(allSchedules);
    });

    const unsubSubjects = firebaseService.subscribeToSubjects("cm_school_123", (allSubjects) => {
      setSubjects(allSubjects);
    });

    return () => {
      unsubStudents();
      unsubSchedules();
      unsubSubjects();
    };
  }, [user?.cpf]);

  React.useEffect(() => {
    if (selectedStudent) {
        if (schedules) updateTodaySchedule(selectedStudent.classId, schedules);
        
        // Fetch performance for selected student
        const fetchPerformance = async () => {
            const perf = await firebaseService.getStudentPerformance("cm_school_123", selectedStudent.id);
            setStudentPerformance(perf || []);
        };
        fetchPerformance();
    }
  }, [selectedStudent, schedules]);

  const updateTodaySchedule = (classId: string, allSchedules: any) => {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = dayNames[new Date().getDay()];
    const classSched = allSchedules[classId] || [];
    const filtered = classSched.filter((s: any) => s.day === today);
    setTodaySchedule(filtered.sort((a: any, b: any) => a.period - b.period));
  };

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student);
    updateTodaySchedule(student.classId, schedules);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400 italic animate-pulse">Autenticando vínculo familiar...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Header Parent - Modern & Clean */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm shadow-slate-200/20">
         <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20 font-black text-xl italic">R</div>
              <div>
                <h1 className="text-base font-black text-slate-900 tracking-tight leading-none mb-1">Escola<span className="text-blue-600">360</span> Pais</h1>
                <p className="text-[10px] text-emerald-600 uppercase font-black tracking-[0.2em] opacity-80">Portal da Família</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <button className="relative p-2.5 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-100 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
               </button>
               <div className="h-8 w-px bg-slate-100"></div>
               <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-slate-800">{user?.name || 'Responsável'}</p>
                    <button 
                      onClick={onLogout}
                      className="text-[10px] font-black text-rose-500 hover:text-rose-700 flex items-center gap-1 uppercase tracking-widest ml-auto"
                    >
                      <LogOut className="w-3 h-3" /> Sair
                    </button>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border-2 border-white shadow-inner flex items-center justify-center text-slate-400 font-bold">
                    {user?.name?.charAt(0) || 'R'}
                  </div>
               </div>
            </div>
         </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-8">
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Perfil do Aluno / Filho */}
           <div className="lg:col-span-1 space-y-6">
              {students.length > 1 && (
                <div className="space-y-2 mb-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alternar Aluno</label>
                  <select 
                    value={selectedStudent?.id}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none ring-2 ring-emerald-500/10 focus:ring-emerald-500 transition-all shadow-sm"
                  >
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 text-center relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600"></div>
                 <div className="w-24 h-24 bg-emerald-50 rounded-full mx-auto flex items-center justify-center text-emerald-600 text-3xl font-black mb-6 border-8 border-white shadow-2xl transition-transform group-hover:scale-105">
                   {selectedStudent?.name?.charAt(0) || 'A'}
                 </div>
                 <h3 className="font-black text-slate-900 text-lg tracking-tight">{selectedStudent?.name || 'Selecionar Aluno'}</h3>
                 <p className="text-[11px] font-bold text-slate-400 mb-8 uppercase tracking-widest">RA: {selectedStudent?.ra || 'N/A'}</p>
                 
                 <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-50/80 p-4 rounded-3xl border border-slate-50">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-xl"><User className="w-3.5 h-3.5 text-emerald-600" /></div>
                          <span className="text-[10px] font-black text-slate-500 uppercase">Presença</span>
                       </div>
                       <span className="text-xs font-black text-emerald-600">94.5%</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50/80 p-4 rounded-3xl border border-slate-50">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-xl"><TrendingUp className="w-3.5 h-3.5 text-blue-600" /></div>
                          <span className="text-[10px] font-black text-slate-500 uppercase">Média Geral</span>
                       </div>
                       <span className="text-xs font-black text-blue-600">8.7</span>
                    </div>
                 </div>
              </div>

              <div className="bg-[#0F172A] rounded-[2rem] shadow-2xl p-6 text-white">
                 <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Avisos da Escola</h4>
                    <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-black">NOVO</span>
                 </div>
                 <div className="space-y-4">
                    <div className="flex gap-4 group cursor-pointer">
                       <div className="w-1 h-12 bg-blue-500 rounded-full group-hover:bg-blue-400 transition-colors"></div>
                       <div>
                          <p className="text-xs font-bold leading-tight">Reunião de Pais e Mestres Presencial</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Sexta • 18:30</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Dashboard de Rendimento */}
           <div className="lg:col-span-3 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/20">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                           <Clock className="w-6 h-6" />
                        </div>
                        <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">Horário do Dia</h4>
                     </div>
                     <div className="space-y-3">
                        {todaySchedule.length > 0 ? todaySchedule.map((s, idx) => (
                           <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                              <span className="text-[10px] font-black text-slate-400">{s.period}º Período</span>
                              <span className="text-xs font-black text-slate-800">{s.subject}</span>
                              <span className="text-[9px] font-bold text-blue-600 uppercase italic opacity-60">{s.teacher}</span>
                           </div>
                        )) : (
                           <p className="text-xs text-slate-400 font-bold italic py-4 text-center">Nenhuma aula para hoje.</p>
                        )}
                     </div>
                  </div>
                  
                  <DashboardCard 
                     title="Diário de Faltas" 
                     icon={<Calendar className="w-6 h-6" />}
                     color="bg-amber-500 shadow-amber-500/20"
                     desc="Acompanhe as entradas, saídas e registros de frequência diária do seu filho."
                  />
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20">
                 <div className="flex justify-between items-center mb-10">
                    <div>
                      <h3 className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-3">
                         <BookOpen className="w-6 h-6 text-emerald-500" /> BOLETIM E NOTAS
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">Consulte o desempenho em tempo real por áreas do conhecimento.</p>
                    </div>
                    <button className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Ver Detalhes</button>
                 </div>
                 
                 <div className="space-y-6">
                    {subjects.length > 0 ? subjects.map((sub) => {
                      const perf = studentPerformance.find(p => p.subject === sub.name);
                      const grade = parseFloat(perf?.b2_grade || "0");
                      return (
                        <GradeRow key={sub.id} Subject={sub.name} Grade={grade} />
                      );
                    }) : (
                      <div className="flex flex-col items-center justify-center py-10 opacity-40">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <BookOpen className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nenhuma disciplina configurada</p>
                      </div>
                    )}
                    
                    {subjects.length > 0 && studentPerformance.length === 0 && (
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                        <p className="text-[10px] font-bold text-blue-600 uppercase">Notas em processamento pedagógico</p>
                      </div>
                    )}
                  </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                 <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/10">
                       <MessageSquare className="w-8 h-8 text-indigo-300" />
                    </div>
                    <div>
                       <h4 className="font-black text-xl tracking-tight">Canais de Atendimento</h4>
                       <p className="text-slate-400 text-sm mt-1">Fale diretamente com a secretaria ou coordenação.</p>
                    </div>
                 </div>
                 <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/25 transition-all active:scale-95 text-nowrap relative z-10">
                   Mensagem Direta
                 </button>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}

function DashboardCard({ title, icon, color, desc }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/20 hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-1">
       <div className={`w-16 h-16 ${color} text-white rounded-[1.5rem] flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <h4 className="font-black text-slate-900 text-lg mb-3 tracking-tight">{title}</h4>
       <p className="text-xs text-slate-500 leading-relaxed font-bold opacity-70 italic">{desc}</p>
    </div>
  );
}

function GradeRow({ Subject, Grade }: any) {
  return (
    <div className="flex items-center gap-8 group">
       <div className="flex-1">
          <div className="flex justify-between items-end mb-3">
             <span className="text-sm font-black text-slate-800 tracking-tight">{Subject}</span>
             <span className={`text-sm font-black p-1.5 rounded-lg ${Grade >= 7 ? 'text-emerald-600' : 'text-rose-600'}`}>{Grade.toFixed(1)}</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Grade * 10}%` }}
              className={`h-full rounded-full transition-all ${Grade >= 8 ? 'bg-blue-600' : Grade >= 6 ? 'bg-emerald-500' : 'bg-rose-500 shadow-inner'}`}
             />
          </div>
       </div>
       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${Grade >= 7 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
          <Hash className="w-5 h-5" />
       </div>
    </div>
  );
}
