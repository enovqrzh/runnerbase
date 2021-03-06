import React from 'react';
import { Callout, HTMLSelect, HTMLTable } from "@blueprintjs/core";
import update from 'immutability-helper';
import { v4 as uuid } from 'uuid';

import skills, { skillPanel } from './skills';
import { karmaCost } from './karmaCost';
import SkillRow from './SkillRow';
import SkillGroupRow from './SkillGroupRow';
import SkillSpecDialog from './SkillSpecDialog';

class ActiveSkillPanel extends skillPanel {
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
  }

  initPanel(character) {
    const base = {
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
      })
    };

    let initObj = ActiveSkillPanel.refreshSkills(base.skills, base.skillGroups, character.attributes, character.meta, character.karmaRemaining)

    initObj.hooks = { attributes: this.hookUpdate };

    return initObj;
  }

  /**
   * Passthrough for refreshing skill table based on attribute or metatype change
   * 
   * @param {RB_Character} character  The character object with the changed attributes
   * @returns {Object}  An object with updated properties to be applied to the character object
   */
  hookUpdate(character) {
    return ActiveSkillPanel.refreshSkills(character.skills, character.skillGroups, character.attributes, character.meta, character.karmaRemaining);
  }

  /**
   * Update the skill table based on attribute or metatype changes
   *
   * @param {Array} oldSkills       An array of character skills
   * @param {Array} oldSkillGroups  An array of character skill groups
   * @param {Array} attributes      An array of character attributes
   * @param {Object} meta           An object with the character's metatype information
   * @param {number} karmaRemaining The character's remaining karma points
   * @returns {Object}  An object with updated character properties
   */
  static refreshSkills(oldSkills, oldSkillGroups, attributes, meta, karmaRemaining) {
    const attrKeys = attributes.map(attr => attr.key);
    
    // Filter out skills/groups where the character doesn't have the necessary attr
    let karmaDiff = 0;
    let charUpdate = {};
    const updateShow = { hidden: { $set: false } };
    const updateHide = { base: { $set: 0 }, karma: { $set: 0 }, hidden: { $set: true } };

    charUpdate.skills = oldSkills.map(skill => {
      if (
        (skill.category !== "Magical" && skill.category !== "Resonance" 
          && (skill.name !== "Flight" || (skill.name === "Flight" && meta.metatype.hasOwnProperty('flight') && meta.metatype.flight))
        )
        || (skill.category === "Magical" && attrKeys.includes('mag'))
        || (skill.category === "Resonance" && attrKeys.includes('res')
      )) {
        return update(skill, updateShow);
      }
      else {
        let updateSkill = update(skill, Object.assign({ specs: { $set: [] } }, updateHide));
        karmaDiff = karmaDiff + karmaCost(skill, updateSkill, 2, 'groupRating') - (7 * skill.specs.filter(spec => (spec.type === 'karma')).length);
        return updateSkill;
      }
    });

    const groupIndices = {
      conjuring: oldSkillGroups.findIndex(group => (group.name === 'Conjuring')),
      enchanting: oldSkillGroups.findIndex(group => (group.name === 'Enchanting')),
      sorcery: oldSkillGroups.findIndex(group => (group.name === 'Sorcery')),
      tasking: oldSkillGroups.findIndex(group => (group.name === 'Tasking'))
    };

    if (attrKeys.includes('mag')) {
      charUpdate.skillGroups = update(oldSkillGroups, {
        [groupIndices.conjuring]: updateShow,
        [groupIndices.enchanting]: updateShow,
        [groupIndices.sorcery]: updateShow,
        [groupIndices.tasking]: updateHide
      });
      karmaDiff = karmaDiff + karmaCost(oldSkillGroups[groupIndices.tasking], charUpdate.skillGroups[groupIndices.tasking], 5);
    }
    else if (attrKeys.includes('res')) {
      charUpdate.skillGroups = update(oldSkillGroups, {
        [groupIndices.conjuring]: updateHide,
        [groupIndices.enchanting]: updateHide,
        [groupIndices.sorcery]: updateHide,
        [groupIndices.tasking]: updateShow
      });
      karmaDiff = karmaDiff + karmaCost(oldSkillGroups[groupIndices.conjuring], charUpdate.skillGroups[groupIndices.conjuring], 5);
      karmaDiff = karmaDiff + karmaCost(oldSkillGroups[groupIndices.enchanting], charUpdate.skillGroups[groupIndices.enchanting], 5);
      karmaDiff = karmaDiff + karmaCost(oldSkillGroups[groupIndices.sorcery], charUpdate.skillGroups[groupIndices.sorcery], 5);
    }
    else {
      charUpdate.skillGroups = update(oldSkillGroups, {
        [groupIndices.conjuring]: updateHide,
        [groupIndices.enchanting]: updateHide,
        [groupIndices.sorcery]: updateHide,
        [groupIndices.tasking]: updateHide
      });
      karmaDiff = karmaDiff + karmaCost(oldSkillGroups[groupIndices.conjuring], charUpdate.skillGroups[groupIndices.conjuring], 5);
      karmaDiff = karmaDiff + karmaCost(oldSkillGroups[groupIndices.enchanting], charUpdate.skillGroups[groupIndices.enchanting], 5);
      karmaDiff = karmaDiff + karmaCost(oldSkillGroups[groupIndices.sorcery], charUpdate.skillGroups[groupIndices.sorcery], 5);
      karmaDiff = karmaDiff + karmaCost(oldSkillGroups[groupIndices.tasking], charUpdate.skillGroups[groupIndices.tasking], 5);
    }

    charUpdate.karmaRemaining = karmaRemaining - karmaDiff;
    return charUpdate;
  }

  updateGroupBy(event) {
    this.setState({ groupBy: event.currentTarget.value });
  }

  render() {
    // TODO: Filter box for skill table
    // TODO: Tooltips
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
              <th className="rb-table-numeric">Base Points</th>
              <th className="rb-table-numeric">Karma</th>
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
              <th className="rb-table-numeric">Base Points</th>
              <th className="rb-table-numeric">Karma</th>
              <th className="rb-table-numeric">Total Dice (Rating)</th>
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
        <SkillSpecDialog 
          specAddSkill={this.state.specAddSkill} 
          addSpec={this.addSpec} 
          closeSpecAdd={this.closeSpecAdd}
          skillPropKey="skills"
        />
      </React.Fragment>
    );
  }
}

export default ActiveSkillPanel;