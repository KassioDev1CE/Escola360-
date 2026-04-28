import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, TrendingUp, Calendar, BookOpen, AlertCircle, MessageSquare, ChevronRight, Hash } from 'lucide-react';

export default function ParentPortal() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Parent */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
         <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 font-bold">R</div>
              <div>
                <h1 className="text-sm font-bold text-slate-800">EduQuest Pais</h1>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Acompanhamento Escolar</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <button className="relative p-2 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
               </button>
               <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white"></div>
               <button onClick={() => window.location.reload()} className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1">Sair</button>
            </div>
         </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-8">
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Perfil do Aluno / Filho */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
                 <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center text-blue-600 text-2xl font-bold mb-4 border-4 border-white shadow-xl">
                   AB
                 </div>
                 <h3 className="font-bold text-slate-800">Ana Beatriz</h3>
                 <p className="text-xs text-slate-400 mb-6 tracking-wide">RA: 2024001 • 9º Ano A</p>
                 
                 <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                       <span className="text-[10px] font-bold text-slate-500 uppercase">Presença</span>
                       <span className="text-xs font-bold text-emerald-600">94.5%</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                       <span className="text-[10px] font-bold text-slate-500 uppercase">Média Geral</span>
                       <span className="text-xs font-bold text-blue-600">8.7</span>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                 <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase">Avisos Recentes</h4>
                    <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">2</span>
                 </div>
                 <div className="divide-y divide-slate-100">
                    <AnnouncementItem 
                      title="Reunião de Pais" 
                      date="Sexta • 18h" 
                      urgent 
                    />
                    <AnnouncementItem 
                      title="Feriado Antecipado" 
                      date="Próx. Segunda" 
                    />
                 </div>
              </div>
           </div>

           {/* Dashboard de Rendimento */}
           <div className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <DashboardCard 
                    title="Boletim On-line" 
                    icon={<BookOpen className="w-6 h-6" />}
                    color="bg-blue-600"
                    desc="Confira as notas de todas as disciplinas e bimestres."
                 />
                 <DashboardCard 
                    title="Frequência Diária" 
                    icon={<Calendar className="w-6 h-6" />}
                    color="bg-amber-500"
                    desc="Veja os registros de presença e atrasos do mês."
                 />
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                       <TrendingUp className="w-5 h-5 text-emerald-500" /> Desempenho por Matéria
                    </h3>
                    <button className="text-xs font-bold text-blue-600 hover:underline">Ver Detalhado</button>
                 </div>
                 
                 <div className="space-y-6">
                    <GradeRow Subject="Português" Grade={8.5} Trend="up" />
                    <GradeRow Subject="Matemática" Grade={9.2} Trend="up" />
                    <GradeRow Subject="História" Grade={7.8} Trend="down" />
                    <GradeRow Subject="Geografia" Grade={9.0} Trend="up" />
                 </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-3xl text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                       <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                       <h4 className="font-bold">Dúvidas com a Secretaria?</h4>
                       <p className="text-slate-400 text-sm">Responda seus comunicados ou inicie um chat direto.</p>
                    </div>
                 </div>
                 <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all active:scale-95 text-nowrap">
                   Abrir Chamado
                 </button>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}

function AnnouncementItem({ title, date, urgent }: any) {
  return (
    <div className={`p-4 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${urgent ? 'border-l-2 border-rose-500' : ''}`}>
      <div className={`w-2 h-2 rounded-full ${urgent ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`}></div>
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-700">{title}</p>
        <p className="text-[10px] text-slate-400">{date}</p>
      </div>
      <ChevronRight className="w-3 h-3 text-slate-300" />
    </div>
  );
}

function DashboardCard({ title, icon, color, desc }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
       <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-current/30 group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <h4 className="font-bold text-slate-800 mb-2">{title}</h4>
       <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function GradeRow({ Subject, Grade, Trend }: any) {
  return (
    <div className="flex items-center gap-6 group">
       <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
             <span className="text-sm font-bold text-slate-700">{Subject}</span>
             <span className="text-sm font-black text-slate-900">{Grade.toFixed(1)}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Grade * 10}%` }}
              className={`h-full rounded-full transition-all ${Grade >= 7 ? 'bg-emerald-500' : 'bg-rose-500'}`}
             />
          </div>
       </div>
       <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${Trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          <Hash className="w-4 h-4" />
       </div>
    </div>
  );
}
