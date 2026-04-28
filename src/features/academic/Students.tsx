import React, { useState, useEffect, type FormEvent, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, User, Trash2, Calendar, Hash, Edit } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  ra: string;
  birthDate: string;
}

interface ClassData {
  id: string;
  name: string;
  year: number;
  room: string;
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Detalhes do Form de Matrícula
  const [formData, setFormData] = useState({
    name: '',
    socialName: '',
    birthDate: '',
    cpf: '',
    rg: '',
    address: '',
    gender: '',
    race: '',
    traditionalCommunity: 'none',
    socialProgram: '',
    nationality: '',
    birthCountry: '',
    birthCity: '',
    motherName: '',
    fatherName: '',
    guardianPhone: '',
    guardianEmail: '',
    specialNeeds: false,
    publicTransport: false,
    disabilities: [] as string[],
    birthCertificate: '',
    classId: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      socialName: (student as any).socialName || '',
      birthDate: student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : '',
      cpf: (student as any).cpf || '',
      rg: (student as any).rg || '',
      address: (student as any).address || '',
      gender: (student as any).gender || '',
      race: (student as any).race || '',
      traditionalCommunity: (student as any).traditionalCommunity || 'none',
      socialProgram: (student as any).socialProgram || '',
      nationality: (student as any).nationality || '',
      birthCountry: (student as any).birthCountry || '',
      birthCity: (student as any).birthCity || '',
      motherName: (student as any).motherName || '',
      fatherName: (student as any).fatherName || '',
      guardianPhone: (student as any).guardianPhone || '',
      guardianEmail: (student as any).guardianEmail || '',
      specialNeeds: !!(student as any).specialNeeds,
      publicTransport: !!(student as any).publicTransport,
      disabilities: (student as any).disabilities || [],
      birthCertificate: (student as any).birthCertificate || '',
      classId: (student as any).classId || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const method = editingStudent ? 'PUT' : 'POST';
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      
      const payload = { ...formData };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingStudent(null);
        resetForm();
        fetchStudents();
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        alert(`Erro ao salvar: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Erro de conexão com o servidor. Verifique sua internet.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', socialName: '', birthDate: '', cpf: '', rg: '', address: '',
      gender: '', race: '', traditionalCommunity: 'none', socialProgram: '',
      nationality: '', birthCountry: '', birthCity: '', motherName: '',
      fatherName: '', guardianPhone: '', guardianEmail: '', specialNeeds: false,
      publicTransport: false, disabilities: [], birthCertificate: '', classId: ''
    });
  };

  const toggleDisability = (d: string) => {
    setFormData(prev => ({
      ...prev,
      disabilities: prev.disabilities.includes(d) 
        ? prev.disabilities.filter(item => item !== d)
        : [...prev.disabilities, d]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Gestão de Alunos</h2>
           <p className="text-sm text-slate-500">Administre as matrículas e registros escolares</p>
        </div>
        <button 
          onClick={() => { setEditingStudent(null); resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Nova Matrícula
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar aluno por nome ou RA..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
             <button 
                onClick={() => setSelectedClassFilter('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedClassFilter === 'all' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'
                }`}
             >
               Todos
             </button>
             {classes.map(c => (
               <button 
                  key={c.id}
                  onClick={() => setSelectedClassFilter(c.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedClassFilter === c.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'
                  }`}
               >
                 {c.name}
               </button>
             ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">RA</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Turma</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nascimento</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Carregando...</td></tr>
              ) : (
                students
                  .filter(s => {
                    const matchesClass = selectedClassFilter === 'all' || (s as any).classId === selectedClassFilter;
                    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.ra.includes(searchTerm);
                    return matchesClass && matchesSearch;
                  })
                  .length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Nenhum aluno encontrado nesta seleção.</td></tr>
                  ) : (
                    students
                      .filter(s => {
                        const matchesClass = selectedClassFilter === 'all' || (s as any).classId === selectedClassFilter;
                        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.ra.includes(searchTerm);
                        return matchesClass && matchesSearch;
                      })
                      .map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                {student.name.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-700">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-mono">{student.ra}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-medium">{(student as any).classId ? classes.find(c => c.id === (student as any).classId)?.name : 'Não alocado'}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 text-nowrap">
                            {new Date(student.birthDate).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleEdit(student)}
                                className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                                title="Editar Aluno"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsModalOpen(false); setEditingStudent(null); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50 shrink-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{editingStudent ? 'Editar Matrícula' : 'Nova Matrícula Profissional'}</h3>
                    <p className="text-xs text-slate-500 font-medium">Preencha todos os campos obrigatórios para o registro acadêmico</p>
                  </div>
                  <button onClick={() => { setIsModalOpen(false); setEditingStudent(null); }} className="text-slate-400 hover:text-slate-600">
                    <Trash2 className="w-6 h-6 rotate-45" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* 1. Identificação Básica */}
                <section className="space-y-6">
                  <SectionTitle title="1. Identificação do Aluno" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Nome Completo *" icon={<User />}>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Maria Antonia" />
                    </FormField>
                    <FormField label="Nome Social" icon={<User />}>
                      <input value={formData.socialName} onChange={e => setFormData({...formData, socialName: e.target.value})} placeholder="Como o aluno deseja ser chamado" />
                    </FormField>
                    <FormField label="Data de Nascimento *" icon={<Calendar />}>
                      <input type="date" required value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                    </FormField>
                    <FormField label="Sexo *" icon={<User />}>
                      <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                         <option value="">Selecione</option>
                         <option value="M">Masculino</option>
                         <option value="F">Feminino</option>
                         <option value="NB">Não Binário</option>
                      </select>
                    </FormField>
                  </div>
                </section>

                {/* 2. Documentos e Socio-demográfico */}
                <section className="space-y-6">
                  <SectionTitle title="2. Documentos e Social" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="CPF">
                      <input value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} placeholder="000.000.000-00" />
                    </FormField>
                    <FormField label="RG">
                      <input value={formData.rg} onChange={e => setFormData({...formData, rg: e.target.value})} />
                    </FormField>
                    <FormField label="Certidão de Nascimento">
                      <input value={formData.birthCertificate} onChange={e => setFormData({...formData, birthCertificate: e.target.value})} />
                    </FormField>
                    <FormField label="Raça / Cor *">
                      <select required value={formData.race} onChange={e => setFormData({...formData, race: e.target.value})}>
                        <option value="">Selecione</option>
                        <option value="branca">Branca</option>
                        <option value="preta">Preta</option>
                        <option value="parda">Parda</option>
                        <option value="amarela">Amarela</option>
                        <option value="indigena">Indígena</option>
                      </select>
                    </FormField>
                    <FormField label="Comunidade Tradicional">
                      <select value={formData.traditionalCommunity} onChange={e => setFormData({...formData, traditionalCommunity: e.target.value})}>
                        <option value="none">Nenhuma</option>
                        <option value="quilombola">Quilombola</option>
                        <option value="cigano">Cigano</option>
                      </select>
                    </FormField>
                    <FormField label="Prog. Social (Bolsa Família, etc) *">
                       <select required value={formData.socialProgram} onChange={e => setFormData({...formData, socialProgram: e.target.value})}>
                         <option value="">Beneficiário?</option>
                         <option value="yes">Sim</option>
                         <option value="no">Não</option>
                       </select>
                    </FormField>
                  </div>
                </section>

                {/* 3. Nacionalidade e Origem */}
                <section className="space-y-6">
                  <SectionTitle title="3. Origem e Nacionalidade" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="Nacionalidade *">
                       <input required value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} placeholder="Ex: Brasileira" />
                    </FormField>
                    <FormField label="País de Nascimento *">
                       <input required value={formData.birthCountry} onChange={e => setFormData({...formData, birthCountry: e.target.value})} placeholder="Ex: Brasil" />
                    </FormField>
                    <FormField label="Naturalidade (Cidade) *">
                       <input required value={formData.birthCity} onChange={e => setFormData({...formData, birthCity: e.target.value})} placeholder="Ex: São Paulo" />
                    </FormField>
                  </div>
                </section>

                {/* 4. Filiação e Contato */}
                <section className="space-y-6">
                  <SectionTitle title="4. Família e Responsável" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Nome da Mãe *">
                       <input required value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} />
                    </FormField>
                    <FormField label="Nome do Pai *">
                       <input required value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                    </FormField>
                    <FormField label="Telefone do Responsável *">
                       <input required value={formData.guardianPhone} onChange={e => setFormData({...formData, guardianPhone: e.target.value})} placeholder="(00) 00000-0000" />
                    </FormField>
                    <FormField label="Email do Responsável">
                       <input value={formData.guardianEmail} onChange={e => setFormData({...formData, guardianEmail: e.target.value})} placeholder="email@exemplo.com" />
                    </FormField>
                  </div>
                  <FormField label="Endereço Completo *">
                     <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border rounded-lg p-2 text-sm" rows={2} placeholder="Rua, Número, Bairro, CEP..." />
                  </FormField>
                </section>

                {/* 5. Educação Especial e Transp */}
                <section className="space-y-6">
                  <SectionTitle title="5. Necessidades Específicas" />
                  <div className="flex flex-wrap gap-8">
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={formData.specialNeeds} onChange={e => setFormData({...formData, specialNeeds: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Precisa de Atendimento Especializado?</span>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={formData.publicTransport} onChange={e => setFormData({...formData, publicTransport: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Utiliza Transporte Escolar Público?</span>
                     </label>
                  </div>
                  
                  <div className="space-y-3">
                     <p className="text-xs font-bold text-slate-400 uppercase">Deficiências / Necessidades Específicas:</p>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Cegueira', 'Baixa Visão', 'Surdez', 'Deficiência Física', 'Deficiência Intelectual', 'Autismo', 'Altas Habilidades', 'Outra'].map(d => (
                          <div 
                            key={d} 
                            onClick={() => toggleDisability(d)}
                            className={`p-3 border rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
                              formData.disabilities.includes(d) 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'
                            }`}
                          >
                             <div className={`w-2 h-2 rounded-full ${formData.disabilities.includes(d) ? 'bg-white' : 'bg-slate-300'}`} />
                             {d}
                          </div>
                        ))}
                     </div>
                  </div>
                </section>

                {/* 6. Seleção de Turma */}
                <section className="space-y-6 pt-6 border-t border-slate-100">
                  <SectionTitle title="6. Seleção de Turma Atual" />
                  <p className="text-xs text-slate-500 mb-4">Selecione uma turma para alocar o aluno imediatamente</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {classes.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => setFormData({...formData, classId: c.id})}
                        className={`p-4 border rounded-xl cursor-pointer transition-all relative ${
                          formData.classId === c.id 
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20' 
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                         <h4 className="font-bold text-slate-800 text-sm">{c.name}</h4>
                         <p className="text-[10px] text-slate-500 font-mono mt-1">{c.year} • {c.room}</p>
                         {formData.classId === c.id && (
                           <div className="absolute top-3 right-3 text-blue-600">
                             <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                           </div>
                         )}
                      </div>
                    ))}
                  </div>
                </section>
                
                <div className="pt-4 flex gap-4 sticky bottom-0 bg-white py-4 border-t border-slate-50">
                   <button 
                    type="button"
                    onClick={() => { setIsModalOpen(false); setEditingStudent(null); }}
                    className="px-6 py-3 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex-1"
                  >
                    Descartar Alterações
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-3 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-black transition-all shadow-xl flex-1 active:scale-[0.98]"
                  >
                    {editingStudent ? 'Salvar Alterações' : 'Finalizar Matrícula'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
      <span className="w-1 h-4 bg-blue-600 rounded-full" />
      {title}
    </h4>
  );
}

function FormField({ label, children, icon }: { label: string, children: ReactNode, icon?: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">{label}</label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
            {React.cloneElement(icon as any, { className: 'w-4 h-4' })}
          </div>
        )}
        <div className={icon ? 'pl-9' : ''}>
          {React.cloneElement(children as any, {
            className: `w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${(children as any).props.className || ''}`
          })}
        </div>
      </div>
    </div>
  );
}
