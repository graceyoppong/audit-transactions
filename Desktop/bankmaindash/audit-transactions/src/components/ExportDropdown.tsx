import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, FileText, Table, FileSpreadsheet } from "lucide-react";

interface ExportDropdownProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  onExportCSV?: () => void;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExportPDF,
  onExportExcel,
  onExportCSV,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onExportPDF} className="cursor-pointer">
          <FileText className="w-4 h-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportExcel} className="cursor-pointer">
          <Table className="w-4 h-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        {onExportCSV && (
          <DropdownMenuItem onClick={onExportCSV} className="cursor-pointer">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDropdown;
