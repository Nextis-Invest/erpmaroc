'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Building,
  Edit2,
  Trash2,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Freelance {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department?: string;
  hireDate: Date;
  salary: number;
  status: string;
  isFreelance: boolean;
  employmentType: string;
}

interface FreelanceTableProps {
  freelances: Freelance[];
  onEdit?: (freelance: Freelance) => void;
  onDelete?: (id: string) => void;
  onHireAsEmployee?: (freelance: Freelance) => void;
}

export default function FreelanceTable({
  freelances,
  onEdit,
  onDelete,
  onHireAsEmployee
}: FreelanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter freelances based on search and filters
  const filteredFreelances = freelances.filter(freelance => {
    const matchesSearch =
      freelance.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelance.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelance.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelance.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = filterDepartment === 'all' || freelance.department === filterDepartment;

    return matchesSearch && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = [...new Set(freelances.map(f => f.department).filter(Boolean))];

  // Pagination
  const totalPages = Math.ceil(filteredFreelances.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFreelances = filteredFreelances.slice(startIndex, endIndex);

  const handleExport = () => {
    // Export logic here
    console.log('Exporting freelances data...');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Employés Non-déclaré</h2>
            <p className="mt-1 text-sm text-gray-500">
              Gérez vos employés non-déclaré
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
              {freelances.length} Non-déclaré{freelances.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un employé non-déclaré..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Tous les départements</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{String(dept)}</option>
              ))}
            </select>

            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Non-déclaré
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarif
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de début
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentFreelances.map((freelance) => (
              <tr key={freelance._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-medium text-sm">
                          {freelance.firstName[0]}{freelance.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {freelance.firstName} {freelance.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {freelance.employeeId}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-1 text-gray-400" />
                    {freelance.email}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <Phone className="w-4 h-4 mr-1 text-gray-400" />
                    {freelance.phone}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {freelance.position}
                  </div>
                  {freelance.department && (
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <Building className="w-4 h-4 mr-1 text-gray-400" />
                      {String(freelance.department)}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                    {freelance.salary.toLocaleString('fr-MA')} DH/jour
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    {format(new Date(freelance.hireDate), 'dd MMM yyyy', { locale: fr })}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    freelance.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : freelance.status === 'inactive'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {freelance.status === 'active' ? 'Actif' :
                     freelance.status === 'inactive' ? 'Inactif' :
                     'En pause'}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onHireAsEmployee && onHireAsEmployee(freelance)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Déclarer comme salarié"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onEdit && onEdit(freelance)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(freelance._id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredFreelances.length)} sur {filteredFreelances.length} employés non-déclaré
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === idx + 1
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredFreelances.length === 0 && (
        <div className="px-6 py-12">
          <div className="text-center">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun employé non-déclaré</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Aucun employé non-déclaré ne correspond à votre recherche.' : 'Commencez par ajouter un employé non-déclaré.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}