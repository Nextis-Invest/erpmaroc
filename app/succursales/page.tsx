import { Metadata } from 'next';
import SuccursalesManagement from '@/components/succursales/SuccursalesManagement';

export const metadata: Metadata = {
  title: 'Gestion des Succursales | ERP Maroc',
  description: 'Gérez vos succursales à travers le royaume du Maroc avec notre système ERP moderne',
  keywords: 'succursales, branches, Maroc, ERP, gestion, entreprise',
  openGraph: {
    title: 'Gestion des Succursales - ERP Maroc',
    description: 'Système de gestion des succursales pour le marché marocain',
    type: 'website',
  }
};

export default function SuccursalesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuccursalesManagement />
    </div>
  );
}