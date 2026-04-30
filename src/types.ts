import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

export interface Post {
  id: string;
  ownerId: string;
  ownerEmail: string;
  media: MediaItem[];
  caption: string;
  createdAt: Timestamp;
  likesCount: number;
  commentsCount: number;
}

export interface Like {
  userId: string;
  postId: string;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  userId: string;
  displayName: string;
  photoURL: string;
  postId: string;
  content: string;
  createdAt: Timestamp;
}
