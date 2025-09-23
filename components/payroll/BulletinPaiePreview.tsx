'use client';

import React from 'react';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';
import { formatMontantMAD, getMoisNom } from '@/types/payroll';

interface BulletinPaiePreviewProps {
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  companyInfo?: {
    name: string;
    address: string;
    ice: string;
    rc: string;
    cnss: string;
  };
}

const BulletinPaiePreview: React.FC<BulletinPaiePreviewProps> = ({
  employee,
  calculation,
  period,
  companyInfo = {
    name: 'ENTREPRISE ERP MAROC',
    address: '123 Boulevard Hassan II, Casablanca',
    ice: 'ICE001234567891234',
    rc: 'RC123456',
    cnss: 'CNSS789012'
  }
}) => {
  return (
    <div className="bg-white p-8 shadow-lg max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-lg font-bold">{companyInfo.name}</h1>
            <p className="text-sm">{companyInfo.address}</p>
            <p className="text-sm">ICE: {companyInfo.ice}</p>
          </div>
          <div className="text-right text-sm">
            <p>RC: {companyInfo.rc}</p>
            <p>CNSS: {companyInfo.cnss}</p>
          </div>
        </div>
      </div>

      {/* Titre */}
      <h2 className="text-xl font-bold text-center mb-6 uppercase">
        BULLETIN DE PAIE
      </h2>

      {/* Informations employé et période */}
      <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 border">
        <div>
          <h3 className="font-semibold mb-3 text-sm">INFORMATIONS EMPLOYÉ</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Nom:</span> {employee.nom}</p>
            <p><span className="font-medium">Prénom:</span> {employee.prenom}</p>
            <p><span className="font-medium">Matricule:</span> {employee.employeeId}</p>
            <p><span className="font-medium">CIN:</span> {employee.cin || 'Non renseigné'}</p>
            <p><span className="font-medium">CNSS:</span> {employee.cnss_numero || 'Non renseigné'}</p>
            <p><span className="font-medium">Fonction:</span> {employee.fonction || 'Non renseigné'}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm">PÉRIODE DE PAIE</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Mois:</span> {getMoisNom(period.mois)} {period.annee}</p>
            <p><span className="font-medium">Du:</span> {new Date(period.date_debut).toLocaleDateString('fr-FR')}</p>
            <p><span className="font-medium">Au:</span> {new Date(period.date_fin).toLocaleDateString('fr-FR')}</p>
            <p><span className="font-medium">Situation:</span> {employee.situation_familiale}</p>
            <p><span className="font-medium">Enfants:</span> {employee.nombre_enfants}</p>
          </div>
        </div>
      </div>

      {/* Tableau des gains */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2 text-sm">GAINS</h3>
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-left">Désignation</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Base</th>
              <th className="border border-gray-300 px-3 py-2 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-2">Salaire de base</td>
              <td className="border border-gray-300 px-3 py-2 text-center">-</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.salaire_base)}</td>
            </tr>
            {calculation.prime_anciennete > 0 && (
              <tr>
                <td className="border border-gray-300 px-3 py-2">Prime d&apos;ancienneté ({calculation.anciennete_mois} mois)</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{calculation.salaire_base.toFixed(2)}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.prime_anciennete)}</td>
              </tr>
            )}
            {calculation.primes_imposables > 0 && (
              <tr>
                <td className="border border-gray-300 px-3 py-2">Primes imposables</td>
                <td className="border border-gray-300 px-3 py-2 text-center">-</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.primes_imposables)}</td>
              </tr>
            )}
            {calculation.primes_non_imposables > 0 && (
              <tr>
                <td className="border border-gray-300 px-3 py-2">Primes non imposables</td>
                <td className="border border-gray-300 px-3 py-2 text-center">-</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.primes_non_imposables)}</td>
              </tr>
            )}
            <tr className="bg-gray-50 font-semibold">
              <td className="border border-gray-300 px-3 py-2">TOTAL GAINS</td>
              <td className="border border-gray-300 px-3 py-2 text-center">-</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.salaire_brut_global)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tableau des cotisations */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2 text-sm">COTISATIONS SALARIALES</h3>
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-left">Désignation</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Base</th>
              <th className="border border-gray-300 px-3 py-2 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-2">CNSS (4.48%)</td>
              <td className="border border-gray-300 px-3 py-2 text-center">{Math.min(calculation.salaire_brut_imposable, 6000).toFixed(2)}</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.cnss_salariale)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2">AMO (2.26%)</td>
              <td className="border border-gray-300 px-3 py-2 text-center">{calculation.salaire_brut_imposable.toFixed(2)}</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.amo_salariale)}</td>
            </tr>
            <tr className="bg-gray-50 font-semibold">
              <td className="border border-gray-300 px-3 py-2">TOTAL COTISATIONS</td>
              <td className="border border-gray-300 px-3 py-2 text-center">-</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.cnss_salariale + calculation.amo_salariale)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Calcul IR */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2 text-sm">IMPÔT SUR LE REVENU</h3>
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-left">Désignation</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Base</th>
              <th className="border border-gray-300 px-3 py-2 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-2">Salaire net imposable</td>
              <td className="border border-gray-300 px-3 py-2 text-center">-</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.salaire_net_imposable)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2">IR brut</td>
              <td className="border border-gray-300 px-3 py-2 text-center">{calculation.salaire_net_imposable.toFixed(2)}</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.ir_brut)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2">Charges familiales</td>
              <td className="border border-gray-300 px-3 py-2 text-center">{employee.nombre_enfants} enfants</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.charges_familiales)}</td>
            </tr>
            <tr className="bg-gray-50 font-semibold">
              <td className="border border-gray-300 px-3 py-2">IR NET À PAYER</td>
              <td className="border border-gray-300 px-3 py-2 text-center">-</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.ir_net)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Salaire net */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200">
        <p className="text-lg font-bold text-center text-green-800">
          SALAIRE NET: {formatMontantMAD(calculation.salaire_net)}
        </p>
      </div>

      {/* Cotisations patronales */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2 text-sm">COTISATIONS PATRONALES (Pour information)</h3>
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-left">Désignation</th>
              <th className="border border-gray-300 px-3 py-2 text-center">Base</th>
              <th className="border border-gray-300 px-3 py-2 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-2">CNSS Patronale (8.0%)</td>
              <td className="border border-gray-300 px-3 py-2 text-center">{Math.min(calculation.salaire_brut_imposable, 6000).toFixed(2)}</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.cnss_patronale)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2">AMO Patronale (1.85%)</td>
              <td className="border border-gray-300 px-3 py-2 text-center">{calculation.salaire_brut_imposable.toFixed(2)}</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.amo_patronale)}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2">Taxe de formation (1.6%)</td>
              <td className="border border-gray-300 px-3 py-2 text-center">{calculation.salaire_brut_global.toFixed(2)}</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.taxe_formation)}</td>
            </tr>
            <tr className="bg-gray-50 font-semibold">
              <td className="border border-gray-300 px-3 py-2">COÛT TOTAL EMPLOYEUR</td>
              <td className="border border-gray-300 px-3 py-2 text-center">-</td>
              <td className="border border-gray-300 px-3 py-2 text-right">{formatMontantMAD(calculation.cout_total_employeur)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pied de page */}
      <div className="flex justify-between items-end text-sm border-t pt-4">
        <div>
          <p>Date d&apos;édition: {new Date().toLocaleDateString('fr-FR')}</p>
          <p>Instance: Beta - Calcul de test</p>
        </div>
        <div className="text-center">
          <p className="mb-8">Signature de l&apos;employeur</p>
          <div className="border-b border-black w-32"></div>
        </div>
      </div>
    </div>
  );
};

export default BulletinPaiePreview;