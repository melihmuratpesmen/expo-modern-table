// useTable.ts
import { useState, useMemo, useEffect } from 'react';
import { SortDirection, Column, Density } from '../types';
import { includesSearch, normalizeSearchText } from '../utils/search';

export function useTable<T extends { id: string | number }>(
  data: T[],
  columns: Column<T>[],
  initialItemsPerPage: number = 10
) {
  // --- STATE ---
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [density, setDensity] = useState<Density>('standard');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.filter(c => !c.hidden).map(c => c.key as string)
  );

  const [stickyColumns, setStickyColumns] = useState<string[]>(
    columns.filter(c => c.isSticky).map(c => c.key as string)
  );

  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: SortDirection }>({
    key: '' as keyof T,
    direction: null,
  });

  // --- LOGIC PIPELINE ---

  // 1. Filtering (Global Search + Column Filters)
  const filteredData = useMemo(() => {
    let result = data;

    // A. Global Search
    if (searchQuery) {
      const normalizedQuery = normalizeSearchText(searchQuery);
      result = result.filter((item) => {
        return Object.values(item).some((val) =>
          includesSearch(String(val), normalizedQuery)
        );
      });
    }

    // B. Column Filters
    if (Object.keys(filters).length > 0) {
      result = result.filter(item => {
        return Object.entries(filters).every(([key, filterValue]) => {
          const itemValue = item[key as keyof T];
          const colConfig = columns.find(c => c.key === key)?.filterConfig;

          if (!filterValue) return true; // Filter cleared

          switch (colConfig?.type) {
            case 'text':
              return includesSearch(String(itemValue), String(filterValue));

            case 'select':
              return itemValue === filterValue;

            case 'boolean':
              return Boolean(itemValue) === (filterValue === 'true' || filterValue === true);

            case 'number-range':
              const { min, max } = filterValue as { min?: number, max?: number };
              const numVal = Number(itemValue);
              if (min !== undefined && numVal < min) return false;
              if (max !== undefined && numVal > max) return false;
              return true;

            default:
              return true;
          }
        });
      });
    }

    return result;
  }, [data, searchQuery, filters, columns]);

  // 2. Sort (Sorting) - Over filtered data
  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    // ...

    if (sortConfig.direction !== null && sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Numeric check
        const isNum = !isNaN(Number(aValue)) && !isNaN(Number(bValue));

        if (isNum) {
          const numA = Number(aValue);
          const numB = Number(bValue);
          if (numA < numB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (numA > numB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }

        // String check
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // 3. Pagination - Over sorted data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // --- HANDLERS ---

  const handleSort = (key: keyof T) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const setColumnFilter = (key: string, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (value === null || value === undefined || value === '') {
        delete newFilters[key]; // Clear
      }
      return newFilters;
    });
  };

  const toggleSelection = (id: string | number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleAllSelection = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      const newSet = new Set(paginatedData.map(item => item.id));
      setSelectedIds(newSet);
    }
  };

  const toggleColumnVisibility = (columnKey: string) => {
    if (visibleColumns.includes(columnKey)) {
      setVisibleColumns(visibleColumns.filter(c => c !== columnKey));
    } else {
      setVisibleColumns([...visibleColumns, columnKey]);
    }
  };

  const toggleStickyColumn = (columnKey: string) => {
    if (stickyColumns.includes(columnKey)) {
      setStickyColumns(stickyColumns.filter(c => c !== columnKey));
    } else {
      setStickyColumns([...stickyColumns, columnKey]);
    }
  };


  return {
    // Data
    paginatedData,
    totalPages,
    currentPage,
    setCurrentPage,

    // Search
    searchQuery,
    setSearchQuery,

    // Sort
    sortConfig,
    handleSort,

    // Selection
    selectedIds,
    toggleSelection,
    toggleAllSelection,
    isAllSelected: paginatedData.length > 0 && selectedIds.size === paginatedData.length,

    // Appearance
    density,
    setDensity,
    visibleColumns,
    toggleColumnVisibility,

    // Pagination
    itemsPerPage,
    setItemsPerPage,

    // Filters
    filters,
    setColumnFilter,

    // Sticky
    stickyColumns,
    toggleStickyColumn,
  };
}