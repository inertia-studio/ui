import type { Component } from 'vue';
import TextCell from './TextCell.vue';
import BadgeCell from './BadgeCell.vue';
import BooleanCell from './BooleanCell.vue';
import ImageCell from './ImageCell.vue';
import IconCell from './IconCell.vue';
import ColorCell from './ColorCell.vue';
import DateCell from './DateCell.vue';
import MoneyCell from './MoneyCell.vue';

export { TextCell, BadgeCell, BooleanCell, ImageCell, IconCell, ColorCell, DateCell, MoneyCell };

export const cellComponentMap: Record<string, Component> = {
    text: TextCell,
    badge: BadgeCell,
    boolean: BooleanCell,
    image: ImageCell,
    icon: IconCell,
    color: ColorCell,
    date: DateCell,
    money: MoneyCell,
};
