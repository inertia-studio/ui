import type { ComponentType } from 'react';
import { TextEntry } from './TextEntry';
import { BadgeEntry } from './BadgeEntry';
import { BooleanEntry } from './BooleanEntry';
import { ImageEntry } from './ImageEntry';
import { DateEntry } from './DateEntry';
import { MoneyEntry } from './MoneyEntry';

export { TextEntry } from './TextEntry';
export { BadgeEntry } from './BadgeEntry';
export { BooleanEntry } from './BooleanEntry';
export { ImageEntry } from './ImageEntry';
export { DateEntry } from './DateEntry';
export { MoneyEntry } from './MoneyEntry';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const detailEntryMap: Record<string, ComponentType<any>> = {
    text: TextEntry,
    badge: BadgeEntry,
    boolean: BooleanEntry,
    image: ImageEntry,
    date: DateEntry,
    money: MoneyEntry,
};
