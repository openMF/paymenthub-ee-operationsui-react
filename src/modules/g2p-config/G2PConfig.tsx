import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import G2PPaymentTab from './G2PPaymentTab'
import CreateG2PTab from './CreateG2PTab'

export default function G2PConfig() {
  const [tab, setTab] = useState('g2p-payment')

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">G2P Payment Config</span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight">G2P Payment Config</h1>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line">
          <TabsTrigger value="g2p-payment">G2P Payment</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="g2p-payment" className="mt-4">
          <G2PPaymentTab />
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <CreateG2PTab
            onCancel={() => setTab('g2p-payment')}
            onSuccess={() => setTab('g2p-payment')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
