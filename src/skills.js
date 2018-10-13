import skillData from './data/skills';

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
    return Object.assign(skill, {
      attribute: skill.attribute.toLowerCase(),
      attrName: attrNames[skill.attribute],
      category: skill.category.slice(0, -7),
      skillgroup: typeof(skill.skillgroup) === 'object' ? '-' : skill.skillgroup,
      default: (skill.default === "True")
    });
  }),
  knowledgeSkills: skillData.chummer.knowledgeskills.skill
};

export default skills;
