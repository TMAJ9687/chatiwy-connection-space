
import React from 'react';
import { Helmet } from 'react-helmet';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy } from 'lucide-react';

const AdminSupport = () => {
  return (
    <div className="flex h-screen bg-background">
      <Helmet>
        <title>User Support | Admin Dashboard</title>
      </Helmet>
      
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">User Support</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>User Support Dashboard</CardTitle>
              <CardDescription>
                Manage user support tickets and inquiries
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <LifeBuoy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Support Module</h3>
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

export default AdminSupport;
