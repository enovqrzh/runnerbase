import React from 'react';
import './CharacterSheet.css';

import { Button, Callout, Classes, Dialog, EditableText, FormGroup, H1, H2, HTMLTable, Icon, InputGroup, Tab, Tabs } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";

import update from 'immutability-helper';

import renderMenuItem from './renderMenuItem';
import PrioritySelector from './PrioritySelector';
import priorities from './priorities';
import SourceLink from './SourceLink';

import Metatype from './Metatype'
import getMetatypes from './getMetatypes';

import AttributeRow from './AttributeRow'

import gameOptions from './data/gameplayoptions'

var character = { excludes: [], requires: [] };

function updateCharacter(elements) {
  character = Object.assign(character, elements);

  if (character.hasOwnProperty('updateRemaining') && elements.hasOwnProperty('karmaRemaining')) {
    character.updateRemaining();
  }
  console.log(character);
}

// TODO: Apply demands
function updateDemands(source, excludes = null, requires = null) {
  character.excludes = character.excludes.filter(demand => demand.source !== source).concat(generateDemands(source, excludes));
  character.requires = character.requires.filter(demand => demand.source !== source).concat(generateDemands(source, requires));
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
      <div id="characterSheet" className={Classes.DARK}>
        <H1>Character Sheet!:</H1>
        <CharacterTabs>
          <Tab id="biotab" title="Bio" panel={<BioPanel />} />
          <Tab id="gameoptsel" title="Gameplay Options" panel={<GameOptionsPanel />} />
          <Tab id="priosel" title="Priority Selection" panel={<PrioSelPanel />} />
          <Tab id="talentsel" title="Talent" panel={<TalentSelPanel />} />
          <Tab id="metatypesel" title="Metatype" panel={<MetatypePanel />} />
          <Tab id="attr" title="Attributes" panel={<AttrPanel />} />
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
    this.setState({
      talent: talent
    });

    this.updateCharacterTalent(talent);
  }

  updateCharacterTalent(talent) {
    // TODO: Qualities, skill selection, spells/complexforms
    // TODO: Refund the special attribute points if Mundane / a different talent is selected
    let updateObj = {
      talent: talent,
      prioritytalent: talent.value,
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
          intent={talentIntent}
          onItemSelect={this.updateTalent}
        >
          <Button text={this.state.talent.name} rightIcon="double-caret-vertical" />
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
    let metatypes = getMetatypes({id: 0, name: "Metahuman"}, metaPrio);

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

class AttrPanel extends React.Component {
  constructor(props) {
    super(props);

    // Reset the max, min, and total for attributes in case metatype changed
    this.setAttrsMMT(character.attributes);
    this.state = {
      attributes: character.attributes,
      attrPtsRemaining: character.attrPtsRemaining,
      specialPtsRemaining: character.specialPtsRemaining,
      karmaRemaining: character.karmaRemaining
    };

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
      { name: "Edge", key: "edg", base: 0, karma: 0, augmodifier: 0, special: true}
    ];

    this.setAttrsMMT(attrs);
  }

  setAttrsMMT(attrs) {
    let meta = character.metavariant ? character.metavariant : character.metatype;

    if (character.talent.hasOwnProperty('magic')) {
      attrs = attrs.filter(attr => {return ((attr.key !== 'res') && (attr.key !== 'dep'))});
      const i = attrs.findIndex(attr => {return attr.key === 'mag';});
      if ( i === -1 ) {
        attrs.push({ name: "Magic", key: "mag", base: 0, karma: 0, augmodifier: 0, special: true, talentMin: character.talent.magic });
      } else {
        attrs[i].talentMin = character.talent.magic;
      }
    } else if (character.talent.hasOwnProperty('resonance')) {
      attrs = attrs.filter(attr => {return ((attr.key !== 'mag') && (attr.key !== 'dep'))});
      const i = attrs.findIndex(attr => {return attr.key === 'res';});
      if ( i === -1 ) {
        attrs.push({ name: "Resonance", key: "res", base: 0, karma: 0, augmodifier: 0, special: true, talentMin: character.talent.resonance });
      } else {
        attrs[i].talentMin = character.talent.resonance;
      }
    } else if (character.talent.hasOwnProperty('depth')) {
      attrs = attrs.filter(attr => {return ((attr.key !== 'res') && (attr.key !== 'mag'))});
      const i = attrs.findIndex(attr => {return attr.key === 'dep';});
      if ( i === -1 ) {
        attrs.push({ name: "Depth", key: "dep", base: 0, karma: 0, augmodifier: 0, special: true, talentMin: character.talent.depth });
      } else {
        attrs[i].talentMin = character.talent.depth;
      }
    }

    // TODO: Someday, we'll also need to add any augs and powers to totalValue
    const attrPrio = character.prioritiesData.find((element) => {
      return (element.key === "attr");
    });

    const metaPrio = character.prioritiesData.find((element) => {
      return (element.key === "meta");
    });

    const metatypePrioItem = metaPrio.metatypes.metatype.find((element) => {
      return (element.name === character.metatype.name);
    });

    const metavariantPrioItem = (! character.metavariant) ?
        metatypePrioItem
      :
        (! Array.isArray(metatypePrioItem.metavariants.metavariant)) ?
          metatypePrioItem.metavariants.metavariant
        :
          metatypePrioItem.metavariants.metavariant.find((element) => {
            return (element.name === character.metavariant.name);
          });

    let state = {
      attrPtsRemaining: attrPrio.attributes,
      specialPtsRemaining: metavariantPrioItem.value
    };

    attrs = attrs.map(attr => {
      this.subtractPts(attr.base, attr.special, state);

      attr.metatypemin = Number(attr.hasOwnProperty('talentMin') ? attr.talentMin : meta[attr.key + "min"]);
      attr.metatypemax = Number(meta[attr.key + "max"]);
      attr.metatypeaugmax = Number(meta[attr.key + "aug"]);
      attr.totalvalue = attr.metatypemin + attr.base + attr.karma;
      return attr;
    });

    updateCharacter(Object.assign({ attributes: attrs }, state));
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
      let attrs = update(this.state.attributes, {[i]: {
        [type]: {$set: value},
        totalvalue: {$apply: function(x) { return x + diff }}
      }});

      let updateObj = { attributes: attrs };

      if (type === 'base') {
        if (this.state.attributes[i].special) {
          updateObj.specialPtsRemaining = this.state.specialPtsRemaining - diff;
        } else {
          updateObj.attrPtsRemaining = this.state.attrPtsRemaining - diff;
        }
      } else {
        updateObj.karmaRemaining = this.state.karmaRemaining;
        if (diff > 0) {
          for (let j = 1; j <= diff; j++) {
            updateObj.karmaRemaining = updateObj.karmaRemaining - ((this.state.attributes[i].totalvalue + j) * 5);
          }
        } else {
          for (let j = 1; j <= (diff * -1); j++) {
            updateObj.karmaRemaining = updateObj.karmaRemaining + ((attrs[i].totalvalue + j) * 5);
          }
        }
      }

      updateCharacter(updateObj);
      this.setState(updateObj);
    }
  }

  render() {
    let attrAtMax = this.state.attributes.find(attr => ( (attr.metatypemin + attr.base + attr.karma) === attr.metatypemax ));

    return (
      <HTMLTable id="rb-attr-table" bordered={true}>
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
          <tr className="rb-table-header2">
            <th colSpan="3">Physical and Mental Attributes</th>
            <th colSpan="2" className="rb-points-remaining"><span>Points Remaining:</span> {this.state.attrPtsRemaining}</th>
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
          <tr className="rb-table-header2">
            <th colSpan="3">Special Attributes</th>
            <th colSpan="2" className="rb-points-remaining"><span>Points Remaining:</span> {this.state.specialPtsRemaining}</th>
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

export default CharacterSheet;
