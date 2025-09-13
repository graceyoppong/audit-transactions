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
  globalSearch: string;
  transactionId: string;
  batchNumber: string;
  sender: string;
  receiver: string;
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
    globalSearch: "",
    transactionId: "",
    batchNumber: "",
    sender: "",
    receiver: "",
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
      globalSearch: "",
      transactionId: "",
      batchNumber: "",
      sender: "",
      receiver: "",
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
          {/* Global Search */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="globalSearch">Global Search</Label>
            <Input
              id="globalSearch"
              placeholder="Search across all transaction fields..."
              value={filters.globalSearch}
              onChange={(e) =>
                setFilters({ ...filters, globalSearch: e.target.value })
              }
            />
          </div>

          {/* Transaction ID */}
          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input
              id="transactionId"
              placeholder="Enter transaction ID"
              value={filters.transactionId}
              onChange={(e) =>
                setFilters({ ...filters, transactionId: e.target.value })
              }
            />
          </div>

          {/* Batch Number */}
          <div className="space-y-2">
            <Label htmlFor="batchNumber">Batch Number</Label>
            <Input
              id="batchNumber"
              placeholder="Enter batch number"
              value={filters.batchNumber}
              onChange={(e) =>
                setFilters({ ...filters, batchNumber: e.target.value })
              }
            />
          </div>

          {/* Sender */}
          <div className="space-y-2">
            <Label htmlFor="sender">Sender</Label>
            <Input
              id="sender"
              placeholder="Enter sender account/phone"
              value={filters.sender}
              onChange={(e) =>
                setFilters({ ...filters, sender: e.target.value })
              }
            />
          </div>

          {/* Receiver */}
          <div className="space-y-2">
            <Label htmlFor="receiver">Receiver</Label>
            <Input
              id="receiver"
              placeholder="Enter receiver account/phone"
              value={filters.receiver}
              onChange={(e) =>
                setFilters({ ...filters, receiver: e.target.value })
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
              step="0.01"
              min="0"
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
              step="0.01"
              min="0"
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
