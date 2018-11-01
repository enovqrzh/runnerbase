import React, { Component } from 'react';
import PriorityItem from './PriorityItem';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'react-addons-update';

class PrioritySelector extends Component {
  constructor(props) {
    super(props);
    this.moveItem = this.moveItem.bind(this);
    this.findItem = this.findItem.bind(this);
    this.updatePriorities = this.updatePriorities.bind(this);

    this.state = { items: props.origPriorities };
  }

  findItem(id) {
    const { items } = this.state;
    const item = items.filter(c => c.id === id)[0];
    return {
      item,
      index: items.indexOf(item)
    };
  }

  updatePriorities() {
    const { items } = this.state;
    this.props.updatePriorities(items);
  }

  moveItem(id, atIndex, dropped) {
    const { item, index } = this.findItem(id);

    this.setState(update(this.state, {
      items: {
        $splice: [
          [index, 1],
          [atIndex, 0, item]
        ]
      }
    }));

    return this.state.items;
  }

  render() {
    const { items } = this.state;
    return (
      <div className="rb-priority-selector">
        {items.map((prio, i) => (
          <PriorityItem
            key={prio.id}
            index={i}
            id={prio.id}
            text={prio.text}
            moveItem={this.moveItem}
            findItem={this.findItem}
            updatePriorities={this.updatePriorities}
          />
        ))}
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(PrioritySelector)
