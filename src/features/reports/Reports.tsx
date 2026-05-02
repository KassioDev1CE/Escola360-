import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileBarChart, 
  Users, 
  UserCheck, 
  GraduationCap, 
  Calendar,
  School,
  Download,
  Filter,
  ArrowUpRight,
  UserCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../../lib/AuthContext';
import { firebaseService } from '../../lib/firebaseService';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

export default function Reports() {
  const { profile } = useAuth();
  const schoolId = profile?.schoolId || "";
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Security Check
  if (profile && profile.role !== 'admin' && profile.role !== 'director' && profile.role !== 'secretary') {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] border border-slate-200">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <FileBarChart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Acesso Restrito</h2>
        <p className="text-slate-500 mt-2 text-center max-w-sm">
          Apenas gestores e secretários possuem permissão para visualizar os relatórios consolidados da instituição.
        </p>
      </div>
    );
  }

  useEffect(() => {
    if (!schoolId) return;

    const unsubStudents = firebaseService.subscribeToStudents(schoolId, (data) => {
      setStudents(data);
      setLoading(false);
    });

    const unsubClasses = firebaseService.subscribeToClasses(schoolId, (data) => {
      setClasses(data);
    });

    return () => {
      unsubStudents();
      unsubClasses();
    };
  }, [schoolId]);

  // Calculations for charts
  const ageData = useMemo(() => {
    const ageMap: Record<number, number> = {};
    const now = new Date();
    
    students.forEach(s => {
      if (s.birthDate) {
        const birth = new Date(s.birthDate);
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
        
        ageMap[age] = (ageMap[age] || 0) + 1;
      }
    });

    return Object.entries(ageMap)
      .map(([age, count]) => ({ age: `${age} anos`, count }))
      .sort((a, b) => parseInt(a.age) - parseInt(b.age));
  }, [students]);

  const genderData = useMemo(() => {
    let m = 0, f = 0, o = 0;
    students.forEach(s => {
      if (s.gender === 'male' || s.gender === 'Masculino') m++;
      else if (s.gender === 'female' || s.gender === 'Feminino') f++;
      else o++;
    });
    return [
      { name: 'Masculino', value: m },
      { name: 'Feminino', value: f },
      { name: 'Outro', value: o }
    ].filter(v => v.value > 0);
  }, [students]);

  const classData = useMemo(() => {
    return classes.map(c => {
      const studentCount = students.filter(s => s.classId === c.id).length;
      return { 
        name: c.name, 
        vagas: c.capacity || 30, 
        ocupado: studentCount 
      };
    }).slice(0, 10);
  }, [classes, students]);

  if (loading) {
    return (
      <div className="p-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 font-bold text-slate-500">Gerando relatórios consolidados...</p>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, trend, color }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600`}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <FileBarChart className="w-10 h-10 text-indigo-600" />
            Relatórios e Analytics
          </h2>
          <p className="text-slate-500 font-medium">Acompanhamento demográfico e desempenho institucional.</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" />
            Filtrar Período
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Alunos" value={students.length} icon={<Users className="w-6 h-6" />} trend="+12%" color="indigo" />
        <StatCard title="Turmas Ativas" value={classes.length} icon={<School className="w-6 h-6" />} color="blue" />
        <StatCard title="Frequência Média" value="94.2%" icon={<UserCheck className="w-6 h-6" />} trend="+2.4%" color="emerald" />
        <StatCard title="Matrículas Novas" value="48" icon={<UserCircle className="w-6 h-6" />} trend="+8%" color="orange" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Age Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 text-lg">Distribuição por Idade</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">Censo Escolar</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 text-lg">Distribuição por Gênero</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">Demográfico</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Classes Occupancy */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 text-lg">Taxa de Ocupação das Turmas</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">Infraestrutura</span>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} width={120} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Bar dataKey="ocupado" name="Alunos Matriculados" fill="#6366f1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="vagas" name="Capacidade Total" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
