
import React from 'react';
import { Helmet } from 'react-helmet';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Inbox } from 'lucide-react';

const AdminInbox = () => {
  return (
    <div className="flex h-screen bg-background">
      <Helmet>
        <title>Admin Inbox | Chatiwy</title>
      </Helmet>
      
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Admin Inbox</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Message Center</CardTitle>
              <CardDescription>
                View and respond to messages from users
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-12">
              <div className="text-center">
                <Inbox className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Admin Inbox</h3>
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

export default AdminInbox;
