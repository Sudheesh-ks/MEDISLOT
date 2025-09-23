import React from 'react';

interface LoadingButtonProps {
  text: any;
  loading: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  text,
  loading,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md
        text-white bg-gradient-to-r from-indigo-500 to-blue-600
        hover:from-indigo-400 hover:to-blue-500
        transition duration-200 ease-in-out
        backdrop-blur-sm ring-1 ring-white/10 shadow-md
        ${loading || disabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}`}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4A12 12 0 004 12z"
          ></path>
        </svg>
      )}
      {loading ? 'Processing...' : text}
    </button>
  );
};

export default LoadingButton;
