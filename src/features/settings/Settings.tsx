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
  ShieldAlert
} from 'lucide-react';

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
  const [config, setConfig] = useState<SchoolConfig>({
    name: "Colégio Santa Maria",
    cnpj: "12.345.678/0001-90",
    address: "Rua das Flores, 123 - Jardim América, São Paulo - SP",
    email: "secretaria@santamaria.edu.br",
    phone: "(11) 4002-8922",
    logoLetter: "S",
    academicYear: 2024,
    directorName: "Prof. Dr. Roberto Silva"
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    // In a real app, fetch from /api/school-config
    const savedConfig = localStorage.getItem('school_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      localStorage.setItem('school_config', JSON.stringify(config));
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Falha ao salvar configurações.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Cenário e Identidade</h2>
          <p className="text-sm text-slate-500">Configure a identidade visual e dados oficiais da sua escola</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
           <ShieldAlert className="w-4 h-4" />
           ADMINISTRADOR
        </div>
      </div>

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
                A letra escolhida será utilizada como ícone principal em documentos oficiais, boletins e declarações emitidas pelo sistema.
              </p>
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-700 italic">
                Dica: Use a inicial da sua instituição para manter a sobriedade nos impressos.
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
                placeholder="Ex: Escola EduQuest"
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

        {/* 3. Canais de Contato */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contato da Secretaria</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingsField label="Email Institucional" icon={<Mail />}>
              <input 
                type="email"
                required
                value={config.email}
                onChange={e => setConfig({...config, email: e.target.value})}
                placeholder="contato@escola.com.br"
              />
            </SettingsField>
            <SettingsField label="Telefone de Suporte" icon={<Phone />}>
              <input 
                required
                value={config.phone}
                onChange={e => setConfig({...config, phone: e.target.value})}
                placeholder="(00) 0000-0000"
              />
            </SettingsField>
          </div>
        </section>

        {/* Status Messages */}
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
