"use client";

import React from 'react';
import PayrollDocumentsList from '@/components/payroll/PayrollDocumentsList';

export default function PayrollDocumentsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Documents de Paie</h1>
          <p className="text-muted-foreground">
            Consultez et gérez tous vos documents de paie générés
          </p>
        </div>

        <PayrollDocumentsList />
      </div>
    </div>
  );
}