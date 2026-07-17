import React, { useState } from 'react';

export default function LogbookStatusFilter() {
  // Keep track of the currently selected status
  const [activeStatus, setActiveStatus] = useState('All');

  // List of your logbook statuses
  const statuses = ['All', 'Pending', 'Approved', 'Rejected'];

  // Helper function to color-code statuses when active
  const getStatusClass = (status, isActive) => {
    if (!isActive) return 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-transparent';
    
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-500';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-500';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-500';
      default: // 'All'
        return 'bg-blue-50 text-blue-700 border-blue-500';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Logbook Status</h2>
      
      {/* Horizontal Status Bar */}
      <div className="flex flex-row items-center space-x-2 border-b border-gray-200 pb-2 overflow-x-auto whitespace-nowrap">
        {statuses.map((status) => {
          const isActive = activeStatus === status;
          return (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-all duration-200 ease-in-out cursor-pointer ${getStatusClass(status, isActive)}`}
            >
              {status}
            </button>
          );
        })}
      </div>

      {/* Simulated Content Area based on selection */}
      <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg shadow-xs">
        <p className="text-gray-600">
          Showing logbooks with status: <span className="font-semibold text-gray-900">{activeStatus}</span>
        </p>
        {/* Your logbook table or list items would map out here based on activeStatus */}
      </div>
    </div>
  );
}

// this js for registers
const form=document.querySelector("form");

form.addEventListener("submit",function(e){

let pass=document.getElementById("password").value;

let confirm=document.getElementById("confirm").value;

if(pass!==confirm){

alert("Passwords do not match");

e.preventDefault();

}

});