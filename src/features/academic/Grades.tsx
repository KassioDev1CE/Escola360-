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

export default function Grades() {
  const schoolId = "cm_school_123";
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedBimester, setSelectedBimester] = useState('1');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const subjects = [
    'Português', 'Matemática', 'História', 'Geografia', 'Ciências', 
    'Artes', 'Educação Física', 'Inglês', 'Literatura'
  ];

  const bimesters = [
    { id: '1', name: '1º Bimestre' },
    { id: '2', name: '2º Bimestre' },
    { id: '3', name: '3º Bimestre' },
    { id: '4', name: '4º Bimestre' },
  ];

  useEffect(() => {
    const unsub = firebaseService.subscribeToClasses(schoolId, setClasses);
    return unsub;
  }, []);

  const handleFetchStudentsGrades = async () => {
    if (!selectedClassId || !selectedSubject) return;
    
    setLoading(true);
    try {
      // Get all students for the class
      const unsub = firebaseService.subscribeToStudents(schoolId, (allStudents) => {
        const classStudents = allStudents.filter(s => s.classId === selectedClassId);
        
        // Now we need to mix in the existing grades if any
        // For simplicity in this view, we'll fetch them and merge
        const fetchGrades = async () => {
            const gradesData = await firebaseService.getGradesByClass(schoolId, selectedClassId);
            const enrichedStudents = classStudents.map(student => {
                const studentPerf = gradesData?.find(pd => pd.studentId === student.id);
                // Find specific grade for this bimester and subject
                const specificPerf = studentPerf?.performance?.find((p: any) => 
                    p.id === `${selectedClassId}_${selectedSubject}`
                );
                
                return {
                    ...student,
                    grade: specificPerf?.[`b${selectedBimester}_grade`] || '',
                    absences: specificPerf?.[`b${selectedBimester}_absences`] || '0'
                };
            });
            setStudents(enrichedStudents);
            setLoading(false);
        };
        fetchGrades();
      });
      return unsub;
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId && selectedSubject && selectedBimester) {
        handleFetchStudentsGrades();
    }
  }, [selectedClassId, selectedSubject, selectedBimester]);

  const handleGradeChange = (studentId: string, field: 'grade' | 'absences', value: string) => {
    setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
            return { ...s, [field]: value };
        }
        return s;
    }));
  };

  const handleSaveAll = async () => {
    if (!selectedClassId || !selectedSubject) return;
    
    setSaving(true);
    try {
      const gradesToSave = students.map(s => ({
        studentId: s.id,
        studentName: s.name,
        [`b${selectedBimester}_grade`]: s.grade,
        [`b${selectedBimester}_absences`]: s.absences,
      }));
      
      await firebaseService.saveGrades(schoolId, selectedClassId, selectedSubject, gradesToSave);
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
            Notas e Frequência
          </h2>
          <p className="text-slate-500 text-sm">Gerencie o desempenho acadêmico dos alunos por bimestre.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            disabled={students.length === 0 || saving}
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
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 ml-1">
              <Users className="w-3 h-3" /> Turma
            </label>
            <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">Selecione uma turma...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.period}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 ml-1">
              <BookOpen className="w-3 h-3" /> Disciplina
            </label>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">Selecione a disciplina...</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 ml-1">
              <Calendar className="w-3 h-3" /> Período
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
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
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
        {(!selectedClassId || !selectedSubject) ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
               <Filter className="w-8 h-8" />
             </div>
             <div>
               <p className="font-bold text-slate-600">Filtros insuficientes</p>
               <p className="text-sm text-slate-400">Selecione uma turma e uma disciplina para visualizar os alunos.</p>
             </div>
          </div>
        ) : loading ? (
           <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-500">Buscando registros...</p>
           </div>
        ) : students.length === 0 ? (
           <div className="p-20 text-center flex flex-col items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-300">
               <AlertCircle className="w-8 h-8" />
             </div>
             <div>
               <p className="font-bold text-slate-600">Nenhum aluno encontrado</p>
               <p className="text-sm text-slate-400">Esta turma ainda não possui alunos matriculados.</p>
             </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">Aluno</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">RA</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase text-center w-32">Nota (0-10)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase text-center w-32">Faltas</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={student.id} 
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden group-hover:scale-110 transition-transform">
                          {student.profileImageUrl ? (
                            <img src={student.profileImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            student.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-400">{student.ra || 'PENDENTE'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={student.grade}
                        onChange={(e) => handleGradeChange(student.id, 'grade', e.target.value)}
                        placeholder="--"
                        className="w-full bg-slate-50 border border-transparent rounded-lg px-3 py-1.5 text-center text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none group-hover:border-slate-200"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number"
                        min="0"
                        value={student.absences}
                        onChange={(e) => handleGradeChange(student.id, 'absences', e.target.value)}
                        placeholder="0"
                        className="w-full bg-slate-50 border border-transparent rounded-lg px-3 py-1.5 text-center text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 transition-all outline-none group-hover:border-slate-200"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {Number(student.grade) >= 6 ? (
                           <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[10px] font-bold">APROVADO</span>
                         ) : student.grade !== '' ? (
                           <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded text-[10px] font-bold">ABAIXO MÉDIA</span>
                         ) : null}
                         <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
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
