import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Post } from '../types';
import PostCard from './PostCard';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Erro no feed:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <Loader2 className="animate-spin text-primary relative z-10" size={48} />
          <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
        </div>
        <p className="font-bold uppercase tracking-[0.2em] text-zinc-500 mt-6 text-xs">Sincronizando Banco de Dados...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="tech-card p-16 text-center bg-zinc-900/30 border-dashed border-zinc-800">
        <h2 className="text-2xl font-display font-black uppercase mb-4 tracking-tight">Nenhuma transmissão ativa</h2>
        <p className="text-zinc-500 max-w-sm mx-auto">Aguarde por novas atualizações tecnológicas criptografadas da WYMDTEC.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <motion.div 
        layout
        className="space-y-8"
      >
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </motion.div>
    </div>
  );
}
