import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  FileCheck, 
  Save, 
  Image as ImageIcon,
  Calendar as CalendarIcon,
  ShieldAlert,
  Loader2,
  BookOpen,
  Plus,
  Trash2,
  GraduationCap
} from 'lucide-react';
import { firebaseService } from '../../lib/firebaseService';
import { useAuth } from '../../lib/AuthContext';

interface SchoolConfig {
  name: string;
  cnpj: string;
  address: string;
  email: string;
  phone: string;
  logoLetter: string;
  academicYear: number;
  directorName: string;
}

export default function Settings() {
  const { profile } = useAuth();
  const schoolId = profile?.schoolId || "cm_school_123";

  const [activeTab, setActiveTab] = useState<'general' | 'curriculum'>('general');
  const [config, setConfig] = useState<SchoolConfig>({
    name: "Colégio Santa Maria",
    cnpj: "12.345.678/0001-90",
    address: "Rua das Flores, 123 - Jardim América, São Paulo - SP",
    email: "secretaria@santamaria.edu.br",
    phone: "(11) 4002-8922",
    logoLetter: "S",
    academicYear: 2026,
    directorName: "Prof. Dr. Roberto Silva"
  });
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await firebaseService.getSchoolConfig(schoolId);
        if (data) {
          setConfig(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
    
    // Subscribe to subjects
    const unsubSubjects = firebaseService.subscribeToSubjects(schoolId, (data) => {
      setSubjects(data);
    });
    
    return () => unsubSubjects();
  }, [schoolId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await firebaseService.updateSchoolConfig(schoolId, config);
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      localStorage.setItem('school_config', JSON.stringify(config));
    } catch (error) {
      console.error("Error saving config:", error);
      setMessage({ type: 'error', text: 'Falha ao salvar configurações.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    try {
      await firebaseService.addSubject(schoolId, { name: newSubject.trim() });
      setNewSubject("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (confirm("Tem certeza que deseja remover esta disciplina?")) {
      try {
        await firebaseService.deleteSubject(schoolId, id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Painel de Configuração</h2>
          <p className="text-sm text-slate-500">Controle os dados institucionais e pedagógicos da escola</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'general' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Institucional
          </button>
          <button 
            onClick={() => setActiveTab('curriculum')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'curriculum' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Currículo
          </button>
        </div>
      </div>

      {activeTab === 'general' ? (
        <form onSubmit={handleSave} className="space-y-6 pb-20">
          {/* 1. Identidade Visual */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Identidade Visual</h3>
            </div>
            <div className="p-6 flex flex-col md:flex-row gap-8 items-center">
              <div className="relative group">
                <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl group-hover:scale-105 transition-transform">
                  {config.logoLetter}
                </div>
                <div className="mt-4 flex flex-col items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2">Letra do Logo</label>
                  <input 
                    maxLength={1}
                    value={config.logoLetter}
                    onChange={e => setConfig({...config, logoLetter: e.target.value.toUpperCase()})}
                    className="w-12 text-center py-1 border border-slate-200 rounded-lg font-bold text-lg focus:ring-4 focus:ring-blue-500/10 outline-none"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  A letra escolhida será utilizada como ícone principal em documentos oficiais e declarações.
                </p>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-700 italic">
                  Dica: Use a inicial da sua instituição.
                </div>
              </div>
            </div>
          </section>

          {/* 2. Dados Oficiais */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Informações Cadastrais</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingsField label="Nome da Instituição" icon={<Building2 />}>
                <input 
                  required
                  value={config.name}
                  onChange={e => setConfig({...config, name: e.target.value})}
                  placeholder="Ex: Unidade Escola360"
                />
              </SettingsField>
              <SettingsField label="CNPJ Oficial" icon={<FileCheck />}>
                <input 
                  required
                  value={config.cnpj}
                  onChange={e => setConfig({...config, cnpj: e.target.value})}
                  placeholder="00.000.000/0001-00"
                />
              </SettingsField>
              <SettingsField label="Diretor(a) Responsável" icon={<ImageIcon />}>
                <input 
                  required
                  value={config.directorName}
                  onChange={e => setConfig({...config, directorName: e.target.value})}
                  placeholder="Nome completo do diretor"
                />
              </SettingsField>
              <SettingsField label="Ano Letivo Vigente" icon={<CalendarIcon />}>
                <input 
                  type="number"
                  required
                  value={config.academicYear}
                  onChange={e => setConfig({...config, academicYear: parseInt(e.target.value)})}
                />
              </SettingsField>
              <div className="md:col-span-2">
                <SettingsField label="Endereço Completo" icon={<MapPin />}>
                  <textarea 
                    required
                    rows={2}
                    value={config.address}
                    onChange={e => setConfig({...config, address: e.target.value})}
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </SettingsField>
              </div>
            </div>
          </section>

          {/* Status Message */}
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}
            >
              {message.type === 'success' ? <FileCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}

          <div className="sticky bottom-6 flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold transition-all shadow-xl active:scale-95 ${
                isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
              }`}
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 pb-20">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Disciplinas do Ano Letivo</h3>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  placeholder="Nova disciplina..."
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddSubject()}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button 
                  onClick={handleAddSubject}
                  className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {subjects.map((sub) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={sub.id} 
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 group-hover:rotate-6 transition-transform">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{sub.name}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteSubject(sub.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
              
              {subjects.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-3">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">Nenhuma disciplina cadastrada.</p>
                </div>
              )}
            </div>
          </section>

          <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-4">
             <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                <ShieldAlert className="w-5 h-5" />
             </div>
             <div>
                <h4 className="text-sm font-bold text-orange-900">Atenção Pedagógica</h4>
                <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                  Remover uma disciplina que já possui notas lançadas não apagará as notas do banco de dados, mas ocultará a disciplina dos relatórios e mapas. Recomendamos apenas adicionar novas disciplinas durante o ano letivo em curso.
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsField({ label, icon, children }: { label: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          {React.cloneElement(icon as any, { className: 'w-4 h-4' })}
        </div>
        <div className="pl-12">
          {React.cloneElement(children as any, {
            className: `w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${(children as any).props.className || ''}`
          })}
        </div>
      </div>
    </div>
  );
}
