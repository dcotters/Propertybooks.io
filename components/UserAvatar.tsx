import React from 'react';

interface UserAvatarProps {
  name?: string;
  size?: number; // px, default 36
  onClick?: () => void;
  className?: string;
}

export default function UserAvatar({ name, size = 36, onClick, className = '' }: UserAvatarProps) {
  const initial = name && name.length > 0 ? name[0].toUpperCase() : 'D';
  return (
    <div
      onClick={onClick}
      className={`rounded-full bg-primary-600 flex items-center justify-center text-white font-bold select-none cursor-pointer ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      title={name || 'User'}
    >
      {initial}
    </div>
  );
} 