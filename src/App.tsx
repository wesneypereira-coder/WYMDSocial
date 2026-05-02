import { useState, useEffect } from 'react';
import Header from './components/Header';
import Feed from './components/Feed';
import CreatePost from './components/CreatePost';
import { auth, db, signIn } from './lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ShieldCheck, UserCircle, LogIn, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Logo } from './components/Logo';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const syncUser = async () => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName || 'Anônimo',
            photoURL: user.photoURL || '',
            createdAt: serverTimestamp()
          });
        }
      };
      syncUser();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg font-sans">
        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4 mb-8"
          >
            <Logo className="h-14" />
            <div className="logo text-xl tracking-widest text-zinc-300">CARREGANDO</div>
          </motion.div>
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-dark selection:bg-primary selection:text-white pb-20">
      <Header onOpenCreate={() => setIsCreateOpen(true)} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!user && (
          <div className="tech-card p-12 text-center bg-white mb-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full -ml-32 -mb-32 blur-3xl" />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10"
            >
              <h1 className="text-4xl font-display font-black uppercase mb-4 tracking-tighter leading-none">
                ACOMPANHE A <span className="text-accent italic">INOVAÇÃO</span>
              </h1>
              <p className="text-zinc-500 text-base mb-8 font-medium leading-relaxed max-w-xl mx-auto uppercase tracking-wide">
                Acesse com sua conta para interagir e comentar nas postagens.
              </p>
              <button onClick={signIn} className="tech-btn tech-btn-primary mx-auto py-3 px-10 text-lg">
                <LogIn size={20} strokeWidth={2.5} />
                ENTRAR PARA INTERAGIR
              </button>
            </motion.div>
          </div>
        )}

        {user?.email === 'wesneypereira@gmail.com' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-dark uppercase tracking-tight">Painel Administrativo</p>
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest leading-none">Sessão Segura • Social</p>
              </div>
            </div>
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="tech-btn tech-btn-accent py-2.5 px-6 text-sm"
            >
              Postar Agora
            </button>
          </motion.div>
        )}
        
        <Feed />
      </main>

      <AnimatePresence>
        {isCreateOpen && (
          <CreatePost onClose={() => setIsCreateOpen(false)} />
        )}
      </AnimatePresence>

      {/* Mobile Post Button */}
      {user?.email === 'wesneypereira@gmail.com' && (
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="fixed bottom-8 right-8 p-5 rounded-3xl bg-accent text-white shadow-2xl shadow-accent/40 hover:scale-110 active:scale-95 transition-all md:hidden z-50 border-4 border-white"
        >
          <PlusSquare size={32} />
        </button>
      )}

      {/* Footer Decoration */}
      <footer className="mt-24 border-t border-zinc-200 p-16 bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2">
            <Logo className="h-7" />
            <span className="logo text-xl font-display uppercase tracking-tight text-accent">Social</span>
          </div>
          <div className="flex flex-wrap justify-center gap-12 font-bold uppercase text-[11px] tracking-[0.2em] text-zinc-300">
            <span className="hover:text-primary cursor-pointer transition-colors">CONEXÃO</span>
            <span className="hover:text-accent cursor-pointer transition-colors">INOVAÇÃO</span>
            <span className="hover:text-success cursor-pointer transition-colors">SUPORTE</span>
            <span className="text-zinc-200">© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
