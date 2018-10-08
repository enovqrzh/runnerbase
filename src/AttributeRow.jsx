import React from 'react';
import { NumericInput } from "@blueprintjs/core";

class AttributeRow extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleAttrPtValueChange = this.handleAttrPtValueChange.bind(this);
    this.handleKarmaValueChange = this.handleKarmaValueChange.bind(this);
  }

  handleAttrPtValueChange(value) {
    this.props.updateAttr(this.props.attr.key, value, 'base');
  }

  handleKarmaValueChange(value) {
    this.props.updateAttr(this.props.attr.key, value, 'karma');
  }

  render() {
    let karmaMax = this.props.attr.metatypemax - this.props.attr.metatypemin - this.props.attr.base;
    let attrMax = this.props.attr.metatypemax - this.props.attr.metatypemin - this.props.attr.karma;

    if (this.props.attrAtMax && this.props.attrAtMax !== this.props.attr.key) {
      attrMax--;
      karmaMax--;
    }

    const unaugmentedTotal = this.props.attr.base + this.props.attr.karma + this.props.attr.metatypemin;
    if (this.props.attrPtsRemaining < (this.props.attr.metatypemin + attrMax - unaugmentedTotal)) {
      attrMax = unaugmentedTotal + this.props.attrPtsRemaining - this.props.attr.metatypemin;
    }

    // Handle a change in metatypes or priority selections wrt. to existing values of base and karma
    let karmaIntent = null;
    let attrIntent = null;
    if (unaugmentedTotal > this.props.attr.metatypemax) {
      karmaMax = this.props.attr.karma;
      attrMax = this.props.attr.base;

      karmaIntent = (this.props.attr.karma > 0) ? 'warning' : null;
      attrIntent = (this.props.attr.base > 0) ? 'warning' : null;
    }
    if (this.props.attrPtsRemaining < 0) {
      attrMax = this.props.attr.base;
      attrIntent = (this.props.attr.base > 0) ? 'warning' : null;
    }

    return (
      <tr>
        <td>{this.props.attr.name}</td>
        <td>{this.props.attr.metatypemin} / {this.props.attr.metatypemax}</td>
        <td>
          <NumericInput
            id={this.props.attr.key + 'Attr'}
            min="0"
            value={this.props.attr.base}
            max={attrMax <= 0 ? null : attrMax}
            disabled={(attrMax <= 0)}
            onValueChange={this.handleAttrPtValueChange}
            intent={attrIntent}
          />
        </td>
        <td>
          <NumericInput
            id={this.props.attr.key + 'Karma'}
            min="0"
            value={this.props.attr.karma}
            max={karmaMax <= 0 ? null : karmaMax}
            disabled={(karmaMax <= 0)}
            onValueChange={this.handleKarmaValueChange}
            intent={karmaIntent}
          />
        </td>
        <td>
          {unaugmentedTotal} ({this.props.attr.totalvalue})
        </td>
      </tr>
    )
  }
}

export default AttributeRow;
