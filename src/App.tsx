import { 
  LayoutDashboard, 
  Users, 
  School as SchoolIcon, 
  Wallet, 
  Bell, 
  ChevronRight,
  Settings,
  LogOut,
  Search,
  FileText,
  Home,
  Briefcase,
  Loader2,
  ArrowRightLeft,
  ChevronDown,
  GraduationCap,
  ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, type ReactNode, useEffect, useRef } from 'react';
import { useAuth } from './lib/AuthContext';

// Feature Components
import Dashboard from './features/dashboard/Dashboard';
import Students from './features/academic/Students';
import Classes from './features/academic/Classes';
import Teachers from './features/academic/Teachers';
import Finance from './features/finance/Finance';
import Documents from './features/documents/Documents';
import SettingsView from './features/settings/Settings';
import Transfers from './features/academic/Transfers';
import Grades from './features/academic/Grades';
import Portal from './features/portal/Portal';
import TeacherPortal from './features/teacher/TeacherPortal';
import ParentPortal from './features/parent/ParentPortal';
import Login from './features/auth/Login';

type UserRole = 'portal' | 'admin' | 'teacher' | 'parent';
type ActiveModule = 'dashboard' | 'students' | 'teachers' | 'classes' | 'finance' | 'documents' | 'settings' | 'transfers' | 'grades';

export default function App() {
  const { user, profile, loading, signOut } = useAuth();
  const [role, setRole] = useState<UserRole>('portal');
  const [authStep, setAuthStep] = useState<'portal' | 'login' | 'authenticated'>('portal');
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');

  useEffect(() => {
    if (!loading) {
      if (user && profile) {
        setRole(profile.role as UserRole);
        setAuthStep('authenticated');
      } else {
        // Only reset if we were previously authenticated
        if (authStep === 'authenticated') {
          setRole('portal');
          setAuthStep('portal');
        }
      }
    }
  }, [user, profile, loading]);

  const handleSelectRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'portal') {
      setAuthStep('portal');
    } else {
      setAuthStep('login');
    }
  };

  const handleLoginSuccess = (user: any) => {
    // This is for legacy mock login, Firebase will trigger the useEffect above
    setAuthStep('authenticated');
  };

  const handleLogout = async () => {
    await signOut();
    setRole('portal');
    setAuthStep('portal');
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students />;
      case 'teachers': return <Teachers />;
      case 'classes': return <Classes />;
      case 'finance': return <Finance />;
      case 'documents': return <Documents />;
      case 'settings': return <SettingsView />;
      case 'transfers': return <Transfers />;
      case 'grades': return <Grades />;
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (authStep === 'portal') {
    return <Portal onSelectRole={handleSelectRole} />;
  }

  if (authStep === 'login' && !user) {
    return <Login role={role as any} onBack={() => setAuthStep('portal')} onLoginSuccess={handleLoginSuccess} />;
  }

  if (role === 'teacher') {
    return <TeacherPortal onLogout={handleLogout} user={profile || user} />;
  }

  if (role === 'parent') {
    return <ParentPortal onLogout={handleLogout} user={profile || user} />;
  }

  return (
    <div id="eduquest-app" className="flex flex-col h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* Top Navigation */}
      <header className="bg-slate-900 border-b border-white/5 text-white shrink-0">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">360</div>
              <h1 className="font-bold tracking-tight text-lg hidden md:block">Escola<span className="text-blue-600">360</span></h1>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              <NavButton 
                active={activeModule === 'dashboard'} 
                onClick={() => setActiveModule('dashboard')}
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Painel"
              />
              
              <NavDropdown 
                label="Escolar"
                icon={<GraduationCap className="w-4 h-4" />}
                active={['students', 'teachers', 'classes', 'transfers'].includes(activeModule)}
                items={[
                  { label: 'Alunos', icon: <Users className="w-4 h-4" />, onClick: () => setActiveModule('students'), active: activeModule === 'students' },
                  { label: 'Professores', icon: <Briefcase className="w-4 h-4" />, onClick: () => setActiveModule('teachers'), active: activeModule === 'teachers' },
                  { label: 'Turmas', icon: <SchoolIcon className="w-4 h-4" />, onClick: () => setActiveModule('classes'), active: activeModule === 'classes' },
                  { label: 'Transferências', icon: <ArrowRightLeft className="w-4 h-4" />, onClick: () => setActiveModule('transfers'), active: activeModule === 'transfers' },
                ]}
              />

              <NavDropdown 
                label="Pedagógico"
                icon={<ClipboardCheck className="w-4 h-4" />}
                active={['grades', 'documents'].includes(activeModule)}
                items={[
                  { label: 'Notas e Frequência', icon: <GraduationCap className="w-4 h-4" />, onClick: () => setActiveModule('grades'), active: activeModule === 'grades' },
                  { label: 'Documentos', icon: <FileText className="w-4 h-4" />, onClick: () => setActiveModule('documents'), active: activeModule === 'documents' },
                ]}
              />

              <NavButton 
                active={activeModule === 'finance'} 
                onClick={() => setActiveModule('finance')}
                icon={<Wallet className="w-4 h-4" />}
                label="Financeiro"
              />
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleSelectRole('portal')}
              className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-white hover:text-slate-900 transition-all border border-slate-700"
            >
              <Home className="w-3 h-3" /> Portais
            </button>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Busca global..." 
                className="bg-slate-800 border-none rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-300 w-48 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all focus:w-64"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
            </button>
            <div className="h-8 w-px bg-slate-800 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{(profile?.name || user?.displayName) || 'Gestor Escola'}</p>
                <p className="text-[10px] text-slate-500">{profile?.role === 'admin' ? 'Administrador' : profile?.role || 'Usuário'}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 cursor-pointer hover:bg-slate-600 transition-colors">
                {(profile?.name || user?.displayName || 'AD').substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb & Sub-actions */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div className="max-w-[1600px] mx-auto px-8 h-12 flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
              <span className="text-slate-400">Escola<span className="text-blue-600">360</span></span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-900">
                {activeModule === 'grades' ? 'Notas e Frequência' : 
                 activeModule === 'dashboard' ? 'Painel' :
                 activeModule === 'students' ? 'Alunos' :
                 activeModule === 'teachers' ? 'Professores' :
                 activeModule === 'classes' ? 'Turmas' :
                 activeModule === 'finance' ? 'Financeiro' :
                 activeModule === 'documents' ? 'Documentos' :
                 activeModule === 'settings' ? 'Configurações' :
                 activeModule === 'transfers' ? 'Transferências' : activeModule}
              </span>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveModule('settings')}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" /> Configurações
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sair
              </button>
           </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Status */}
      <footer className="bg-white border-t border-slate-200 shrink-0">
        <div className="max-w-[1600px] mx-auto px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <StatusIndicator dotColor="bg-emerald-500" label="Servidor: Online" />
            <StatusIndicator dotColor="bg-blue-400" label="Sincronização: Tempo Real" />
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Escola<span className="text-blue-600">360</span> v2.8.5 • {new Date().getFullYear()} Built with Tech Solutions</p>
        </div>
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function NavDropdown({ label, icon, items, active }: { label: string; icon: ReactNode; items: { label: string, icon: ReactNode, onClick: () => void, active: boolean }[]; active: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
          active 
            ? 'text-white bg-slate-800/50' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        {icon}
        <span>{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 p-1.5"
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  item.active 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusIndicator({ dotColor, label }: { dotColor: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`}></span>
      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{label}</span>
    </div>
  );
}
