class RB_Character {
  constructor() {
    this.demands = new RB_Demands();
    this.karmaRemaining = 0;
    this.hooks = {};
  }

  update(elements = {}) {
    let newChar = Object.assign(this, elements);
    Object.keys(elements).forEach(key => {
      if (this.hooks.hasOwnProperty(key)) {
        this.hooks[key].forEach(hook => {
          const hookAdditions = hook(newChar);
          newChar = newChar.update(hookAdditions);
        });
      }
    });

    return newChar;
  }
}

class RB_Demands {
  constructor(excls = [], reqs = []) {
    this.excludes = excls;
    this.requires = reqs;

    this.updateDemands = this.updateDemands.bind(this);
    this.getDemandValues = this.getDemandValues.bind(this);
  }

  getDemandValues(type, target) {
    let values = [];

    if (Array.isArray(this[type])) {
      this[type].forEach(demand => {
        if (demand.target === target) values.push(demand.item);
      });
    }

    return values;
  }

  updateDemands(source, excludes = null, requires = null) {
    console.log(this);
    const ret_excls = this.excludes
      .filter(demand => demand.source !== source)
      .concat(this.generateDemands(source, excludes));
    const ret_reqs = this.requires
      .filter(demand => demand.source !== source)
      .concat(this.generateDemands(source, requires));

    return new RB_Demands(ret_excls, ret_reqs);
  }

  generateDemands(source, items = null) {
    let demands = [];

    if (items) {
      if (items.hasOwnProperty('oneof')) {
        Object.entries(items.oneof).forEach(pair => {
          if (Array.isArray(pair[1])) {
            demands.concat(
              pair[1].map(item => {
                return new RB_Demand(source, pair[0], item);
              })
            );
          } else {
            demands.push(new RB_Demand(source, pair[0], pair[1]));
          }
        });
      }
    }
    return demands;
  }
}

class RB_Demand {
  constructor(source, target, item) {
    this.source = source;
    this.target = target;
    this.item = item;
  }
}

export default RB_Character;
