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
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, type ReactNode } from 'react';

// Feature Components
import Dashboard from './features/dashboard/Dashboard';
import Students from './features/academic/Students';
import Classes from './features/academic/Classes';
import Finance from './features/finance/Finance';
import Documents from './features/documents/Documents';

type ActiveModule = 'dashboard' | 'students' | 'classes' | 'finance' | 'documents' | 'settings';

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students />;
      case 'classes': return <Classes />;
      case 'finance': return <Finance />;
      case 'documents': return <Documents />;
      case 'settings': return <div className="p-8 text-slate-400">Configurações em desenvolvimento...</div>;
      default: return <Dashboard />;
    }
  };

  return (
    <div id="eduquest-app" className="flex flex-col h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* Top Navigation */}
      <header className="bg-slate-900 text-white shrink-0">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">E</div>
              <h1 className="font-bold tracking-tight text-lg hidden md:block">EduQuest SGE</h1>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              <NavButton 
                active={activeModule === 'dashboard'} 
                onClick={() => setActiveModule('dashboard')}
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Painel"
              />
              <NavButton 
                active={activeModule === 'students'} 
                onClick={() => setActiveModule('students')}
                icon={<Users className="w-4 h-4" />}
                label="Alunos"
              />
              <NavButton 
                active={activeModule === 'classes'} 
                onClick={() => setActiveModule('classes')}
                icon={<SchoolIcon className="w-4 h-4" />}
                label="Turmas"
              />
              <NavButton 
                active={activeModule === 'finance'} 
                onClick={() => setActiveModule('finance')}
                icon={<Wallet className="w-4 h-4" />}
                label="Financeiro"
              />
              <NavButton 
                active={activeModule === 'documents'} 
                onClick={() => setActiveModule('documents')}
                icon={<FileText className="w-4 h-4" />}
                label="Documentos"
              />
            </nav>
          </div>

          <div className="flex items-center gap-4">
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
                <p className="text-xs font-bold text-white">Colégio Santa Maria</p>
                <p className="text-[10px] text-slate-500">Tenant Ativo</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 cursor-pointer hover:bg-slate-600 transition-colors">
                JS
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb & Sub-actions */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div className="max-w-[1600px] mx-auto px-8 h-12 flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
              <span className="text-slate-400">EduQuest</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-900">{activeModule}</span>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveModule('settings')}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" /> Configurações
              </button>
              <button className="flex items-center gap-2 text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors">
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
          <p className="text-[10px] text-slate-400 font-medium">EduQuest SGE v2.8.0 • 2024 Built with Tech Solutions</p>
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

function StatusIndicator({ dotColor, label }: { dotColor: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`}></span>
      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{label}</span>
    </div>
  );
}
