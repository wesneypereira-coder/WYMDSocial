import { auth, signIn, logout } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogIn, LogOut, PlusSquare } from 'lucide-react';
import { motion } from 'motion/react';

export default function Header({ onOpenCreate }: { onOpenCreate: () => void }) {
  const [user] = useAuthState(auth);
  const isAdmin = user?.email === 'wesneypereira@gmail.com';

  return (
    <header className="glass-header p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="logo text-3xl"
        >
          <b>WYMD</b><span>Social</span>
        </motion.div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {isAdmin && (
                <button 
                  onClick={onOpenCreate}
                  className="tech-btn tech-btn-accent hidden md:flex py-2 px-4 text-sm"
                >
                  <PlusSquare size={18} />
                  NOVA POSTAGEM
                </button>
              )}
              <div className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-zinc-50 border border-zinc-100 rounded-2xl">
                <img 
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                  alt={user.displayName || 'User'} 
                  className="w-8 h-8 rounded-xl border border-zinc-200"
                />
                <span className="hidden sm:inline text-sm font-bold text-dark">{user.displayName?.split(' ')[0]}</span>
              </div>
              <button 
                onClick={logout} 
                className="p-2.5 rounded-2xl border border-zinc-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center text-zinc-400"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <button onClick={signIn} className="tech-btn tech-btn-primary">
              <LogIn size={20} />
              ENTRAR
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
