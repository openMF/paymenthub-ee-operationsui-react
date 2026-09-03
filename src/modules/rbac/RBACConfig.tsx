import { Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RoleConfigTab from './RoleConfigTab'
import UserManagementTab from './UserManagementTab'

export default function RBACConfig() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Role Configuration</span>
      </nav>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Access & Role Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure what each role can access using Keycloak policies
        </p>
      </div>

      <Tabs defaultValue="role-config">
        <TabsList variant="line">
          <TabsTrigger value="role-config">Role Configuration</TabsTrigger>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="role-config" className="mt-4">
          <RoleConfigTab />
        </TabsContent>

        <TabsContent value="user-management" className="mt-4">
          <UserManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
