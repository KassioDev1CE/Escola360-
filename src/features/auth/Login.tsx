import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  Lock, 
  User, 
  ArrowRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Calendar,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

interface LoginProps {
  role: 'admin' | 'teacher' | 'parent';
  onBack: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function Login({ role, onBack, onLoginSuccess }: LoginProps) {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    identifier: '', // Email, Username or CPF
    password: '',   // Generic password or Date of Birth
  });

  const getRoleConfig = () => {
    switch (role) {
      case 'admin':
        return {
          title: 'Acesso Administrativo',
          desc: 'Gestão Central da Instituição',
          icon: <ShieldCheck className="w-10 h-10" />,
          color: 'bg-blue-600',
          userInput: 'E-mail Institucional',
          passInput: 'Senha',
          type: 'password'
        };
      case 'teacher':
        return {
          title: 'Portal do Professor',
          desc: 'Ambiente de Sala de Aula',
          icon: <GraduationCap className="w-10 h-10" />,
          color: 'bg-indigo-600',
          userInput: 'Email Institucional',
          passInput: 'Senha de Acesso',
          type: 'password'
        };
      case 'parent':
        return {
          title: 'Área do Responsável',
          desc: 'Acompanhamento do Aluno',
          icon: <Users className="w-10 h-10" />,
          color: 'bg-emerald-600',
          userInput: 'CPF do Responsável',
          passInput: 'Data de Nascimento',
          type: 'password'
        };
      default: return { title: 'Login', desc: '', userInput: 'Usuário', passInput: 'Senha', type: 'password' };
    }
  };

  const config = getRoleConfig();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        await signUp(form.identifier, form.password);
      } else {
        await signIn(form.identifier, form.password);
      }
    } catch (err: any) {
      console.error("Erro de Autenticação:", err.code, err.message);
      
      // Mapeamento de erros comuns do Firebase para mensagens amigáveis
      if (err.code === 'auth/user-not-found') {
        if (role === 'admin') {
          setError("Este administrador ainda não está cadastrado no sistema.");
          setIsRegistering(true);
        } else {
          setError("E-mail ou identificador não encontrado.");
        }
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      } else if (err.code === 'auth/invalid-email') {
        setError("O formato do e-mail é inválido.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Este e-mail já está em uso.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(`Provedor Email/Senha desativado no Firebase. Ative-o em: console.firebase.google.com/project/gen-lang-client-0443157874/authentication`);
      } else if (err.code === 'auth/weak-password') {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError(`Erro (${err.code}): ${err.message || "Tente novamente mais tarde."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-left-top bg-no-repeat" style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)' }}>
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold text-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar ao Início
      </button>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-2xl shadow-slate-200/50">
          <div className="flex flex-col items-center text-center mb-10">
            <div className={`w-20 h-20 ${config.color} text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-current/20`}>
              {config.icon}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{isRegistering ? 'Cadastrar Admin' : config.title}</h1>
            <p className="text-slate-500 font-medium text-sm mt-2">{isRegistering ? 'Crie sua conta de acesso inicial' : config.desc}</p>
          </div>

          <div className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{config.userInput}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input 
                    required
                    type={role === 'admin' ? "email" : "text"}
                    value={form.identifier}
                    onChange={e => setForm({...form, identifier: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm"
                    placeholder={role === 'parent' ? "000.000.000-00" : "seu@email.com"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{config.passInput}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    {role === 'parent' ? <Calendar className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <input 
                    required
                    type={config.type}
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm"
                    placeholder={role === 'parent' ? "" : "••••••••"}
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-2 p-4 bg-rose-50 text-rose-600 rounded-2xl text-[11px] font-bold border border-rose-100"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                  {error.includes("não encontrado") && (
                    <button 
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      className="text-blue-600 underline hover:text-blue-700 text-left mt-1"
                    >
                      Clique aqui para cadastrar com este e-mail
                    </button>
                  )}
                </motion.div>
              )}

              <button 
                disabled={loading}
                className={`w-full py-5 rounded-[1.5rem] font-black text-white shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all text-xs uppercase tracking-widest ${
                  loading ? 'bg-slate-400' : 'bg-slate-900 hover:bg-black shadow-slate-900/10'
                }`}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{isRegistering ? 'Criar e Entrar' : 'Entrar Agora'} <ArrowRight className="w-4 h-4" /></>}
              </button>
              
              {isRegistering && (
                <button 
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="w-full text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 hover:text-slate-600"
                >
                  Voltar para o Login
                </button>
              )}
            </form>
          </div>

          {role === 'parent' && (
            <div className="mt-8 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Esqueceu seus dados?</p>
              <button className="text-emerald-600 text-[10px] font-black uppercase mt-1 hover:underline">Contatar Secretaria</button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
