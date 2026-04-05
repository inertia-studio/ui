import type { ComponentType } from 'react';
import { TextCell } from './TextCell';
import { BadgeCell } from './BadgeCell';
import { BooleanCell } from './BooleanCell';
import { ImageCell } from './ImageCell';
import { IconCell } from './IconCell';
import { ColorCell } from './ColorCell';
import { DateCell } from './DateCell';
import { MoneyCell } from './MoneyCell';

export { TextCell } from './TextCell';
export { BadgeCell } from './BadgeCell';
export { BooleanCell } from './BooleanCell';
export { ImageCell } from './ImageCell';
export { IconCell } from './IconCell';
export { ColorCell } from './ColorCell';
export { DateCell } from './DateCell';
export { MoneyCell } from './MoneyCell';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cellComponentMap: Record<string, ComponentType<any>> = {
    text: TextCell,
    badge: BadgeCell,
    boolean: BooleanCell,
    image: ImageCell,
    icon: IconCell,
    color: ColorCell,
    date: DateCell,
    money: MoneyCell,
};
