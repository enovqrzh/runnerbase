import React from 'react';
import { HTMLTable, Callout, FormGroup } from '@blueprintjs/core';
import { Suggest } from '@blueprintjs/select';
import { v4 as uuid } from 'uuid';
import update from 'immutability-helper';
import Fuse from 'fuse.js';

import renderMenuItem from './renderMenuItem';
import skills, { skillPanel } from './skills';
import KnowRow from './KnowRow';
import SkillSpecDialog from './SkillSpecDialog';

class KnowPanel extends skillPanel {
  constructor(props) {
    super(props);

    let attrValues = {};
    this.props.attributes.filter(attr => (attr.key === 'log' || attr.key === 'int')).forEach(attr => {
      attrValues[attr.key] = attr.totalvalue;
    });

    let suids = [];
    let knowPtsRemaining = (attrValues.log + attrValues.int) * 2;
    this.props.knowledgeSkills.forEach(skill => {
      suids.push(skill.suid);
      knowPtsRemaining = knowPtsRemaining - skill.base;
    });

    this.state = {
      attrValues: attrValues,
      skillPtsRemaining: knowPtsRemaining,
      knowSkillOpts: skills.knowledgeSkills.filter(skill => (! suids.includes(skill.id))),
      justAddedID: null,
      specAddSkill: null
    };

    this.addSkill = this.addSkill.bind(this);
    this.updateSkillProperties = this.updateSkillProperties.bind(this);
  }

  initPanel() {
    return { 
      nativeLanguages: 1,
      knowledgeSkills: []
    };
  }

  renderInputValue(skill) {
    return skill.name;
  }

  /**
   * Add a knowledge skill to a character
   *
   * @param {Object} skill  The skill object to add to the character
   */
  addSkill(skill) {
    let addSkill;
    let stateUpdate = {};

    if (skill.custom) {
      addSkill = update(skill, {
        suid: { $set: skill.id },
        guid: { $set: uuid() },
        karma: { $set: 0 },
        base: { $set: 0 },
        specs: { $set: [] },
        $unset: ['intent', 'icon']
      });
    } else {
      addSkill = Object.assign(skill, {
        suid: skill.id,
        guid: uuid(),
        karma: 0,
        base: 0,
        specs: []
      });

      stateUpdate.knowSkillOpts = this.state.knowSkillOpts.filter(item => (item.id !== skill.id));
    }

    stateUpdate.justAddedID = addSkill.guid;

    this.setState(stateUpdate);
    this.props.updateCharacter({ knowledgeSkills: update(this.props.knowledgeSkills, { $push: [ addSkill ] })});
  }

  /**
   * A function to filter / add a custom option to a list of skills
   *
   * @param {string}  query   The query string
   * @param {Array}   skills  The array of skills
   * @returns {Array}   The filtered list of skills
   */
  addSkillPredicate(query, skills) {
    let filteredSkills = [];
    if (query.length > 0) {
      const fuse = new Fuse(skills, {
        threshold: 0.4,
        keys: ['name'],
        minMatchCharLength: 3
      });
      filteredSkills = fuse.search(query);

      if (filteredSkills.length > 15) {
        filteredSkills = filteredSkills.slice(0, 14);
      }

      if (filteredSkills.length === 0 || filteredSkills[0].name !== query) {
        filteredSkills.push({
          name: query,
          attribute: 'log',
          attrName: 'Logic',
          category: 'Academic',
          specOptions: [],
          custom: true,
          icon: 'add',
          intent: 'success',
          id: uuid()
        });
      }
    }

    return filteredSkills;
  }

  updateSkillProperties(updatedSkill) {
    const i = this.props.knowledgeSkills.findIndex(item => item.guid === updatedSkill.guid);

    this.props.updateCharacter({ knowledgeSkills: update(this.props.knowledgeSkills, { [i]: { $set: updatedSkill } }) });
  }

  render() {
    const sortedSkills = this.props.knowledgeSkills.sort();

    return (
      <React.Fragment>
        <Callout intent={(this.state.skillPtsRemaining < 0) ? 'warning' : null}>Knowledge Skill Points Remaining: {this.state.skillPtsRemaining}</Callout>
        <HTMLTable id="rb-know-skill-table" className="rb-table" bordered={true}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th className="rb-table-numeric">Base Points</th>
              <th className="rb-table-numeric">Karma</th>
              <th className="rb-table-numeric">Total Dice (Rating)</th>
              <th>Specializations</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedSkills.map(skill => (
              <KnowRow
                skill={skill}
                key={skill.guid}
                attrValue={this.state.attrValues[skill.attribute]}
                skillPtsRemaining={this.state.skillPtsRemaining}
                justAdded={(this.state.justAddedID === skill.guid)}
                updateSkill={this.updateSkillElement} 
                openSpecAdd={this.openSpecAdd} 
                removeSpec={this.removeSpec} 
                updateSkillProperties={this.updateSkillProperties}
              />
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan="7">
                <FormGroup
                  label="Add a skill:"
                  labelFor="skill-suggest"
                  inline={true}
                >
                  <Suggest
                    id="skill-suggest"
                    itemRenderer={renderMenuItem}
                    inputValueRenderer={this.renderInputValue}
                    items={this.state.knowSkillOpts}
                    onItemSelect={this.addSkill}
                    itemListPredicate={this.addSkillPredicate}
                    selectedItem={null}
                    resetOnSelect={true}
                    openOnKeyDown={true}
                  />
                </FormGroup>
              </th>
            </tr>
          </tfoot>
        </HTMLTable>
        <SkillSpecDialog 
          specAddSkill={this.state.specAddSkill} 
          addSpec={this.addSpec} 
          closeSpecAdd={this.closeSpecAdd} 
          skillPropKey="knowledgeSkills"
        />
      </React.Fragment>
    );
  }
}

export default KnowPanel;