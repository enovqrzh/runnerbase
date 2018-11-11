import React from 'react';
import { NumericInput, Button, Tag } from "@blueprintjs/core";
import SourceLink from './SourceLink';

class SkillRow extends React.PureComponent {
  constructor(props) {
    super(props);
    this.updateSkillBase = this.updateSkillBase.bind(this);
    this.updateSkillKarma = this.updateSkillKarma.bind(this);
    this.openSpecAdd = this.openSpecAdd.bind(this);
    this.removeSpec = this.removeSpec.bind(this);
  }

  updateSkillProps = { id: 'guid', elements: 'skills', pts: 'skillPtsRemaining', factor: 2, startingProp: 'groupRating' };

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
    this.props.removeSpec(this.props.skill, spec, "skills");
  }

  render() {
    const rating = this.props.skill.base + this.props.skill.karma + this.props.skillGroupRating;
    const dice = rating === 0 ? this.props.attrValue - 1 : rating + this.props.attrValue;

    const diceRating = ((rating === 0 && (! this.props.skill.default)) || dice === 0 )? ' - ' : dice + ' (' + rating + ')';

    let baseIntent = null;
    let baseMax = (this.props.skillPtsRemaining < (6 - this.props.skill.base)) ? this.props.skill.base + this.props.skillPtsRemaining : 6;
    if (this.props.skillPtsRemaining < 0) {
      baseMax = this.props.skill.base;
      baseIntent = this.props.skill.base > 0 ? 'warning' : null;
    }
    return (
      <tr className={this.props.index === 0 ? "rb-skill-table-section-top" : null}>
        {this.props.index === 0 ? <th className="rb-table-header2" scope="row" rowSpan={this.props.skillsInCollection}><div>{this.props.skill[this.props.groupBy]}</div></th> : null}
        <td><div className="rb-skill-name"><span>{this.props.skill.name}</span><SourceLink source={this.props.skill.source} page={this.props.skill.page}/></div></td>
        {['skillgroup', 'attrName'].filter(col => (col !== this.props.groupBy)).map(col => (<td key={col}>{this.props.skill[col]}</td>))}
        <td className="rb-table-numeric">
          <NumericInput
            min="0"
            value={this.props.skill.base}
            onValueChange={this.updateSkillBase}
            disabled={this.props.disabled || baseMax <= 0}
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
            <Tag minimal={true} key={spec.id} onRemove={this.removeSpec}>{spec.name}</Tag>
          ))}
          <Button minimal={true} onClick={this.openSpecAdd} icon="add" intent="success" />
        </td>
      </tr>
    )
  }
}

export default SkillRow;
