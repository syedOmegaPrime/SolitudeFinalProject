"use client";

import type { ForumPost, ForumReply } from '@/types';
import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

interface ForumContextType {
  posts: ForumPost[];
  addPost: (newPost: ForumPost) => void;
  addReply: (postId: string, newReply: Omit<ForumReply, 'id' | 'postId' | 'creationDate'>) => void; // User provides content, userId, userName
}

const FORUM_POSTS_STORAGE_KEY = 'forumPostsData';

export const ForumContext = createContext<ForumContextType | undefined>(undefined);

export const ForumProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<ForumPost[]>(() => {
    if (typeof window !== 'undefined') {
      const storedPosts = localStorage.getItem(FORUM_POSTS_STORAGE_KEY);
      if (storedPosts) {
        try {
          return JSON.parse(storedPosts) as ForumPost[];
        } catch (e) {
          console.error("Failed to parse stored forum posts, initializing as empty:", e);
          localStorage.removeItem(FORUM_POSTS_STORAGE_KEY); // Clear corrupted data
          return [];
        }
      }
    }
    return []; // Default to empty array
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(FORUM_POSTS_STORAGE_KEY, JSON.stringify(posts));
    }
  }, [posts]);

  const addPost = (newPost: ForumPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const addReply = (postId: string, replyData: Omit<ForumReply, 'id' | 'postId' | 'creationDate'>) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const newReply: ForumReply = {
            ...replyData,
            id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            postId: postId,
            creationDate: new Date().toISOString(),
          };
          return {
            ...post,
            replies: [...(post.replies || []), newReply],
          };
        }
        return post;
      })
    );
  };


  return (
    <ForumContext.Provider value={{ posts, addPost, addReply }}>
      {children}
    </ForumContext.Provider>
  );
};

export const useForum = () => {
  const context = useContext(ForumContext);
  if (context === undefined) {
    throw new Error('useForum must be used within a ForumProvider');
  }
  return context;
};
