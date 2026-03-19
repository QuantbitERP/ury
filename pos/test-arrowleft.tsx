import React from 'react';
import { ArrowLeft } from 'lucide-react';

const TestArrowLeft: React.FC = () => {
    return (
        <div className="p-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to POS
            </button>
        </div>
    );
};

export default TestArrowLeft;
