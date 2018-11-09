import React from 'react';
import { NumericInput } from "@blueprintjs/core";

class SkillGroupRow extends React.PureComponent {
  constructor(props) {
    super(props);
    this.updateSkillGroupBase = this.updateSkillGroupBase.bind(this);
    this.updateSkillGroupKarma = this.updateSkillGroupKarma.bind(this);
  }

  updateSkillProps = { id: 'id', elements: 'skillGroups', pts: 'skillGrpPtsRemaining', factor: 5, startingProp: null };

  updateSkillGroupBase(value) {
    this.props.updateElement(this.props.group.id, value, 'base', this.updateSkillProps);
  }

  updateSkillGroupKarma(value) {
    this.props.updateElement(this.props.group.id, value, 'karma', this.updateSkillProps);
  }

  render() {
    let baseIntent = null;
    let baseMax = (this.props.skillGrpPtsRemaining < (6 - this.props.group.base)) ? this.props.group.base + this.props.skillGrpPtsRemaining : 6;
    if (this.props.skillGrpPtsRemaining < 0) {
      baseMax = this.props.group.base;
      baseIntent = this.props.group.base > 0 ? 'warning' : null;
    }

    return (
      <tr>
        <td>{this.props.group.name}</td>
        <td className="rb-table-numeric">
          <NumericInput
            min="0"
            value={this.props.group.base}
            onValueChange={this.updateSkillGroupBase}
            disabled={this.props.disabledBase || baseMax <= 0}
            max={baseMax <= 0 ? null : baseMax}
            intent={baseIntent}
          />
        </td>
        <td className="rb-table-numeric">
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
