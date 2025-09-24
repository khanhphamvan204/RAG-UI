import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorAlert = ({ error, setError }) => {
    if (!error) return null;

    return (
        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
                <p className="text-red-800 font-medium">Có lỗi xảy ra</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
            <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default ErrorAlert;