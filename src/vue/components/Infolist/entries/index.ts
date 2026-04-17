import type { Component } from 'vue';
import TextEntry from './TextEntry.vue';
import BadgeEntry from './BadgeEntry.vue';
import BooleanEntry from './BooleanEntry.vue';
import ImageEntry from './ImageEntry.vue';
import DateEntry from './DateEntry.vue';
import MoneyEntry from './MoneyEntry.vue';

export { TextEntry, BadgeEntry, BooleanEntry, ImageEntry, DateEntry, MoneyEntry };

export const detailEntryMap: Record<string, Component> = {
    text: TextEntry,
    badge: BadgeEntry,
    boolean: BooleanEntry,
    image: ImageEntry,
    date: DateEntry,
    money: MoneyEntry,
};
