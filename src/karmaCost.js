/**
 * Recalculate the karma cost for points for a given attribute or skill
 *
 * @param  {Object}        oldItem       The previous state of the item
 * @param  {Object}        newItem       The new state of the item
 * @param  {number}        factor        The factor by which point totals are multiplied to get karma cost
 * @param  {string|null}   startingProp  The property with minimum value of this attribute below the "base"
 * @return {number}                      The karma cost
 */
export function karmaCost(oldItem, newItem, factor, startingProp = null) {
  let karmaDiff = 0;
  if (oldItem.karma > 0) {
    const startingValue = oldItem.base + (startingProp ? oldItem.hasOwnProperty(startingProp) ? oldItem[startingProp] : null : null);
    for (let j = startingValue + 1; j <= (startingValue + oldItem.karma); j++) {
      karmaDiff = karmaDiff - (j * factor);
    }
  }
  if (newItem.karma > 0) {
    const startingValue = newItem.base + (startingProp ? newItem.hasOwnProperty(startingProp) ? newItem[startingProp] : null : null);
    for (let j = startingValue + 1; j <= (startingValue + newItem.karma); j++) {
      karmaDiff = karmaDiff + (j * factor);
    }
  }
  return karmaDiff;
}
