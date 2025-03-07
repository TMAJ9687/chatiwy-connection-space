
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Flag, 
  Search, 
  Trash, 
  AlertCircle, 
  Filter,
  Eye,
  User,
  Clock,
  Calendar
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUsername: string;
  reporterUserId: string;
  reporterUsername: string;
  reason: string;
  description: string;
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'resolved';
  autoDeleteAt: Date;
}

const MOCK_REPORTS: UserReport[] = [
  {
    id: 'report-1',
    reportedUserId: 'user-4',
    reportedUsername: 'Moreor',
    reporterUserId: 'user-1',
    reporterUsername: 'Reincarnated',
    reason: 'Inappropriate content',
    description: 'This user was sharing inappropriate images in the chat',
    timestamp: new Date(Date.now() - 86400000 * 1), // 1 day ago
    status: 'pending',
    autoDeleteAt: new Date(Date.now() + 86400000 * 1), // 1 day from now
  },
  {
    id: 'report-2',
    reportedUserId: 'user-3',
    reportedUsername: 'Naisees',
    reporterUserId: 'user-2',
    reporterUsername: 'Shinhoff',
    reason: 'Harassment',
    description: 'This user has been repeatedly sending unwanted messages',
    timestamp: new Date(Date.now() - 86400000 * 0.5), // 12 hours ago
    status: 'reviewed',
    autoDeleteAt: new Date(Date.now() + 86400000 * 1.5), // 1.5 days from now
  },
  {
    id: 'report-3',
    reportedUserId: 'bot-1',
    reportedUsername: 'Emma',
    reporterUserId: 'user-6',
    reporterUsername: 'Mason',
    reason: 'Spam',
    description: 'This bot keeps sending the same message over and over',
    timestamp: new Date(Date.now() - 86400000 * 0.2), // ~5 hours ago
    status: 'pending',
    autoDeleteAt: new Date(Date.now() + 86400000 * 1.8), // 1.8 days from now
  },
];

const AdminReports = () => {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    // Load reports - in a real app, this would fetch from an API
    setReports(MOCK_REPORTS);
    
    // Set up auto-delete timer
    const intervalId = setInterval(() => {
      setReports(prevReports => 
        prevReports.filter(report => new Date(report.autoDeleteAt) > new Date())
      );
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredReports = reports.filter(report => {
    if (searchQuery && 
        !report.reportedUsername.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !report.reporterUsername.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !report.reason.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (statusFilter && report.status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  const handleViewReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const handleDeleteReport = (reportId: string) => {
    const reportToDelete = reports.find(r => r.id === reportId);
    if (!reportToDelete) return;

    setReports(prev => prev.filter(r => r.id !== reportId));
    toast.success(`Report deleted successfully`);
  };

  const handleUpdateStatus = (reportId: string, status: 'pending' | 'reviewed' | 'resolved') => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status } : report
    ));
    
    toast.success(`Report status updated to ${status}`);
    
    if (status === 'resolved') {
      setTimeout(() => {
        handleDeleteReport(reportId);
      }, 1500);
    }
  };

  const getTimeRemaining = (autoDeleteAt: Date) => {
    const now = new Date();
    const timeRemaining = new Date(autoDeleteAt).getTime() - now.getTime();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${minutesRemaining}m`;
    }
    return `${minutesRemaining}m`;
  };

  const getStatusBadgeVariant = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'secondary',
      'reviewed': 'warning',
      'resolved': 'success',
    };
    
    return statusMap[status] || 'secondary';
  };

  return (
    <div className="flex h-screen bg-background">
      <Helmet>
        <title>User Reports | Chatiwy Admin</title>
      </Helmet>
      
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">User Reports</h1>
          
          <div className="flex justify-between items-center mb-6">
            <div className="text-muted-foreground">
              Reports are automatically deleted after 48 hours if not handled
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search reports..."
                  className="pl-10 w-60"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setStatusFilter(null)}
                  >
                    {!statusFilter ? '✓ ' : ''}All Reports
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter('pending')}
                  >
                    {statusFilter === 'pending' ? '✓ ' : ''}Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter('reviewed')}
                  >
                    {statusFilter === 'reviewed' ? '✓ ' : ''}Reviewed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter('resolved')}
                  >
                    {statusFilter === 'resolved' ? '✓ ' : ''}Resolved
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>
                Review and manage reports submitted by users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredReports.length > 0 ? (
                <div className="divide-y">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="py-4 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Flag className={`h-8 w-8 ${
                            report.status === 'pending' ? 'text-destructive' :
                            report.status === 'reviewed' ? 'text-amber-500' : 'text-green-500'
                          }`} />
                        </div>
                        
                        <div>
                          <div className="font-medium flex items-center">
                            <span>Report against {report.reportedUsername}</span>
                            <Badge 
                              variant={getStatusBadgeVariant(report.status) as any}
                              className="ml-2"
                            >
                              {report.status}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            Reason: {report.reason}
                          </div>
                          
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <User className="h-3 w-3 mr-1" />
                            <span>Reported by {report.reporterUsername}</span>
                            <span className="mx-2">•</span>
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{format(new Date(report.timestamp), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-muted-foreground flex items-center bg-muted py-1 px-2 rounded-full">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Auto-delete in {getTimeRemaining(report.autoDeleteAt)}</span>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewReport(report.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {report.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(report.id, 'reviewed')}>
                                <Eye className="h-4 w-4 mr-2" />
                                Mark as Reviewed
                              </DropdownMenuItem>
                            )}
                            {(report.status === 'pending' || report.status === 'reviewed') && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(report.id, 'resolved')}>
                                <Badge variant="success" className="mr-2 px-1">✓</Badge>
                                Mark as Resolved
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteReport(report.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No reports found</h3>
                  <p className="text-muted-foreground">There are no reports matching your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Review the full details of this report
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">Report against:</div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>{selectedReport.reportedUsername}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium">Reported by:</div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>{selectedReport.reporterUsername}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium">Reason:</div>
                <div className="bg-muted p-2 rounded">
                  {selectedReport.reason}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium">Description:</div>
                <div className="bg-muted p-2 rounded">
                  {selectedReport.description}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium">Timestamp:</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{format(new Date(selectedReport.timestamp), 'PPpp')}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium">Status:</div>
                <Badge variant={getStatusBadgeVariant(selectedReport.status) as any}>
                  {selectedReport.status}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium">Auto-delete in:</div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{getTimeRemaining(selectedReport.autoDeleteAt)}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <div>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (selectedReport) {
                    handleDeleteReport(selectedReport.id);
                    setIsViewDialogOpen(false);
                  }
                }}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Report
              </Button>
            </div>
            <div className="space-x-2">
              {selectedReport && selectedReport.status === 'pending' && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (selectedReport) {
                      handleUpdateStatus(selectedReport.id, 'reviewed');
                      setIsViewDialogOpen(false);
                    }
                  }}
                >
                  Mark as Reviewed
                </Button>
              )}
              {selectedReport && (selectedReport.status === 'pending' || selectedReport.status === 'reviewed') && (
                <Button 
                  onClick={() => {
                    if (selectedReport) {
                      handleUpdateStatus(selectedReport.id, 'resolved');
                      setIsViewDialogOpen(false);
                    }
                  }}
                >
                  Resolve Report
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReports;
