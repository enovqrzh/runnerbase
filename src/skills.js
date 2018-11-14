import React from 'react';
import skillData from './data/skills';
import update from 'immutability-helper';
import { v4 as uuid } from 'uuid';

import { karmaCost } from './karmaCost';

const attrNames = {
  BOD: 'Body',
  AGI: 'Agility',
  REA: 'Reaction',
  STR: 'Strength',
  CHA: 'Charisma',
  INT: 'Intuition',
  LOG: 'Logic',
  WIL: 'Willpower',
  EDG: 'Edge',
  MAG: 'Magic',
  RES: 'Resonance',
  DEP: 'Depth'
};

const skills = {
  groups: skillData.chummer.skillgroups.name,
  activeCategories: skillData.chummer.categories.category
    .filter(cat => cat.type === 'active')
    .map(cat => {
      return cat['$t'].slice(0, -7);
    }),
  knowledgeCategories: skillData.chummer.categories.category
    .filter(cat => cat.type === 'knowledge')
    .map(cat => {
      return cat['$t'];
    }),
  activeSkills: skillData.chummer.skills.skill.map(skill => {
    return update(skill, {
      attribute: { $set: skill.attribute.toLowerCase() },
      attrName: { $set: attrNames[skill.attribute] },
      category: { $set: skill.category.slice(0, -7) },
      skillgroup: {
        $set: typeof skill.skillgroup === 'object' ? '-' : skill.skillgroup
      },
      default: { $set: skill.default === 'True' },
      specOptions: {
        $set: skill.specs.hasOwnProperty('spec')
          ? generateSpecOptions(skill.specs.spec)
          : null
      },
      $unset: ['specs']
    });
  }),
  knowledgeSkills: skillData.chummer.knowledgeskills.skill.map(skill => {
    return update(skill, {
      attribute: { $set: skill.attribute.toLowerCase() },
      attrName: { $set: attrNames[skill.attribute] },
      specOptions: {
        $set: skill.specs.hasOwnProperty('spec')
          ? generateSpecOptions(skill.specs.spec)
          : null
      },
      custom: { $set: false },
      $unset: ['specs', 'default', 'skillgroup']
    });
  })
};

/**
 * A function to convert the specialization name(s) of a skill into an an array of onItemSelect
 *
 * @param  {Array|string} spec A string containing a single specialization name or an array of strings of specialization names
 * @return {Array}             An array of objects suitable for renderMenuItem
 */
function generateSpecOptions(spec) {
  const specArray = Array.isArray(spec) ? spec : [spec];
  return specArray.map(specName => {
    return {
      id: uuid(),
      name: specName,
      isCustomCategory: specName.charAt(0) === '[',
      isCustom: false
    };
  });
}

export class skillPanel extends React.Component {
  constructor(props) {
    super(props);

    this.updateSkillElement = this.updateSkillElement.bind(this);
    this.openSpecAdd = this.openSpecAdd.bind(this);
    this.closeSpecAdd = this.closeSpecAdd.bind(this);
    this.addSpec = this.addSpec.bind(this);
    this.removeSpec = this.removeSpec.bind(this);
  }

  /**
   * Update a skill or skill group
   *
   * @param  {string}  id     The element's id
   * @param  {number}  value  The new value to set
   * @param  {string}  type   Karma or base
   * @param  {Object}  props  Properties/keys for the element being updated (skill vs. skill group)
   */
  updateSkillElement(id, value, type, props) {
    const i = this.props[props.elements].findIndex(
      item => item[props.id] === id
    );
    const diff = value - this.props[props.elements][i][type];

    if (diff !== 0) {
      const updateElements = update(this.props[props.elements], {
        [i]: {
          [type]: { $set: value }
        }
      });

      let karmaDiff = karmaCost(
        this.props[props.elements][i],
        updateElements[i],
        props.factor,
        props.startingProp
      );

      let charUpdate = {};

      // Update a skillgroup's rating in its child skills
      if (props.elements === 'skillGroups') {
        let updateSkills = this.props.skills.map(skill => {
          if (skill.skillgroup !== updateElements[i].name) {
            return skill;
          }
          const updateSkill = update(skill, {
            groupRating: {
              $set: updateElements[i].base + updateElements[i].karma
            }
          });
          karmaDiff =
            karmaDiff + karmaCost(skill, updateSkill, 2, 'groupRating');
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

  /**
   * Open the dialog for adding a specialization for a given skill
   *
   * @param {Object} skill  A skill object to which to add a specialization
   */
  openSpecAdd(skill) {
    this.setState({ specAddSkill: skill });
  }

  /**
   * Close the specialization add dialog
   */
  closeSpecAdd() {
    this.setState({ specAddSkill: null });
  }

  /**
   * Add a skill specialization
   *
   * @param {Object} skill        The skill object to which the spec is being added
   * @param {Object} spec         The specialiation to add
   * @param {string} skillPropKey The key for the array of appropriate skill objects to update
   */
  addSpec(skill, spec, skillPropKey) {
    const i = this.props[skillPropKey].findIndex(
      row => row.guid === skill.guid
    );
    const skillUpdate = update(this.props[skillPropKey], {
      [i]: {
        specs: { $push: [spec] },
        specOptions: {
          $set: skill.specOptions.filter(item => item.id !== spec.id)
        }
      }
    });

    let charUpdate = {};
    charUpdate[skillPropKey] = skillUpdate;
    if (spec.type === 'base') {
      this.setState({ skillPtsRemaining: this.state.skillPtsRemaining - 1 });
    } else {
      charUpdate.karmaRemaining = this.props.karmaRemaining - 7;
    }

    this.props.updateCharacter(charUpdate);
  }

  /**
   * Remove a skill specialization
   *
   * @param {Object} skill        The skill object from which the specialization is being removed
   * @param {Object} spec         The specialization being removed
   * @param {string} skillPropKey The key for the array of appropriate skill objects to update
   */
  removeSpec(skill, spec, skillPropKey) {
    const i = this.props[skillPropKey].findIndex(
      row => row.guid === skill.guid
    );
    let updateObj = {
      [i]: {
        specs: { $set: skill.specs.filter(item => item.id !== spec.id) }
      }
    };
    if (!spec.isCustom) {
      updateObj[i].specOptions = {
        $set: skill.specOptions.concat([spec]).sort((a, b) => {
          if (a.isCustomCategory === b.isCustomCategory) {
            return a.name.localeCompare(b.name);
          } else if (a.isCustomCategory) {
            return -1;
          } else {
            return 1;
          }
        })
      };
    }

    let charUpdate = {};
    charUpdate[skillPropKey] = update(this.props[skillPropKey], updateObj);
    if (spec.type === 'base') {
      this.setState({ skillPtsRemaining: this.state.skillPtsRemaining + 1 });
    } else {
      charUpdate.karmaRemaining = this.props.karmaRemaining + 7;
    }
    this.props.updateCharacter(charUpdate);
  }
}

export default skills;
