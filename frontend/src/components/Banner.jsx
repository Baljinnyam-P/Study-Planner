//Component to display banner messages
// with different styles based on message type

import React from 'react';

export default function Banner({ msg, type = 'info' }){
  if (!msg) return null;
  const styles = type === 'success'
    ? 'bg-green-50 text-green-700 border border-green-200'
    : type === 'error'
      ? 'bg-red-50 text-red-700 border border-red-200'
      : 'bg-blue-50 text-blue-700 border border-blue-200';
  return (
    <div className={`mb-3 px-3 py-2 rounded ${styles}`}>{msg}</div>
  );
}
