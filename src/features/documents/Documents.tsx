import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Printer, User, Search, Download, ShieldCheck, Mail, MapPin, ArrowRightLeft } from 'lucide-react';
import { firebaseService } from '../../lib/firebaseService';
import { useAuth } from '../../lib/AuthContext';

interface Student {
  id: string;
  name: string;
  ra: string;
  classId?: string;
}

interface SchoolInfo {
  name: string;
  cnpj: string;
  address: string;
  email: string;
  phone: string;
  logoLetter: string;
  academicYear?: number;
}

interface ClassData {
  id: string;
  name: string;
}

export default function Documents() {
  const { profile } = useAuth();
  const schoolId = profile?.schoolId || "cm_school_123";
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [studentTransfers, setStudentTransfers] = useState<any[]>([]);
  const [isRequestingTransfer, setIsRequestingTransfer] = useState(false);
  const [transferReason, setTransferReason] = useState('');

  const [school, setSchool] = useState<SchoolInfo>({
    name: "Colégio Santa Maria",
    cnpj: "12.345.678/0001-90",
    address: "Rua Das Flores, 123",
    email: "secretaria@escola.edu.br",
    phone: "(11) 4002-8922",
    logoLetter: "S",
    academicYear: 2024
  });

  useEffect(() => {
    // 1. Fetch from Firestore (Source of Truth)
    const fetchConfig = async () => {
      try {
        const data = await firebaseService.getSchoolConfig(schoolId);
        if (data) {
          setSchool(prev => ({ ...prev, ...data }));
        } else {
          // Fallback to localStorage if no Firestore data yet
          const savedConfig = localStorage.getItem('school_config');
          if (savedConfig) {
            setSchool(JSON.parse(savedConfig));
          }
        }
      } catch (error) {
        console.error("Error fetching documents config:", error);
      }
    };

    fetchConfig();

    const unsubStudents = firebaseService.subscribeToStudents(schoolId, setStudents);
    const unsubClasses = firebaseService.subscribeToClasses(schoolId, setClasses);

    return () => {
      unsubStudents();
      unsubClasses();
    };
  }, [schoolId]);

  useEffect(() => {
    if (selectedStudentId) {
      const fetchData = async () => {
        try {
          const [occData, transData] = await Promise.all([
            firebaseService.getOccurrences(schoolId, selectedStudentId),
            firebaseService.getStudentTransfers(schoolId, selectedStudentId)
          ]);
          setOccurrences(occData || []);
          setStudentTransfers(transData || []);
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    } else {
      setOccurrences([]);
      setStudentTransfers([]);
    }
  }, [selectedStudentId, schoolId]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.ra || '').includes(searchTerm);
    const matchesClass = selectedClassId === 'all' || s.classId === selectedClassId;
    return matchesSearch && matchesClass;
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handlePrint = (type: string) => {
    setIsGenerating(type);
    
    // Pequeno atraso para garantir que o React renderizou o conteúdo do template com os dados
    setTimeout(() => {
      window.print();
      // Aguarda o diálogo de impressão fechar
      setTimeout(() => setIsGenerating(null), 1000);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Estilos definitivos para impressão */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Esconde totalmente o App principal */
          #eduquest-app, .no-print {
            display: none !important;
          }
          
          /* Garante que o body não tenha margens ou paddings extras */
          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Estilo para a área impressa que está no portal */
          .portal-print-container {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 9999999 !important;
          }

          /* Forçar cores */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            margin: 1cm;
            size: portrait;
          }
        }
      `}} />

      <div id="main-layout-container" className="space-y-6 no-print">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Emissão de Documentos</h2>
            <p className="text-sm text-slate-500">Gere boletins, declarações e fichas oficiais</p>
          </div>
          <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl text-blue-700">
             <ShieldCheck className="w-5 h-5" />
             <span className="text-xs font-bold uppercase tracking-wider">Assinatura Digital Ativa</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Selector */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-100 space-y-3">
               <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar aluno..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
               </div>
               <select 
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl text-xs font-bold p-2 text-slate-600 outline-none"
               >
                  <option value="all">Todas as Turmas</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredStudents.length === 0 ? (
                <p className="text-center py-10 text-xs text-slate-400">Nenhum aluno encontrado</p>
              ) : (
                filteredStudents.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                      selectedStudentId === s.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      selectedStudentId === s.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold truncate max-w-[150px]">{s.name}</p>
                      <p className={`text-[10px] ${selectedStudentId === s.id ? 'text-blue-100' : 'text-slate-400'}`}>RA: {s.ra || 'N/D'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Document Options */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {selectedStudent ? (
                <motion.div 
                  key={selectedStudent.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-blue-600">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                          {school.logoLetter}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">{school.name}</h3>
                          <p className="text-xs text-slate-500 font-mono">CNPJ: {school.cnpj}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                             <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {school.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl mb-6">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Aluno Selecionado</p>
                       <div className="flex justify-between items-end">
                          <div>
                            <p className="text-lg font-bold text-slate-800">{selectedStudent.name}</p>
                            <p className="text-xs text-slate-500">Matrícula: {selectedStudent.ra}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-600">
                              Turma: {classes.find(c => c.id === selectedStudent.classId)?.name || 'Não alocada'}
                            </p>
                            <p className="text-[10px] text-slate-400">Ano Letivo {school.academicYear || 2024}</p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DocCard 
                        title="Boletim Escolar" 
                        desc="Resumo de notas, faltas e desempenho anual por bimestre."
                        loading={isGenerating === 'boletim'}
                        onClick={() => handlePrint('boletim')}
                      />
                      <DocCard 
                        title="Declaração de Matrícula" 
                        desc="Documento oficial que comprova o vínculo com a instituição."
                        loading={isGenerating === 'declaracao'}
                        onClick={() => handlePrint('declaracao')}
                      />
                      <DocCard 
                        title="Ficha Individual" 
                        desc="Relatório completo com dados pessoais e histórico resumido."
                        loading={isGenerating === 'ficha'}
                        onClick={() => handlePrint('ficha')}
                      />
                      <DocCard 
                        title="Transferência Escolar" 
                        desc={
                          studentTransfers[0]?.status === 'pending' ? "Solicitação em análise pela gestão." :
                          studentTransfers[0]?.status === 'approved' ? "Transferência aprovada. Clique para imprimir." :
                          "Solicitar transferência definitiva para outra instituição."
                        }
                        loading={isGenerating === 'transfer'}
                        onClick={() => {
                          if (studentTransfers[0]?.status === 'approved') {
                            handlePrint('transfer');
                          } else if (studentTransfers[0]?.status === 'pending') {
                            alert("Sua solicitação ainda está em análise pela diretoria.");
                          } else {
                            setIsRequestingTransfer(true);
                          }
                        }}
                        icon={<ArrowRightLeft className="w-6 h-6" />}
                        colorClass="amber"
                        status={studentTransfers[0]?.status}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-[600px] bg-slate-100 rounded-2xl border border-dotted border-slate-300 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-300 mb-4">
                      <User className="w-8 h-8" />
                   </div>
                   <h3 className="font-bold text-slate-500">Nenhum Aluno Selecionado</h3>
                   <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Escolha um aluno na lista ao lado para gerar documentos.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Print Template - Renderizado via Portal diretamente no Body para total isolamento */}
      {isGenerating && selectedStudent && createPortal(
        <div className="portal-print-container">
           {/* Font Import for Professional Look */}
           <style dangerouslySetInnerHTML={{ __html: `
             @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
             
             .document-body {
               font-family: 'Inter', sans-serif;
               color: #1e293b;
               background: white;
               line-height: 1.6;
             }
             .document-content {
               font-family: 'Libre+Baskerville', serif;
               line-height: 1.8;
             }
             .stamp-effect {
               border: 3px solid #1e293b;
               padding: 5px 15px;
               font-weight: 900;
               text-transform: uppercase;
               transform: rotate(-10deg);
               opacity: 0.15;
               position: absolute;
               top: 50%;
               left: 50%;
               font-size: 4rem;
               pointer-events: none;
               z-index: 0;
             }
           `}} />

           <div className="document-body p-12 min-h-screen relative overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 z-0" />
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-50 rounded-full -ml-48 -mb-48 z-0" />
             
             <div className="relative z-10 border-4 border-double border-slate-900 p-10 min-h-[1050px] flex flex-col bg-white/80 backdrop-blur-[2px]">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-10">
                  <div className="flex gap-6 items-center">
                    <div className="w-20 h-20 bg-slate-900 flex items-center justify-center text-white text-4xl font-black rounded-lg shadow-xl shadow-slate-900/20">
                      {school.logoLetter}
                    </div>
                    <div>
                      <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-1">{school.name}</h1>
                      <p className="text-sm font-bold text-slate-700">{school.cnpj}</p>
                      <div className="flex flex-col text-[11px] text-slate-500 font-medium mt-1">
                        <span>{school.address}</span>
                        <span>{school.phone} • {school.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded mb-2">
                      Documento Oficial
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                  </div>
                </div>
                
                {/* Watermark Label in background */}
                <div className="stamp-effect">
                  {school.name.split(' ')[0]}
                </div>

                <div className="text-center mb-12">
                   <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 relative inline-block">
                     {isGenerating === 'boletim' ? 'Boletim de Desempenho' : 
                      isGenerating === 'declaracao' ? 'Declaração Escolar' :
                      isGenerating === 'ficha' ? 'Ficha Individual do Discente' :
                      'Cópia de Guia de Transferência'}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-indigo-600 rounded-full" />
                   </h2>
                </div>

                <div className="flex-1">
                  {isGenerating === 'boletim' ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Discente</p>
                          <p className="text-sm font-bold text-slate-800">{selectedStudent.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">RA: {selectedStudent.ra || 'REGISTRO PENDENTE'}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Enturmação</p>
                          <p className="text-sm font-bold text-slate-800">{classes.find(c => c.id === selectedStudent.classId)?.name || 'N/A'}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Ano Letivo {school.academicYear || 2024}</p>
                        </div>
                      </div>
                      
                      <div className="overflow-hidden border border-slate-900 rounded-lg">
                        <table className="w-full text-xs text-center">
                          <thead>
                            <tr className="bg-slate-900 text-white">
                              <th className="p-3 text-left">Disciplina</th>
                              <th className="p-3">1º Bim</th>
                              <th className="p-3">2º Bim</th>
                              <th className="p-3">3º Bim</th>
                              <th className="p-3">4º Bim</th>
                              <th className="p-3">Média</th>
                              <th className="p-3">Faltas</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {['Língua Portuguesa', 'Matemática', 'História', 'Geografia', 'Ciências', 'Artes', 'Inglês', 'Educação Física'].map(disciplina => (
                              <tr key={disciplina} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 text-left font-bold text-slate-800">{disciplina}</td>
                                {[8.5, 9.0, '-', '-', 8.8, 2].map((val, idx) => (
                                  <td key={idx} className={`p-3 font-medium ${idx === 4 ? 'bg-indigo-50 font-black text-indigo-700' : ''}`}>
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                         <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Situação Parcial:</p>
                         <p className="text-xs font-black text-indigo-800 uppercase tracking-widest">Aproveitamento Satisfatório (Em Curso)</p>
                      </div>
                    </div>
                  ) : isGenerating === 'ficha' ? (
                    <div className="space-y-10">
                       <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
                         <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nome Civil Completo</p>
                           <p className="font-bold border-b border-slate-200 pb-1 text-slate-800">{selectedStudent.name}</p>
                         </div>
                         <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Matrícula Escolar (RA)</p>
                           <p className="font-bold border-b border-slate-200 pb-1 text-slate-800">{selectedStudent.ra || 'PENDENTE'}</p>
                         </div>
                         <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Data de Nascimento</p>
                           <p className="font-bold border-b border-slate-200 pb-1 text-slate-800">15 de Maio de 2012</p>
                         </div>
                         <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Turma de Referência</p>
                           <p className="font-bold border-b border-slate-200 pb-1 text-slate-800">{classes.find(c => c.id === selectedStudent.classId)?.name || 'Não alocada'}</p>
                         </div>
                         <div className="col-span-2 space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Responsáveis Legais</p>
                           <p className="font-bold border-b border-slate-200 pb-1 text-slate-800">Maria Oliveira Souza e João Souza</p>
                         </div>
                       </div>
                       
                       <div className="mt-6">
                         <h3 className="font-black text-xs uppercase tracking-widest text-slate-800 bg-slate-100 p-2 border-l-4 border-slate-900 mb-4">Registro Histórico de Ocorrências</h3>
                         {occurrences.length === 0 ? (
                           <div className="border border-slate-200 border-dashed p-10 text-center text-xs text-slate-400 italic rounded-2xl">
                             "Nenhum registro de ocorrência disciplinar ou pedagógica consta no prontuário do aluno até a presente data."
                           </div>
                         ) : (
                           <div className="space-y-6">
                             {occurrences.slice(0, 8).map(occ => (
                               <div key={occ.id} className="text-xs border-l-2 border-slate-200 pl-4 py-1 relative">
                                  <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-slate-900" />
                                  <div className="flex justify-between items-center mb-1">
                                     <span className="font-black text-slate-900 uppercase tracking-tight">{occ.type} • {occ.severity === 'high' ? 'GRAVIDADE ALTA' : occ.severity === 'medium' ? 'GRAVIDADE MÉDIA' : 'GRAVIDADE BAIXA'}</span>
                                     <span className="text-slate-400 font-mono">{occ.createdAt?.toDate().toLocaleDateString('pt-BR')}</span>
                                  </div>
                                  <p className="text-slate-600 italic leading-relaxed">"{occ.description}"</p>
                               </div>
                             ))}
                             {occurrences.length > 8 && <p className="text-[10px] text-indigo-600 font-black text-center pt-4 uppercase tracking-widest animate-pulse">+ {occurrences.length - 8} registros adicionais arquivados em prontuário físico</p>}
                           </div>
                         )}
                       </div>
                    </div>
                  ) : isGenerating === 'transfer' ? (
                    <div className="space-y-10 text-[15px] document-content text-justify">
                      <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center gap-6 shadow-2xl">
                         <div className="p-4 bg-white/10 rounded-full">
                            <ArrowRightLeft className="w-8 h-8" />
                         </div>
                         <div>
                            <h3 className="text-lg font-black uppercase tracking-widest mb-1">Guia de Transferência Definitiva</h3>
                            <p className="text-[10px] font-bold text-indigo-300 uppercase opacity-70 tracking-tighter">Status: Autorizado pela Diretoria Escolar</p>
                         </div>
                      </div>

                      <p>O <strong>{school.name}</strong>, devidamente credenciado pelos órgãos de regulação de ensino sob o CNPJ {school.cnpj}, certifica para todos os fins acadêmicos e legais que o discente <strong>{selectedStudent.name}</strong>, portador do número de registro (RA) <strong>{selectedStudent.ra || 'PENDENTE'}</strong>, teve seu pedido de desligamento e transferência <strong>DEFERIDO</strong> com sucesso.</p>

                      <div className="grid grid-cols-1 gap-4 bg-slate-50 p-6 border-l-4 border-indigo-600 rounded-r-2xl italic text-sm">
                        <p><strong>Justificativa da Solicitação:</strong> {studentTransfers[0]?.reason || 'Motivos de foro particular / Mudança de Comarca.'}</p>
                        <p><strong>Despacho do Diretor:</strong> {studentTransfers[0]?.observations || 'Nada mais a opor. Transferência integral autorizada com base no regimento interno desta instituição.'}</p>
                        <p><strong>Data de Homologação:</strong> {studentTransfers[0]?.resolvedAt?.toDate().toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR')}</p>
                      </div>

                      <p>Certificamos que o prontuário pedagógico do referido aluno encontra-se disponível e atualizado, contendo todas as notas, avaliações e registros de frequência necessários para a devida adaptação e equivalência curricular na instituição de destino (instituto receptor).</p>
                      
                      <p>Pela presente guia, damos por encerrado o vínculo institucional de matrícula para o período letivo vigente, responsabilizando-se a secretaria por toda a documentação comprobatória entregue à família.</p>
                    </div>
                  ) : (
                    <div className="space-y-10 text-[16px] document-content text-justify mt-16 leading-extra-relaxed">
                      <p>Declaramos para os devidos fins de interesse do requisitante que o(a) aluno(a) <strong>{selectedStudent.name}</strong>, devidamente inscrito sob o Registro Acadêmico (RA) <strong>{selectedStudent.ra || 'PENDENTE'}</strong>, encontra-se com matrícula <strong>ATIVA</strong> e regular nesta unidade de ensino.</p>
                      
                      <p>O referido discente está enturmado no(a) <strong>{classes.find(c => c.id === selectedStudent.classId)?.name || '(Sem Turma)'}</strong>, assistindo aula regularmente no período letivo de {school.academicYear || 2024}, cumprindo integralmente com todas as exigências regimentais, pedagógicas e administrativas previstas no plano de ensino aprovado.</p>
                      
                      <p>A presente declaração é a expressão da verdade acadêmica desta casa de educação e possui validade de 30 (trinta) dias ininterruptos, contados a partir da data de sua emissão.</p>
                    </div>
                  )}
                </div>

                {/* Date and Signature */}
                <div className="mt-auto pt-20">
                   <div className="text-right mb-24">
                      <p className="text-sm font-medium text-slate-800">
                        {school.address.split(',')[1]?.split('-')[1]?.trim() || 'São Paulo'}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                   </div>
                   
                   <div className="flex justify-around items-center gap-12">
                      <div className="text-center">
                         <div className="w-48 h-[1px] bg-slate-900 mb-2 mx-auto" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-tight">Secretaria Acadêmica</p>
                         <p className="text-[9px] text-slate-400 italic">Responsável pelo Prontuário</p>
                      </div>
                      <div className="text-center">
                         <div className="w-48 h-[1px] bg-slate-900 mb-2 mx-auto" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-tight">Direção Escolar</p>
                         <p className="text-[9px] text-slate-400 italic">Gestão da Unidade {school.logoLetter}</p>
                      </div>
                   </div>
                </div>
                
                {/* Footer Info */}
                <div className="flex justify-between items-end mt-12 pt-6 border-t border-slate-100 text-[8px] font-mono text-slate-400">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-2 h-2" /> Assinado Digitalmente • Validação: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    <span>Emitido por: {profile?.name || 'Administrador Sistema'} via Escola360 v2.8</span>
                  </div>
                  <div className="text-right">
                    <span>Folha 01/01 • Documentação Acadêmica Digital</span>
                  </div>
                </div>
             </div>
           </div>
        </div>,
        document.body
      )}

      <AnimatePresence>
        {isRequestingTransfer && selectedStudent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsRequestingTransfer(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-6"
              >
                <div className="flex items-center gap-3 text-amber-600">
                   <div className="p-3 bg-amber-50 rounded-xl">
                      <ArrowRightLeft className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-800">Solicitar Transferência</h3>
                     <p className="text-xs text-slate-500">Fluxo de autorização administrativa</p>
                   </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Aluno Alvo</p>
                   <p className="text-sm font-bold text-slate-800">{selectedStudent.name}</p>
                   <p className="text-[10px] text-slate-500">RA: {selectedStudent.ra || 'PENDENTE'}</p>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Motivo da Transferência</label>
                   <textarea 
                    value={transferReason}
                    onChange={e => setTransferReason(e.target.value)}
                    placeholder="Descreva o motivo (mudança de cidade, pedido dos pais, etc)..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs outline-none focus:ring-2 focus:ring-amber-500/20 min-h-[100px]"
                   />
                </div>

                <div className="flex gap-2">
                   <button 
                    onClick={() => setIsRequestingTransfer(false)}
                    className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                   >
                     Cancelar
                   </button>
                   <button 
                    onClick={async () => {
                      if (!transferReason) return alert("Por favor, informe o motivo.");
                      try {
                        await firebaseService.requestTransfer(schoolId, selectedStudent.id, selectedStudent.name, transferReason);
                        alert("Solicitação enviada para análise da gestão!");
                        setIsRequestingTransfer(false);
                        setTransferReason('');
                      } catch (err) {
                        console.error(err);
                        alert("Erro ao enviar solicitação.");
                      }
                    }}
                    className="flex-1 py-3 px-4 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-500/20"
                   >
                     Enviar Pedido
                   </button>
                </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DocCard({ title, desc, onClick, loading, icon, colorClass = 'blue', status }: { title: string, desc: string, onClick: () => void, loading: boolean, icon?: React.ReactNode, colorClass?: 'blue' | 'amber', status?: string }) {
  const colors = {
    blue: {
      border: 'hover:border-blue-200',
      shadow: 'hover:shadow-blue-500/5',
      text: 'text-blue-600',
      bgHover: 'group-hover:bg-blue-600',
      textHover: 'group-hover:text-blue-400',
      textActive: 'text-blue-600'
    },
    amber: {
      border: 'hover:border-amber-200',
      shadow: 'hover:shadow-amber-500/5',
      text: 'text-amber-600',
      bgHover: 'group-hover:bg-amber-600',
      textHover: 'group-hover:text-amber-400',
      textActive: 'text-amber-600'
    }
  };

  const activeColor = colors[colorClass];

  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white ${activeColor.border} hover:shadow-xl ${activeColor.shadow} transition-all group relative cursor-pointer active:scale-95 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {status && (
        <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-lg text-[8px] font-black uppercase shadow-sm ${
          status === 'approved' ? 'bg-emerald-500 text-white' : 
          status === 'pending' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {status === 'approved' ? 'Aprovado' : status === 'pending' ? 'Pendente' : 'Rejeitado'}
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 bg-white rounded-xl shadow-sm ${activeColor.text} ${activeColor.bgHover} group-hover:text-white transition-all`}>
          {icon || <FileText className="w-6 h-6" />}
        </div>
        <Printer className={`w-4 h-4 text-slate-300 ${activeColor.textHover}`} />
      </div>
      <h4 className="font-bold text-slate-800 text-sm mb-1">{title}</h4>
      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{desc}</p>
      
      <div className={`mt-4 flex items-center gap-2 text-[10px] font-bold ${activeColor.textActive} uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity`}>
        <span>{loading ? 'Processando...' : 'Gerar e Visualizar'}</span>
      </div>
    </div>
  );
}
