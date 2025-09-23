"use client";

import React, { useEffect, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Download, Filter, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { useEmployees, useEmployeeFilters, usePagination, useHRActions, Employee } from '@/stores/hrStoreHooks';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import AddEmployeeButton from './AddEmployeeButton';
import EmployeeViewDialog from './EmployeeViewDialog';
import EmployeeEditDialog from './EmployeeEditDialog';
import EmployeeDeleteDialog from './EmployeeDeleteDialog';
import ContractTypeManager from './ContractTypeManager';
import { fetchEmployees } from '@/lib/api/employeeApi';

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    "on-leave": "bg-yellow-100 text-yellow-800",
    terminated: "bg-red-100 text-red-800",
    suspended: "bg-orange-100 text-orange-800"
  };

  return (
    <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Employee Type Badge
const EmploymentTypeBadge = ({ type }: { type: string }) => {
  const typeColors = {
    "full-time": "bg-blue-100 text-blue-800",
    "part-time": "bg-purple-100 text-purple-800",
    contract: "bg-orange-100 text-orange-800",
    intern: "bg-green-100 text-green-800",
    temporary: "bg-yellow-100 text-yellow-800"
  };

  return (
    <Badge variant="secondary" className={typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800"}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
};

// Table columns definition
const createColumns = (
  onViewEmployee: (employee: Employee) => void,
  onEditEmployee: (employee: Employee) => void,
  onDeleteEmployee: (employee: Employee) => void,
  onConvertToFreelance?: (employee: Employee) => void
): ColumnDef<Employee>[] => [
  {
    accessorKey: "employeeId",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 p-0 font-semibold"
      >
        ID Employé
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium text-blue-600">{row.getValue("employeeId")}</div>
    ),
  },
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 p-0 font-semibold"
      >
        Nom
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.firstName} {row.original.lastName}</div>
        <div className="text-sm text-gray-500">{row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: "position",
    header: "Poste",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("position")}</div>
        <div className="text-sm text-gray-500">
          {row.original.department?.name || "Aucun Département"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "employmentType",
    header: "Type",
    cell: ({ row }) => (
      <EmploymentTypeBadge type={row.getValue("employmentType")} />
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => (
      <StatusBadge status={row.getValue("status")} />
    ),
  },
  {
    accessorKey: "phone",
    header: "Contact",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue("phone")}
      </div>
    ),
  },
  {
    accessorKey: "hireDate",
    header: "Date d'Embauche",
    cell: ({ row }) => (
      <div className="text-sm">
        {new Date(row.getValue("hireDate")).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original;

      return (
        <div className="flex items-center space-x-2">
          <ContractTypeManager
            employee={employee}
            onUpdate={() => window.location.reload()}
          />
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewEmployee(employee)}>
              Voir Détails
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditEmployee(employee)}>
              Modifier le bulletin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('View attendance', employee)}>
              Voir Présence
            </DropdownMenuItem>
            {onConvertToFreelance && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onConvertToFreelance(employee)}
                  className="text-green-600 hover:text-green-700"
                >
                  Convertir en Non-déclaré
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              onClick={() => onDeleteEmployee(employee)}
              className="text-red-600 focus:text-red-600"
            >
              Supprimer Employé
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      );
    },
  },
];

// Main Employee Table Component
const EmployeeTable = () => {
  const employees = useEmployees();
  const employeeFilters = useEmployeeFilters();
  const pagination = usePagination();
  const {
    setEmployees,
    setEmployeeFilters,
    setPagination,
    setSelectedEmployee,
    setLoading
  } = useHRActions();

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState<Employee | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployeeForDelete, setSelectedEmployeeForDelete] = useState<Employee | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedEmployeeForView(employee);
    setIsViewDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployeeForEdit(employee);
    setIsEditDialogOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployeeForDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (employeeData: any) => {
    setIsEditing(true);
    try {
      const response = await fetch(`/api/hr/employees/${selectedEmployeeForEdit?.employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'employé');
      }

      const result = await response.json();

      // Refresh the employee list
      window.location.reload();

      setIsEditDialogOpen(false);
      setSelectedEmployeeForEdit(null);
      toast.success('Employé mis à jour avec succès!');

    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Erreur lors de la mise à jour de l\'employé');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteConfirm = async (employee: Employee) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/hr/employees/${employee.employeeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'employé');
      }

      // Refresh the employee list
      window.location.reload();

      setIsDeleteDialogOpen(false);
      setSelectedEmployeeForDelete(null);
      toast.success('Employé supprimé avec succès!');

    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Erreur lors de la suppression de l\'employé');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConvertToFreelance = async (employee: Employee) => {
    if (confirm(`Êtes-vous sûr de vouloir convertir ${employee.firstName} ${employee.lastName} en non-déclaré ?`)) {
      try {
        const response = await fetch(`/api/hr/employees/${employee.employeeId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            
            isFreelance: true,
            employmentType: 'freelance'
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('API Error Response:', errorData);
          throw new Error(`Erreur lors de la conversion en non-déclaré: ${response.status}`);
        }

        const result = await response.json();
        console.log('Conversion success:', result);
        toast.success('Employé converti en non-déclaré avec succès!');
        window.location.reload();
      } catch (error) {
        console.error('Error converting to non-declared:', error);
        toast.error('Erreur lors de la conversion en non-déclaré');
      }
    }
  };

  const columns = createColumns(handleViewEmployee, handleEditEmployee, handleDeleteEmployee, handleConvertToFreelance);

  const table = useReactTable({
    data: employees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function'
        ? updater({ pageIndex: pagination.page - 1, pageSize: pagination.limit })
        : updater;

      setPagination({
        page: newPagination.pageIndex + 1,
        limit: newPagination.pageSize,
      });
    },
  });

  // Fetch employees data
  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      try {
        const result = await fetchEmployees({
          page: pagination.page,
          limit: pagination.limit,
          search: employeeFilters.search,
          department: employeeFilters.department,
          team: employeeFilters.team,
          status: employeeFilters.status,
        });

        setEmployees(result.employees);
        setPagination(result.pagination);
      } catch (error) {
        console.error('Unexpected error loading employees:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, [employeeFilters, pagination.page, pagination.limit, setEmployees, setPagination, setLoading]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employés</h2>
          <p className="text-gray-600">Gérez la main-d&apos;œuvre de votre organisation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <AddEmployeeButton onEmployeeAdded={(employee) => {
            // Refresh the employee list when a new employee is added
            window.location.reload();
          }} />
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher des employés..."
                value={employeeFilters.search}
                onChange={(e) => setEmployeeFilters({ search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={employeeFilters.status}
            onValueChange={(value) => setEmployeeFilters({ status: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
              <SelectItem value="on-leave">En Congé</SelectItem>
              <SelectItem value="terminated">Licencié</SelectItem>
              <SelectItem value="suspended">Suspendu</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={employeeFilters.department}
            onValueChange={(value) => setEmployeeFilters({ department: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les Départements</SelectItem>
              <SelectItem value="ressources-humaines">Ressources Humaines</SelectItem>
              <SelectItem value="informatique">Informatique</SelectItem>
              <SelectItem value="ventes-marketing">Ventes et Marketing</SelectItem>
              <SelectItem value="finance-comptabilite">Finance et Comptabilité</SelectItem>
              <SelectItem value="operations">Opérations</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="logistique">Logistique</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Aucun employé trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">
                Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
                {pagination.total} résultats
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Suivant
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Employee View Dialog */}
      <EmployeeViewDialog
        employee={selectedEmployeeForView}
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) {
            setSelectedEmployeeForView(null);
          }
        }}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />

      {/* Employee Edit Dialog */}
      <EmployeeEditDialog
        employee={selectedEmployeeForEdit}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedEmployeeForEdit(null);
          }
        }}
        onSubmit={handleEditSubmit}
        isLoading={isEditing}
      />

      {/* Employee Delete Dialog */}
      <EmployeeDeleteDialog
        employee={selectedEmployeeForDelete}
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setSelectedEmployeeForDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default EmployeeTable;