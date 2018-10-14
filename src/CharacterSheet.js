import React from 'react';
import './CharacterSheet.css';

import { Button, Callout, Classes, Dialog, EditableText, FormGroup, H1, H2, HTMLSelect, HTMLTable, Icon, InputGroup, Tab, Tabs } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";

import update from 'immutability-helper';
import { v4 as uuid } from 'uuid';

import renderMenuItem from './renderMenuItem';
import PrioritySelector from './PrioritySelector';
import priorities from './priorities';
import SourceLink from './SourceLink';

import Metatype from './Metatype'
import getMetatypes from './getMetatypes';

import AttributeRow from './AttributeRow'

import gameOptions from './data/gameplayoptions'

import skills from './skills'
import SkillRow from './SkillRow'
import SkillGroupRow from './SkillGroupRow'

var character = {
  demands: {
    getDemandValues: (type, target) => {
      let values = [];
      character.demands[type].forEach(demand => {
        if (demand.target === target)
          values.push(demand.item);
      });

      return values;
    },
    excludes: [],
    requires: []
  }
};

function updateCharacter(elements) {
  character = Object.assign(character, elements);

  if (character.hasOwnProperty('updateRemaining') && elements.hasOwnProperty('karmaRemaining')) {
    character.updateRemaining();
  }
  console.log(character);
}

function updateDemands(source, excludes = null, requires = null) {
  character.demands.excludes = character.demands.excludes.filter(demand => demand.source !== source).concat(generateDemands(source, excludes));
  character.demands.requires = character.demands.requires.filter(demand => demand.source !== source).concat(generateDemands(source, requires));
}

function generateDemands(source, items = null) {
  let demands = [];

  if (items) {
    if (items.hasOwnProperty('oneof')) {
      Object.entries(items.oneof).forEach(pair => {
        if (Array.isArray(pair[1])) {
          demands.concat(pair[1].map(item => {
            return new rbDemand(source, pair[0], item);
          }));
        } else {
          demands.push(new rbDemand(source, pair[0], pair[1]));
        }
      });
    }
  }
  return demands;
}

class rbDemand {
  constructor(source, target, item) {
    this.source = source;
    this.target = target;
    this.item = item;
  }
}

class CharacterSheet extends React.PureComponent {
  render() {
    return (
      <div id="rb-character-sheet" className={Classes.DARK}>
        <H1>Character Sheet!:</H1>
        <CharacterTabs>
          <Tab id="biotab" title="Bio" panel={<BioPanel />} />
          <Tab id="gameoptsel" title="Gameplay Options" panel={<GameOptionsPanel />} />
          <Tab id="priosel" title="Priority Selection" panel={<PrioSelPanel />} />
          <Tab id="talentsel" title="Talent" panel={<TalentSelPanel />} />
          <Tab id="metatypesel" title="Metatype" panel={<MetatypePanel />} />
          <Tab id="attr" title="Attributes" panel={<AttrPanel />} />
          <Tab id="skills" title="Skills" panel={<SkillPanel />} />
        </CharacterTabs>
      </div>
    );
  }
}

const RemainingContext = React.createContext({
  karmaRemaining: null
});

class CharacterTabs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      characterInitialized: false,
      remaining: {
        karmaRemaining: null
      }
    };
    this.initCharacter = this.initCharacter.bind(this);
    this.updateRemaining = this.updateRemaining.bind(this);
  }

  initCharacter() {
    this.props.children.forEach(child => {
      if (child.props.panel.type.prototype.hasOwnProperty('initPanel')) {
        child.props.panel.type.prototype.initPanel();
      }
    });

    this.setState({
      characterInitialized: true,
    });

    this.updateRemaining();
    updateCharacter({ updateRemaining: this.updateRemaining });
  }

  updateRemaining() {
    this.setState({
      remaining: {
        karmaRemaining: character.karmaRemaining
      }
    });
  }

  render() {
    return (
      <div className="rb-character">
        <Dialog
          title="Import or Create?"
          icon="new-person"
          isOpen={(! this.state.characterInitialized)}
          onClose={this.initCharacter}
          isCloseButtonShown={false}
          className={Classes.DARK}
        >
          <Button icon="new-person" onClick={this.initCharacter}>Create a new character</Button>
        </Dialog>
        <RemainingContext.Provider value={this.state.remaining}>
          <div className="rb-top-box">
            <CharacterName />
            <RemainingCard />
          </div>
          <Tabs renderActiveTabPanelOnly={true} vertical={true}>
            {this.props.children.map(child => { return child; })}
          </Tabs>
        </RemainingContext.Provider>
      </div>
    );
  }
}

class CharacterName extends React.PureComponent {
  render() {
    return (
      <H2>
        <EditableText placeholder="Character Name" />&nbsp;
        <Icon icon="edit" color="#5C7080" />
      </H2>
    );
  }
}

class PlayerName extends React.PureComponent {
  render() {
    return (
      <FormGroup
        label="Player Name"
        labelFor="playername"
      >
        <InputGroup id="playername" />
      </FormGroup>
    );
  }
}

class RemainingCard extends React.Component {
  render() {
    return (
      <RemainingContext.Consumer>
        {({karmaRemaining}) => (
          <Callout className="rb-remaining-box" intent={(karmaRemaining >= 0) ? null : "warning"}>
            <span><span>Karma Remaining:</span> {karmaRemaining}</span>
          </Callout>
        )}
      </RemainingContext.Consumer>
    );
  }
}

class BioPanel extends React.PureComponent {
  render() {
    return (
      <PlayerName />
    );
  }
}

class GameOptionsPanel extends React.Component {
  constructor(props) {
    super(props);

    // Collect the game play option object back from the character object because Chummer breaks out all the values
    this.state = {
      gameOption: {
        id: character.gameplayoptionid,
        name: character.gameplayoption,
        karma: character.buildkarma,
        maxavailability: character.maxavail,
        maxnuyen: character.maxnuyen,
        contactmultiplier: character.contactmultiplier,
        bannedwaregrades: character.bannedwaregrades
      }
    };

    this.handleGameOptionValueChange = this.handleGameOptionValueChange.bind(this);
  }

  initPanel() {
    this.updateCharacterGameOptions(gameOptions.chummer.gameplayoptions.gameplayoption[0]);
  }

  updateCharacterGameOptions(item) {
    let gameOpts = {
      gameplayoptionid: item.id,
      gameplayoption: item.name,
      buildkarma: item.karma,
      maxavail: item.maxavailability,
      maxnuyen: item.maxnuyen,
      contactmultiplier: item.contactmultiplier,
      bannedwaregrades: item.bannedwaregrades,
      karmaRemaining: character.hasOwnProperty('buildKarma') ? item.karma - (character.buildKarma - character.karmaRemaining) : item.karma,
    };

    updateCharacter(gameOpts);
  }

  handleGameOptionValueChange(item) {
    this.setState({gameOption: item});
    this.updateCharacterGameOptions(item);
  }

  render() {
    let buttonVal = this.state.gameOption.name ? this.state.gameOption.name : gameOptions.chummer.gameplayoptions.gameplayoption[0].name;

    return (
      <FormGroup
        label="Runner Level"
        labelFor="RunnerLevel"
        helperText={<span>Reference: <SourceLink source="SR5" page="64" /></span>}
      >
        <Select
          id="RunnerLevel"
          items={gameOptions.chummer.gameplayoptions.gameplayoption}
          itemRenderer={renderMenuItem}
          filterable={false}
          onItemSelect={this.handleGameOptionValueChange}
        >
          <Button text={buttonVal} rightIcon="double-caret-vertical" />
        </Select>
      </FormGroup>
    );
  }
}

class PrioSelPanel extends React.Component {
  constructor(props) {
    super(props);
    this.updatePriorityDescriptions = this.updatePriorityDescriptions.bind(this);
    this.state = { items: character.priorities };
  }

  initPanel() {
    // A metatype is needed to get the correct attribute priority information, but it cannot be initialized yet, so we fudge it
    updateCharacter({ metatype: { name: "Human" } });
    this.updateCharacterPriority(priorities);
  }

  updateCharacterPriority(items) {
    let prioData = [];
    items.forEach((prio, i) => {
      prioData.push(prio.getData(i, character));
    });
    updateCharacter({priorities: items, prioritiesData: prioData});
  }

  updatePriorityDescriptions(items) {
    this.setState({ items: items });
    this.updateCharacterPriority(items);
  }

  render() {
    return (
      <FormGroup
        helperText={<span>Reference: <SourceLink source="SR5" page="65" /></span>}
      >
        <PrioritySelector updatePriorityDescriptions={this.updatePriorityDescriptions} origPriorities={this.state.items}/>
        <div className="rb-priority-description-container">
          {this.state.items.map((prio, i) => (
            <div className={Classes.BUTTON} key={prio.key}>{prio.getDescription(i, character)}</div>
          ))}
        </div>
      </FormGroup>
    );
  }
}

class TalentSelPanel extends React.Component {
  constructor(props) {
    super(props);

    const talentPrio = this.getTalentPrio();
    const talentOptions = talentPrio.talents.talent.map((talent) => {
      return Object.assign(talent, { id: talent.name });
    });

    this.state = {
      talentPrio: talentPrio,
      talentOptions: talentOptions,
      talent: character.talent
    };

    this.updateTalent = this.updateTalent.bind(this);
  }

  initPanel() {
    const talentPrio = this.getTalentPrio();
    this.updateCharacterTalent(talentPrio.talents.talent[0]);
  }

  getTalentPrio() {
    return character.prioritiesData.find((element) => {
      return (element.key === "talent");
    });
  }

  updateTalent(talent) {
    // TODO: Skill selection
    if (talent !== this.state.talent) {
      this.setState({
        talent: talent
      });

      this.updateCharacterTalent(talent);
    }
  }

  updateCharacterTalent(talent) {
    // TODO: Qualities, skill selection, spells/complexforms
    let updateObj = {
      talent: talent,
      prioritytalent: talent.value
    };

    updateCharacter(updateObj);
    updateDemands(
      'talent',
      talent.hasOwnProperty('forbidden') ? talent.forbidden : null,
      talent.hasOwnProperty('required') ? talent.required : null
    );
  }

  render() {
    let talentIntent = null;
    if (! this.state.talentOptions.includes(this.state.talent)) {
      talentIntent = 'warning';
    }

    // TODO: Skill select based on talent
    return (
      <FormGroup
        helperText={<span>Reference: <SourceLink source="SR5" page="68" /></span>}
      >
        <Select
          id="Talent"
          items={this.state.talentOptions}
          itemRenderer={renderMenuItem}
          filterable={false}
          onItemSelect={this.updateTalent}
        >
          <Button intent={talentIntent} text={this.state.talent.name} rightIcon="double-caret-vertical" />
        </Select>
      </FormGroup>
    );
  }
}

class MetatypePanel extends React.PureComponent {
  initPanel() {
    let metaPrio = character.prioritiesData.find((element) => {
      return (element.key === "meta");
    });
    let metatypes = getMetatypes({id: 0, name: "Metahuman"}, metaPrio, character.demands);

    updateCharacter({
      metatypecategory: {id: 0, name: "Metahuman"},
      metatype: metatypes[0],
      metavariant: null
    });
  }

  render() {
    return (
      <Metatype characterUpdate={updateCharacter} origCharacter={character} />
    );
  }
}

/**
 * Recalculate the karma cost for points for a given attribute or skill
 *
 * @param  {Object} oldItem  The previous state of the item
 * @param  {Object} newItem  The new state of the item
 * @param  {number} factor  The factor by which point totals are multiplied to get karma cost
 * @return {number}         The karma remaining
 */
function karmaCostRecalc(oldItem, newItem, factor) {
  let karmaRemaining = character.karmaRemaining;

  if (oldItem.karma > 0) {
    const base = oldItem.base + (oldItem.hasOwnProperty('metatypemin') ? oldItem.metatypemin : null);
    for (let j = base + 1; j <= (base + oldItem.karma); j++) {
      karmaRemaining = karmaRemaining + (j * factor);
    }
  }

  if (newItem.karma > 0) {
    const base = newItem.base + (newItem.hasOwnProperty('metatypemin') ? newItem.metatypemin : null);
    for (let j = base + 1; j <= (base + newItem.karma); j++) {
      karmaRemaining = karmaRemaining - (j * factor);
    }
  }

  return karmaRemaining;
}

class AttrPanel extends React.Component {
  constructor(props) {
    super(props);

    // Reset the max, min, and total for attributes in case metatype changed
    const updateObj = this.setAttrsMMT(character.attributes);
    updateCharacter({ attributes: updateObj.attributes, karmaRemaining: updateObj.karmaRemaining });

    this.state = update(updateObj, { $unset: ['karmaRemaining'] })

    this.updateAttr = this.updateAttr.bind(this);
  }

  initPanel() {
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

    const updateObj = this.setAttrsMMT(attrs);
    updateCharacter({ attributes: updateObj.attributes });
  }

  /**
   * Set minimums, maximums and totals for attributes, and add special attributes from talent
   * @param {Array} oldAttrs  The starting array of character attributes
   * @return {Object}         An object with state / character properties to update
   */
  setAttrsMMT(oldAttrs) {
    let newAttrs = Object.assign(oldAttrs, {});

    function addSpecialAttr(key, attrs) {
      const specAttrs = {
        'mag': { name: 'Magic', type: 'magic' },
        'res': { name: 'Resonance', type: 'resonance' },
        'dep': { name: 'Depth', type: 'depth' }
      };
      const otherAttrs = Object.getOwnPropertyNames(update(specAttrs, {$unset: [ key ]}));

      let updateAttrs = {};

      const i = attrs.findIndex(attr => { return attr.key === key; });
      if ( i === -1 ) {
        const oldSpec = attrs.find(attr => { return otherAttrs.includes(attr.key); });
        if (oldSpec) {
          updateCharacter({ karmaRemaining: karmaCostRecalc(oldSpec, { karma: 0 }, 5) });
        }
        updateAttrs = update(attrs, {$push: [{ name: specAttrs[key].name, key: key, base: 0, karma: 0, augmodifier: 0, special: true, talentMin: character.talent[specAttrs[key].type] }]});
      } else {
        updateAttrs = update(attrs, {[i]: {talentMin: {$set: character.talent[specAttrs[key].type]}}});
      }
      updateAttrs = updateAttrs.filter(attr => { return (! otherAttrs.includes(attr.key)); });

      return updateAttrs;
    }

    if (character.talent.hasOwnProperty('magic')) {
      newAttrs = addSpecialAttr('mag', newAttrs);
    } else if (character.talent.hasOwnProperty('resonance')) {
      newAttrs = addSpecialAttr('res', newAttrs);
    } else if (character.talent.hasOwnProperty('depth')) {
      newAttrs = addSpecialAttr('dep', newAttrs);
    } else {
      // Mundane, refund any karma previously spent on a special attr
      const oldSpec = oldAttrs.find(attr => { return ['mag', 'res', 'dep'].includes(attr.key); });
      if (oldSpec) {
        updateCharacter({ karmaRemaining: karmaCostRecalc(oldSpec, { karma: 0 }, 5) });
        newAttrs = newAttrs.filter(attr => { return (! ['mag', 'res', 'dep'].includes(attr.key)); });
      }
    }
    // TODO: Refund karma if old attribute object has a special attribute that is no longer present

    // TODO: Someday, we'll also need to add any augs and powers to totalValue
    const meta = character.metavariant ? character.metavariant : character.metatype;
    const attrPrio = character.prioritiesData.find((element) => { return (element.key === "attr"); });
    const metaPrio = character.prioritiesData.find((element) => { return (element.key === "meta"); });

    const metatypePrioItem = metaPrio.metatypes.metatype.find((element) => {
      return (element.name === character.metatype.name);
    });

    let specialPts = 0;

    if (metatypePrioItem) {
      const metavariantPrioItem = (! character.metavariant) ?
          metatypePrioItem
        :
          (! Array.isArray(metatypePrioItem.metavariants.metavariant)) ?
            metatypePrioItem.metavariants.metavariant
          :
            metatypePrioItem.metavariants.metavariant.find((element) => {
              return (element.name === character.metavariant.name);
            });

      specialPts = metavariantPrioItem.value;
    }

    let ptsRemaining = {
      attrPtsRemaining: attrPrio.attributes,
      specialPtsRemaining: specialPts
    };

    let karmaDiff = 0;

    newAttrs = newAttrs.map(attr => {
      this.subtractPts(attr.base, attr.special, ptsRemaining);

      let newAttr = update(attr, {
        metatypemin: {$set: Number(attr.hasOwnProperty('talentMin') ? attr.talentMin : meta[attr.key + "min"])},
        metatypemax: {$set: Number(meta[attr.key + "max"])},
        metatypeaugmax: {$set: Number(meta[attr.key + "aug"])}
      });
      newAttr = update(newAttr, {totalvalue: {$set: newAttr.metatypemin + newAttr.base + newAttr.karma}});

      karmaDiff = karmaDiff + (character.karmaRemaining - karmaCostRecalc(attr, newAttr, 5));

      return newAttr;
    });

    return Object.assign({ attributes: newAttrs, karmaRemaining: character.karmaRemaining - karmaDiff }, ptsRemaining);
  }

  subtractPts(diff, special, state) {
    if (special) {
      state.specialPtsRemaining = state.specialPtsRemaining - diff;
    } else {
      state.attrPtsRemaining = state.attrPtsRemaining - diff;
    }
  }

  updateAttr(key, value, type = 'base') {
    let i = this.state.attributes.findIndex(attr => attr.key === key);
    let diff = value - this.state.attributes[i][type];

    if (diff !== 0) {
      let attrsUpdate = update(this.state.attributes, {[i]: {
        [type]: {$set: value},
        totalvalue: {$apply: function(x) { return x + diff }}
      }});

      let updateObj = { attributes: attrsUpdate };

      if (type === 'base') {
        if (this.state.attributes[i].special) {
          updateObj.specialPtsRemaining = this.state.specialPtsRemaining - diff;
        } else {
          updateObj.attrPtsRemaining = this.state.attrPtsRemaining - diff;
        }
      }
      updateObj.karmaRemaining = karmaCostRecalc(this.state.attributes[i], attrsUpdate[i], 5);

      updateCharacter(updateObj);
      this.setState(update(updateObj, {$unset: ['karmaRemaining']}));
    }
  }

  render() {
    let attrAtMax = this.state.attributes.find(attr => ( (attr.metatypemin + attr.base + attr.karma) === attr.metatypemax ));

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
          {this.state.attributes.filter(attr => (! attr.special)).map(attr => (
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
          {this.state.attributes.filter(attr => attr.special).map(attr => (
            <AttributeRow
              id={attr.key}
              key={attr.key}
              attr={attr}
              attrPtsRemaining={this.state.specialPtsRemaining}
              updateAttr={this.updateAttr}
            />
          ))}
        </tbody>
      </HTMLTable>
    );
  }
}

class SkillPanel extends React.Component {
  constructor(props) {
    // TODO: Remove irrelavant skill groups based on talent
    super(props);

    let attrValues = {};
    character.attributes.forEach(attr => {
      attrValues[attr.key] = attr.totalvalue;
    });

    const skillPrio = character.prioritiesData.find(element => { return element.key === "skills"; });
    let skillPtsRemaining = skillPrio.skills;
    let skillGrpPtsRemaining = skillPrio.skillgroups;

    character.skills.forEach(skill => {
      skillPtsRemaining = skillPtsRemaining - skill.base;
    });
    character.skillGroups.forEach(group => {
      skillGrpPtsRemaining = skillGrpPtsRemaining - group.base;
    });

    this.state = {
      skills: character.skills,
      attrValues: attrValues,
      groupBy: 'skillgroup',
      groupOpts: {
        skillgroup: { groups: skills.groups.concat(['-']), label: "Skill Group", value: 'skillgroup' },
        category: { groups: skills.activeCategories, label: "Category", value: 'category' },
        attrName: { groups: character.attributes.map(attr => { return attr.name; }), label: "Attribute", value: 'attrName' }
      },
      skillPtsRemaining: skillPtsRemaining,
      doSkillGrps: Boolean(skillPrio.skillgroups),
      skillGroups: character.skillGroups,
      skillGrpPtsRemaining: skillGrpPtsRemaining
    };

    this.updateGroupBy = this.updateGroupBy.bind(this);
    this.updateSkillElement = this.updateSkillElement.bind(this);
  }

  initPanel() {
    updateCharacter({
      skills: skills.activeSkills.map(skill => {
        return Object.assign(skill, {
          suid: skill.id,
          guid: uuid(),
          karma: 0,
          base: 0
        });
      }),
      skillGroups: skills.groups.map(groupName => {
        return {
          name: groupName,
          id: uuid(),
          karma: 0,
          base: 0
        };
      })
    });
  }

  /**
   * Update a skill or skill group
   * @param  {string}  id            The element's id
   * @param  {number}  value         The new value to set
   * @param  {string}  type          Karma or base
   * @param  {boolean} [group=false] Skill group?
   */
  updateSkillElement(id, value, type, group = false) {
    const props = group ?
        { id: 'id', elements: 'skillGroups', pts: 'skillGrpPtsRemaining', factor: 5 }
      :
        { id: 'guid', elements: 'skills', pts: 'skillPtsRemaining', factor: 2 }
    ;
    const i = this.state[props.elements].findIndex(item => item[props.id] === id);
    const diff = value - this.state[props.elements][i][type];

    if (diff !== 0) {
      const updateElements = update(this.state[props.elements], {[i]: {
        [type]: {$set: value}
      }});
      let stateUpdate = {};
      stateUpdate[props.elements] = updateElements;
      let charUpdate = {};
      charUpdate[props.elements] = updateElements;

      if (type === 'base') {
        stateUpdate[props.pts] = this.state[props.pts] - diff;
      }
      charUpdate.karmaRemaining = karmaCostRecalc(this.state[props.elements][i], updateElements[i], 2);

      updateCharacter(charUpdate);
      this.setState(stateUpdate);
    }
  }

  updateGroupBy(event) {
    this.setState({ groupBy: event.currentTarget.value });
  }

  render() {
    // TODO: Filter box for skill table
    // TODO: Tooltips
    // TODO: SourceLink
    // TODO: Specializations

    const sortedSkills = this.state.groupOpts[this.state.groupBy].groups.map(group => {
      return this.state.skills.filter(skill => (
        skill[this.state.groupBy] === group &&
        this.state.attrValues.hasOwnProperty(skill.attribute) &&
        this.state.attrValues[skill.attribute] !== 0
      )).sort((a, b) => { return a.name.localeCompare(b.name); });
    }).filter(items => (items.length > 0));

    let skillGroupValues = {};
    this.state.skills.forEach(skill => {
      if (! skillGroupValues.hasOwnProperty(skill.skillgroup)) {
        skillGroupValues[skill.skillgroup] = skill.base + skill.karma;
      } else if (skillGroupValues[skill.skillgroup] !== (skill.base + skill.karma)) {
        skillGroupValues[skill.skillgroup] = -1;
      }
    });

    return (
      <React.Fragment>
        <Callout intent={(this.state.skillGrpPtsRemaining < 0) ? 'warning' : null}>Skill Group Points Remaining: {this.state.skillGrpPtsRemaining}</Callout>
        <HTMLTable id="rb-skill-group-table" className="rb-table" bordered={true}>
          <thead>
            <tr>
              <th>Group</th>
              <th>Base Points</th>
              <th>From Karma</th>
            </tr>
          </thead>
          <tbody>
            {this.state.skillGroups.map(group => {
              return (
                <SkillGroupRow
                  group={group}
                  key={group.id}
                  skillGrpPtsRemaining={this.state.skillGrpPtsRemaining}
                  disabledBase={(this.state.skills.findIndex(skill => { return (skill.base > 0 && skill.skillgroup === group.name); }) !== -1)}
                  disabledKarma={(skillGroupValues[group.name] === -1)}
                  updateElement={this.updateSkillElement}
                />
              );
            })}
          </tbody>
        </HTMLTable>
        <Callout intent={(this.state.skillPtsRemaining < 0) ? 'warning' : null}>Skill Points Remaining: {this.state.skillPtsRemaining}</Callout>
        <HTMLTable id="rb-skill-table" className="rb-table" bordered={true}>
          <thead>
            <tr>
              <th>
                <HTMLSelect
                  options={Object.values(this.state.groupOpts)}
                  value={this.state.groupBy}
                  onChange={this.updateGroupBy}
                />
              </th>
              <th>Name</th>
              {['skillgroup', 'category', 'attrName'].filter(col => (col !== this.state.groupBy)).map(col => (<th key={col}>{this.state.groupOpts[col].label}</th>))}
              <th className="rb-skill-table-numeric">Base Points</th>
              <th className="rb-skill-table-numeric">From Karma</th>
              <th className="rb-skill-table-numeric">Total Dice (Rating)</th>
            </tr>
          </thead>
          <tbody>
            {sortedSkills.map(group => {
              const totalSkills = group.length;
              return group.map((skill, index) => {
                const skillGroup = skill.skillgroup === '-' ? { base: 0, karma: 0 } : this.state.skillGroups.find(skillGroup => { return (skillGroup.name === skill.skillgroup); });
                return (
                  <SkillRow
                    skill={skill}
                    key={skill.guid}
                    attrValue={this.state.attrValues[skill.attribute]}
                    index={index}
                    skillsInCollection={totalSkills}
                    groupBy={this.state.groupBy}
                    updateSkill={this.updateSkillElement}
                    disabled={(skillGroup.base > 0)}
                    skillPtsRemaining={this.state.skillPtsRemaining}
                    skillGroupRating={skillGroup.base + skillGroup.karma}
                  />
                )
              });
            })}
          </tbody>
        </HTMLTable>
      </React.Fragment>
    );
  }
}

export default CharacterSheet;
