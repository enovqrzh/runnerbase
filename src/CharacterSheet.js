import React from 'react';
import './CharacterSheet.css';

import { Button, Classes, Dialog, Divider, EditableText, FormGroup, H1, H2, HTMLTable, InputGroup, Tab, Tabs } from "@blueprintjs/core";
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

var character = {};

function updateCharacter(elements) {
  // TODO: Check if the remaining box variables are being updated and call this.updateRem
  character = Object.assign(character, elements);
  console.log(character);
}

class CharacterSheet extends React.PureComponent {
  render() {
    return (
      <div id="characterSheet">
        <H1>Character Sheet!:</H1>
        <CharacterTabs>
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
  karmaRemaining: null,
  attrPtsRemaining: null,
  specialPtsRemaining: null,
  update: () => {}
});

class CharacterTabs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      characterInitialized: false,
      remaining: {
        karmaRemaining: null,
        attrPtsRemaining: null,
        specialPtsRemaining: null,
        update: this.updateRemaining
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

    updateCharacter({ updateRem: this.updateRemaining });
  }

  updateRemaining() {
    this.setState({
      remaining: {
        karmaRemaining: character.karmaRemaining,
        attrPtsRemaining: character.attrPtsRemaining,
        specialPtsRemaining: character.specialPtsRemaining,
      }
    });
  }

  render() {
    return (
      <div>
        <Dialog
          title="Import or Create?"
          icon="new-person"
          isOpen={(! this.state.characterInitialized)}
          onClose={this.initCharacter}
          isCloseButtonShown={false}
        >
          <Button icon="new-person" onClick={this.initCharacter}>Create a new character</Button>
        </Dialog>
        <RemainingContext.Provider value={this.state.remaining}>
          <div className="rb-top-box">
            <CharacterName />
            <RemainingCard />
          </div>
          <PlayerName />
          <Tabs renderActiveTabPanelOnly={true}>
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
        <EditableText placeholder="Character Name" />
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
  // TODO: Intent for negative values
  render() {
    return (
      <RemainingContext.Consumer>
        {({karmaRemaining, attrPtsRemaining, specialPtsRemaining}) => (
          <div className="rb-remaining-box">
            <span><span>Attribute Points Remaining:</span> {attrPtsRemaining}</span>
            <Divider />
            <span><span>Special Attribute Points Remaining:</span> {specialPtsRemaining}</span>
            <Divider />
            <span><span>Karma Remaining:</span> {karmaRemaining}</span>
          </div>
        )}
      </RemainingContext.Consumer>
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

    // TODO: Refund the special attribute points if Mundane is selected
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
    // TODO: Qualities, exlcudes, attributes, skill selection, spells/complexforms

    updateCharacter({
      talent: talent,
      prioritytalent: talent.value,
    });
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
      karmaRemaining: character.karmaRemaining,
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
      character.updateRem();
      this.setState(updateObj);
    }
  }

  render() {
    let attrAtMax = this.state.attributes.find(attr => ( (attr.metatypemin + attr.base + attr.karma) === attr.metatypemax ));

    return (
      <HTMLTable>
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
          {this.state.attributes.map(attr => (
            <AttributeRow
              id={attr.key}
              key={attr.key}
              attr={attr}
              attrAtMax={(attrAtMax && (! attr.special)) ? attrAtMax.key : null}
              attrPtsRemaining={attr.special ? this.state.specialPtsRemaining : this.state.attrPtsRemaining}
              updateAttr={this.updateAttr}
            />
          ))}
        </tbody>
      </HTMLTable>
    );
  }
}

export default CharacterSheet;
