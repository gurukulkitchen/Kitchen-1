import React from 'react';

const toneClasses = {
    red: {
        button: 'text-red-500 hover:text-red-400',
        circle: 'text-red-500',
        label: 'text-red-600 dark:text-red-400'
    },
    blue: {
        button: 'text-blue-500 hover:text-blue-400',
        circle: 'text-blue-500',
        label: 'text-blue-600 dark:text-blue-400'
    },
    emerald: {
        button: 'text-emerald-500 hover:text-emerald-400',
        circle: 'text-emerald-500',
        label: 'text-emerald-600 dark:text-emerald-400'
    },
    orange: {
        button: 'text-orange-500 hover:text-orange-400',
        circle: 'text-orange-500',
        label: 'text-orange-600 dark:text-orange-400'
    },
    amber: {
        button: 'text-amber-500 hover:text-amber-400',
        circle: 'text-amber-500',
        label: 'text-amber-600 dark:text-amber-400'
    },
    slate: {
        button: 'text-muted-foreground hover:text-foreground',
        circle: 'text-muted-foreground',
        label: 'text-muted-foreground dark:text-muted-foreground'
    }
};

export default function TableActionButton({
    icon,
    label,
    tone = 'slate',
    onClick,
    disabled = false,
    className = '',
    title,
    as = 'button',
    children
}) {
    const palette = toneClasses[tone] || toneClasses.slate;
    const Component = as;

    const commonProps = {
        onClick: disabled ? undefined : onClick,
        title: title || label,
        className: `group inline-flex items-center justify-center w-8 h-8 transition-all ${disabled ? ' cursor-not-allowed' : 'cursor-pointer'} ${className}`
    };

    if (as === 'button') {
        commonProps.type = 'button';
        commonProps.disabled = disabled;
    }

    return (
        <Component {...commonProps}>
            <span className={`flex items-center justify-center transition-transform duration-200 ${palette.button} group-hover:scale-110 active:scale-95`}>
                {icon}
            </span>
            {children}
        </Component>
    );
}
