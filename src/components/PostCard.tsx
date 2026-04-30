import React, { useState, useEffect } from 'react';
import { db, auth, signIn } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Post, Comment, MediaItem } from '../types';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  setDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  increment, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { Heart, MessageSquare, Send, Trash2, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [likes, setLikes] = useState<string[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [user] = useAuthState(auth);
  const isAdmin = user?.email?.toLowerCase() === 'wesneypereira@gmail.com';

  const mediaList = post.media || [];

  useEffect(() => {
    const likesRef = collection(db, 'posts', post.id, 'likes');
    const commentsRef = collection(db, 'posts', post.id, 'comments');
    
    const unsubLikes = onSnapshot(likesRef, (snap) => {
      setLikes(snap.docs.map(d => d.id));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `posts/${post.id}/likes`);
    });

    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const unsubComments = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `posts/${post.id}/comments`);
    });

    return () => {
      unsubLikes();
      unsubComments();
    };
  }, [post.id]);

  const toggleLike = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }
    const likeRef = doc(db, 'posts', post.id, 'likes', user.uid);
    const postRef = doc(db, 'posts', post.id);

    try {
      if (likes.includes(user.uid)) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likesCount: increment(-1) });
      } else {
        await setDoc(likeRef, { 
          userId: user.uid, 
          postId: post.id, 
          createdAt: serverTimestamp() 
        });
        await updateDoc(postRef, { likesCount: increment(1) });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `posts/${post.id}/likes`);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'WYMD Social',
      text: post.caption,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Using a temporary toast-like state would be better, but for now we'll just log
        console.log('Link copiado!');
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    const commentsRef = collection(db, 'posts', post.id, 'comments');
    const postRef = doc(db, 'posts', post.id);

    try {
      await addDoc(commentsRef, {
        userId: user.uid,
        displayName: user.displayName || 'Anônimo',
        photoURL: user.photoURL || '',
        postId: post.id,
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });
      await updateDoc(postRef, { commentsCount: increment(1) });
      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `posts/${post.id}/comments`);
    }
  };

  const deletePost = async () => {
    if (!isAdmin) return;

    try {
      await deleteDoc(doc(db, 'posts', post.id));
      console.log("Postagem excluída com sucesso");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${post.id}`);
    }
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length);
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const isLiked = user && likes.includes(user.uid);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="tech-card mb-8"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-50 flex justify-between items-center bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-primary text-xs tracking-tight">
            Adm
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight text-dark">WYMDTEC Owner</h3>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{post.createdAt?.toDate().toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="flex items-center">
              <AnimatePresence mode="wait">
                {isDeleting ? (
                  <motion.div 
                    key="confirm"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2"
                  >
                    <button 
                      onClick={deletePost}
                      className="text-[10px] font-bold uppercase bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors"
                    >
                      Excluir?
                    </button>
                    <button 
                      onClick={() => setIsDeleting(false)}
                      className="text-[10px] font-bold uppercase bg-zinc-100 text-zinc-500 px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      Não
                    </button>
                  </motion.div>
                ) : (
                  <motion.button 
                    key="trash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsDeleting(true)} 
                    className="text-zinc-300 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary/5 border-b border-primary/10 py-2 px-4 flex items-center justify-between"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Você precisa estar logado para curtir!
            </p>
            <button 
              onClick={signIn}
              className="text-[10px] font-bold uppercase bg-primary text-white px-3 py-1 rounded-lg"
            >
              Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Content */}
      <div className="aspect-video relative flex items-center justify-center overflow-hidden bg-zinc-100 group/media">
        <AnimatePresence mode="wait">
          {mediaList.length > 0 && (
            <motion.div 
              key={currentMediaIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              {mediaList[currentMediaIndex].type === 'image' ? (
                <img 
                  src={mediaList[currentMediaIndex].url} 
                  alt={post.caption} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <video 
                  src={mediaList[currentMediaIndex].url} 
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Media Navigation */}
        {mediaList.length > 1 && (
          <>
            <button 
              onClick={prevMedia}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md rounded-full text-dark opacity-0 group-hover/media:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={nextMedia}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-md rounded-full text-dark opacity-0 group-hover/media:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight size={24} />
            </button>
            
            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {mediaList.map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    currentMediaIndex === i ? "bg-white w-4" : "bg-white/40"
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Media Type Badge */}
        {mediaList.length > 0 && (
          <div className="absolute top-4 right-4 bg-app-bg/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-dark">
            {mediaList[currentMediaIndex].type === 'image' ? 'IMG' : 'VIDEO'} 
            {mediaList.length > 1 && ` • ${currentMediaIndex + 1}/${mediaList.length}`}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 bg-white">
        <div className="flex items-center gap-6 mb-6">
          <button 
            onClick={toggleLike}
            className={cn(
              "flex items-center gap-2 font-bold text-xs uppercase tracking-tight transition-all",
              isLiked ? "text-red-500" : "text-zinc-400 hover:text-dark"
            )}
          >
            <Heart size={22} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2} />
            <span>{likes.length} Curtidas</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 font-bold text-xs uppercase tracking-tight text-zinc-400 hover:text-primary transition-all"
          >
            <MessageSquare size={22} />
            <span>{comments.length} Comentários</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 font-bold text-xs uppercase tracking-tight text-zinc-400 hover:text-accent transition-all ml-auto"
            title="Compartilhar"
          >
            <Share2 size={22} />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
        </div>

        <p className="text-dark text-lg leading-snug font-bold">
          {post.caption}
        </p>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-zinc-50 mt-6 pt-6"
            >
              <div className="max-h-80 overflow-y-auto mb-6 space-y-4 pr-1 custom-scrollbar">
                {comments.length === 0 ? (
                  <div className="py-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <p className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Nada por aqui ainda...</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100 flex gap-4">
                      <img 
                        src={comment.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`} 
                        className="w-9 h-9 rounded-xl border border-zinc-200"
                        alt="User"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-xs text-dark uppercase tracking-tight">{comment.displayName}</p>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase">{comment.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-zinc-600 font-medium leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {user ? (
                <form onSubmit={handleAddComment} className="flex gap-3">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="ESCREVA ALGO..."
                    className="flex-1 px-5 py-3 rounded-2xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 text-sm font-bold uppercase transition-all"
                  />
                  <button type="submit" className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
                    <Send size={20} />
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center gap-4 py-4 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
                  <p className="text-xs font-bold text-zinc-400 uppercase">Acesse sua conta para comentar</p>
                  <button onClick={signIn} className="tech-btn tech-btn-primary py-2 px-6 text-xs">
                    FAZER LOGIN
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PostCard;

