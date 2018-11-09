import React from 'react';
import { NumericInput, Button, Tag, Colors } from "@blueprintjs/core";
import Transition from 'react-transition-group/Transition'

class KnowRow extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = { mounted: false };

    this.updateSkillBase = this.updateSkillBase.bind(this);
    this.updateSkillKarma = this.updateSkillKarma.bind(this);
    this.openSpecAdd = this.openSpecAdd.bind(this);
    this.removeSpec = this.removeSpec.bind(this);
  }

  componentDidMount() {
    this.setState({ mounted: true });
  }

  updateSkillProps = { id: 'guid', elements: 'knowledgeSkills', pts: 'skillPtsRemaining', factor: 1, startingProp: null };

  updateSkillBase(value) {
    this.props.updateSkill(this.props.skill.guid, value, 'base', this.updateSkillProps);
  }

  updateSkillKarma(value) {
    this.props.updateSkill(this.props.skill.guid, value, 'karma', this.updateSkillProps);
  }

  openSpecAdd() {
    this.props.openSpecAdd(this.props.skill);
  }

  removeSpec(event, item) {
    const specName = item.children;
    const spec = this.props.skill.specs.find(item => (item !== null && item.name === specName));
    this.props.removeSpec(this.props.skill, spec, "knowledgeSkills");
  }

  render() {
    const rating = this.props.skill.base + this.props.skill.karma;
    const dice = rating + this.props.attrValue;
    const diceRating = rating === 0 ? ' - ' : dice + ' (' + rating + ')';

    let baseIntent = null;
    let baseMax = this.props.skill.base + this.props.skillPtsRemaining;
    if (this.props.skillPtsRemaining < 0) {
      baseMax = this.props.skill.base;
      baseIntent = this.props.skill.base > 0 ? 'warning' : null;
    } 
    
    let row = (
      <React.Fragment>
        <td>{this.props.skill.name}</td>
        <td>{this.props.skill.category}</td>
        <td className="rb-table-numeric">
          <NumericInput
            min="0"
            value={this.props.skill.base}
            onValueChange={this.updateSkillBase}
            disabled={baseMax <= 0}
            max={baseMax <= 0 ? null : baseMax}
            intent={baseIntent}
          />
        </td>
        <td className="rb-table-numeric">
          <NumericInput
            min="0"
            value={this.props.skill.karma}
            onValueChange={this.updateSkillKarma}
          />
        </td>
        <td className="rb-table-numeric">{diceRating}</td>
        <td>
          {this.props.skill.specs.map(spec => (
            <Tag minimal={true} key={spec.id} onRemove={this.removeSpec}>{spec.name}</Tag>
          ))}
          <Button minimal={true} onClick={this.openSpecAdd} icon="add" intent="success" />
        </td>
        <td>
          <Button icon='trash' minimal={true} intent="danger" />
        </td>
      </React.Fragment>
    );

    if (this.props.justAdded === true) {
      const duration = 1200;

      const defaultStyle = {
        'transition-property': 'opacity, background-color',
        'transition-duration': `${duration/4}ms, ${duration}ms`,
        'transition-timing-function': 'ease-in-out, ease-in-out',
        opacity: 0,
        'background-color': 'transparent'
      };

      const transitionStyles = {
        entering: { opacity: 1, 'background-color': Colors.GREEN1 },
        entered: { opacity: 1, 'background-color': 'transparent' }
      };

      return (
        <Transition in={this.state.mounted} timeout={duration}>
          {(state) => (
            <tr style={{
              ...defaultStyle,
              ...transitionStyles[state]
            }}>
              {row}
            </tr>
          )}
        </Transition>
      );
    }

    return (<tr>{row}</tr>);
  }
}

export default KnowRow;