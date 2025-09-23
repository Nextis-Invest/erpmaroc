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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
const createColumns = (onViewEmployee: (employee: Employee) => void): ColumnDef<Employee>[] => [
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
            <DropdownMenuItem onClick={() => onViewEmployee(employee)}>
              Modifier Employé
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('View leaves', employee)}>
              Voir Congés
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('View attendance', employee)}>
              Voir Présence
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    // Here you would navigate to employee detail view or open a modal
    console.log('Viewing employee:', employee);
  };

  const columns = createColumns(handleViewEmployee);

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
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          mock: 'true',
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          search: employeeFilters.search,
          status: employeeFilters.status,
        });

        if (employeeFilters.department && employeeFilters.department !== 'all') {
          params.append('department', employeeFilters.department);
        }

        if (employeeFilters.team) {
          params.append('team', employeeFilters.team);
        }

        const response = await fetch(`/api/hr/employees?${params}`);
        const data = await response.json();

        if (data.meta.status === 200) {
          setEmployees(data.data.employees);
          setPagination({
            total: data.meta.total,
            page: data.meta.page,
            limit: data.meta.limit,
          });
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
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
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter Employé
          </Button>
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
    </div>
  );
};

export default EmployeeTable;