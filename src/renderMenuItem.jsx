import React from 'react';
import { MenuItem } from "@blueprintjs/core";
import { ItemRenderer } from "@blueprintjs/select";
import SourceLink from './SourceLink';

const renderMenuItem: ItemRenderer = (item, { handleClick, modifiers, query }) => {
  if (! modifiers.matchesPredicate) {
    return null;
  }

  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={item.id}
      onClick={handleClick}
      text={item.name}
      intent={item.hasOwnProperty('intent') ? item.intent : null}
      icon={item.hasOwnProperty('icon') ? item.icon : null}
      labelElement={(item.hasOwnProperty('source') ? <SourceLink source={item.source} page={item.page} /> : null)}
    />
  );
};

export default renderMenuItem;
