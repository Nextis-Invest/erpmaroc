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

  // In development, add bypass parameter to avoid auth issues
  if (process.env.NODE_ENV === 'development') {
    queryParams.append('bypass', 'true');
  }

  // Fetch from API with authentication
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

  // If API fails, throw error instead of falling back to mock data
  const errorMessage = apiResponse.error || 'Failed to fetch employees from database';
  console.error('Failed to fetch employees:', errorMessage);
  throw new Error(errorMessage);
}