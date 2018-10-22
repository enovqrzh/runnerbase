import skillData from './data/skills';
import update from 'immutability-helper';
import { v4 as uuid } from 'uuid';

const attrNames = {
  BOD: "Body",
  AGI: "Agility",
  REA: "Reaction",
  STR: "Strength",
  CHA: "Charisma",
  INT: "Intuition",
  LOG: "Logic",
  WIL: "Willpower",
  EDG: "Edge",
  MAG: "Magic",
  RES: "Resonance",
  DEP: "Depth"
}

const skills = {
  groups: skillData.chummer.skillgroups.name,
  activeCategories: skillData.chummer.categories.category
    .filter(cat => cat.type === 'active')
    .map(cat => {
      return cat['$t'].slice(0, -7);
    })
  ,
  knowledgeCategories: skillData.chummer.categories.category
    .filter(cat => cat.type === 'knowledge')
    .map(cat => {
      return cat['$t'];
    })
  ,
  activeSkills: skillData.chummer.skills.skill.map(skill => {
    return update(skill, {
      attribute: { $set: skill.attribute.toLowerCase() },
      attrName: { $set: attrNames[skill.attribute] },
      category: { $set: skill.category.slice(0, -7) },
      skillgroup: { $set: typeof(skill.skillgroup) === 'object' ? '-' : skill.skillgroup },
      default: { $set: (skill.default === "True") },
      specOptions: { $set: skill.specs.hasOwnProperty('spec') ? generateSpecOptions(skill.specs.spec) : null },
      $unset: ['specs']
    });
  }),
  knowledgeSkills: skillData.chummer.knowledgeskills.skill.map(skill => {
    return update(skill, {
      attribute: { $set: skill.attribute.toLowerCase() },
      attrName: { $set: attrNames[skill.attribute] },
      specOptions: { $set: skill.specs.hasOwnProperty('spec') ? generateSpecOptions(skill.specs.spec) : null },
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
      isCustomCategory: (specName.charAt(0) === '['),
      isCustom: false
    };
  });
}

export default skills;
