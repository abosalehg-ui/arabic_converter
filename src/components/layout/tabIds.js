/**
 * Element ids linking each tab button to its panel (`aria-controls` /
 * `aria-labelledby`). Kept out of the component files so both sides of the
 * relationship import the same source of truth.
 */
export const tabButtonId = (id) => `tab-${id}`;
export const tabPanelId = (id) => `panel-${id}`;
