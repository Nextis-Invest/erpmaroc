'use client';

import React from 'react';

interface ProcessStepperProps {
  currentStep: 'select' | 'form' | 'calculate';
}

export default function ProcessStepper({ currentStep }: ProcessStepperProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Processus de Paie</h3>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${
            currentStep === 'select' ? 'text-blue-600' : currentStep === 'form' || currentStep === 'calculate' ? 'text-green-600' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'select' ? 'bg-blue-100' : currentStep === 'form' || currentStep === 'calculate' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <span className="text-sm font-semibold">1</span>
            </div>
            <span className="text-sm font-medium">Sélection</span>
          </div>
          <div className={`w-8 h-1 rounded ${
            currentStep === 'form' || currentStep === 'calculate' ? 'bg-green-200' : 'bg-gray-200'
          }`}></div>
          <div className={`flex items-center space-x-2 ${
            currentStep === 'form' ? 'text-blue-600' : currentStep === 'calculate' ? 'text-green-600' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'form' ? 'bg-blue-100' : currentStep === 'calculate' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <span className="text-sm font-semibold">2</span>
            </div>
            <span className="text-sm font-medium">Saisie</span>
          </div>
          <div className={`w-8 h-1 rounded ${
            currentStep === 'calculate' ? 'bg-green-200' : 'bg-gray-200'
          }`}></div>
          <div className={`flex items-center space-x-2 ${
            currentStep === 'calculate' ? 'text-blue-600' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'calculate' ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <span className="text-sm font-semibold">3</span>
            </div>
            <span className="text-sm font-medium">Calcul</span>
          </div>
        </div>
      </div>
    </div>
  );
}