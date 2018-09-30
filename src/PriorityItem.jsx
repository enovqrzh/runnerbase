import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import { Classes, Icon } from "@blueprintjs/core"
import { IconNames } from "@blueprintjs/icons";

const Types = {
  ITEM: 'PriorityItem'
};

const itemSource = {
  beginDrag(props) {
    return {
      id: props.id,
      originalIndex: props.findItem(props.id).index
    };
  },
  endDrag(props, monitor) {
    const { id: droppedId, originalIndex } = monitor.getItem();
    const didDrop = monitor.didDrop();

    if (!didDrop) {
      props.moveItem(droppedId, originalIndex);
    }
    props.updatePriorities();
  }
};

const itemTarget = {
  hover(props, monitor) {
    const { id: draggedId } = monitor.getItem();
    const { id: overId } = props;

    if (draggedId !== overId) {
      const { index: overIndex } = props.findItem(overId);
      props.moveItem(draggedId, overIndex);
    }
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
}

function collect2(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
}

class PriorityItem extends Component {
  render() {
      const { text, isDragging, connectDragSource, connectDropTarget } = this.props;
      const opacity = isDragging ? 0 : 1;

      return connectDragSource(connectDropTarget(
        <div className={Classes.BUTTON} style={{...opacity }} id={this.props.id}>
          <span className="rb-dnd-button-text">{text}</span>
          <Icon icon={IconNames.DRAG_HANDLE_VERTICAL} />
        </div>
      ));
  }
}

PriorityItem.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  id: PropTypes.any.isRequired,
  text: PropTypes.string.isRequired,
  moveItem: PropTypes.func.isRequired,
  findItem: PropTypes.func.isRequired
}

const x = DropTarget(Types.ITEM, itemTarget, collect)(PriorityItem);
export default DragSource(Types.ITEM, itemSource, collect2)(x);
