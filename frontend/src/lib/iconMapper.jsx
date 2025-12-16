import React from 'react';
import * as Icons from 'lucide-react';
import {
  Heart,
  Stethoscope,
  Calendar,
  Star,
  Sparkles,
  Building2,
  Activity,
  Smile,
  FileText,
  Zap,
  Shield,
  Flame,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTooth } from '@fortawesome/free-solid-svg-icons';

// Map emoji strings to Lucide React icon components or Font Awesome icons
const emojiToIconMap = {
  '😊': Smile,
  '👨‍⚕️': Stethoscope,
  '👩‍⚕️': Stethoscope,
  '📅': Calendar,
  '⭐': Star,
  '✨': Sparkles,
  '🏥': Building2,
  '🦷': 'tooth', // Font Awesome Tooth icon for dentistry
  '💪': Activity,
  '😁': Smile,
  '📐': FileText,
  '⚠️': Shield,
  '❤️': Heart,
  '🔥': Flame,
  '⚡': Zap,
};

// Default icon if emoji not found
const DefaultIcon = Activity;

/**
 * Converts an emoji string to a Lucide React icon component or Font Awesome icon
 * @param {string} emoji - The emoji string
 * @param {object} props - Props to pass to the icon (className, size, etc.)
 * @returns {React.Component} The icon component
 */
export const getIconFromEmoji = (emoji, props = {}) => {
  if (!emoji) {
    const Icon = DefaultIcon;
    return <Icon {...props} />;
  }

  // Check if it's a direct Lucide Icon name (e.g., 'Stethoscope', 'Droplet')
  if (Icons[emoji]) {
      const LucideIcon = Icons[emoji];
      return <LucideIcon {...props} />;
  }

  const IconOrString = emojiToIconMap[emoji] || DefaultIcon;
  
  // If it's a string identifier (like 'tooth'), use Font Awesome
  if (typeof IconOrString === 'string' && IconOrString === 'tooth') {
    return <FontAwesomeIcon icon={faTooth} {...props} />;
  }
  
  // Otherwise, it's a Lucide React icon component from the map
  const Icon = IconOrString;
  return <Icon {...props} />;
};

/**
 * Gets the icon component directly (for use in JSX)
 * @param {string} emoji - The emoji string
 * @param {string} className - Tailwind classes for styling (default: 'w-12 h-12')
 * @param {number} size - Icon size in pixels (optional, uses className if not provided)
 */
export const IconFromEmoji = ({ emoji, className = 'w-12 h-12', size, ...props }) => {
  const iconProps = {
    ...props,
    className: className,
    ...(size && { style: { width: size, height: size, ...props.style } }),
  };
  
  return getIconFromEmoji(emoji, iconProps);
};

export default IconFromEmoji;

