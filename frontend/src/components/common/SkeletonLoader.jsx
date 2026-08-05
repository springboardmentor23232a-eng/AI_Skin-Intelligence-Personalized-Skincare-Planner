import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((_, idx) => (
          <div key={idx} className="bg-white border border-brand-100 p-6 rounded-2xl shadow-sm space-y-4 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-brand-100 rounded w-1/3"></div>
              <div className="h-8 w-8 bg-brand-100 rounded-lg"></div>
            </div>
            <div className="h-8 bg-brand-100 rounded w-1/2"></div>
            <div className="h-3 bg-brand-100 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3 animate-pulse">
        {items.map((_, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-white border border-brand-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 rounded-full"></div>
              <div className="space-y-1.5">
                <div className="h-4 bg-brand-100 rounded w-24"></div>
                <div className="h-3 bg-brand-100 rounded w-16"></div>
              </div>
            </div>
            <div className="h-4 bg-brand-100 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="bg-white border border-brand-100 p-6 rounded-2xl shadow-sm animate-pulse flex flex-col justify-between h-[240px]">
        <div className="h-4 bg-brand-100 rounded w-1/4"></div>
        <div className="flex items-end justify-between h-[150px] px-4">
          <div className="w-8 bg-brand-100 rounded-t h-[40%]"></div>
          <div className="w-8 bg-brand-100 rounded-t h-[60%]"></div>
          <div className="w-8 bg-brand-100 rounded-t h-[30%]"></div>
          <div className="w-8 bg-brand-100 rounded-t h-[80%]"></div>
          <div className="w-8 bg-brand-100 rounded-t h-[50%]"></div>
        </div>
      </div>
    );
  }

  return null;
}
