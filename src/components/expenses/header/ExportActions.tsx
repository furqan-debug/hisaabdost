
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportActionsProps {
  isMobile: boolean;
  isExporting: string | null;
  handleExport: (type: 'csv' | 'pdf') => void;
}

export function ExportActions({ isMobile, isExporting, handleExport }: ExportActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={isMobile ? "icon-sm" : "default"}
          className="rounded-lg"
        >
          <Download className="h-4 w-4" />
          {!isMobile && <span className="ml-2">Export</span>}
          {isMobile && <span className="sr-only">Export</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem 
          onClick={() => handleExport('csv')}
          disabled={isExporting !== null}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>{isExporting === 'csv' ? 'Exporting...' : 'CSV'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          disabled={isExporting !== null}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>{isExporting === 'pdf' ? 'Exporting...' : 'PDF'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
