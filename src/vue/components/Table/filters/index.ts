import type { Component } from 'vue';
import SelectFilter from './SelectFilter.vue';
import TernaryFilter from './TernaryFilter.vue';
import DateFilter from './DateFilter.vue';
import BooleanFilter from './BooleanFilter.vue';
import FilterPanel from './FilterPanel.vue';

export { SelectFilter, TernaryFilter, DateFilter, BooleanFilter, FilterPanel };

export const filterComponentMap: Record<string, Component> = {
    select: SelectFilter,
    ternary: TernaryFilter,
    date: DateFilter,
    boolean: BooleanFilter,
};
