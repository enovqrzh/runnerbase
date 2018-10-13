import priorityData from './data/priorities';

const priorities = [
  {
    key: "meta",
    id: "meta",
    text: "Metatype",
    getDescription: function(index) {
      return getPriorityData("Heritage", index, null, "name");
    },
    getData: function(index) {
      let prioItem = getPriorityData("Heritage", index);

      const metaArray = Array.isArray(prioItem.metatypes.metatype) ? prioItem.metatypes.metatype : [ prioItem.metatypes.metatype ];

      prioItem.allowedMetatypes = metaArray.map(metatype => {
        return metatype.name;
      });

      prioItem.allowedMetavariants = [];
      metaArray.forEach(function(metatype) {
        if (metatype.hasOwnProperty('metavariants')) {
          const variantArray = Array.isArray(metatype.metavariants.metavariant) ? metatype.metavariants.metavariant : [ metatype.metavariants.metavariant ];
          variantArray.forEach(function(variant) {
            if (variant) {
              prioItem.allowedMetavariants.push(variant.name);
            }
          });
        }
      });

      prioItem.key = "meta";
      return prioItem;
    }
  },
  {
    key: "attr",
    id: "attr",
    text: "Attributes",
    getDescription: function(index, character) {
      let itemName = getPriorityData("Attributes", index, null, "name");

      const meta = character.metavariant ? character.metavariant : character.metatype;
      if (meta.hasOwnProperty('halveattributepoints')) {
        itemName = itemName.replace(/(\d+) \((\d+)\)/, "$2");
      } else {
        itemName = itemName.replace(/(\d+) \((\d+)\)/, "$1");
      }
      return itemName;
    },
    getData: function(index, character) {
      // Use a shallow copy of the priority data so we don't muck it up by changing the source with metatypes that halve points
      let prioItem = Object.assign({}, getPriorityData("Attributes", index));
      prioItem.key = "attr";

      const meta = character.metavariant ? character.metavariant : character.metatype;
      if (meta.hasOwnProperty('halveattributepoints')) {
        prioItem.attributes = prioItem.attributes / 2;
        prioItem.name = prioItem.name.replace(/(\d+) \((\d+)\)/, "$2");
      } else {
        prioItem.name = prioItem.name.replace(/(\d+) \((\d+)\)/, "$1");
      }

      return prioItem;
    }
  },
  {
    key: "talent",
    id: "talent",
    text: "Talent",
    getDescription: function(index) {
      return getPriorityData("Talent", index, null, "name");
    },
    getData: function(index) {
      let prioItem = getPriorityData("Talent", index);
      prioItem.key = "talent";
      return prioItem;
    }
  },
  {
    key: "skills",
    id: "skills",
    text: "Skills",
    getDescription: function(index, character) {
      return getPriorityData("Skills", index, character.gameplayoption, "name");
    },
    getData: function(index, character) {
      let prioItem = getPriorityData("Skills", index, character.gameplayoption);
      prioItem.key = "skills";
      prioItem.skills = Number(prioItem.skills);
      prioItem.skillgroups = Number(prioItem.skillgroups);
      return prioItem;
    }
  },
  {
    key: "res",
    id: "res",
    text: "Resources",
    getDescription: function(index, character) {
      return getPriorityData("Resources", index, character.gameplayoption, "name");
    },
    getData: function(index, character) {
      let prioItem = getPriorityData("Resources", index, character.gameplayoption);
      prioItem.key = "res";
      return prioItem;
    }
  }
];

function getPriorityData(category, index, gameOpt = null, prop = null) {
  const rank = 4 - index;
  const indexChar = String.fromCharCode(65 + index);
  let item = priorityData.chummer.priorities.priority.find(function(element) {
    if (gameOpt) {
      if ((element.category === category) && (element.value === indexChar + "," + rank) && (element.gameplayoption === gameOpt)) {
        return true;
      };
    }
    return ((element.category === category) && (element.value === indexChar + "," + rank) && (! element.hasOwnProperty('gameplayoption')));
  });

  if (prop) {
    return item[prop];
  }

  return item;
}

export default priorities;
