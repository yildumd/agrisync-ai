import React from 'react';

const LoadingSpinner = () => {
  return React.createElement('div', { className: "flex justify-center items-center py-8" },
    React.createElement('div', { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" })
  );
};

export default LoadingSpinner;