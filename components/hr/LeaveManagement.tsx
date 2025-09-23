"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Filter } from 'lucide-react';
import { useLeaveRequests, useHRActions } from '@/stores/hrStoreHooks';

// Status Badge Component
const LeaveStatusBadge = ({ status }: { status: string }) => {
  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-orange-100 text-orange-800"
  };

  const statusIcons = {
    draft: <Clock className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
    approved: <CheckCircle className="w-3 h-3" />,
    rejected: <XCircle className="w-3 h-3" />,
    cancelled: <XCircle className="w-3 h-3" />
  };

  return (
    <Badge className={`flex items-center gap-1 ${statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}>
      {statusIcons[status as keyof typeof statusIcons]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Leave Request Card Component
const LeaveRequestCard = ({ request, onApprove, onReject }: {
  request: any;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}) => {
  const startDate = new Date(request.startDate);
  const endDate = new Date(request.endDate);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            {request.employee.firstName} {request.employee.lastName}
          </h3>
          <p className="text-sm text-gray-600">{request.employee.position}</p>
        </div>
        <LeaveStatusBadge status={request.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Type :</span>
          <Badge variant="outline">{request.leaveType.name}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </span>
          <Badge variant="secondary">{request.numberOfDays} jours</Badge>
        </div>
        <div className="text-sm">
          <span className="font-medium">Raison :</span>
          <p className="text-gray-600 mt-1">{request.reason}</p>
        </div>
      </div>

      {request.status === 'pending' && onApprove && onReject && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onApprove(request._id)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Approuver
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReject(request._id)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Rejeter
          </Button>
        </div>
      )}
    </Card>
  );
};

// Leave Balance Card
const LeaveBalanceCard = ({ employee, balances }: { employee: any; balances: any[] }) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-gray-900 mb-3">
        {employee.firstName} {employee.lastName}
      </h3>
      <div className="space-y-3">
        {balances.map((balance, index) => (
          <div key={index} className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{balance.leaveType}</p>
              <p className="text-xs text-gray-500">Quota annuel : {balance.entitled}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-green-600">
                {balance.available} disponibles
              </p>
              <p className="text-xs text-gray-500">
                {balance.taken} utilisés
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Main Leave Management Component
const LeaveManagement = () => {
  const leaveRequests = useLeaveRequests();
  const { setLeaveRequests, updateLeaveRequest } = useHRActions();
  const [activeTab, setActiveTab] = useState("requests");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch('/api/hr/leave-requests?mock=true');
        const data = await response.json();

        if (data.meta.status === 200) {
          setLeaveRequests(data.data.leaveRequests);
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };

    fetchLeaveRequests();
  }, [setLeaveRequests]);

  const handleApprove = async (requestId: string) => {
    try {
      // In a real app, this would call the API
      updateLeaveRequest(requestId, { status: 'approved' });
      console.log('Approved leave request:', requestId);
    } catch (error) {
      console.error('Error approving leave request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      // In a real app, this would call the API
      updateLeaveRequest(requestId, { status: 'rejected' });
      console.log('Rejected leave request:', requestId);
    } catch (error) {
      console.error('Error rejecting leave request:', error);
    }
  };

  // Filter leave requests
  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
      request.employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.leaveType.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Mock leave balances data
  const mockLeaveBalances = [
    {
      employee: { firstName: "Ahmed", lastName: "Hassan" },
      balances: [
        { leaveType: "Annual Leave", entitled: 30, taken: 8, available: 22 },
        { leaveType: "Sick Leave", entitled: 15, taken: 2, available: 13 }
      ]
    },
    {
      employee: { firstName: "Yasmine", lastName: "Benali" },
      balances: [
        { leaveType: "Annual Leave", entitled: 30, taken: 5, available: 25 },
        { leaveType: "Sick Leave", entitled: 15, taken: 0, available: 15 }
      ]
    }
  ];

  const pendingCount = leaveRequests.filter(req => req.status === 'pending').length;
  const approvedCount = leaveRequests.filter(req => req.status === 'approved').length;
  const rejectedCount = leaveRequests.filter(req => req.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Congés</h2>
          <p className="text-gray-600">Gérez les demandes de congés et les soldes des employés</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Demande de Congé
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approuvées</p>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejetées</p>
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Demandes Totales</p>
              <p className="text-2xl font-bold text-blue-600">{leaveRequests.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">Demandes de Congés</TabsTrigger>
          <TabsTrigger value="balances">Soldes de Congés</TabsTrigger>
          <TabsTrigger value="calendar">Vue Calendrier</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par nom d'employé ou type de congé..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Statuts</SelectItem>
                  <SelectItem value="pending">En Attente</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Leave Requests Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <LeaveRequestCard
                  key={request._id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            ) : (
              <div className="col-span-full">
                <Card className="p-8 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune Demande de Congé Trouvée</h3>
                  <p className="text-gray-600">
                    {searchQuery || filterStatus !== 'all'
                      ? 'Essayez d\'ajuster vos filtres pour voir plus de résultats.'
                      : 'Aucune demande de congé n\'a encore été soumise.'}
                  </p>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {mockLeaveBalances.map((balance, index) => (
              <LeaveBalanceCard
                key={index}
                employee={balance.employee}
                balances={balance.balances}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card className="p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendrier des Congés</h3>
            <p className="text-gray-600 mb-4">
              Voir tous les congés approuvés dans un format calendrier pour gérer la disponibilité de l&apos;équipe.
            </p>
            <p className="text-sm text-blue-600">Bientôt Disponible</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaveManagement;