import React from 'react';
import { MenuItem } from "@blueprintjs/core";
import { ItemRenderer } from "@blueprintjs/select";

const renderMenuItem: ItemRenderer = (item, { handleClick, modifiers, query }) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={item.id}
      onClick={handleClick}
      text={item.name}
    />
  );
};

export default renderMenuItem;
