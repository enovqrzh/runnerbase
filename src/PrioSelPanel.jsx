import React from 'react';
import { Classes, FormGroup } from "@blueprintjs/core";
import PrioritySelector from './PrioritySelector';
import priorities from './priorities';
import SourceLink from './SourceLink';

class PrioSelPanel extends React.Component {
  constructor(props) {
    super(props);
    this.updatePriorities = this.updatePriorities.bind(this);
  }

  initPanel(character) {
    // A metatype is needed to get the correct attribute priority information, but it cannot be initialized yet, so we fudge it
    return { 
      priorities: { 
        items: priorities, 
        data: this.getPriorities(priorities, { meta: { metatype: { name: "Human" } }, gameOptions: character.gameOptions } ) 
      } 
    };
  }

  /**
   * Retrieve priority data descriptions based on order
   *
   * @param {Array} priorities    An ordered array of priority items
   * @param {Object} metaGameOpt  An object with character metatype and gameOption keys to use when getting data
   * @returns {Object}            An object containing priority data keyed by priority type
   */
  getPriorities(priorities, metaGameOpt) {
    let prioData = {};
    priorities.forEach((prio, i) => {
      prioData[prio.key] = prio.getData(i, metaGameOpt);
    });
    return prioData;
  }

  updatePriorities(items) {
    this.props.updateCharacter({ 
      priorities: {
        items: items, 
        data: this.getPriorities(items, this.props.metaGameOpt)
      }
    });

    this.setState({ items: items });
  }

  render() {
    console.log(this.props);
    // TODO: The way this is currently set up is super not accessible
    return (
      <FormGroup 
        helperText={<span>Reference: <SourceLink source="SR5" page="65" /></span>}
      >
        <PrioritySelector updatePriorities={this.updatePriorities} origPriorities={this.props.priorities.items} />
        <div className="rb-priority-description-container">
          {this.props.priorities.items.map((prio, i) => (<div className={Classes.BUTTON} key={prio.key}>{prio.getDescription(i, this.props.metaGameOpt)}</div>))}
        </div>
      </FormGroup>
    );
  }
}

export default PrioSelPanel;