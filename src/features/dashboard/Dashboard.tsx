import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Matrículas Ativas" 
          value="1.240" 
          change="+4.2% em relação ao ano ant." 
          trend="up" 
        />
        <MetricCard 
          label="Inadimplência" 
          value="5.8%" 
          change="-1.2% meta do trimestre" 
          trend="down" 
        />
        <MetricCard 
          label="Receita Mensal (Out)" 
          value="R$ 452k" 
          change="+12% vs. mês anterior" 
          trend="up" 
        />
        <MetricCard 
          label="Aulas Realizadas" 
          value="98%" 
          change="Meta: 100% frequência docente" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Desempenho Financeiro por Curso</h3>
          </div>
          <div className="flex-1 p-8 flex items-end gap-6 justify-between h-[300px]">
            <Bar height="32" label="JAN" />
            <Bar height="48" label="FEV" />
            <Bar height="56" label="MAR" />
            <Bar height="44" label="ABR" />
            <Bar height="64" label="MAI" active />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Alertas Rápidos</h3>
          <div className="space-y-3">
             <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs">
                <p className="font-bold text-amber-800">Inadimplência</p>
                <p className="text-amber-700">8 alunos com mensalidade atrasada.</p>
             </div>
             <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs">
                <p className="font-bold text-blue-800">Notas</p>
                <p className="text-blue-700">6 turmas sem fechamento de notas.</p>
             </div>
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
