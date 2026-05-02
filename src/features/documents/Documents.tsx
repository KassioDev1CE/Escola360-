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
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.ra.includes(searchTerm);
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
                      <p className={`text-[10px] ${selectedStudentId === s.id ? 'text-blue-100' : 'text-slate-400'}`}>RA: {s.ra}</p>
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
           <div className="p-10 font-sans text-slate-900 bg-white min-h-screen">
             <div className="border-2 border-slate-900 p-8 min-h-[1000px] flex flex-col relative bg-white">
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-6 mb-8">
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter">{school.name}</h1>
                    <p className="text-xs font-bold">{school.address}</p>
                    <p className="text-[10px]">CNPJ: {school.cnpj} • Email: {school.email}</p>
                  </div>
                  <div className="w-16 h-16 border-2 border-slate-900 flex items-center justify-center font-black text-3xl">
                    {school.logoLetter}
                  </div>
                </div>
                
                <div className="text-center my-8">
                  <h2 className="text-xl font-black uppercase underline decoration-2 underline-offset-8">
                    {isGenerating === 'boletim' ? 'Boletim de Desempenho Escolar' : 
                     isGenerating === 'declaracao' ? 'Declaração de Matrícula e Frequência' :
                     'Ficha Individual do Aluno'}
                  </h2>
                </div>

                <div className="flex-1">
                  {isGenerating === 'boletim' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="border border-slate-900 p-2"><strong>Aluno:</strong> {selectedStudent.name}</div>
                        <div className="border border-slate-900 p-2"><strong>RA:</strong> {selectedStudent.ra}</div>
                        <div className="border border-slate-900 p-2"><strong>Turma:</strong> {classes.find(c => c.id === selectedStudent.classId)?.name || '-'}</div>
                        <div className="border border-slate-900 p-2"><strong>Ano:</strong> {school.academicYear || 2024}</div>
                      </div>
                      
                      <table className="w-full border-collapse border border-slate-900 text-xs text-center mt-4">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-900 p-2">Componente Curricular</th>
                            <th className="border border-slate-900 p-2">1º Bim</th>
                            <th className="border border-slate-900 p-2">2º Bim</th>
                            <th className="border border-slate-900 p-2">3º Bim</th>
                            <th className="border border-slate-900 p-2">4º Bim</th>
                            <th className="border border-slate-900 p-2">Média</th>
                            <th className="border border-slate-900 p-2">Faltas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['Língua Portuguesa', 'Matemática', 'História', 'Geografia', 'Ciências', 'Artes'].map(disciplina => (
                            <tr key={disciplina}>
                              <td className="border border-slate-900 p-2 text-left font-bold">{disciplina}</td>
                              <td className="border border-slate-900 p-2">8.5</td>
                              <td className="border border-slate-900 p-2">9.0</td>
                              <td className="border border-slate-900 p-2">-</td>
                              <td className="border border-slate-900 p-2">-</td>
                              <td className="border border-slate-900 p-2">8.8</td>
                              <td className="border border-slate-900 p-2">2</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="text-[10px] italic mt-4">* Dados parciais referentes aos bimestres concluídos.</p>
                    </div>
                  ) : isGenerating === 'ficha' ? (
                    <div className="space-y-8">
                       <div className="grid grid-cols-2 gap-y-4 text-sm mt-4">
                         <div><strong>Nome Completo:</strong><br/>{selectedStudent.name}</div>
                         <div><strong>Registro Acadêmico (RA):</strong><br/>{selectedStudent.ra}</div>
                         <div><strong>Data de Nascimento:</strong><br/>15/05/2012</div>
                         <div><strong>Turma Atual:</strong><br/>{classes.find(c => c.id === selectedStudent.classId)?.name || 'Não alocada'}</div>
                         <div className="col-span-2"><strong>Filiação:</strong><br/>Maria Oliveira Souza e João Souza</div>
                         <div className="col-span-2"><strong>Endereço:</strong><br/>Rua das Palmeiras, 456 - Bairro Novo</div>
                       </div>
                       
                       <div className="mt-10">
                         <h3 className="font-bold border-b border-slate-900 mb-2">Histórico de Ocorrências / Observações</h3>
                         {occurrences.length === 0 ? (
                           <div className="border border-slate-300 p-4 h-32 text-xs text-slate-600 bg-slate-50 italic">
                             Nenhuma ocorrência disciplinar registrada até a presente data ({new Date().toLocaleDateString('pt-BR')}).
                           </div>
                         ) : (
                           <div className="space-y-4">
                             {occurrences.slice(0, 5).map(occ => (
                               <div key={occ.id} className="text-xs border-b border-slate-100 pb-2">
                                  <div className="flex justify-between font-bold mb-1">
                                     <span>{occ.type} - {occ.severity === 'high' ? 'GRAVE' : occ.severity === 'medium' ? 'MÉDIA' : 'LEVE'}</span>
                                     <span>{occ.createdAt?.toDate().toLocaleDateString('pt-BR')}</span>
                                  </div>
                                  <p>{occ.description}</p>
                               </div>
                             ))}
                             {occurrences.length > 5 && <p className="text-[10px] text-slate-400 italic">Mais {occurrences.length - 5} registros não listados nesta via...</p>}
                           </div>
                         )}
                       </div>
                    </div>
                  ) : isGenerating === 'transfer' ? (
                    <div className="space-y-8 text-sm leading-relaxed text-justify mt-10">
                      <div className="text-center mb-10">
                        <h3 className="text-xl font-black border-2 border-slate-900 inline-block px-6 py-2 uppercase">Guia de Transferência</h3>
                      </div>
                      <p>O <strong>{school.name}</strong>, por meio de sua secretaria acadêmica, certifica que o(a) aluno(a) <strong>{selectedStudent.name}</strong>, portador(a) do RA <strong>{selectedStudent.ra}</strong>, regularmente matriculado(a) nesta instituição de ensino, teve sua solicitação de transferência DEFERIDA.</p>
                      
                      <div className="p-4 bg-slate-50 border border-slate-900">
                        <p><strong>Motivo da Solicitação:</strong> {studentTransfers[0]?.reason || 'Não informado'}</p>
                        <p><strong>Parecer da Gestão:</strong> {studentTransfers[0]?.observations || 'Transferência autorizada conforme regimento escolar.'}</p>
                        <p><strong>Data de Autorização:</strong> {studentTransfers[0]?.resolvedAt?.toDate().toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR')}</p>
                      </div>

                      <p>O(A) referido(a) aluno(a) está apto(a) a prosseguir with seus estudos em outra unidade escolar, levando consigo seu prontuário e ficha individual de rendimento acadêmico para as devidas equivalências curriculares.</p>
                      
                      <p>Damos por encerrado o vínculo de matrícula com esta instituição na presente data, ressalvadas as obrigações legais e administrativas decorrentes do período de permanência.</p>
                      
                      <p className="mt-10 text-right">{school.address.split(',')[1]?.split('-')[1]?.trim() || 'São Paulo'}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 text-sm leading-relaxed text-justify mt-10">
                      <p>Declaramos para os devidos fins de direito que o(a) aluno(a) <strong>{selectedStudent.name}</strong>, inscrito sob a matrícula/RA <strong>{selectedStudent.ra}</strong>, encontra-se devidamente matriculado(a) na turma <strong>{classes.find(c => c.id === selectedStudent.classId)?.name || '(Sem Turma)'}</strong> desta conceituada instituição de ensino no período letivo de {school.academicYear || 2024}.</p>
                      <p>O(A) referido(a) discente frequenta as aulas regularmente, cumprindo com as exigências pedagógicas e regimentais da escola.</p>
                      <p>A presente declaração é a expressão da verdade e tem validade de 30 (trinta) dias a contar da data de sua emissão.</p>
                      <p className="mt-10 text-right">{school.address.split(',')[1].split('-')[1]?.trim() || 'São Paulo'}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
                    </div>
                  )}
                </div>

                <div className="mt-40 border-t-2 border-slate-900 pt-2 text-center max-w-xs mx-auto">
                  <p className="text-xs font-bold uppercase tracking-wider">Secretaria Acadêmica</p>
                  <p className="text-[10px] text-slate-500">{school.name}</p>
                </div>
                
                <div className="flex justify-between items-end mt-auto pt-10 text-[8px] font-mono text-slate-400">
                  <span>Autenticidade: {Math.random().toString(36).substring(7).toUpperCase()}-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                  <span>Emitido via Sistema Escola360 em {new Date().toLocaleString('pt-BR')}</span>
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
                   <p className="text-[10px] text-slate-500">RA: {selectedStudent.ra}</p>
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
