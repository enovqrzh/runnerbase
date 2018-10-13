import React from 'react';
import { NumericInput } from "@blueprintjs/core";

const IS_SKILL_GROUP = true;

class SkillGroupRow extends React.PureComponent {
  constructor(props) {
    super(props);
    this.updateSkillGroupBase = this.updateSkillGroupBase.bind(this);
    this.updateSkillGroupKarma = this.updateSkillGroupKarma.bind(this);
  }

  updateSkillGroupBase(value) {
    this.props.updateElement(this.props.group.id, value, 'base', IS_SKILL_GROUP);
  }

  updateSkillGroupKarma(value) {
    this.props.updateElement(this.props.group.id, value, 'karma', IS_SKILL_GROUP);
  }

  render() {
    return (
      <tr>
        <td>{this.props.group.name}</td>
        <td className="rb-skill-table-numeric">
          <NumericInput
            min="0"
            value={this.props.group.base}
            onValueChange={this.updateSkillGroupBase}
            disabled={this.props.disabledBase}
          />
        </td>
        <td className="rb-skill-table-numeric">
          <NumericInput
            min="0"
            value={this.props.group.karma}
            onValueChange={this.updateSkillGroupKarma}
            disabled={this.props.disabledKarma}
          />
        </td>
      </tr>
    )
  }
}

export default SkillGroupRow;
