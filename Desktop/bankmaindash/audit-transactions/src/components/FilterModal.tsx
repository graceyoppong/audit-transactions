import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterCriteria) => void;
  serviceType: string;
}

export interface FilterCriteria {
  search: string;
  accountNumber: string;
  status: string;
  type: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  amountFrom: string;
  amountTo: string;
  phoneNumber: string;
  meterNumber: string;
  smartCardNumber: string;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  serviceType,
}) => {
  const [filters, setFilters] = useState<FilterCriteria>({
    search: "",
    accountNumber: "",
    status: "all",
    type: "all",
    dateFrom: undefined,
    dateTo: undefined,
    amountFrom: "",
    amountTo: "",
    phoneNumber: "",
    meterNumber: "",
    smartCardNumber: "",
  });

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      search: "",
      accountNumber: "",
      status: "all",
      type: "all",
      dateFrom: undefined,
      dateTo: undefined,
      amountFrom: "",
      amountTo: "",
      phoneNumber: "",
      meterNumber: "",
      smartCardNumber: "",
    });
  };

  const renderServiceSpecificFields = () => {
    switch (serviceType) {
      case "airtime":
        return (
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="Enter phone number"
              value={filters.phoneNumber}
              onChange={(e) =>
                setFilters({ ...filters, phoneNumber: e.target.value })
              }
            />
          </div>
        );
      case "ecg":
      case "water":
        return (
          <div className="space-y-2">
            <Label htmlFor="meterNumber">Meter Number</Label>
            <Input
              id="meterNumber"
              placeholder="Enter meter number"
              value={filters.meterNumber}
              onChange={(e) =>
                setFilters({ ...filters, meterNumber: e.target.value })
              }
            />
          </div>
        );
      case "multichoice":
        return (
          <div className="space-y-2">
            <Label htmlFor="smartCardNumber">Smart Card Number</Label>
            <Input
              id="smartCardNumber"
              placeholder="Enter smart card number"
              value={filters.smartCardNumber}
              onChange={(e) =>
                setFilters({ ...filters, smartCardNumber: e.target.value })
              }
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
          <DialogDescription>
            Filter transactions by various criteria to find what you&apos;re looking
            for.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="Enter account number"
              value={filters.accountNumber}
              onChange={(e) =>
                setFilters({ ...filters, accountNumber: e.target.value })
              }
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <Label>Date From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom
                    ? format(filters.dateFrom, "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date: Date | undefined) =>
                    setFilters({ ...filters, dateFrom: date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label>Date To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateTo
                    ? format(filters.dateTo, "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date: Date | undefined) => setFilters({ ...filters, dateTo: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Amount From */}
          <div className="space-y-2">
            <Label htmlFor="amountFrom">Amount From (GH₵)</Label>
            <Input
              id="amountFrom"
              type="number"
              placeholder="0.00"
              value={filters.amountFrom}
              onChange={(e) =>
                setFilters({ ...filters, amountFrom: e.target.value })
              }
            />
          </div>

          {/* Amount To */}
          <div className="space-y-2">
            <Label htmlFor="amountTo">Amount To (GH₵)</Label>
            <Input
              id="amountTo"
              type="number"
              placeholder="0.00"
              value={filters.amountTo}
              onChange={(e) =>
                setFilters({ ...filters, amountTo: e.target.value })
              }
            />
          </div>

          {/* Service-specific fields */}
          {renderServiceSpecificFields()}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
