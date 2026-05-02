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
  UserCircle,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

// Helper to convert Firestore Timestamp or string to Date
const toDate = (val: any) => {
  if (!val) return null;
  if (val.toDate && typeof val.toDate === 'function') return val.toDate(); // Firestore Timestamp
  if (val instanceof Date) return val;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

export default function Reports() {
  const { profile } = useAuth();
  const schoolId = profile?.schoolId || "";
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
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

  const [activeTab, setActiveTab] = useState('graficos');
  const [expandedMap, setExpandedMap] = useState(false);
  const [expandedCenso, setExpandedCenso] = useState(false);

  useEffect(() => {
    if (!schoolId) return;

    const unsubStudents = firebaseService.subscribeToStudents(schoolId, (data) => {
      setStudents(data);
      setLoading(false);
    });

    const unsubClasses = firebaseService.subscribeToClasses(schoolId, (data) => {
      setClasses(data);
    });

    const unsubTeachers = firebaseService.subscribeToTeachers(schoolId, (data) => {
      setTeachers(data);
    });

    const unsubGrades = firebaseService.subscribeToGrades(schoolId, (data) => {
      setGrades(data);
    });

    const unsubAttendance = firebaseService.subscribeToAttendance(schoolId, (data) => {
      setAttendance(data);
    });

    return () => {
      unsubStudents();
      unsubClasses();
      unsubTeachers();
      unsubGrades();
      unsubAttendance();
    };
  }, [schoolId]);

  // Calculations for charts
  const ageData = useMemo(() => {
    const ageMap: Record<number, number> = {};
    const now = new Date();
    
    students.forEach(s => {
      const bDate = toDate(s.birthDate);
      if (bDate) {
        let age = now.getFullYear() - bDate.getFullYear();
        const m = now.getMonth() - bDate.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < bDate.getDate())) age--;
        
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
      const g = (s.gender || '').toLowerCase();
      if (g === 'male' || g === 'masculino') m++;
      else if (g === 'female' || g === 'feminino') f++;
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

  // Helper for census date (Last Wednesday of May)
  const censusBaseDate = useMemo(() => {
    const year = new Date().getFullYear();
    const date = new Date(year, 4, 31); // Start from May 31 (month is 0-indexed, so 4 is May)
    while (date.getDay() !== 3) { // 3 is Wednesday
      date.setDate(date.getDate() - 1);
    }
    date.setHours(23, 59, 59, 999);
    return date;
  }, []);

  // Helper for filtered report lists
  const filteredStudents = useMemo(() => {
    switch (activeTab) {
      case 'alunos': return students;
      case 'transfers': return students.filter(s => s.status === 'Transferido' || s.status === 'Em Transferência');
      case 'bolsas': return students.filter(s => s.socialProgram === 'yes' || s.scholarship);
      case 'map-deficiencia': return students.filter(s => s.disabilities && s.disabilities.length > 0);
      case 'map-doencas': return students.filter(s => s.healthConditions && s.healthConditions.length > 0);
      case 'map-transporte': return students.filter(s => s.publicTransport);
      case 'map-enturmacao': return students.filter(s => s.classId);
      case 'map-raca': return students.filter(s => s.ethnicity && s.ethnicity !== 'Não Informado');
      case 'census-initial': 
        return students.filter(s => {
          const created = toDate(s.createdAt);
          if (!created) return true; // Default to census if no date
          return created <= censusBaseDate;
        });
      case 'census-admitted':
        return students.filter(s => {
          const created = toDate(s.createdAt);
          if (!created) return false;
          return created > censusBaseDate;
        });
      default: return students;
    }
  }, [students, activeTab, censusBaseDate]);

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

  const ReportTable = ({ data, columns }: { data: any[], columns: any[] }) => (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 font-medium">
                  Nenhum registro encontrado para este relatório.
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      {col.render ? col.render(item) : (
                        <span className="text-sm font-bold text-slate-600">{item[col.key]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Real data for performance monitoring
  const performanceTrends = useMemo(() => {
    const bimestres = ['1º Bim', '2º Bim', '3º Bim', '4º Bim'];
    return bimestres.map(bim => {
      const bimKey = bim.charAt(0); // '1', '2', '3', '4'
      const bimGrades = grades.filter(g => g[`b${bimKey}_grade`]);
      const total = bimGrades.length;
      const approved = bimGrades.filter(g => parseFloat(g[`b${bimKey}_grade`]) >= 6).length;
      
      const aprova = total > 0 ? (approved / total) * 100 : 0;
      const reprova = total > 0 ? 100 - aprova : 0;
      
      return { 
        name: bim, 
        aprova: parseFloat(aprova.toFixed(1)), 
        reprova: parseFloat(reprova.toFixed(1)),
        total
      };
    });
  }, [grades]);

  // Helper for dashboard overview stats
  const dashboardStats = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const newStudents = students.filter(s => {
      const created = toDate(s.createdAt);
      return created && created > lastMonth;
    }).length;

    const totalAttendance = attendance.length;
    const presents = attendance.filter(a => a.status === 'present').length;
    const avgAttendance = totalAttendance > 0 ? ((presents / totalAttendance) * 100).toFixed(1) : '0';

    return {
      totalStudents: students.length,
      activeClasses: classes.length,
      avgAttendance: avgAttendance + '%',
      newEnrollments: newStudents
    };
  }, [students, classes, attendance]);

  const renderContent = () => {
    switch (activeTab) {
      case 'graficos':
        return (
          <motion.div 
            key="dash"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                  Visão Geral Analítica
                </h2>
                <p className="text-slate-500 font-medium">Acompanhamento demográfico e desempenho institucional.</p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Exportar Relatório
                </button>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total de Alunos" value={dashboardStats.totalStudents} icon={<Users className="w-6 h-6" />} color="indigo" />
              <StatCard title="Turmas Ativas" value={dashboardStats.activeClasses} icon={<School className="w-6 h-6" />} color="blue" />
              <StatCard title="Frequência Média" value={dashboardStats.avgAttendance} icon={<UserCheck className="w-6 h-6" />} color="emerald" />
              <StatCard title="Matrículas Novas (30d)" value={dashboardStats.newEnrollments} icon={<UserCircle className="w-6 h-6" />} color="orange" />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Performance Trend */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm col-span-full">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">Evolução do Desempenho</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Média de Aprovação por Bimestre</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase">Aprovação</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase">Reprovação</span>
                    </div>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceTrends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', shadow: 'none' }}
                        formatter={(value: any) => [`${value}%`]}
                      />
                      <Area type="monotone" dataKey="aprova" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={3} />
                      <Area type="monotone" dataKey="reprova" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

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
            </div>
          </motion.div>
        );
      
      case 'alunos':
      case 'transfers':
      case 'bolsas':
      case 'map-deficiencia':
      case 'map-doencas':
      case 'map-transporte':
      case 'map-enturmacao':
      case 'map-raca':
      case 'census-initial':
      case 'census-admitted':
        return (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800">{getTabLabel(activeTab)}</h2>
                {activeTab.startsWith('census') && (
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    Data Base Censo: {censusBaseDate.toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <p className="text-xs font-bold text-slate-400">{filteredStudents.length} registros encontrados</p>
            </div>
            <ReportTable 
              data={filteredStudents}
              columns={[
                { header: 'Matrícula', key: 'registration' },
                { header: 'Nome do Aluno', key: 'name', render: (s: any) => <span className="font-bold text-slate-800">{s.name}</span> },
                { header: 'Turma', key: 'classId', render: (s: any) => (
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-bold">
                    {classes.find(c => c.id === s.classId)?.name || 'Sem Turma'}
                  </span>
                )},
                { header: 'Data Cadastro', key: 'createdAt', render: (s: any) => (
                  <span className="text-[11px] font-bold text-slate-500">
                    {s.createdAt ? toDate(s.createdAt)?.toLocaleDateString('pt-BR') : '-'}
                  </span>
                )},
                { header: 'Status', key: 'status', render: (s: any) => (
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                    s.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    s.status === 'Transferido' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                    'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    {s.status || 'Ativo'}
                  </span>
                )},
              ]}
            />
          </motion.div>
        );

      case 'map-notas':
        return (
          <motion.div key="notas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800">Mapa de Notas por Turma</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map(cls => {
                const classGrades = grades.filter(g => g.classId === cls.id);
                const avg = classGrades.length ? 
                  (classGrades.reduce((sum, g) => sum + (g.grade || 0), 0) / classGrades.length).toFixed(1) : 
                  'N/A';
                
                return (
                  <div key={cls.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-black text-slate-800 uppercase text-xs">{cls.name}</h4>
                      <div className={`px-2 py-1 rounded-lg text-xs font-black ${parseFloat(avg) >= 7 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        MD: {avg}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold text-slate-400">
                        <span>Abaixo da Média</span>
                        <span className="text-rose-500">{classGrades.filter(g => (g.grade || 0) < 6).length}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full transition-all" 
                          style={{ width: `${(parseFloat(avg) / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );

      case 'map-infrequencia':
        return (
          <motion.div key="frequencia" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800">Mapa de Infrequência</h2>
            <ReportTable 
              data={students.map(s => {
                const studentAttendance = attendance.filter(a => a.studentId === s.id);
                const absenses = studentAttendance.filter(a => a.status === 'absent').length;
                return { ...s, absenses };
              }).sort((a,b) => b.absenses - a.absenses)}
              columns={[
                { header: 'Aluno', key: 'name' },
                { header: 'Turma', key: 'classId', render: (s: any) => classes.find(c => c.id === s.classId)?.name },
                { header: 'Faltas Totais', key: 'absenses', render: (s: any) => (
                  <span className={`font-black ${s.absenses > 10 ? 'text-rose-600' : 'text-slate-600'}`}>{s.absenses}</span>
                )},
                { header: 'Status Risco', key: 'risk', render: (s: any) => (
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                    s.absenses > 15 ? 'bg-rose-100 text-rose-700' : 
                    s.absenses > 5 ? 'bg-orange-100 text-orange-700' : 
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {s.absenses > 15 ? 'Abandono' : s.absenses > 5 ? 'Atenção' : 'Frequência Ok'}
                  </span>
                )}
              ]}
            />
          </motion.div>
        );

      case 'calendario':
        return (
          <motion.div key="cal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800">Calendário Acadêmico</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { date: '20/05/2026', event: 'Início do 2º Bimestre', type: 'Academic' },
                { date: '10/06/2026', event: 'Festa Junina Institucional', type: 'Event' },
                { date: '15/07/2026', event: 'Recesso Escolar', type: 'Holidays' },
                { date: '01/08/2026', event: 'Encontro Pedagógico', type: 'Staff' },
              ].map((ev, i) => (
                <div key={i} className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex flex-col items-center bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl">
                    <span className="text-[10px] font-black uppercase">{ev.date.split('/')[1] === '05' ? 'MAI' : ev.date.split('/')[1] === '06' ? 'JUN' : 'JUL'}</span>
                    <span className="text-xl font-black">{ev.date.split('/')[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{ev.event}</h4>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{ev.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 'classificacao':
        return (
          <motion.div key="rank" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800">Ranking por Desempenho</h2>
            <ReportTable 
              data={students.map(s => {
                const sGrades = grades.filter(g => g.studentId === s.id);
                const avg = sGrades.length ? sGrades.reduce((a, b) => a + (b.grade || 0), 0) / sGrades.length : 0;
                return { ...s, avg };
              }).sort((a, b) => b.avg - a.avg).slice(0, 20)}
              columns={[
                { header: 'Posição', key: 'pos', render: (_, idx) => <span className="font-black text-indigo-600">#{idx + 1}</span> },
                { header: 'Aluno', key: 'name' },
                { header: 'Média Geral', key: 'avg', render: (s: any) => (
                  <span className={`font-black ${s.avg >= 9 ? 'text-indigo-600' : 'text-slate-600'}`}>
                    {s.avg.toFixed(1)}
                  </span>
                )},
                { header: 'Nível', key: 'level', render: (s: any) => (
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                    s.avg >= 9 ? 'bg-indigo-100 text-indigo-700' : 
                    s.avg >= 7 ? 'bg-emerald-100 text-emerald-700' : 
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {s.avg >= 9 ? 'Excelente' : s.avg >= 7 ? 'Bom' : 'Regular'}
                  </span>
                )}
              ]}
            />
          </motion.div>
        );

      case 'dados-gerais':
        return (
          <motion.div key="school" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <h2 className="text-2xl font-black text-slate-800">Perfil da Instituição</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6">Recursos Humanos</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <span className="text-sm font-bold text-slate-600">Professores Cadastrados</span>
                    <span className="font-black text-slate-800">{teachers.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <span className="text-sm font-bold text-slate-600">Turmas Ativas</span>
                    <span className="font-black text-slate-800">{classes.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <span className="text-sm font-bold text-slate-600">Média Alunos/Turma</span>
                    <span className="font-black text-slate-800">
                      {classes.length > 0 ? (students.length / classes.length).toFixed(1) : 0}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-6">Estrutura Física</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-orange-50/50 rounded-2xl">
                    <span className="text-sm font-bold text-slate-600">Total de Turmas</span>
                    <span className="font-black text-slate-800">{classes.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-orange-50/50 rounded-2xl">
                    <span className="text-sm font-bold text-slate-600">Vagas Totais</span>
                    <span className="font-black text-slate-800">
                      {classes.reduce((sum, c) => sum + (parseInt(c.capacity) || 30), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-orange-50/50 rounded-2xl">
                    <span className="text-sm font-bold text-slate-600">Taxa de Ocupação</span>
                    <span className="font-black text-emerald-600">
                      {classes.length > 0 ? (
                        (students.length / classes.reduce((sum, c) => sum + (parseInt(c.capacity) || 30), 0) * 100).toFixed(1)
                      ) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'monitoramento':
      case 'rendimentos':
        return (
          <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800">{getTabLabel(activeTab)}</h2>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px' }} 
                      formatter={(value: any) => [`${value}%`]}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="aprova" name="% Aprovação" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="reprova" name="% Reprovação" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div 
            key="placeholder"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white p-12 rounded-[3rem] border border-slate-200 flex flex-col items-center justify-center text-center"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
              <FileBarChart className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">Relatório Consolidado</h3>
            <p className="text-slate-500 mt-2 max-w-md">
              Os dados de <strong>{getTabLabel(activeTab)}</strong> estão disponíveis nos registros do sistema.
            </p>
            <button 
              onClick={() => setActiveTab('graficos')}
              className="mt-8 px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all"
            >
              Voltar para Visão Geral
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-72 shrink-0 space-y-2 no-print">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-4">
          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">Categorias de Relatórios</h3>
          <div className="space-y-1">
            <NavItem id="graficos" label="Gráficos e Visão Geral" icon={<FileBarChart className="w-4 h-4" />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem id="alunos" label="Alunos" icon={<Users className="w-4 h-4" />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem id="transfers" label="Transferências SPAECE" icon={<ArrowUpRight className="w-4 h-4" />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem id="calendario" label="Calendário Letivo" icon={<Calendar className="w-4 h-4" />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem id="classificacao" label="Classificação por Período" icon={<GraduationCap className="w-4 h-4" />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem id="dados-gerais" label="Dados Gerais do Aluno" icon={<UserCircle className="w-4 h-4" />} activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className="pt-4 pb-2">
              <button 
                onClick={() => setExpandedMap(!expandedMap)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${expandedMap ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Filter className="w-3.5 h-3.5" />
                  </div>
                  Mapas
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedMap ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {expandedMap && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden ml-4 mt-2 space-y-1 border-l-2 border-slate-100 pl-4"
                  >
                    <SubNavItem id="map-enturmacao" label="Mapa de Enturmação" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SubNavItem id="map-raca" label="Mapa de Cor/Raça" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SubNavItem id="map-deficiencia" label="Mapa Deficiência" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SubNavItem id="map-doencas" label="Mapa de Doenças/Sídromes" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SubNavItem id="map-notas" label="Mapa de Notas" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SubNavItem id="map-infrequencia" label="Mapa de Infrequência" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SubNavItem id="map-transporte" label="Mapa de Transporte Escolar" activeTab={activeTab} setActiveTab={setActiveTab} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-2 pb-2 border-t border-slate-50 mt-2">
              <button 
                onClick={() => setExpandedCenso(!expandedCenso)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${expandedCenso ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <School className="w-3.5 h-3.5" />
                  </div>
                  Censo Escolar
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedCenso ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {expandedCenso && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden ml-4 mt-2 space-y-1 border-l-2 border-slate-100 pl-4"
                  >
                    <SubNavItem id="census-initial" label="Matrícula Inicial" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SubNavItem id="census-admitted" label="Admitidos Pós-Censo" activeTab={activeTab} setActiveTab={setActiveTab} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavItem id="monitoramento" label="Monitoramento de Resultados" icon={<UserCheck className="w-4 h-4" />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem id="bolsas" label="Alunos que recebem Bolsa" icon={<Users className="w-4 h-4" />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem id="rendimentos" label="Status dos Rendimentos" icon={<GraduationCap className="w-4 h-4" />} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 space-y-8">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NavItem({ id, label, icon, activeTab, setActiveTab }: any) {
  const active = activeTab === id;
  return (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      <div className={active ? 'text-white' : 'text-indigo-400'}>
        {icon}
      </div>
      {label}
    </button>
  );
}

function SubNavItem({ id, label, activeTab, setActiveTab }: any) {
  const active = activeTab === id;
  return (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full text-left px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${
        active 
          ? 'text-indigo-600 bg-indigo-50/50' 
          : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

function getTabLabel(id: string): string {
  const labels: Record<string, string> = {
    'alunos': 'Relatório Geral de Alunos',
    'transfers': 'Transferências SPAECE',
    'calendario': 'Calendário Letivo',
    'classificacao': 'Classificação por Período',
    'dados-gerais': 'Dados Gerais do Aluno',
    'monitoramento': 'Monitoramento de Resultados',
    'bolsas': 'Alunos que recebem Bolsa',
    'rendimentos': 'Status dos Rendimentos',
    'map-enturmacao': 'Mapa de Enturmação',
    'map-deficiencia': 'Mapa Deficiência',
    'map-doencas': 'Mapa de Doenças/Síndromes',
    'map-notas': 'Mapa de Notas',
    'map-infrequencia': 'Mapa de Infrequência',
    'map-transporte': 'Mapa de Transporte Escolar',
    'map-raca': 'Mapa de Cor/Raça (Censo)',
    'census-initial': 'Matrícula Inicial (Censo)',
    'census-admitted': 'Alunos Admitidos (Pós-Censo)'
  };
  return labels[id] || id;
}
