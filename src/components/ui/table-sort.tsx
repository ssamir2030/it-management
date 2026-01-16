import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from './button'

export type SortDirection = 'asc' | 'desc' | null

interface TableSortProps {
    column: string
    label: string
    currentSort: string | null
    currentDirection: SortDirection
    onSort: (column: string) => void
}

export function TableSort({
    column,
    label,
    currentSort,
    currentDirection,
    onSort,
}: TableSortProps) {
    const isActive = currentSort === column

    const getIcon = () => {
        if (!isActive) {
            return <ArrowUpDown className="h-4 w-4 opacity-50" />
        }

        if (currentDirection === 'asc') {
            return <ArrowUp className="h-4 w-4" />
        }

        return <ArrowDown className="h-4 w-4" />
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className={`-ml-3 h-8 gap-1 ${isActive ? 'font-bold' : ''}`}
            onClick={() => onSort(column)}
        >
            <span>{label}</span>
            {getIcon()}
        </Button>
    )
}

interface TableHeaderSortableProps {
    column: string
    label: string
    currentSort: string | null
    currentDirection: SortDirection
    onSort: (column: string) => void
    className?: string
}

export function TableHeaderSortable({
    column,
    label,
    currentSort,
    currentDirection,
    onSort,
    className = '',
}: TableHeaderSortableProps) {
    return (
        <th className={`text-right ${className}`}>
            <TableSort
                column={column}
                label={label}
                currentSort={currentSort}
                currentDirection={currentDirection}
                onSort={onSort}
            />
        </th>
    )
}
