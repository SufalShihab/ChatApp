import React from 'react';

export default function MenuTab() {
  return (
    <div className="w-full flex-1 sm:w-[350px] lg:w-[380px] flex flex-col h-full border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Menu & Settings</h2>
      </div>
      <div className="flex-1 p-6 text-center text-gray-400 text-sm">
        App settings, theme options, and menu items will appear here.
      </div>
    </div>
  );
}