import { Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import VouchersTab from './VouchersTab'
import CreateVouchersTab from './CreateVouchersTab'

export default function Vouchers() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Voucher Management</span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight">Voucher Management</h1>

      {/* Tabs */}
      <Tabs defaultValue="vouchers">
        <TabsList variant="line">
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="create-vouchers">Create Vouchers</TabsTrigger>
        </TabsList>

        <TabsContent value="vouchers" className="mt-4">
          <VouchersTab />
        </TabsContent>

        <TabsContent value="create-vouchers" className="mt-4">
          <CreateVouchersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
