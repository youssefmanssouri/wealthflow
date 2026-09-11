import React from 'react';
import * as LucideIcons from 'lucide-react-native';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = '#FFFFFF',
  strokeWidth = 2,
}) => {
  // Convert kebab-case or snake_case to PascalCase
  const pascalName = name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');

  // Fallback to CircleDollarSign if icon name not found
  const IconComponent =
    ((LucideIcons as unknown) as Record<string, React.FC<LucideIcons.LucideProps>>)[pascalName] ||
    LucideIcons.CircleDollarSign ||
    LucideIcons.HelpCircle;

  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
};
