"use client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CustomPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CustomPaginationProps) {
  // Funkcja do generowania numerów stron do wyświetlenia
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Maksymalna liczba stron do wyświetlenia

    if (totalPages <= maxPagesToShow) {
      // Jeśli jest mniej stron niż maksymalna liczba, pokaż wszystkie
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Zawsze pokazuj pierwszą stronę
      pageNumbers.push(1);

      // Oblicz zakres stron do wyświetlenia wokół bieżącej strony
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      // Dodaj wielokropek po pierwszej stronie, jeśli potrzeba
      if (startPage > 2) {
        pageNumbers.push("ellipsis-start");
      }

      // Dodaj strony w zakresie
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Dodaj wielokropek przed ostatnią stroną, jeśli potrzeba
      if (endPage < totalPages - 1) {
        pageNumbers.push("ellipsis-end");
      }

      // Zawsze pokazuj ostatnią stronę
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <Pagination>
      <PaginationContent>
        {/* Przycisk "Poprzednia" */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) {
                onPageChange(currentPage - 1);
              }
            }}
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>

        {/* Numery stron */}
        {getPageNumbers().map((pageNumber, index) => {
          if (
            pageNumber === "ellipsis-start" ||
            pageNumber === "ellipsis-end"
          ) {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNumber as number);
                }}
                isActive={currentPage === pageNumber}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Przycisk "Następna" */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
              }
            }}
            className={
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
