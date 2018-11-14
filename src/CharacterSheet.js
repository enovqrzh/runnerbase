import React from 'react';
import './CharacterSheet.scss';

import {
  Button,
  Callout,
  Classes,
  Dialog,
  EditableText,
  FormGroup,
  H1,
  H2,
  Icon,
  InputGroup,
  Tab,
  Tabs
} from '@blueprintjs/core';

import RB_Character from './CharacterClasses';

import GameOptionsPanel from './GameOptionsPanel';
import PrioSelPanel from './PrioSelPanel';
import TalentSelPanel from './TalentSelPanel';
import MetatypePanel from './MetatypePanel';
import AttrPanel from './AttrPanel';
import ActiveSkillPanel from './ActiveSkillPanel';
import KnowPanel from './KnowPanel';

class CharacterSheet extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      character: new RB_Character()
    };
    this.updateCharacter = this.updateCharacter.bind(this);
    this.setCharacter = this.setCharacter.bind(this);
  }

  updateCharacter(elements) {
    this.setState({ character: this.state.character.update(elements) });
    console.log(this.state.character);
    this.forceUpdate();
  }

  setCharacter(char) {
    this.setState({ character: char });
    console.log(this.state.character);
    this.forceUpdate();
  }

  render() {
    const char = this.state.character;
    const prioData = char.hasOwnProperty('priorities')
      ? char.priorities.data
      : {};
    return (
      <div id="rb-character-sheet" className={Classes.DARK}>
        <H1>Character Sheet!:</H1>
        <CharacterTabs character={char} setCharacter={this.setCharacter}>
          <Tab id="biotab" title="Bio" panel={<BioPanel />} />
          <Tab
            id="gameoptsel"
            title="Gameplay Options"
            panel={
              <GameOptionsPanel
                gameOptions={char.gameOptions}
                updateCharacter={this.updateCharacter}
                karmaRemaining={char.karmaRemaining}
              />
            }
          />
          <Tab
            id="priosel"
            title="Priority Selection"
            panel={
              <PrioSelPanel
                metaGameOpt={{ meta: char.meta, gameOptions: char.gameOptions }}
                updateCharacter={this.updateCharacter}
                priorities={char.priorities}
              />
            }
          />
          <Tab
            id="talentsel"
            title="Talent"
            panel={
              <TalentSelPanel
                talentPrio={prioData.talent}
                talent={char.talent}
                updateCharacter={this.updateCharacter}
                updateDemands={char.demands.updateDemands}
              />
            }
          />
          <Tab
            id="metatypesel"
            title="Metatype"
            panel={
              <MetatypePanel
                metaPrio={prioData.meta}
                demands={char.demands}
                meta={char.meta}
                updateCharacter={this.updateCharacter}
              />
            }
          />
          <Tab
            id="attr"
            title="Attributes"
            panel={
              <AttrPanel
                attributes={char.attributes}
                talent={char.talent}
                meta={char.meta}
                metaPrio={prioData.meta}
                attrPrio={prioData.attr}
                karmaRemaining={char.karmaRemaining}
                updateCharacter={this.updateCharacter}
              />
            }
          />
          <Tab
            id="skills"
            title="Active Skills"
            panel={
              <ActiveSkillPanel
                attributes={char.attributes}
                skillPrio={prioData.skills}
                skills={char.skills}
                skillGroups={char.skillGroups}
                karmaRemaining={char.karmaRemaining}
                updateCharacter={this.updateCharacter}
              />
            }
          />
          <Tab
            id="knowledge"
            title="Knowledge Skills"
            panel={
              <KnowPanel
                attributes={char.attributes}
                knowledgeSkills={char.knowledgeSkills}
                nativeLanguages={char.nativeLanguages}
                karmaRemaining={char.karmaRemaining}
                updateCharacter={this.updateCharacter}
              />
            }
          />
        </CharacterTabs>
      </div>
    );
  }
}

class CharacterTabs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      characterInitialized: false
    };
    this.initCharacter = this.initCharacter.bind(this);
  }

  initCharacter() {
    let char = this.props.character.update();
    this.props.children.forEach(child => {
      if (child.props.panel.type.prototype.hasOwnProperty('initPanel')) {
        let {
          hooks,
          ...updatedProps
        } = child.props.panel.type.prototype.initPanel(char);
        if (hooks) {
          Object.keys(hooks).forEach(key => {
            if (char.hooks.hasOwnProperty(key)) {
              char.hooks[key].push(hooks[key]);
            } else {
              char.hooks[key] = [hooks[key]];
            }
          });
        }
        char = char.update(updatedProps);
      }
    });
    this.props.setCharacter(char);

    this.setState({ characterInitialized: true });
  }

  render() {
    return (
      <div className="rb-character">
        <Dialog
          title="Import or Create?"
          icon="new-person"
          isOpen={!this.state.characterInitialized}
          onClose={this.initCharacter}
          isCloseButtonShown={false}
          className={Classes.DARK}
        >
          <div className="rb-dialog-content">
            <Button fill={false} icon="new-person" onClick={this.initCharacter}>
              Create a new character
            </Button>
          </div>
        </Dialog>
        <div className="rb-top-box">
          <CharacterName />
          <RemainingCard karmaRemaining={this.props.character.karmaRemaining} />
        </div>
        <Tabs renderActiveTabPanelOnly={true} vertical={true}>
          {this.props.children.map(child => {
            return child;
          })}
        </Tabs>
      </div>
    );
  }
}

class CharacterName extends React.PureComponent {
  render() {
    return (
      <H2>
        <EditableText placeholder="Character Name" />
        &nbsp;
        <Icon icon="edit" color="#5C7080" />
      </H2>
    );
  }
}

class PlayerName extends React.PureComponent {
  render() {
    return (
      <FormGroup label="Player Name" labelFor="playername">
        <InputGroup id="playername" />
      </FormGroup>
    );
  }
}

class RemainingCard extends React.PureComponent {
  render() {
    return (
      <Callout
        className="rb-remaining-box"
        intent={this.props.karmaRemaining >= 0 ? null : 'warning'}
      >
        <span>
          <span>Karma Remaining:</span> {this.props.karmaRemaining}
        </span>
      </Callout>
    );
  }
}

class BioPanel extends React.PureComponent {
  render() {
    return <PlayerName />;
  }
}

export default CharacterSheet;
