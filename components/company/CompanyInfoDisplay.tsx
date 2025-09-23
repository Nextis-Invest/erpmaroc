'use client';

import React, { useState } from 'react';
import {
  Building2,
  CreditCard,
  FileText,
  MapPin,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';
import { companyConfig, formatRIB, formatIBAN } from '@/config/company';

export default function CompanyInfoDisplay() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => handleCopy(text, field)}
      className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      title="Copier"
    >
      {copiedField === field ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );

  const sections = [
    {
      id: 'general',
      title: 'Informations Générales',
      icon: <Building2 className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Nom de la société:</span>
            <div className="flex items-center">
              <span className="font-medium">{companyConfig.name}</span>
              <CopyButton text={companyConfig.name} field="name" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">ICE:</span>
            <div className="flex items-center">
              <span className="font-medium font-mono">{companyConfig.ice}</span>
              <CopyButton text={companyConfig.ice} field="ice" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">RC:</span>
            <div className="flex items-center">
              <span className="font-medium">{companyConfig.rc}</span>
              <CopyButton text={companyConfig.rc} field="rc" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">CNSS:</span>
            <div className="flex items-center">
              <span className="font-medium">{companyConfig.cnss}</span>
              <CopyButton text={companyConfig.cnss} field="cnss" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Patente:</span>
            <div className="flex items-center">
              <span className="font-medium">{companyConfig.patente}</span>
              <CopyButton text={companyConfig.patente} field="patente" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">IF:</span>
            <div className="flex items-center">
              <span className="font-medium">{companyConfig.if}</span>
              <CopyButton text={companyConfig.if} field="if" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      title: 'Coordonnées',
      icon: <MapPin className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <div>
            <span className="text-gray-600 block mb-1">Adresse:</span>
            <div className="flex items-start justify-between">
              <span className="font-medium">{companyConfig.address}</span>
              <CopyButton text={companyConfig.address} field="address" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              <Phone className="w-4 h-4 inline mr-1" />
              Téléphone:
            </span>
            <div className="flex items-center">
              <span className="font-medium">{companyConfig.phone}</span>
              <CopyButton text={companyConfig.phone} field="phone" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              <Mail className="w-4 h-4 inline mr-1" />
              Email:
            </span>
            <div className="flex items-center">
              <span className="font-medium">{companyConfig.email}</span>
              <CopyButton text={companyConfig.email} field="email" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              <Globe className="w-4 h-4 inline mr-1" />
              Site web:
            </span>
            <div className="flex items-center">
              <a
                href={companyConfig.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                {companyConfig.website}
              </a>
              <CopyButton text={companyConfig.website} field="website" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'banking',
      title: 'Informations Bancaires',
      icon: <CreditCard className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Banque:</span>
            <span className="font-medium">{companyConfig.bank.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Agence:</span>
            <span className="font-medium">{companyConfig.bank.agency}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Code Agence:</span>
            <div className="flex items-center">
              <span className="font-medium font-mono">{companyConfig.bank.agencyCode}</span>
              <CopyButton text={companyConfig.bank.agencyCode} field="agencyCode" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-600">RIB:</span>
              <CopyButton text={companyConfig.bank.rib} field="rib" />
            </div>
            <div className="bg-gray-50 p-2 rounded font-mono text-sm">
              {formatRIB()}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-600">IBAN:</span>
              <CopyButton text={companyConfig.bank.iban} field="iban" />
            </div>
            <div className="bg-gray-50 p-2 rounded font-mono text-sm">
              {formatIBAN()}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">SWIFT:</span>
            <div className="flex items-center">
              <span className="font-medium font-mono">{companyConfig.bank.swift}</span>
              <CopyButton text={companyConfig.bank.swift} field="swift" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tax',
      title: 'Informations Fiscales',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Identifiant Fiscal (IF):</span>
            <div className="flex items-center">
              <span className="font-medium">{companyConfig.if}</span>
              <CopyButton text={companyConfig.if} field="tax-if" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tax ID:</span>
            <div className="flex items-center">
              <span className="font-medium">{companyConfig.tax.taxId}</span>
              <CopyButton text={companyConfig.tax.taxId} field="taxId" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Numéro TVA:</span>
            <div className="flex items-center">
              <span className="font-medium">{companyConfig.tax.vatNumber}</span>
              <CopyButton text={companyConfig.tax.vatNumber} field="vatNumber" />
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Informations de la Société
      </h2>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-blue-600">{section.icon}</span>
                <span className="font-medium text-gray-900">{section.title}</span>
              </div>
              {expandedSection === section.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSection === section.id && (
              <div className="p-4 bg-white">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Ces informations sont chargées depuis les variables d'environnement
          et sont utilisées automatiquement pour la génération des documents (bulletins de paie,
          fichiers SIMT, déclarations CNSS, etc.).
        </p>
      </div>
    </div>
  );
}