import { getMockData } from '@/lib/hr/mockData';
import { apiClient } from '@/lib/utils/apiClient';

interface FetchEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  team?: string;
  status?: string;
}

export async function fetchEmployees(params: FetchEmployeesParams) {
  const queryParams = new URLSearchParams({
    page: (params.page || 1).toString(),
    limit: (params.limit || 10).toString(),
    search: params.search || '',
    status: params.status || 'active',
  });

  if (params.department && params.department !== 'all') {
    queryParams.append('department', params.department);
  }

  if (params.team) {
    queryParams.append('team', params.team);
  }

  // Try to fetch from API
  const apiResponse = await apiClient<any>(`/api/hr/employees?${queryParams}`);

  if (apiResponse.data && apiResponse.data.meta?.status === 200) {
    return {
      employees: apiResponse.data.data.employees,
      pagination: {
        total: apiResponse.data.meta.total,
        page: apiResponse.data.meta.page,
        limit: apiResponse.data.meta.limit,
      },
    };
  }

  // Fallback to mock data
  console.log('Using fallback mock data for employees');

  // Fallback to mock data
  let employees = getMockData('employees');

  // Apply filters on mock data
  if (params.search) {
    employees = employees.filter((emp: any) =>
      emp.firstName.toLowerCase().includes(params.search!.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(params.search!.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(params.search!.toLowerCase()) ||
      emp.email.toLowerCase().includes(params.search!.toLowerCase())
    );
  }

  if (params.department && params.department !== 'all') {
    employees = employees.filter((emp: any) => emp.department === params.department);
  }

  if (params.team) {
    employees = employees.filter((emp: any) => emp.team === params.team);
  }

  if (params.status) {
    employees = employees.filter((emp: any) => emp.status === params.status);
  }

  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 10;
  const total = employees.length;
  const startIndex = (page - 1) * limit;
  const paginatedEmployees = employees.slice(startIndex, startIndex + limit);

  return {
    employees: paginatedEmployees,
    pagination: {
      total,
      page,
      limit,
    },
  };
}