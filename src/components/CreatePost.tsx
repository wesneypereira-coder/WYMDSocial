import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, Camera, UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';

export default function CreatePost({ onClose }: { onClose: () => void }) {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !imageUrl.trim() || !caption.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        ownerId: user.uid,
        ownerEmail: user.email,
        imageUrl: imageUrl.trim(),
        caption: caption.trim(),
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0
      });
      onClose();
    } catch (error) {
      console.error("Erro ao criar postagem:", error);
      alert('Erro ao criar postagem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-app-bg/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="tech-card w-full max-w-lg p-8 relative shadow-2xl shadow-primary/10"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-dark transition-colors p-2 rounded-xl hover:bg-zinc-50"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-display font-black uppercase mb-8 flex items-center gap-3 tracking-tighter">
          <Camera size={32} className="text-primary" />
          Nova Postagem
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-bold uppercase text-[10px] tracking-[0.2em] text-zinc-500">URL da Foto</label>
            <input 
              type="url" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
              required
              className="tech-input"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-bold uppercase text-[10px] tracking-[0.2em] text-zinc-500">Legenda</label>
            <textarea 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="O que está acontecendo na tecnologia?"
              required
              rows={4}
              className="tech-input resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="tech-btn tech-btn-primary w-full py-4 text-lg disabled:opacity-50 mt-4 group"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                PUBLICANDO...
              </span>
            ) : (
              <>
                <UploadCloud size={24} className="group-hover:-translate-y-1 transition-transform" />
                PUBLICAR AGORA
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
