import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  Briefcase, 
  Save, 
  X,
  Plus,
  Trash2,
  BookOpen,
  Edit3,
  FileText,
  Clock,
  ChevronRight,
  Lock,
  Key
} from 'lucide-react';
import { firebaseService } from '../../lib/firebaseService';
import { useAuth } from '../../lib/AuthContext';

interface Teacher {
  id: string;
  name: string;
  cpf: string;
  email: string;
  nis: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  race: string;
  motherName: string;
  fatherName?: string;
  nationality: string;
  birthCountry: string;
  birthState: string;
  birthCity: string;
  disabilities?: string;
  address: string;
  educationLevel: string;
  graduation: string;
  extraEducation?: string;
}

export default function Teachers() {
  const { profile } = useAuth();
  const schoolId = profile?.schoolId || "cm_school_123";
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [allSchedules, setAllSchedules] = useState<any>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const initialForm = {
    name: '', cpf: '', email: '', nis: '', birthDate: '', gender: '', 
    maritalStatus: '', race: '', motherName: '', fatherName: '', 
    nationality: 'Brasileira', birthCountry: 'Brasil', birthState: '', 
    birthCity: '', disabilities: '', address: '', educationLevel: '', 
    graduation: '', extraEducation: ''
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const unsubTeachers = firebaseService.subscribeToTeachers(schoolId, (data) => {
      setTeachers(data);
      setLoading(false);
    });
    const unsubClasses = firebaseService.subscribeToClasses(schoolId, setClasses);
    const unsubSchedules = firebaseService.subscribeToSchedules(schoolId, setAllSchedules);

    return () => {
      unsubTeachers();
      unsubClasses();
      unsubSchedules();
    };
  }, [schoolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTeacher) {
        await firebaseService.updateTeacher(schoolId, selectedTeacher.id, formData);
      } else {
        await firebaseService.addTeacher(schoolId, formData);
      }
      setIsModalOpen(false);
      setSelectedTeacher(null);
      setFormData(initialForm);
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar professor.");
    }
  };

  const handleDelete = async (teacherId: string) => {
    if (confirm("Tem certeza que deseja excluir este professor?")) {
      try {
        await firebaseService.deleteTeacher(schoolId, teacherId);
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir professor.");
      }
    }
  };

  const handleUpdatePassword = async () => {
    if (!selectedTeacher || !newPassword) return;
    try {
      await firebaseService.updateTeacher(schoolId, selectedTeacher.id, { password: newPassword });
      setIsPasswordModalOpen(false);
      setNewPassword('');
      alert('Senha atualizada com sucesso!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({ ...teacher });
    setIsModalOpen(true);
  };

  const handleOpenReport = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsReportOpen(true);
  };

  const handleOpenPasswordModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleNewTeacher = () => {
    setSelectedTeacher(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const getTeacherWorkload = (teacherId: string) => {
    const workload: any[] = [];
    Object.keys(allSchedules).forEach(classId => {
      const classSched = allSchedules[classId];
      const cls = classes.find(c => c.id === classId);
      classSched.forEach((item: any) => {
        if (item.teacher === teacherId || item.teacherId === teacherId) {
          workload.push({
            ...item,
            className: cls?.name || 'Turma não encontrada',
            classId
          });
        }
      });
    });
    return workload;
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Corpo Docente</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">Gestão de professores e quadros de horários</p>
        </div>
        <button 
          onClick={handleNewTeacher}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-blue-600 transition-all flex items-center gap-3 shadow-xl shadow-slate-900/10 active:scale-95 uppercase tracking-widest"
        >
          <UserPlus className="w-4 h-4" /> Novo Professor
        </button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por nome ou CPF..." 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Docente</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {teachers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.cpf.includes(searchTerm)).map(teacher => (
                <tr key={teacher.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-lg border border-blue-100 group-hover:scale-110 transition-transform">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{teacher.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{teacher.graduation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <p className="text-xs font-bold text-slate-700">CPF: {teacher.cpf}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase">NIS: {teacher.nis}</p>
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-2 text-slate-600 text-xs font-medium mb-1">
                      <Mail className="w-3.5 h-3.5" /> {teacher.email}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black">
                      <Calendar className="w-3.5 h-3.5" /> Nasc: {teacher.birthDate}
                    </div>
                  </td>
                  <td className="px-4 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleOpenReport(teacher)}
                        className="p-3 bg-slate-50 hover:bg-slate-900 group/btn rounded-xl text-slate-400 hover:text-white transition-all shadow-sm border border-slate-100"
                        title="Ficha Individual"
                       >
                         <FileText className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => handleEdit(teacher)}
                        className="p-3 bg-slate-50 hover:bg-blue-600 group/btn rounded-xl text-slate-400 hover:text-white transition-all shadow-sm border border-slate-100"
                        title="Editar Cadastro"
                       >
                         <Edit3 className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => handleOpenPasswordModal(teacher)}
                        className="p-3 bg-slate-50 hover:bg-amber-500 group/btn rounded-xl text-slate-400 hover:text-white transition-all shadow-sm border border-slate-100"
                        title="Redefinir Senha"
                       >
                         <Lock className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => handleDelete(teacher.id)}
                        className="p-3 bg-slate-50 hover:bg-rose-600 group/btn rounded-xl text-slate-400 hover:text-white transition-all shadow-sm border border-slate-100"
                        title="Remover"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cadastro Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-200"
            >
              <div className="p-10 pb-6 shrink-0 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl">
                    <UserPlus className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">{selectedTeacher ? 'Editar Docente' : 'Novo Docente'}</h3>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Cadastro Completo Obrigatório</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl transition-all shadow-sm">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                {/* Personal Data */}
                <section className="space-y-6">
                  <SectionTitle title="1. Dados Pessoais" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="Nome Completo *" icon={<User />}>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome completo do docente" />
                    </FormField>
                    <FormField label="CPF *" icon={<Briefcase />}>
                      <input required value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} placeholder="000.000.000-00" />
                    </FormField>
                    <FormField label="NIS *" icon={<Briefcase />}>
                      <input required value={formData.nis} onChange={e => setFormData({...formData, nis: e.target.value})} placeholder="Número NIS/PIS" />
                    </FormField>
                    <FormField label="Email *" icon={<Mail />}>
                      <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@instituicao.com" />
                    </FormField>
                    <FormField label="Data Nascimento *" icon={<Calendar />}>
                      <input type="date" required value={formData.birthDate || ''} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                    </FormField>
                    <FormField label="Sexo *">
                      <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                        <option value="">Selecione...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="O">Outro</option>
                      </select>
                    </FormField>
                    <FormField label="Estado Civil *">
                      <select required value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value})}>
                        <option value="">Selecione...</option>
                        <option value="S">Solteiro(a)</option>
                        <option value="C">Casado(a)</option>
                        <option value="D">Divorciado(a)</option>
                        <option value="V">Viúvo(a)</option>
                      </select>
                    </FormField>
                    <FormField label="Raça/Cor *">
                      <select required value={formData.race} onChange={e => setFormData({...formData, race: e.target.value})}>
                        <option value="">Selecione...</option>
                        <option value="branca">Branca</option>
                        <option value="preta">Preta</option>
                        <option value="parda">Parda</option>
                        <option value="amarela">Amarela</option>
                        <option value="indigena">Indígena</option>
                      </select>
                    </FormField>
                  </div>
                </section>

                {/* Family and Origin */}
                <section className="space-y-6">
                  <SectionTitle title="2. Origem e Família" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Nome da Mãe *">
                      <input required value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} placeholder="Nome completo da progenitora" />
                    </FormField>
                    <FormField label="Nome do Pai">
                      <input value={formData.fatherName || ''} onChange={e => setFormData({...formData, fatherName: e.target.value})} placeholder="Nome completo do progenitor" />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <FormField label="Nacionalidade *">
                      <input required value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
                    </FormField>
                    <FormField label="País Origem *">
                      <input required value={formData.birthCountry} onChange={e => setFormData({...formData, birthCountry: e.target.value})} />
                    </FormField>
                    <FormField label="UF Nascimento *">
                      <input required value={formData.birthState} onChange={e => setFormData({...formData, birthState: e.target.value})} placeholder="EX: RJ" />
                    </FormField>
                    <FormField label="Município Nascimento *">
                      <input required value={formData.birthCity} onChange={e => setFormData({...formData, birthCity: e.target.value})} />
                    </FormField>
                  </div>
                </section>

                {/* Additional Info */}
                <section className="space-y-6">
                  <SectionTitle title="3. Localização e Deficiências" />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3">
                      <FormField label="Endereço Completo *" icon={<MapPin />}>
                        <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Rua, Número, Bairro, Cidade - UF" />
                      </FormField>
                    </div>
                    <FormField label="Deficiências">
                      <input value={formData.disabilities || ''} onChange={e => setFormData({...formData, disabilities: e.target.value})} placeholder="Nenhuma" />
                    </FormField>
                  </div>
                </section>

                {/* Education */}
                <section className="space-y-6">
                  <SectionTitle title="4. Formação Acadêmica" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="Escolaridade *" icon={<GraduationCap />}>
                      <select required value={formData.educationLevel} onChange={e => setFormData({...formData, educationLevel: e.target.value})}>
                        <option value="">Selecione...</option>
                        <option value="superior">Superior Completo</option>
                        <option value="pos">Pós-Graduação</option>
                        <option value="mestrado">Mestrado</option>
                        <option value="doutorado">Doutorado</option>
                      </select>
                    </FormField>
                    <FormField label="Graduação *" icon={<BookOpen />}>
                      <input required value={formData.graduation} onChange={e => setFormData({...formData, graduation: e.target.value})} placeholder="EX: Licenciatura em Geografia" />
                    </FormField>
                    <FormField label="Formação Complementar">
                      <input value={formData.extraEducation || ''} onChange={e => setFormData({...formData, extraEducation: e.target.value})} placeholder="Cursos, certificações..." />
                    </FormField>
                  </div>
                </section>

                <div className="pt-10 flex gap-4">
                  <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                    <Save className="w-5 h-5" /> {selectedTeacher ? 'Salvar Alterações' : 'Finalizar Cadastro'}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Relatório / Ficha Individual Modal */}
      <AnimatePresence>
        {isReportOpen && selectedTeacher && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsReportOpen(false)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-slate-50 rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white"
              >
                  <div className="p-8 bg-white flex items-center justify-between border-b border-slate-100">
                     <div className="flex items-center gap-5">
                        <div className="w-20 h-20 bg-blue-600 text-white text-3xl font-black rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-600/20">
                          {selectedTeacher.name.charAt(0)}
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedTeacher.name}</h3>
                           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                             <GraduationCap className="w-3.5 h-3.5" /> Ficha Funcional Individual
                           </p>
                        </div>
                     </div>
                     <button onClick={() => setIsReportOpen(false)} className="p-3 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <InfoItem label="CPF" value={selectedTeacher.cpf} />
                        <InfoItem label="NIS" value={selectedTeacher.nis} />
                        <InfoItem label="Nascimento" value={selectedTeacher.birthDate} />
                        <InfoItem label="Email" value={selectedTeacher.email} />
                        <InfoItem label="Estado Civil" value={selectedTeacher.maritalStatus === 'S' ? 'Solteiro(a)' : 'Casado(a)'} />
                        <InfoItem label="Gênero" value={selectedTeacher.gender === 'M' ? 'Masculino' : 'Feminino'} />
                        <InfoItem label="Formação" value={selectedTeacher.graduation} className="col-span-1 md:col-span-2 lg:col-span-3" />
                        <InfoItem label="Endereço" value={selectedTeacher.address} className="col-span-1 md:col-span-2 lg:col-span-3" />
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <Clock className="w-5 h-5 text-blue-600" />
                           <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Carga Horária e Atribuições</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {getTeacherWorkload(selectedTeacher.id).length > 0 ? getTeacherWorkload(selectedTeacher.id).map((work, idx) => (
                              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                                 <div>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{work.className}</p>
                                    <p className="text-sm font-black text-slate-900 italic">{work.subject}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{work.day}</p>
                                    <p className="text-xs font-black text-slate-700">{work.period}º Período</p>
                                 </div>
                              </div>
                           )) : (
                              <div className="col-span-2 p-10 bg-slate-100 rounded-3xl border border-dashed border-slate-200 text-center">
                                 <p className="text-slate-400 font-bold italic text-sm">Este docente não possui aulas atribuídas no cronograma atual.</p>
                                 <button className="mt-4 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">Configurar Quadros</button>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
                     <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                        <FileText className="w-4 h-4" /> Exportar PDF
                     </button>
                     <button 
                      onClick={() => { setIsReportOpen(false); handleEdit(selectedTeacher); }}
                      className="px-8 py-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center justify-center gap-3"
                     >
                        <Edit3 className="w-4 h-4" /> Editar Cadastro
                     </button>
                  </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && selectedTeacher && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsPasswordModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 border border-slate-200"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight">Nova Senha</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedTeacher.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha..."
                    className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                  />
                </div>
                
                <div className="pt-2 flex gap-3">
                  <button 
                    onClick={handleUpdatePassword}
                    className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                  >
                    Confirmar Nova Senha
                  </button>
                  <button 
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">{title}</h4>
      <div className="h-px bg-slate-100 w-full"></div>
    </div>
  );
}

function FormField({ label, children, icon }: any) {
  return (
    <div className="space-y-1.5 group">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-blue-500 transition-colors">
        {icon && React.cloneElement(icon as React.ReactElement, { className: 'w-3 h-3' })}
        {label}
      </label>
      <div className="relative [&>input]:w-full [&>input]:pl-4 [&>input]:pr-4 [&>input]:py-4 [&>input]:bg-slate-50 [&>input]:border-none [&>input]:rounded-2xl [&>input]:text-xs [&>input]:font-bold [&>input]:outline-none [&>input]:ring-1 [&>input]:ring-slate-100 focus-within:ring-2 focus-within:ring-blue-500/30 [&>input]:transition-all [&>select]:w-full [&>select]:pl-4 [&>select]:pr-4 [&>select]:py-4 [&>select]:bg-slate-50 [&>select]:border-none [&>select]:rounded-2xl [&>select]:text-xs [&>select]:font-bold [&>select]:outline-none [&>select]:ring-1 [&>select]:ring-slate-100 focus-within:ring-2 focus-within:ring-blue-500/30 [&>select]:transition-all [&>select]:appearance-none">
        {children}
      </div>
    </div>
  );
}

function InfoItem({ label, value, className = "" }: { label: string; value: string; className?: string }) {
   return (
      <div className={className}>
         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
         <p className="text-sm font-black text-slate-900 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">{value || '---'}</p>
      </div>
   );
}

