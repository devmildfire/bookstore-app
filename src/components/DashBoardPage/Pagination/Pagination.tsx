import * as React from 'react';
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { usePagination } from '@/hooks/usePagination';

type Props = {
  className?: string;
  totalPages: number;
  onChange: (page: number) => void;
  // itemsPerPage: number;
  // currentPage: number;
  // setCurrentPage: number;
};

const Pagination: React.FC<Props> = ({ className, totalPages, onChange }) => {
  const pagination = usePagination({
    total: totalPages,
    onChange: onChange,
  });

  console.log(pagination.range);

  return (
    <PaginationRoot className={className}>
      <PaginationContent>
        <PaginationItem onClick={pagination.previous}>
          <PaginationPrevious href='#' />
        </PaginationItem>
        {pagination.range.map((page, idx) => {
          if (page === 'dots') {
            return <PaginationItem key={idx}>...</PaginationItem>;
          }

          return (
            <PaginationItem onClick={() => pagination.setPage(page)} key={idx}>
              <PaginationLink href='#' isActive={page === pagination.active}>
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem onClick={pagination.next}>
          <PaginationNext href='#' />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
};

export default React.memo(Pagination);
