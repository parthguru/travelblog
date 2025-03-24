"use client";

import React, { useState } from 'react';
import { Facebook, Twitter, Linkedin, Mail, Link2, Share2, Check } from 'lucide-react';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  url,
  title,
  description = '',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Ensure we have absolute URLs
  const shareUrl = url.startsWith('http') ? url : `https://australiatravelblog.com${url}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = [
    {
      name: 'Facebook',
      icon: <Facebook size={18} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-[#1877F2] hover:bg-[#0d6ae4]',
    },
    {
      name: 'Twitter',
      icon: <Twitter size={18} />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-[#1DA1F2] hover:bg-[#0c85d0]',
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={18} />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-[#0A66C2] hover:bg-[#085197]',
    },
    {
      name: 'Email',
      icon: <Mail size={18} />,
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Mobile: Show toggle button first */}
      <div className="sm:hidden">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Share"
        >
          <Share2 size={20} />
        </button>

        {showMenu && (
          <div className="absolute top-12 right-0 z-50 bg-white rounded-lg shadow-lg p-3 min-w-[200px]">
            <div className="flex flex-col space-y-2">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center space-x-2 rounded-md px-3 py-2 text-white ${link.color}`}
                  onClick={() => setShowMenu(false)}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </a>
              ))}
              <button
                onClick={() => {
                  copyToClipboard();
                  setShowMenu(false);
                }}
                className="flex items-center space-x-2 rounded-md px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white"
              >
                {copied ? <Check size={18} /> : <Link2 size={18} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Show all buttons in a row */}
      <div className="hidden sm:flex items-center space-x-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center w-8 h-8 rounded-full text-white ${link.color}`}
            aria-label={`Share on ${link.name}`}
          >
            {link.icon}
          </a>
        ))}
        <button
          onClick={copyToClipboard}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-900 text-white"
          aria-label="Copy link"
        >
          {copied ? <Check size={18} /> : <Link2 size={18} />}
        </button>
      </div>
    </div>
  );
};

export default SocialShareButtons; 