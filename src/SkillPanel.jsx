import React from 'react';
import { Callout, HTMLSelect, HTMLTable } from "@blueprintjs/core";
import update from 'immutability-helper';
import { v4 as uuid } from 'uuid';

import skills from './skills';

import { karmaCost } from './karmaCost';

import SkillRow from './SkillRow';
import SkillGroupRow from './SkillGroupRow';
import SkillSpecDialog from './SkillSpecDialog';

class SkillPanel extends React.Component {
  constructor(props) {
    super(props);

    let attrValues = {};
    this.props.attributes.forEach(attr => {
      attrValues[attr.key] = attr.totalvalue;
    });

    // Calculate the skill and skill group points remaining to be spent
    let skillPtsRemaining = this.props.skillPrio.skills;
    let skillGrpPtsRemaining = this.props.skillPrio.skillgroups;
    this.props.skills.forEach(skill => {
      skillPtsRemaining = skillPtsRemaining - skill.base - skill.specs.filter(spec => (spec.type === 'base')).length;
    });
    this.props.skillGroups.forEach(group => {
      skillGrpPtsRemaining = skillGrpPtsRemaining - group.base;
    });

    this.state = {
      attrValues: attrValues,
      groupBy: 'skillgroup',
      groupOpts: {
        skillgroup: { groups: skills.groups.concat(['-']), label: "Skill Group", value: 'skillgroup' },
        attrName: { groups: this.props.attributes.map(attr => { return attr.name; }), label: "Attribute", value: 'attrName' }
      },
      skillPtsRemaining: skillPtsRemaining,
      skillGrpPtsRemaining: skillGrpPtsRemaining,
      specAddSkill: null
    };

    this.updateGroupBy = this.updateGroupBy.bind(this);
    this.updateSkillElement = this.updateSkillElement.bind(this);
    this.openSpecAdd = this.openSpecAdd.bind(this);
    this.closeSpecAdd = this.closeSpecAdd.bind(this);
    this.addSpec = this.addSpec.bind(this);
    this.removeSpec = this.removeSpec.bind(this);
  }

  initPanel() {
    return {
      skills: skills.activeSkills.map(skill => {
        return Object.assign(skill, {
          suid: skill.id,
          guid: uuid(),
          karma: 0,
          base: 0,
          hidden: false,
          groupRating: 0,
          specs: []
        });
      }),
      skillGroups: skills.groups.map(groupName => {
        return {
          name: groupName,
          id: uuid(),
          karma: 0,
          base: 0,
          hidden: false
        };
      }),
      hooks: { attributes: this.hookUpdate }
    };
  }

  /**
   * Update the skill table based on attribute changes
   * 
   * @param {RB_Character} character  The character object with the changed attributes
   * @returns {Object}  An object with updated properties to be applied to the character object
   */
  hookUpdate(character) {
    const attrKeys = character.attributes.map(attr => attr.key);
    
    // Filter out skills/groups where the character doesn't have the necessary attr
    let karmaDiff = 0;
    let charUpdate = {};
    const updateShow = { hidden: { $set: false } };
    const updateHide = { base: { $set: 0 }, karma: { $set: 0 }, hidden: { $set: true } };

    charUpdate.skills = character.skills.map(skill => {
      if ((skill.category !== "Magical" && skill.category !== "Resonance")
        || (skill.category === "Magical" && attrKeys.includes('mag'))
        || (skill.category === "Resonance" && attrKeys.includes('res'))) {
        return update(skill, updateShow);
      }
      else {
        let updateSkill = update(skill, Object.assign({ specs: { $set: [] } }, updateHide));
        karmaDiff = karmaDiff + karmaCost(skill, updateSkill, 2, 'groupRating') - (7 * skill.specs.filter(spec => (spec.type === 'karma')).length);
        return updateSkill;
      }
    });

    const groupIndices = {
      conjuring: character.skillGroups.findIndex(group => (group.name === 'Conjuring')),
      enchanting: character.skillGroups.findIndex(group => (group.name === 'Enchanting')),
      sorcery: character.skillGroups.findIndex(group => (group.name === 'Sorcery')),
      tasking: character.skillGroups.findIndex(group => (group.name === 'Tasking'))
    };

    if (attrKeys.includes('mag')) {
      charUpdate.skillGroups = update(character.skillGroups, {
        [groupIndices.conjuring]: updateShow,
        [groupIndices.enchanting]: updateShow,
        [groupIndices.sorcery]: updateShow,
        [groupIndices.tasking]: updateHide
      });
      karmaDiff = karmaDiff + karmaCost(character.skillGroups[groupIndices.tasking], charUpdate.skillGroups[groupIndices.tasking], 5);
    }
    else if (attrKeys.includes('res')) {
      charUpdate.skillGroups = update(character.skillGroups, {
        [groupIndices.conjuring]: updateHide,
        [groupIndices.enchanting]: updateHide,
        [groupIndices.sorcery]: updateHide,
        [groupIndices.tasking]: updateShow
      });
      karmaDiff = karmaDiff + karmaCost(character.skillGroups[groupIndices.conjuring], charUpdate.skillGroups[groupIndices.conjuring], 5);
      karmaDiff = karmaDiff + karmaCost(character.skillGroups[groupIndices.enchanting], charUpdate.skillGroups[groupIndices.enchanting], 5);
      karmaDiff = karmaDiff + karmaCost(character.skillGroups[groupIndices.sorcery], charUpdate.skillGroups[groupIndices.sorcery], 5);
    }
    else {
      charUpdate.skillGroups = update(character.skillGroups, {
        [groupIndices.conjuring]: updateHide,
        [groupIndices.enchanting]: updateHide,
        [groupIndices.sorcery]: updateHide,
        [groupIndices.tasking]: updateHide
      });
      karmaDiff = karmaDiff + karmaCost(character.skillGroups[groupIndices.conjuring], charUpdate.skillGroups[groupIndices.conjuring], 5);
      karmaDiff = karmaDiff + karmaCost(character.skillGroups[groupIndices.enchanting], charUpdate.skillGroups[groupIndices.enchanting], 5);
      karmaDiff = karmaDiff + karmaCost(character.skillGroups[groupIndices.sorcery], charUpdate.skillGroups[groupIndices.sorcery], 5);
      karmaDiff = karmaDiff + karmaCost(character.skillGroups[groupIndices.tasking], charUpdate.skillGroups[groupIndices.tasking], 5);
    }

    charUpdate.karmaRemaining = character.karmaRemaining - karmaDiff;
    return charUpdate;
  }

  /**
   * Update a skill or skill group
   *
   * @param  {string}  id            The element's id
   * @param  {number}  value         The new value to set
   * @param  {string}  type          Karma or base
   * @param  {boolean} [group=false] Skill group?
   */
  updateSkillElement(id, value, type, group = false) {
    const props = group ?
      { id: 'id', elements: 'skillGroups', pts: 'skillGrpPtsRemaining', factor: 5, startingProp: null }
      :
      { id: 'guid', elements: 'skills', pts: 'skillPtsRemaining', factor: 2, startingProp: 'groupRating' };

    const i = this.props[props.elements].findIndex(item => item[props.id] === id);
    const diff = value - this.props[props.elements][i][type];

    if (diff !== 0) {
      const updateElements = update(this.props[props.elements], {
        [i]: {
          [type]: { $set: value }
        }
      });

      let karmaDiff = karmaCost(this.props[props.elements][i], updateElements[i], props.factor, props.startingProp);

      let charUpdate = {};
      
      // Update a skillgroup's rating in its child skills
      if (group) {
        let updateSkills = this.props.skills.map(skill => {
          if (skill.skillgroup !== updateElements[i].name) {
            return skill;
          }
          const updateSkill = update(skill, { groupRating: { $set: (updateElements[i].base + updateElements[i].karma) } });
          karmaDiff = karmaDiff + karmaCost(skill, updateSkill, 2, 'groupRating');
          return updateSkill;
        });
        charUpdate.skills = updateSkills;
      }

      charUpdate[props.elements] = updateElements;
      charUpdate.karmaRemaining = this.props.karmaRemaining - karmaDiff;
      this.props.updateCharacter(charUpdate);

      if (type === 'base') {
        let stateUpdate = {};
        stateUpdate[props.pts] = this.state[props.pts] - diff;
        this.setState(stateUpdate);
      }
    }
  }

  updateGroupBy(event) {
    this.setState({ groupBy: event.currentTarget.value });
  }

  openSpecAdd(skill) {
    this.setState({ specAddSkill: skill });
  }

  closeSpecAdd() {
    this.setState({ specAddSkill: null });
  }

  /**
   * Add a skill specialization
   *
   * @param {Object} skill The skill object to which the spec is being added
   * @param {Object} spec  The specialiation to add
   */
  addSpec(skill, spec) {
    const i = this.props.skills.findIndex(row => (row.guid === skill.guid));
    const skillUpdate = update(this.props.skills, {
      [i]: {
        specs: { $push: [spec] },
        specOptions: { $set: skill.specOptions.filter(item => (item.id !== spec.id)) }
      }
    });

    let charUpdate = { skills: skillUpdate };
    if (spec.type === 'base') {
      this.setState({ skillPtsRemaining: this.state.skillPtsRemaining - 1});
    }
    else {
      charUpdate.karmaRemaining = this.props.karmaRemaining - 7;
    }
    
    this.props.updateCharacter(charUpdate);
  }

  /**
   * Remove a skill specialization
   *
   * @param {Object} skill  The skill object from which the specialization is being removed
   * @param {Object} spec   The specialization being removed
   */
  removeSpec(skill, spec) {
    const i = this.props.skills.findIndex(row => (row.guid === skill.guid));
    let updateObj = {
      [i]: {
        specs: { $set: skill.specs.filter(item => (item.id !== spec.id)) }
      }
    };
    if (! spec.isCustom) {
      updateObj[i].specOptions = {
        $set: skill.specOptions.concat([spec]).sort((a, b) => {
          if (a.isCustomCategory === b.isCustomCategory) {
            return a.name.localeCompare(b.name);
          }
          else if (a.isCustomCategory) {
            return -1;
          }
          else {
            return 1;
          }
        })
      };
    }

    let charUpdate = { skills: update(this.props.skills, updateObj) };
    if (spec.type === 'base') {
      this.setState({ skillPtsRemaining: this.state.skillPtsRemaining + 1 });
    }
    else {
      charUpdate.karmaRemaining = this.props.karmaRemaining + 7;
    }
    this.props.updateCharacter(charUpdate);
  }

  render() {
    // TODO: Filter box for skill table
    // TODO: Tooltips
    // TODO: SourceLink
    const sortedSkills = this.state.groupOpts[this.state.groupBy].groups.map(group => {
      return this.props.skills.filter(skill => (skill[this.state.groupBy] === group &&
        skill.hidden !== true &&
        this.state.attrValues[skill.attribute] !== 0)).sort((a, b) => { return a.name.localeCompare(b.name); });
    }).filter(items => (items.length > 0));

    let skillGroupValues = {};
    this.props.skills.forEach(skill => {
      if (!skillGroupValues.hasOwnProperty(skill.skillgroup)) {
        skillGroupValues[skill.skillgroup] = skill.base + skill.karma;
      }
      else if (skillGroupValues[skill.skillgroup] !== (skill.base + skill.karma)) {
        skillGroupValues[skill.skillgroup] = -1;
      }
    });

    // Split the skill group table because it's not very wide
    const visibleSkillGroups = this.props.skillGroups.filter(group => (group.hidden !== true));
    const rowsPerSGTable = Math.ceil(visibleSkillGroups.length / 3);
    let skillGroupTables = [];
    for (let i = 0; i < 3; i++) {
      let rows = [];
      for (let j = i * rowsPerSGTable; (j < (rowsPerSGTable * (i + 1))) && (j < visibleSkillGroups.length); j++) {
        const group = visibleSkillGroups[j];
        rows.push(
          <SkillGroupRow 
            group={group} 
            key={group.id} 
            skillGrpPtsRemaining={this.state.skillGrpPtsRemaining} 
            disabledBase={(this.props.skills.findIndex(skill => { return (skill.base > 0 && skill.skillgroup === group.name); }) !== -1)} 
            disabledKarma={(skillGroupValues[group.name] === -1)} 
            updateElement={this.updateSkillElement} 
          />
        );
      }
      skillGroupTables.push(
        <HTMLTable id="rb-skill-group-table" className="rb-table" bordered={true} key={"sgtable" + i}>
          <thead>
            <tr>
              <th>Group</th>
              <th>Base Points</th>
              <th>From Karma</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </HTMLTable>
      );
    }

    return (
      <React.Fragment>
        <Callout intent={(this.state.skillGrpPtsRemaining < 0) ? 'warning' : null}>Skill Group Points Remaining: {this.state.skillGrpPtsRemaining}</Callout>
        <div id="rb-skill-group-tables">{skillGroupTables}</div>
        <Callout intent={(this.state.skillPtsRemaining < 0) ? 'warning' : null}>Skill Points Remaining: {this.state.skillPtsRemaining}</Callout>
        <HTMLTable id="rb-skill-table" className="rb-table" bordered={true}>
          <thead>
            <tr>
              <th>
                <HTMLSelect options={Object.values(this.state.groupOpts)} value={this.state.groupBy} onChange={this.updateGroupBy} />
              </th>
              <th>Name</th>
              {['skillgroup', 'attrName'].filter(col => (col !== this.state.groupBy)).map(col => (<th key={col}>{this.state.groupOpts[col].label}</th>))}
              <th className="rb-skill-table-numeric">Base Points</th>
              <th className="rb-skill-table-numeric">From Karma</th>
              <th className="rb-skill-table-numeric">Total Dice (Rating)</th>
              <th>Specializations</th>
            </tr>
          </thead>
          <tbody>
            {sortedSkills.map(group => {
              const totalSkills = group.length;
              return group.map((skill, index) => {
                return (
                  <SkillRow 
                    skill={skill} 
                    key={skill.guid} 
                    attrValue={this.state.attrValues[skill.attribute]} 
                    index={index} 
                    skillsInCollection={totalSkills} 
                    groupBy={this.state.groupBy} 
                    updateSkill={this.updateSkillElement} 
                    disabled={(skill.groupRating > 0)} 
                    skillPtsRemaining={this.state.skillPtsRemaining} 
                    skillGroupRating={skill.groupRating} 
                    openSpecAdd={this.openSpecAdd} 
                    removeSpec={this.removeSpec} 
                  />
                );
              });
            })}
          </tbody>
        </HTMLTable>
        <SkillSpecDialog specAddSkill={this.state.specAddSkill} addSpec={this.addSpec} closeSpecAdd={this.closeSpecAdd} />
      </React.Fragment>
    );
  }
}

export default SkillPanel;