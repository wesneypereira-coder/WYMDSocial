import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, Camera, UploadCloud, Plus, Trash2, Image as ImageIcon, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem } from '../types';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export default function CreatePost({ onClose }: { onClose: () => void }) {
  const [media, setMedia] = useState<MediaItem[]>([{ url: '', type: 'image' }]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  const addMediaField = () => {
    if (media.length < 10) {
      setMedia([...media, { url: '', type: 'image' }]);
    }
  };

  const removeMediaField = (index: number) => {
    if (media.length > 1) {
      setMedia(media.filter((_, i) => i !== index));
    }
  };

  const updateMedia = (index: number, field: keyof MediaItem, value: string) => {
    const newMedia = [...media];
    newMedia[index] = { ...newMedia[index], [field]: value };
    setMedia(newMedia);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validMedia = media.filter(m => m.url.trim() !== '');
    if (!user || validMedia.length === 0 || !caption.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        ownerId: user.uid,
        ownerEmail: user.email,
        media: validMedia,
        caption: caption.trim(),
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-app-bg/60 backdrop-blur-md overflow-y-auto pt-20 pb-10">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="tech-card w-full max-w-2xl p-8 relative shadow-2xl shadow-primary/10 my-auto"
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

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block font-bold uppercase text-[10px] tracking-[0.2em] text-zinc-500">Mídia (Máx 10)</label>
              <button 
                type="button"
                onClick={addMediaField}
                disabled={media.length >= 10}
                className="flex items-center gap-1 text-primary font-bold text-[10px] uppercase tracking-wider hover:underline disabled:opacity-50"
              >
                <Plus size={14} /> Adicionar URL
              </button>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {media.map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex gap-3 items-end"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateMedia(index, 'type', 'image')}
                          className={`p-2 rounded-xl border transition-all ${item.type === 'image' ? 'bg-primary text-white border-primary' : 'bg-white text-zinc-400 border-zinc-100 hover:bg-zinc-50'}`}
                        >
                          <ImageIcon size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateMedia(index, 'type', 'video')}
                          className={`p-2 rounded-xl border transition-all ${item.type === 'video' ? 'bg-primary text-white border-primary' : 'bg-white text-zinc-400 border-zinc-100 hover:bg-zinc-50'}`}
                        >
                          <Film size={18} />
                        </button>
                        <input 
                          type="url" 
                          value={item.url}
                          onChange={(e) => updateMedia(index, 'url', e.target.value)}
                          placeholder={item.type === 'image' ? "URL da imagem.jpg" : "URL do vídeo (direct link / mp4)"}
                          required
                          className="tech-input flex-1 py-2 text-sm"
                        />
                      </div>
                    </div>
                    {media.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeMediaField(index)}
                        className="p-3 text-zinc-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-bold uppercase text-[10px] tracking-[0.2em] text-zinc-500">Legenda</label>
            <textarea 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="O que está acontecendo na tecnologia?"
              required
              rows={3}
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
