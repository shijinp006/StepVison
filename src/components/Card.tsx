import React from 'react';

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    shadow?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
    shadow = 'md',
    hover = false,
}) => {
    const paddingStyles = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    const shadowStyles = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
    };

    const hoverStyle = hover ? 'hover:shadow-xl transition-shadow duration-300' : '';

    const combinedClassName = `bg-white rounded-lg border border-neutral-200 ${paddingStyles[padding]} ${shadowStyles[shadow]} ${hoverStyle} ${className}`.trim();

    return <div className={combinedClassName}>{children}</div>;
};
