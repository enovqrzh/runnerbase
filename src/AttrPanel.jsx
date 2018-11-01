import React from 'react';
import { HTMLTable } from "@blueprintjs/core";
import update from 'immutability-helper';
import AttributeRow from './AttributeRow';
import { karmaCost } from './karmaCost';

class AttrPanel extends React.Component {
  constructor(props) {
    super(props);
    // Reset the max, min, and total for attributes in case metatype changed
    const updateObj = AttrPanel.setAttrsMMT(this.props.attributes, this.props.talent, this.props.meta, this.props.metaPrio, this.props.attrPrio, this.props.karmaRemaining);
    this.state = {
      attrPtsRemaining: updateObj.attrPtsRemaining,
      specialPtsRemaining: updateObj.specialPtsRemaining
    };
    this.updateAttr = this.updateAttr.bind(this);
  }

  initPanel(character) {
    let attrs = [
      { name: "Body", key: "bod", base: 0, karma: 0, augmodifier: 0, special: false },
      { name: "Agility", key: "agi", base: 0, karma: 0, augmodifier: 0, special: false },
      { name: "Reaction", key: "rea", base: 0, karma: 0, augmodifier: 0, special: false },
      { name: "Strength", key: "str", base: 0, karma: 0, augmodifier: 0, special: false },
      { name: "Charisma", key: "cha", base: 0, karma: 0, augmodifier: 0, special: false },
      { name: "Intuition", key: "int", base: 0, karma: 0, augmodifier: 0, special: false },
      { name: "Logic", key: "log", base: 0, karma: 0, augmodifier: 0, special: false },
      { name: "Willpower", key: "wil", base: 0, karma: 0, augmodifier: 0, special: false },
      { name: "Edge", key: "edg", base: 0, karma: 0, augmodifier: 0, special: true }
    ];

    const updateObj = AttrPanel.setAttrsMMT(attrs, character.talent, character.meta, character.priorities.data.meta, character.priorities.data.attr, character.karmaRemaining);

    return { attributes: updateObj.attributes, hooks: { meta: this.hookUpdate, priorities: this.hookUpdate, talent: this.hookUpdate } };
  }

  hookUpdate(character) {
    const updateObj = AttrPanel.setAttrsMMT(character.attributes, character.talent, character.meta, character.priorities.data.meta, character.priorities.data.attr, character.karmaRemaining);
    return { attributes: updateObj.attributes };
  }

  /**
   * Set minimums, maximums and totals for attributes, and add special attributes from talent
   * 
   * @param {Array}   oldAttrs        The starting array of character attributes
   * @param {Object}  talent          Character talent object
   * @param {Object}  meta            Character meta object
   * @param {Object}  metaPrio        Metatype priority object
   * @param {Object}  attrPrio        Attribute priority object
   * @param {number}  karmaRemaining  The remaining character karma
   * @return {Object} An object with state / character properties to update
   */
  static setAttrsMMT(oldAttrs, talent, meta, metaPrio, attrPrio, karmaRemaining) {
    let newAttrs = Object.assign(oldAttrs, {});
    let karmaDiff = 0;

    function addSpecialAttr(key, attrs) {
      const specAttrs = {
        'mag': { name: 'Magic', type: 'magic' },
        'res': { name: 'Resonance', type: 'resonance' },
        'dep': { name: 'Depth', type: 'depth' }
      };
      const otherAttrs = Object.getOwnPropertyNames(update(specAttrs, { $unset: [key] }));
      let updateAttrs = {};

      const i = attrs.findIndex(attr => { return attr.key === key; });
      if (i === -1) {
        const oldSpec = attrs.find(attr => { return otherAttrs.includes(attr.key); });
        if (oldSpec) {
          karmaDiff = karmaDiff + karmaCost(oldSpec, { karma: 0 }, 5, 'metatypemin');
        }
        updateAttrs = update(attrs, { $push: [{ name: specAttrs[key].name, key: key, base: 0, karma: 0, augmodifier: 0, special: true, talentMin: talent[specAttrs[key].type] }] });
      }
      else {
        updateAttrs = update(attrs, { [i]: { talentMin: { $set: talent[specAttrs[key].type] } } });
      }
      updateAttrs = updateAttrs.filter(attr => { return (! otherAttrs.includes(attr.key)); });
      return updateAttrs;
    }

    if (talent.hasOwnProperty('magic')) {
      newAttrs = addSpecialAttr('mag', newAttrs);
    }
    else if (talent.hasOwnProperty('resonance')) {
      newAttrs = addSpecialAttr('res', newAttrs);
    }
    else if (talent.hasOwnProperty('depth')) {
      newAttrs = addSpecialAttr('dep', newAttrs);
    }
    else {
      // Mundane, refund any karma previously spent on a special attr
      const oldSpec = oldAttrs.find(attr => { return ['mag', 'res', 'dep'].includes(attr.key); });
      if (oldSpec) {
        karmaDiff = karmaDiff + karmaCost(oldSpec, { karma: 0 }, 5, 'metatypemin');
        newAttrs = newAttrs.filter(attr => { return (!['mag', 'res', 'dep'].includes(attr.key)); });
      }
    }

    // TODO: Someday, we'll also need to add any augs and powers to totalValue
    const mtv = meta.metavariant ? meta.metavariant : meta.metatype;
    const metatypePrioItem = metaPrio.metatypes.metatype.find((element) => {
      return (element.name === meta.metatype.name);
    });

    let specialPts = 0;

    if (metatypePrioItem) {
      const metavariantPrioItem = (! meta.metavariant) ?
        metatypePrioItem
        :
        (! Array.isArray(metatypePrioItem.metavariants.metavariant)) ?
          metatypePrioItem.metavariants.metavariant
          :
          metatypePrioItem.metavariants.metavariant.find((element) => {
            return (element.name === meta.metavariant.name);
          });
      specialPts = metavariantPrioItem.value;
    }

    let ptsRemaining = {
      attrPtsRemaining: attrPrio.attributes,
      specialPtsRemaining: specialPts
    };

    newAttrs = newAttrs.map(attr => {
      AttrPanel.subtractPts(attr.base, attr.special, ptsRemaining);
      let newAttr = update(attr, {
        metatypemin: { $set: Number(attr.hasOwnProperty('talentMin') ? attr.talentMin : mtv[attr.key + "min"]) },
        metatypemax: { $set: Number(mtv[attr.key + "max"]) },
        metatypeaugmax: { $set: Number(mtv[attr.key + "aug"]) }
      });
      newAttr = update(newAttr, { totalvalue: { $set: newAttr.metatypemin + newAttr.base + newAttr.karma } });
      karmaDiff = karmaDiff + karmaCost(attr, newAttr, 5, 'metatypemin');
      return newAttr;
    });

    return Object.assign({ attributes: newAttrs, karmaRemaining: karmaRemaining - karmaDiff }, ptsRemaining);
  }
  
  static subtractPts(diff, special, state) {
    if (special) {
      state.specialPtsRemaining = state.specialPtsRemaining - diff;
    }
    else {
      state.attrPtsRemaining = state.attrPtsRemaining - diff;
    }
  }

  updateAttr(key, value, type = 'base') {
    let i = this.props.attributes.findIndex(attr => attr.key === key);
    let diff = value - this.props.attributes[i][type];
    if (diff !== 0) {
      let attrsUpdate = update(this.props.attributes, {
        [i]: {
          [type]: { $set: value },
          totalvalue: { $apply: function (x) { return x + diff; } }
        }
      });
      
      if (type === 'base') {
        let stateUpdate = Object.assign({}, this.state);
        AttrPanel.subtractPts(diff, this.props.attributes[i].special, stateUpdate);
        this.setState(stateUpdate);
      }

      this.props.updateCharacter({
        attributes: attrsUpdate,
        karmaRemaining: this.props.karmaRemaining - karmaCost(this.props.attributes[i], attrsUpdate[i], 5, 'metatypemin')
      });
    }
  }

  render() {
    let attrAtMax = this.props.attributes.find(attr => ((attr.metatypemin + attr.base + attr.karma) === attr.metatypemax));
    return (
    <HTMLTable id="rb-attr-table" className="rb-table" bordered={true}>
      <thead>
        <tr>
          <th>Attribute Name</th>
          <th>Min / Max</th>
          <th>Attribute Points</th>
          <th>From Karma</th>
          <th>Total (Augmented)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th className="rb-table-header2" colSpan="3">Physical and Mental Attributes</th>
          <th colSpan="2" className="rb-table-header2 rb-points-remaining"><span>Points Remaining:</span> {this.state.attrPtsRemaining}</th>
        </tr>
        {this.props.attributes.filter(attr => (! attr.special)).map(attr => (
          <AttributeRow 
            id={attr.key}
            key={attr.key} 
            attr={attr} 
            attrAtMax={attrAtMax ? attrAtMax.key : null} 
            attrPtsRemaining={this.state.attrPtsRemaining} 
            updateAttr={this.updateAttr} 
          />
        ))}
        <tr>
          <th className="rb-table-header2" colSpan="3">Special Attributes</th>
          <th colSpan="2" className="rb-table-header2 rb-points-remaining"><span>Points Remaining:</span> {this.state.specialPtsRemaining}</th>
        </tr>
        {this.props.attributes.filter(attr => attr.special).map(attr => (
          <AttributeRow 
            id={attr.key} 
            key={attr.key} 
            attr={attr} 
            attrPtsRemaining={this.state.specialPtsRemaining} 
            updateAttr={this.updateAttr} 
          />
        ))}
      </tbody>
    </HTMLTable>);
  }
}

export default AttrPanel;