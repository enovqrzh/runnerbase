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

  render() {
    const rating = this.props.skill.base + this.props.skill.karma + this.props.skillGroupRating;
    const dice = rating === 0 ? this.props.attrValue - 1 : rating + this.props.attrValue;

    const diceRating = ((rating === 0 && (! this.props.skill.default)) || dice === 0 )? ' - ' : dice + ' (' + rating + ')';

    return (
      <tr className={this.props.index === 0 ? "rb-skill-table-section-top" : null}>
        {this.props.index === 0 ? <th className="rb-table-header2" scope="row" rowSpan={this.props.skillsInCollection}><div>{this.props.skill[this.props.groupBy]}</div></th> : null}
        <td>{this.props.skill.name}</td>
        {['skillgroup', 'category', 'attrName'].filter(col => (col !== this.props.groupBy)).map(col => (<td key={col}>{this.props.skill[col]}</td>))}
        <td className="rb-skill-table-numeric">
          <NumericInput
            min="0"
            value={this.props.skill.base}
            onValueChange={this.updateSkillBase}
            disabled={this.props.disabled}
          />
        </td>
        <td className="rb-skill-table-numeric">
          <NumericInput
            min="0"
            value={this.props.skill.karma}
            onValueChange={this.updateSkillKarma}
          />
        </td>
        <td className="rb-skill-table-numeric">{diceRating}</td>
      </tr>
    )
  }
}

export default SkillRow;
