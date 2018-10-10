import React from 'react';
import { NumericInput } from "@blueprintjs/core";

class SkillRow extends React.PureComponent {
  constructor(props) {
    super(props);
    this.updateSkillBase = this.updateSkillBase.bind(this);
    this.updateSkillKarma = this.updateSkillKarma.bind(this);
  }

  updateSkillBase(value) {
    this.props.updateSkill(this.props.skill.guid, value, 'base');
  }

  updateSkillKarma(value) {
    this.props.updateSkill(this.props.skill.guid, value, 'karma');
  }

  // TODO: Skill points remaining
  render() {
    const rating = this.props.skill.base + this.props.skill.karma;
    const dice = rating === 0 ? this.props.attrValue - 1 : rating + this.props.attrValue;

    return (
      <tr className={this.props.index === 0 ? "rb-skill-table-section-top" : null}>
        {this.props.index === 0 ? <th className="rb-table-header2" scope="row" rowSpan={this.props.skillsInCollection}><div>{this.props.skill[this.props.groupBy]}</div></th> : null}
        <td>{this.props.skill.name}</td>
        {['skillgroup', 'category', 'attrName'].filter(col => (col !== this.props.groupBy)).map(col => (<td key={col}>{this.props.skill[col]}</td>))}
        <td className="rb-skill-table-numeric">
          <NumericInput
            // id={this.props.skill.guid + '_Attr'}
            min="0"
            value={this.props.skill.base}
            onValueChange={this.updateSkillBase}
          />
        </td>
        <td className="rb-skill-table-numeric">
          <NumericInput
            // id={this.props.skill.guid + '_Attr'}
            min="0"
            value={this.props.skill.karma}
            onValueChange={this.updateSkillKarma}
          />
        </td>
        <td className="rb-skill-table-numeric">{dice} ({rating})</td>
      </tr>
    )
  }
}

export default SkillRow;