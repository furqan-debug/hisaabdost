
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExpenseFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  dateRange: {
    start: string;
    end: string;
  };
  setDateRange: (dateRange: { start: string; end: string; }) => void;
}

export function ExpenseFilters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  dateRange,
  setDateRange,
}: ExpenseFiltersProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`flex flex-col gap-4 ${isMobile ? 'space-y-2' : 'md:flex-row md:items-center md:justify-between'}`}>
      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-1 gap-2'}`}>
        <Input
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`${isMobile ? 'w-full' : 'max-w-xs'}`}
        />
        <Select
          value={categoryFilter}
          onValueChange={setCategoryFilter}
        >
          <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[180px]'}`}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.keys(CATEGORY_COLORS).map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className={`flex ${isMobile ? 'justify-between' : 'gap-2'}`}>
        <Input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({
            ...dateRange,
            start: e.target.value
          })}
          className={`${isMobile ? 'w-[48%]' : 'w-auto'}`}
        />
        <Input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({
            ...dateRange,
            end: e.target.value
          })}
          className={`${isMobile ? 'w-[48%]' : 'w-auto'}`}
        />
      </div>
    </div>
  );
}
