import { UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CreateVouchersTab() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-white px-12 py-10 shadow-sm text-center">
        <div className="rounded-full bg-blue-50 p-4">
          <UploadCloud className="h-8 w-8 text-[#1565C0]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">Bulk Voucher Upload</h2>
          <p className="text-sm text-muted-foreground">
            Upload a CSV file to create multiple vouchers at once
          </p>
        </div>
        <Button className="bg-[#1565C0] hover:bg-[#0d47a1] text-white mt-2">
          Choose File to Upload
        </Button>
      </div>
    </div>
  )
}
