
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Globe, Settings, Layout, Image, AlertCircle, CheckCircle, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';
import { getSiteSettings, saveSiteSettings, SiteSettings } from '@/utils/siteSettings';

const AdminWebsite = () => {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(getSiteSettings());
  
  const handleSave = () => {
    setSaving(true);
    
    // Save settings using the utility function
    saveSiteSettings(settings);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setSaving(false);
      toast.success('Website settings saved successfully');
    }, 1000);
  };
  
  const handlePhotoLimitChange = (value: number[]) => {
    setSettings(prev => ({ ...prev, photoLimit: value[0] }));
  };

  return (
    <div className="flex h-screen bg-background">
      <Helmet>
        <title>Website Management | Admin Dashboard</title>
      </Helmet>
      
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Website Management</h1>
          
          <Tabs defaultValue="general">
            <TabsList className="mb-6">
              <TabsTrigger value="general" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center">
                <Layout className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center">
                <Image className="h-4 w-4 mr-2" />
                Media
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Maintenance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage basic website settings and configurations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Website Name</Label>
                    <Input id="site-name" defaultValue="Chatiwy" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="site-description">Website Description</Label>
                    <Textarea 
                      id="site-description" 
                      defaultValue="Chat with people from around the world instantly."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="site-url">Website URL</Label>
                    <Input id="site-url" defaultValue="https://chatiwy.app" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable the website for maintenance
                      </p>
                    </div>
                    <Switch id="maintenance-mode" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize the look and feel of your website
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-12">
                    <div className="text-center">
                      <Layout className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Appearance Settings</h3>
                      <p className="text-muted-foreground mt-2">
                        Theme customization features coming soon.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle>Media Settings</CardTitle>
                  <CardDescription>
                    Manage image uploads and media limitations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Daily Photo Limits</h3>
                      <p className="text-muted-foreground mb-4">
                        Set the maximum number of photos standard users can send per day
                      </p>
                      
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="photo-limit">Daily Photo Limit</Label>
                            <span className="font-medium">{settings.photoLimit} photos</span>
                          </div>
                          
                          <Slider
                            id="photo-limit"
                            max={50}
                            min={1}
                            step={1}
                            value={[settings.photoLimit]}
                            onValueChange={handlePhotoLimitChange}
                            className="py-4"
                          />
                          
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1</span>
                            <span>25</span>
                            <span>50</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Input 
                            type="number" 
                            id="photo-limit-input"
                            value={settings.photoLimit}
                            onChange={(e) => handlePhotoLimitChange([parseInt(e.target.value) || 1])}
                            min={1}
                            max={50}
                            className="w-20"
                          />
                          <span>photos per day</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg bg-muted p-4 mt-6">
                      <h4 className="font-medium mb-2">Note:</h4>
                      <p className="text-sm text-muted-foreground">
                        Changes to photo limits will take effect immediately for all standard users. 
                        VIP users are not affected by these limitations.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Media Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="maintenance">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Settings</CardTitle>
                  <CardDescription>
                    Configure maintenance mode and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-12">
                    <div className="text-center">
                      <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Maintenance Settings</h3>
                      <p className="text-muted-foreground mt-2">
                        Site maintenance settings coming soon.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminWebsite;
