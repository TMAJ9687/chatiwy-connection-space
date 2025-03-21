
import React from 'react';
import { Helmet } from 'react-helmet';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const AdminIssues = () => {
  return (
    <div className="flex h-screen bg-background">
      <Helmet>
        <title>Active Issues | Admin Dashboard</title>
      </Helmet>
      
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Active Issues</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Active Issues Dashboard</CardTitle>
              <CardDescription>
                Monitor and resolve active issues on the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Issues Tracking Module</h3>
                <p className="text-muted-foreground mt-2">
                  This module is under development. Check back soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminIssues;
