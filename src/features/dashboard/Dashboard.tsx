import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, School } from 'lucide-react';

export default function Dashboard() {
  const [schoolName, setSchoolName] = useState("Escola360");
  const [stats, setStats] = useState<any>({
    activeStudents: 0,
    teachersCount: 0,
    classesCount: 0,
    income: 0,
    balance: 0,
    alerts: []
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('school_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      if (config.schoolName) setSchoolName(config.schoolName);
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg backdrop-blur-sm">
              <School className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Painel Administrativo</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Bem-vindo, Gestor</h2>
          <p className="text-slate-400 text-sm max-w-lg">Você está gerenciando o <strong>{schoolName}</strong>. Confira os indicadores chave de hoje e as pendências da secretaria.</p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent"></div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Matrículas Ativas" 
          value={stats.activeStudents.toString()} 
          change="Total de alunos no sistema" 
        />
        <MetricCard 
          label="Turmas Ativas" 
          value={stats.classesCount.toString()} 
          change="Turmas cadastradas" 
        />
        <MetricCard 
          label="Docentes" 
          value={stats.teachersCount.toString()} 
          change="Corpo docente ativo" 
        />
        <MetricCard 
          label="Saldo em Caixa" 
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.balance)} 
          change="Saldo financeiro atual" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-8 items-center justify-center min-h-[300px]">
           <div className="text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <School className="w-8 h-8" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Gráficos de Desempenho</p>
              <p className="text-slate-500 text-sm mt-1">Dados insuficientes para gerar visualizações.</p>
           </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Alertas Rápidos</h3>
          <div className="space-y-3">
             {stats.alerts.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Nenhum alerta</p>
                </div>
             ) : (
               stats.alerts.map((alert: any, idx: number) => (
                 <div key={idx} className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs">
                    <p className="font-bold text-blue-800">{alert.title}</p>
                    <p className="text-blue-700">{alert.desc}</p>
                 </div>
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, trend }: { label: string, value: string, change: string, trend?: 'up' | 'down' }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"
    >
      <p className="text-slate-500 text-xs font-semibold uppercase mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
        trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-500' : 'text-slate-400'
      }`}>
        {trend === 'up' && <TrendingUp className="w-3 h-3" />}
        {trend === 'down' && <TrendingDown className="w-3 h-3" />}
        {change}
      </div>
    </motion.div>
  );
}

function Bar({ height, label, active }: { height: string, label: string, active?: boolean }) {
  return (
    <div className="flex-1 flex flex-col gap-2 group cursor-pointer h-full justify-end">
      <motion.div 
        initial={{ height: 0 }}
        animate={{ height: `${height}%` }}
        className={`${active ? 'bg-blue-600' : 'bg-blue-500'} w-full rounded-t transition-all group-hover:bg-blue-400`} 
      />
      <p className={`text-center text-[10px] mt-2 ${active ? 'font-bold text-slate-700' : 'text-slate-400'}`}>{label}</p>
    </div>
  );
}
