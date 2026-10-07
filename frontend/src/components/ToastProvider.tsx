'use client';

import React from 'react';
import { ToastContainer } from './Toast';
import { useToast } from '@/store/useToast';

export const ToastProvider: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return <ToastContainer toasts={toasts} onRemove={removeToast} />;
};
