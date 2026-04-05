import type { ComponentType } from 'react';
import { SelectFilter } from './SelectFilter';
import { TernaryFilter } from './TernaryFilter';
import { DateFilter } from './DateFilter';
import { BooleanFilter } from './BooleanFilter';

export { SelectFilter } from './SelectFilter';
export { TernaryFilter } from './TernaryFilter';
export { DateFilter } from './DateFilter';
export { BooleanFilter } from './BooleanFilter';
export { FilterPanel } from './FilterPanel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const filterComponentMap: Record<string, ComponentType<any>> = {
    select: SelectFilter,
    ternary: TernaryFilter,
    date: DateFilter,
    boolean: BooleanFilter,
};
