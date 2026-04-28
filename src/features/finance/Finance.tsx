import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Search, Filter } from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
}

export default function Finance() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/finance')
      .then(res => {
        if (!res.ok) {
            throw new Error(`Failed to fetch finance data: ${res.status}`);
        }
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const totalBalance = data.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Financeiro</h2>
        <div className="flex gap-2">
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4" /> Receita
            </button>
            <button className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4" /> Despesa
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-200">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Saldo Geral</p>
            <p className="text-3xl font-bold">R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
               <TrendingUpIcon className="w-4 h-4" />
               <span>+8.2% em relação a Março</span>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Receitas (Mês)</p>
            <p className="text-2xl font-bold text-emerald-600">R$ 15.420,00</p>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Despesas (Mês)</p>
            <p className="text-2xl font-bold text-rose-500">R$ 4.280,00</p>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
           <div className="relative max-w-xs flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Filtrar transações..." className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg" />
           </div>
           <button className="p-2 border rounded-lg text-slate-400 hover:text-slate-600">
             <Filter className="w-4 h-4" />
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left border-b border-slate-100 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
                <th className="px-6 py-3 uppercase">Data</th>
                <th className="px-6 py-3 uppercase">Descrição</th>
                <th className="px-6 py-3 uppercase">Tipo</th>
                <th className="px-6 py-3 uppercase">Valor</th>
                <th className="px-6 py-3 uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map(item => (
                <tr key={item.id} className="text-sm text-slate-600">
                   <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                   <td className="px-6 py-4 font-medium text-slate-800">{item.description}</td>
                   <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                         {item.type === 'INCOME' ? 'ENTRADA' : 'SAÍDA'}
                      </span>
                   </td>
                   <td className={`px-6 py-4 font-bold ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </td>
                   <td className="px-6 py-4 text-right">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Efetivado" />
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

function TrendingUpIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
