import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, GraduationCap, Users, ArrowRight, School } from 'lucide-react';

interface PortalProps {
  onSelectRole: (role: 'admin' | 'teacher' | 'parent') => void;
}

export default function Portal({ onSelectRole }: PortalProps) {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('school_config');
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-left-top bg-no-repeat" style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)' }}>
      <div className="max-w-5xl w-full">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center gap-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <School className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">EduQuest <span className="text-blue-600">SGE</span></h1>
            </div>
            {config?.schoolName && (
               <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                  {config.schoolName}
               </div>
            )}
          </motion.div>
          <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Bem-vindo ao Portal Educacional</h2>
          <p className="text-slate-500 mt-4 text-lg">Selecione seu perfil para acessar as funcionalidades específicas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <RoleCard 
            title="Administrativo"
            desc="Gestão acadêmica, financeira e documentos oficiais da instituição."
            icon={<ShieldCheck className="w-8 h-8" />}
            color="bg-blue-600"
            onClick={() => onSelectRole('admin')}
          />
          <RoleCard 
            title="Professor"
            desc="Lançamento de notas, frequências, planos de aula e diário de classe."
            icon={<GraduationCap className="w-8 h-8" />}
            color="bg-indigo-600"
            onClick={() => onSelectRole('teacher')}
          />
          <RoleCard 
            title="Responsável"
            desc="Acompanhamento de desempenho, avisos e vida escolar do aluno."
            icon={<Users className="w-8 h-8" />}
            color="bg-emerald-600"
            onClick={() => onSelectRole('parent')}
          />
        </div>

        <div className="mt-20 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">
          Sistema de Gestão Escolar Profissional • v2.0.4
        </div>
      </div>
    </div>
  );
}

function RoleCard({ title, desc, icon, color, onClick }: { title: string, desc: string, icon: React.ReactNode, color: string, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      onClick={onClick}
      className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer group"
    >
      <div className={`w-16 h-16 ${color} text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-8 h-12">{desc}</p>
      
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
        Acessar Área <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}
