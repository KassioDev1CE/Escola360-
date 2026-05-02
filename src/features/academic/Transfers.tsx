import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  User,
  ArrowRight,
  FileText,
  AlertCircle
} from 'lucide-react';
import { firebaseService } from '../../lib/firebaseService';
import { useAuth } from '../../lib/AuthContext';

interface TransferRequest {
  id: string;
  studentId: string;
  studentName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: any;
  authorEmail: string;
  observations?: string;
  resolvedAt?: any;
  resolvedBy?: string;
}

export default function Transfers() {
  const { profile } = useAuth();
  const schoolId = profile?.schoolId || "cm_school_123";
  
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = firebaseService.subscribeToTransfers(schoolId, (data) => {
      setTransfers(data);
      setLoading(false);
    });
    return () => unsub();
  }, [schoolId]);

  const filteredTransfers = transfers.filter(t => {
    const matchesSearch = t.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selectedTransfer || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await firebaseService.updateTransferStatus(schoolId, selectedTransfer.id, status, observations);
      setSelectedTransfer(null);
      setObservations('');
      alert(`Transferência ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`);
    } catch (error) {
      console.error("Error updating transfer:", error);
      alert("Erro ao processar solicitação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pendente</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Aprovada</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Rejeitada</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gestão de Transferências</h2>
          <p className="text-sm text-slate-500">Analise e autorize solicitações de movimentação escolar</p>
        </div>
        <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-xl text-indigo-700">
           <ArrowRightLeft className="w-5 h-5" />
           <span className="text-xs font-bold uppercase tracking-wider text-center">{filteredTransfers.filter(t => t.status === 'pending').length} Pendentes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 flex gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar por nome do aluno..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="bg-slate-50 border-none rounded-xl text-xs font-bold px-3 py-2 text-slate-600 outline-none"
            >
              <option value="all">Todos Status</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovadas</option>
              <option value="rejected">Rejeitadas</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <Clock className="w-8 h-8 animate-spin" />
                <p className="text-xs font-medium">Carregando solicitações...</p>
              </div>
            ) : filteredTransfers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <AlertCircle className="w-8 h-8" />
                <p className="text-xs font-medium">Nenhuma solicitação encontrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransfers.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => setSelectedTransfer(t)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      selectedTransfer?.id === t.id 
                        ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600' 
                        : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        selectedTransfer?.id === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {t.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{t.studentName}</p>
                        <p className="text-[10px] text-slate-400">Solicitado em: {t.requestedAt?.toDate ? t.requestedAt.toDate().toLocaleDateString('pt-BR') : 'Recentemente'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(t.status)}
                      <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                        selectedTransfer?.id === t.id ? 'text-indigo-600' : 'text-slate-300'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details / Action */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedTransfer ? (
              <motion.div 
                key={selectedTransfer.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-slate-800">Detalhes da Solicitação</h3>
                  {getStatusBadge(selectedTransfer.status)}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Aluno</p>
                    <p className="text-sm font-bold text-slate-700">{selectedTransfer.studentName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Motivo / Justificativa</p>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl italic">
                      "{selectedTransfer.reason}"
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Solicitante</p>
                    <p className="text-sm text-slate-600">{selectedTransfer.authorEmail}</p>
                  </div>
                  
                  {selectedTransfer.status !== 'pending' && (
                    <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Resolução</p>
                      <p className="text-xs italic">"{selectedTransfer.observations || 'Sem observações adicionais'}"</p>
                      <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <span className="text-[9px] text-slate-400">Por: {selectedTransfer.resolvedBy}</span>
                        <span className="text-[9px] text-slate-400">{selectedTransfer.resolvedAt?.toDate().toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedTransfer.status === 'pending' && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Observações da Gestão</label>
                      <textarea 
                        value={observations}
                        onChange={e => setObservations(e.target.value)}
                        placeholder="Adicione observações para a aprovação ou negação..."
                        className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs min-h-[100px] outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleAction('rejected')}
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors disabled:opacity-50"
                       >
                         Rejeitar
                       </button>
                       <button 
                        onClick={() => handleAction('approved')}
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                       >
                         Autorizar
                       </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-[400px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-300 mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                 </div>
                 <h4 className="font-bold text-slate-500">Selecione uma solicitação</h4>
                 <p className="text-[10px] text-slate-400 mt-1">Para visualizar os detalhes e tomar uma ação administrativa.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
