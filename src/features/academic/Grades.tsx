import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  BookOpen,
  Filter,
  Users,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../../lib/firebaseService';
import { useAuth } from '../../lib/AuthContext';

export default function Grades() {
  const { profile } = useAuth();
  const schoolId = profile?.schoolId || "cm_school_123";
  const [activeTab, setActiveTab] = useState<'entry' | 'map'>('entry');
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedBimester, setSelectedBimester] = useState('1');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const bimesters = [
    { id: '1', name: '1º Bimestre' },
    { id: '2', name: '2º Bimestre' },
    { id: '3', name: '3º Bimestre' },
    { id: '4', name: '4º Bimestre' },
  ];
  
  useEffect(() => {
    const unsubClasses = firebaseService.subscribeToClasses(schoolId, setClasses);
    const unsubSubjects = firebaseService.subscribeToSubjects(schoolId, (data) => {
      setSubjects(data);
      if (data.length === 0 && !loading) {
        const defaultSubjects = ['Português', 'Matemática', 'História', 'Geografia', 'Ciências', 'Artes', 'Educação Física', 'Inglês'];
        Promise.all(defaultSubjects.map(s => firebaseService.addSubject(schoolId, { name: s })))
          .catch(err => console.error("Erro ao criar disciplinas padrão:", err));
      }
    });
    return () => {
      unsubClasses();
      unsubSubjects();
    };
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setSelectedClass(null);
      return;
    }

    const currentClass = classes.find(c => c.id === selectedClassId);
    setSelectedClass(currentClass); // Force immediate update
    
    if (!currentClass) return;

    const isInfant = currentClass.level === 'creche' || currentClass.level === 'pre-escola';
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        // 1. Subscribe to students of the specific class directly if possible, or filter locally
        const unsubStudents = firebaseService.subscribeToStudents(schoolId, (allStudents) => {
          if (!isMounted) return;
          
          // Debug log to help identify data issues
          console.log(`Loaded ${allStudents.length} students total. Filtering for class ${selectedClassId}`);
          
          const classStudents = allStudents.filter(s => {
            const studentClassId = s.classId || s.turmaId; // Handle potential field name variations
            return studentClassId === selectedClassId;
          });

          console.log(`Found ${classStudents.length} students for this class`);
          
          // 2. Buscar dados de desempenho de forma assíncrona para não travar a lista de alunos
          const fetchPerformance = async () => {
            let perfData = [];
            if (isInfant) {
              perfData = await firebaseService.getPedagogicalReportsByClass(schoolId, selectedClassId) || [];
            } else {
              perfData = await firebaseService.getGradesByClass(schoolId, selectedClassId) || [];
            }

            if (!isMounted) return;
            setPerformanceData(perfData);

            const enriched = classStudents.map(student => {
              const studentPerf = perfData.find(pd => pd.studentId === student.id);
              
              if (isInfant) {
                return {
                  ...student,
                  report: studentPerf?.[`b${selectedBimester}_report`] || '',
                  absences: studentPerf?.[`b${selectedBimester}_absences`] || '0'
                };
              }

              const specificPerf = studentPerf?.performance?.find((p: any) => 
                p.id === `${selectedClassId}_${selectedSubject}`
              );
              
              return {
                ...student,
                grade: specificPerf?.[`b${selectedBimester}_grade`] || '',
                absences: specificPerf?.[`b${selectedBimester}_absences`] || '0'
              };
            });

            setStudents(enriched);
            setLoading(false);
          };

          fetchPerformance();
        });

        return unsubStudents;
      } catch (error) {
        console.error("Erro crítico ao carregar dados:", error);
        if (isMounted) setLoading(false);
      }
    };

    const unsubPromise = loadData();

    return () => {
      isMounted = false;
      unsubPromise.then(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [selectedClassId, selectedSubject, selectedBimester, schoolId, classes]);

  const handleReportChange = (studentId: string, value: string) => {
    setPerformanceData(prev => {
        const studentIdx = prev.findIndex(p => p.studentId === studentId);
        let newPerfData = [...prev];
        
        if (studentIdx === -1) {
            newPerfData.push({
                studentId,
                [`b${selectedBimester}_report`]: value,
                [`b${selectedBimester}_absences`]: '0'
            });
        } else {
            newPerfData[studentIdx] = { 
                ...newPerfData[studentIdx], 
                [`b${selectedBimester}_report`]: value 
            };
        }
        return newPerfData;
    });
  };

  const handleAbsencesChange = (studentId: string, value: string) => {
    setPerformanceData(prev => {
        const studentIdx = prev.findIndex(p => p.studentId === studentId);
        let newPerfData = [...prev];
        
        if (studentIdx === -1) {
            newPerfData.push({
                studentId,
                [`b${selectedBimester}_absences`]: value
            });
        } else {
            newPerfData[studentIdx] = { 
                ...newPerfData[studentIdx], 
                [`b${selectedBimester}_absences`]: value 
            };
        }
        return newPerfData;
    });
  };

  const isEarlyChildhood = selectedClass?.level === 'creche' || selectedClass?.level === 'pre-escola';

  const handleGradeChange = (studentId: string, subjectName: string, field: 'grade' | 'absences', value: string) => {
    setPerformanceData(prev => {
        const studentIdx = prev.findIndex(p => p.studentId === studentId);
        let newPerfData = [...prev];
        
        if (studentIdx === -1) {
            newPerfData.push({
                studentId,
                performance: [{ id: `${selectedClassId}_${subjectName}`, subject: subjectName, [`b${selectedBimester}_grade`]: value, [`b${selectedBimester}_absences`]: field === 'absences' ? value : '0' }]
            });
        } else {
            const student = { ...newPerfData[studentIdx] };
            const perfIdx = student.performance.findIndex((p: any) => p.subject === subjectName);
            
            if (perfIdx === -1) {
                student.performance.push({ 
                    id: `${selectedClassId}_${subjectName}`, 
                    subject: subjectName, 
                    [`b${selectedBimester}_grade`]: field === 'grade' ? value : '', 
                    [`b${selectedBimester}_absences`]: field === 'absences' ? value : '0' 
                });
            } else {
                student.performance[perfIdx] = { 
                    ...student.performance[perfIdx], 
                    [`b${selectedBimester}_${field}`]: value 
                };
            }
            newPerfData[studentIdx] = student;
        }
        return newPerfData;
    });
    
    // Also update UI students list for immediate feedback
    setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
            return { ...s, lastUpdate: Date.now() }; // Trigger re-render
        }
        return s;
    }));
  };

  const handleSaveAll = async () => {
    if (!selectedClassId) return;
    
    setSaving(true);
    try {
      if (isEarlyChildhood) {
        await firebaseService.savePedagogicalReports(schoolId, selectedClassId, performanceData);
      } else {
        const batch = [];
        for (const studentPerf of performanceData) {
            if (studentPerf.performance) {
              for (const perf of studentPerf.performance) {
                  batch.push({
                      studentId: studentPerf.studentId,
                      ...perf
                  });
              }
            }
        }
        await firebaseService.saveGrades(schoolId, selectedClassId, "BATCH_UPDATE", batch);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              {isEarlyChildhood ? 'Relatórios Pedagógicos' : 'Notas e Frequência'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isEarlyChildhood 
                ? 'Avaliação qualitativa e frequência na educação infantil.' 
                : 'Gerencie o desempenho acadêmico dos alunos por bimestre.'}
            </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-100 rounded-xl mr-4">
              <button 
                onClick={() => setActiveTab('entry')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'entry' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {isEarlyChildhood ? 'Lançar Relatórios' : 'Lançar Notas'}
              </button>
              <button 
                onClick={() => setActiveTab('map')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {isEarlyChildhood ? 'Visualizar Relatórios' : 'Mapa de Notas'}
              </button>
          </div>
          <button 
            disabled={students.length === 0 || saving || activeTab === 'map'}
            onClick={handleSaveAll}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                success 
                ? 'bg-emerald-500 text-white shadow-emerald-200' 
                : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 active:scale-95 disabled:bg-slate-300 disabled:shadow-none'
            }`}
          >
            {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : success ? (
                <CheckCircle2 className="w-4 h-4" />
            ) : (
                <Save className="w-4 h-4" />
            )}
            {success ? 'Salvo com Sucesso' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 ml-1">
              <Users className="w-3 h-3" /> Selecionar Turma
            </label>
            <select 
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedStudentId(null);
              }}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">Selecione uma turma para carregar os alunos...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.shift || 'S/T'}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 ml-1">
              <Calendar className="w-3 h-3" /> Bimestre de Lançamento
            </label>
            <div className="flex p-1 bg-slate-50 rounded-xl">
              {bimesters.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBimester(b.id)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    selectedBimester === b.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {b.id}º BIM
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-end">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase leading-none">Total Alunos</p>
                <p className="text-lg font-black text-blue-700 leading-tight">{students.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {(!selectedClassId) ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
               <Filter className="w-8 h-8" />
             </div>
             <div>
               <p className="font-bold text-slate-600">Nenhuma turma selecionada</p>
               <p className="text-sm text-slate-400">Escolha uma turma acima para carregar os registros.</p>
             </div>
          </div>
        ) : loading ? (
           <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-500">Buscando registros acadêmicos...</p>
           </div>
        ) : students.length === 0 ? (
           <div className="p-20 text-center flex flex-col items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-300">
               <AlertCircle className="w-8 h-8" />
             </div>
             <div>
               <p className="font-bold text-slate-600">Sem alunos nesta turma</p>
               <p className="text-sm text-slate-400">É necessário matricular alunos antes de lançar notas.</p>
             </div>
          </div>
        ) : isEarlyChildhood ? (
          <div className="p-6">
            {activeTab === 'entry' ? (
              <div className="space-y-6">
                {!selectedStudentId ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((student, idx) => {
                      const data = performanceData.find(p => p.studentId === student.id) || {};
                      const hasReport = !!data[`b${selectedBimester}_report`];
                      
                      return (
                        <motion.div 
                          key={student.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          className={`p-5 rounded-2xl border transition-all ${
                            hasReport 
                              ? 'bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50/50' 
                              : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                              {student.name.substring(0, 2)}
                            </div>
                            {hasReport ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase">Preenchido</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-lg text-[9px] font-black uppercase">Pendente</span>
                            )}
                          </div>
                          
                          <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{student.name || "Sem nome cadastrado"}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">RA: {student.ra || '---'}</p>
                          
                          <button 
                            onClick={() => setSelectedStudentId(student.id)}
                            className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                              hasReport 
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                            }`}
                          >
                            <BookOpen className="w-3 h-3" />
                            {hasReport ? 'Editar Relatório' : 'Iniciar Relatório'}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {(() => {
                      const student = students.find(s => s.id === selectedStudentId);
                      const data = performanceData.find(p => p.studentId === selectedStudentId) || {};
                      
                      if (!student) return null;
                      
                      return (
                        <>
                          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                             <div className="flex items-center gap-4">
                               <button 
                                 onClick={() => setSelectedStudentId(null)}
                                 className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all font-black"
                               >
                                 <ChevronRight className="w-5 h-5 rotate-180" />
                               </button>
                               <div>
                                 <h3 className="font-black text-slate-800 text-lg">{student.name || "Aluno sem nome"}</h3>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Preenchendo Relatório do {selectedBimester}º Bimestre</p>
                               </div>
                             </div>
                             
                             <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                               <label className="text-[10px] font-bold text-slate-500 uppercase px-2">Faltas no Período</label>
                               <input 
                                 type="number"
                                 min="0"
                                 value={data[`b${selectedBimester}_absences`] || '0'}
                                 onChange={(e) => handleAbsencesChange(student.id, e.target.value)}
                                 className="w-16 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-center outline-none focus:ring-2 focus:ring-blue-500"
                               />
                             </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relatório Pedagógico e Socioemocional</label>
                              <span className="text-[10px] text-slate-400">Escrita livre • {data[`b${selectedBimester}_report`]?.length || 0} caracteres</span>
                            </div>
                            <textarea 
                              autoFocus
                              value={data[`b${selectedBimester}_report`] || ''}
                              onChange={(e) => handleReportChange(student.id, e.target.value)}
                              placeholder="Descreva detalhadamente o desenvolvimento do aluno: interações sociais, habilidades motoras, processos cognitivos e aspectos emocionais..."
                              className="w-full h-80 p-6 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-medium leading-relaxed focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none shadow-inner"
                            />
                          </div>

                          <div className="flex justify-between items-center pt-4">
                             <button 
                               onClick={() => setSelectedStudentId(null)}
                               className="px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors"
                             >
                               Voltar para lista de alunos
                             </button>
                             <button 
                               onClick={handleSaveAll}
                               className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                             >
                                <Save className="w-4 h-4" />
                                Salvar e Continuar
                             </button>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {students.map(student => {
                   const data = performanceData.find(p => p.studentId === student.id) || {};
                   const report = data[`b${selectedBimester}_report`];
                   return (
                     <div key={student.id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                           <h4 className="font-bold text-slate-800">{student.name}</h4>
                           <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">
                             {data[`b${selectedBimester}_absences`] || 0} Faltas
                           </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-blue-500 pl-4 bg-slate-50 py-3 rounded-r-xl">
                          {report || 'Nenhum relatório lançado para este bimestre.'}
                        </p>
                     </div>
                   );
                 })}
              </div>
            )}
          </div>
        ) : activeTab === 'entry' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase sticky left-0 bg-slate-50 z-10 w-64 border-r border-slate-100">Aluno</th>
                  {subjects.map(s => (
                    <th key={s.id} className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase text-center min-w-[120px] border-r border-slate-100">
                        {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, idx) => {
                  const studentPerf = performanceData.find(p => p.studentId === student.id);
                  
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={student.id} 
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50/50 z-10 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.01)] text-xs font-bold text-slate-700 truncate">
                        {student.name}
                      </td>
                      
                      {subjects.map(s => {
                        const subPerf = studentPerf?.performance?.find((p: any) => p.subject === s.name);
                        const gradeVal = subPerf?.[`b${selectedBimester}_grade`] || '';
                        
                        return (
                          <td key={s.id} className="px-2 py-2 border-r border-slate-100 text-center">
                             <input 
                               type="number"
                               min="0"
                               max="10"
                               step="0.1"
                               value={gradeVal}
                               onChange={(e) => handleGradeChange(student.id, s.name, 'grade', e.target.value)}
                               placeholder="--"
                               className={`w-full bg-slate-50/50 border border-transparent rounded-lg px-2 py-2 text-center text-xs font-bold transition-all outline-none focus:bg-white focus:ring-2 ${
                                 !gradeVal ? 'text-slate-400' : parseFloat(gradeVal) >= 6 ? 'text-blue-600 focus:ring-blue-500' : 'text-rose-500 focus:ring-rose-500'
                               } hover:border-slate-200`}
                             />
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase w-64 sticky left-0 bg-slate-50 z-10 border-r border-slate-100">Aluno</th>
                  {subjects.map(s => (
                    <th key={s.id} className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase text-center min-w-[100px] border-r border-slate-100">
                      {s.name}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase text-center w-32">Média</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const studentPerf = performanceData.find(p => p.studentId === student.id);
                  let totalGrades = 0;
                  let gradeCount = 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 sticky left-0 bg-white z-10 border-r border-slate-100 text-xs font-bold text-slate-700 truncate">
                        {student.name}
                      </td>
                      {subjects.map(s => {
                        const subPerf = studentPerf?.performance?.find((p: any) => p.subject === s.name);
                        const gradeVal = subPerf?.[`b${selectedBimester}_grade`];
                        if (gradeVal) {
                          totalGrades += parseFloat(gradeVal);
                          gradeCount++;
                        }
                        return (
                          <td key={s.id} className="px-4 py-4 text-center border-r border-slate-100 text-xs font-black">
                            {gradeVal ? (
                                <span className={parseFloat(gradeVal) >= 6 ? 'text-blue-600' : 'text-rose-500'}>
                                    {gradeVal}
                                </span>
                            ) : '--'}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-center bg-slate-50/30">
                        <span className={`text-sm font-black ${
                          gradeCount === 0 ? 'text-slate-300' : 
                          (totalGrades/gradeCount) >= 6 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {gradeCount > 0 ? (totalGrades / gradeCount).toFixed(1) : '--'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-emerald-900">Salvamento Automático</h4>
                <p className="text-xs text-emerald-700 mt-1">Ao selecionar uma nova disciplina ou bimestre, os dados atuais não salvos serão perdidos. Lembre-se de clicar em "Salvar Alterações".</p>
            </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-blue-900">Média Institucional</h4>
                <p className="text-xs text-blue-700 mt-1">A média padrão configurada é 6.0. Alunos abaixo desta nota serão destacados para atenção pedagógica imediata.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
