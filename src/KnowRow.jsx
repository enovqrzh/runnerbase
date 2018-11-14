import React from 'react';
import {
  NumericInput,
  Button,
  Tag,
  Colors,
  HTMLSelect
} from '@blueprintjs/core';
import Transition from 'react-transition-group/Transition';
import update from 'immutability-helper';

class KnowRow extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      mounted: false,
      catOpts: {
        Academic: {
          label: 'Academic',
          value: 'Academic',
          attribute: 'log',
          attrName: 'Logic'
        },
        Interests: {
          label: 'Interests',
          value: 'Interests',
          attribute: 'int',
          attrName: 'Intuition'
        },
        Language: {
          label: 'Language',
          value: 'Language',
          attribute: 'int',
          attrName: 'Intuition'
        },
        Professional: {
          label: 'Professional',
          value: 'Professional',
          attribute: 'log',
          attrName: 'Logic'
        },
        Street: {
          label: 'Street',
          value: 'Street',
          attribute: 'int',
          attrName: 'Intuition'
        }
      }
    };

    this.updateSkillBase = this.updateSkillBase.bind(this);
    this.updateSkillKarma = this.updateSkillKarma.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.openSpecAdd = this.openSpecAdd.bind(this);
    this.removeSpec = this.removeSpec.bind(this);
    this.removeSkill = this.removeSkill.bind(this);
  }

  componentDidMount() {
    this.setState({ mounted: true });
  }

  updateSkillProps = {
    id: 'guid',
    elements: 'knowledgeSkills',
    pts: 'skillPtsRemaining',
    factor: 1,
    startingProp: null
  };

  updateSkillBase(value) {
    this.props.updateSkill(
      this.props.skill.guid,
      value,
      'base',
      this.updateSkillProps
    );
  }

  updateSkillKarma(value) {
    this.props.updateSkill(
      this.props.skill.guid,
      value,
      'karma',
      this.updateSkillProps
    );
  }

  updateCategory(event) {
    const cat = this.state.catOpts[event.currentTarget.value];
    this.props.updateSkillProperties(
      update(this.props.skill, {
        category: { $set: cat.value },
        attribute: { $set: cat.attribute },
        attrName: { $set: cat.attrName }
      })
    );
  }

  openSpecAdd() {
    this.props.openSpecAdd(this.props.skill);
  }

  removeSpec(event, item) {
    const specName = item.children;
    const spec = this.props.skill.specs.find(
      item => item !== null && item.name === specName
    );
    this.props.removeSpec(this.props.skill, spec, 'knowledgeSkills');
  }

  removeSkill() {
    this.props.removeSkill(this.props.skill);
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

    const natCols = this.props.skill.nativeLanguage ? (
      <React.Fragment>
        <td colSpan="4" className="rb-know-skill-table-native-language">
          Native Language
        </td>
      </React.Fragment>
    ) : (
      <React.Fragment>
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
        <td className="rb-table-tag">
          {this.props.skill.specs.map(spec => (
            <Tag minimal={true} key={spec.id} onRemove={this.removeSpec}>
              {spec.name}
            </Tag>
          ))}
          <Button
            minimal={true}
            onClick={this.openSpecAdd}
            icon="add"
            intent="success"
          />
        </td>
      </React.Fragment>
    );

    let row = (
      <React.Fragment>
        <td>{this.props.skill.name}</td>
        <td>
          <HTMLSelect
            options={Object.values(this.state.catOpts)}
            value={this.props.skill.category}
            onChange={this.updateCategory}
          />
        </td>
        {natCols}
        <td>
          <Button
            icon="trash"
            minimal={true}
            intent="danger"
            onClick={this.removeSkill}
          />
        </td>
      </React.Fragment>
    );

    if (this.props.justAdded === true) {
      const duration = 1200;

      const defaultStyle = {
        transitionProperty: 'opacity, background-color',
        transitionDuration: `${duration / 4}ms, ${duration}ms`,
        transitionTimingFunction: 'ease-in-out, ease-in-out',
        opacity: 0,
        backgroundColor: 'transparent'
      };

      const transitionStyles = {
        entering: { opacity: 1, backgroundColor: Colors.GREEN1 },
        entered: { opacity: 1, backgroundColor: 'transparent' }
      };

      return (
        <Transition in={this.state.mounted} timeout={duration}>
          {state => (
            <tr
              style={{
                ...defaultStyle,
                ...transitionStyles[state]
              }}
            >
              {row}
            </tr>
          )}
        </Transition>
      );
    }

    return <tr>{row}</tr>;
  }
}

export default KnowRow;
