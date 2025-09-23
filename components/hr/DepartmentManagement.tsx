"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Users,
  Banknote,
  Search,
  MoreVertical
} from 'lucide-react';
import { useDepartments, useHRActions } from '@/stores/hrStoreHooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  head?: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  employeeCount: number;
  budget?: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

const DepartmentCard = ({ department, onEdit, onDelete }: {
  department: Department;
  onEdit: (dept: Department) => void;
  onDelete: (deptId: string) => void;
}) => (
  <Card className="p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Building2 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
          <p className="text-sm text-gray-500">Code: {department.code}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={department.status === 'active' ? 'default' : 'secondary'}>
          {department.status}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onEdit(department)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(department._id)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    {department.description && (
      <p className="text-sm text-gray-600 mb-4">{department.description}</p>
    )}

    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center space-x-2">
        <Users className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">
          {department.employeeCount} employees
        </span>
      </div>
      {department.budget && (
        <div className="flex items-center space-x-2">
          <Banknote className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {new Intl.NumberFormat('fr-MA', {
              style: 'currency',
              currency: 'MAD'
            }).format(department.budget)} budget
          </span>
        </div>
      )}
    </div>

    {department.head && (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Head:</span> {department.head.firstName} {department.head.lastName} ({department.head.employeeId})
        </p>
      </div>
    )}
  </Card>
);

const DepartmentForm = ({ department, onSave, onCancel }: {
  department?: Department;
  onSave: (data: any) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: department?.name || '',
    code: department?.code || '',
    description: department?.description || '',
    budget: department?.budget || '',
    status: department?.status || 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      budget: formData.budget ? Number(formData.budget) : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Department Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="code">Department Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="budget">Budget</Label>
        <Input
          id="budget"
          type="number"
          value={formData.budget}
          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          placeholder="0"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {department ? 'Update' : 'Create'} Department
        </Button>
      </div>
    </form>
  );
};

const DepartmentManagement = () => {
  const departments = useDepartments();
  const { setDepartments, setLoading } = useHRActions();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | undefined>();

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/hr/departments?mock=true');
        const data = await response.json();

        if (data.meta.status === 200) {
          setDepartments(data.data.departments);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [setDepartments, setLoading]);

  const handleSaveDepartment = async (departmentData: any) => {
    try {
      const url = editingDepartment
        ? `/api/hr/departments/${editingDepartment._id}`
        : '/api/hr/departments';

      const method = editingDepartment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...departmentData, useMockData: true }),
      });

      if (response.ok) {
        // Refresh departments list
        const departmentsResponse = await fetch('/api/hr/departments?mock=true');
        const departmentsData = await departmentsResponse.json();

        if (departmentsData.meta.status === 200) {
          setDepartments(departmentsData.data.departments);
        }

        setIsDialogOpen(false);
        setEditingDepartment(undefined);
      }
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        const response = await fetch(`/api/hr/departments/${departmentId}?mock=true`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove from local state
          setDepartments(departments.filter(dept => dept._id !== departmentId));
        }
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setIsDialogOpen(true);
  };

  const handleAddDepartment = () => {
    setEditingDepartment(undefined);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
          <p className="text-gray-600">Organize your workforce into departments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddDepartment}>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </DialogTitle>
            </DialogHeader>
            <DepartmentForm
              department={editingDepartment}
              onSave={handleSaveDepartment}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingDepartment(undefined);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredDepartments.length === 0 ? (
        <Card className="p-8 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No departments match your search.' : 'Get started by creating your first department.'}
          </p>
          {!searchTerm && (
            <Button onClick={handleAddDepartment}>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <DepartmentCard
              key={department._id}
              department={department}
              onEdit={handleEditDepartment}
              onDelete={handleDeleteDepartment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;