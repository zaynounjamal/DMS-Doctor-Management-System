import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ to, label = "Back" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="group flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition-colors mb-6 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

export default BackButton;
