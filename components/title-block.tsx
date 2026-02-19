import { Printer } from 'lucide-react'

interface TitleBlockProps {
  title?: string
}

export default function TitleBlock({ title = 'Digital Marketing' }: TitleBlockProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="mb-4 flex items-start justify-between gap-4 no-print">
      <div className="flex-1">
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-950 dark:text-blue-100 tracking-tight leading-tight mb-1">
          {title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-500 font-normal">
          Maven Jobs — Workstreams, status, ownership, cadence
        </p>
      </div>

      {/* Print Preview Button */}
      <button 
        onClick={handlePrint}
        className="px-4 py-2.5 text-sm font-medium text-white bg-blue-900 dark:bg-blue-900 hover:bg-blue-800 dark:hover:bg-blue-800 rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
      >
        <Printer className="w-4 h-4" />
        Print Preview
      </button>
    </div>
  )
}
