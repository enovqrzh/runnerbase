/**
 * Recalculate the karma cost for points for a given attribute or skill
 *
 * @param  {Object} oldItem  The previous state of the item
 * @param  {Object} newItem  The new state of the item
 * @param  {number} factor   The factor by which point totals are multiplied to get karma cost
 * @return {number}          The karma cost
 */
export function karmaCost(oldItem, newItem, factor) {
  let karmaDiff = 0;
  if (oldItem.karma > 0) {
    const base = oldItem.base + (oldItem.hasOwnProperty('metatypemin') ? oldItem.metatypemin : null);
    for (let j = base + 1; j <= (base + oldItem.karma); j++) {
      karmaDiff = karmaDiff - (j * factor);
    }
  }
  if (newItem.karma > 0) {
    const base = newItem.base + (newItem.hasOwnProperty('metatypemin') ? newItem.metatypemin : null);
    for (let j = base + 1; j <= (base + newItem.karma); j++) {
      karmaDiff = karmaDiff + (j * factor);
    }
  }
  return karmaDiff;
}