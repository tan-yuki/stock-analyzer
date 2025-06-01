import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>データを取得中...</p>
    </div>
  );
};