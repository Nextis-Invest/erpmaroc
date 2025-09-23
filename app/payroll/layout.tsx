import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestion de Paie - ERP Maroc',
  description: 'Calcul de paie conforme aux normes marocaines',
};

export default function PayrollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}