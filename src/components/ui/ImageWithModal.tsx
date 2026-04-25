'use client';

import { useState } from 'react';
import ImageModal from './ImageModal';

interface ImageWithModalProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function ImageWithModal({ src, alt = '', className = '' }: ImageWithModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <img 
        src={src} 
        alt={alt} 
        className={`${className} cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={() => setIsOpen(true)}
      />
      <ImageModal imageUrl={isOpen ? src : null} onClose={() => setIsOpen(false)} />
    </>
  );
}
