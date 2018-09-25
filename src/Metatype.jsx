import React from 'react';
import { Button, ControlGroup, FormGroup } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";

import renderMenuItem from './renderMenuItem';
import getMetatypes from './getMetatypes';
import SourceLink from './SourceLink';

class Metatype extends React.Component {
  constructor(props) {
    super(props);

    let metatypes = null;
    let metaPrio = this.props.origCharacter.prioritiesData.find((element) => {
      return (element.key === "meta");
    });
    let metatypeCategories = this.getMetatypeCategories(metaPrio);

    metatypes = getMetatypes(this.props.origCharacter.metatypecategory, metaPrio);
    this.state = {
      category: this.props.origCharacter.metatypecategory,
      categoryTypes: metatypes,
      metatype: this.props.origCharacter.metatype,
      metavariant: this.props.origCharacter.metavariant ? this.props.origCharacter.metavariant : this.props.origCharacter.metatype,
      metatypeVariants: this.getMetavariants(this.props.origCharacter.metatype, metaPrio),
      metaPrio: metaPrio
    };

    this.state.metatypeCategories = metatypeCategories;

    this.handleCategoryValueChange = this.handleCategoryValueChange.bind(this);
    this.handleMetatypeValueChange = this.handleMetatypeValueChange.bind(this);
    this.handleMetavariantValueChange = this.handleMetavariantValueChange.bind(this);
  }

  getMetatypeCategories(metaPrio) {
    let metatypeCategories = [
      {id: 0, name: "Metahuman"}
    ];

    if (['A,4', 'B,3', 'C,2'].includes(metaPrio.value) ) {
      metatypeCategories.push({id: 1, name: "Metasapient"});
      metatypeCategories.push({id: 2, name: "Shapeshifter"});
    }

    return metatypeCategories;
  }

  getMetavariants(metatype, metaPrio) {
    let metavariants = [];
    if (metatype.hasOwnProperty('metavariants')) {
      if (Array.isArray(metatype.metavariants.metavariant)) {
        metavariants = Array.from(metatype.metavariants.metavariant);
      } else {
        metavariants = [metatype.metavariants.metavariant];
      }
    }

    metavariants.filter(metavariant => metaPrio.allowedMetavariants.includes(metavariant.name));

    metavariants.unshift(metatype);
    metavariants = metavariants.map((m, index) => {
      m.id = m.name;
      return m;
    });

    return metavariants;
  }

  handleCategoryValueChange(item) {
    // If the category actually changed, reset the metatype select
    if (this.state.category !== item) {
      let metatypes = getMetatypes(this.state.metatypeCategories[item.id], this.state.metaPrio);
      this.setState({
        category: item,
        categoryTypes: metatypes,
        metatype: metatypes[0],
        metatypeVariants: this.getMetavariants(metatypes[0], this.state.metaPrio),
        metavariant: metatypes[0]
      });

      this.props.characterUpdate({
        metatypecategory: item,
        metatype: metatypes[0],
        metavariant: null
      });
    }
  }

  handleMetatypeValueChange(item) {
    // If the metatype actually changed, reset the metavariant select
    if (this.state.metatype !== item) {
      this.setState({
        metatype: item,
        metatypeVariants: this.getMetavariants(item, this.state.metaPrio),
        metavariant: item
      });
      this.props.characterUpdate({
        metatype: item,
        metavariant: null
      });
    }
  }

  handleMetavariantValueChange(item) {
    this.setState({
      metavariant: item
    });
    this.props.characterUpdate({
      metavariant: (item !== this.state.metatype) ? item : null
    });
  }

  render() {
    let catIntent = this.state.metatypeCategories.find(function(item) {return (item.id === this.state.category.id);}, this) ? 'none' : 'warning';
    let typeIntent = ((catIntent !== 'warning') && this.state.categoryTypes.includes(this.state.metatype)) ? 'none' : 'warning';
    let variantIntent = ((typeIntent !== 'warning') && this.state.metatypeVariants.includes(this.state.metavariant)) ? 'none' : 'warning';

    return (
      <FormGroup
        helperText={<span>Reference: <SourceLink source={this.state.metavariant.source} page={this.state.metavariant.page} /></span>}
        labelFor="metatypegroup"
      >
        <ControlGroup id="metatypegroup">
          <FormGroup
            label="Metatype Category"
            labelFor="MetatypeCategory"
          >
            <Select
              id="MetatypeCategory"
              items={this.state.metatypeCategories}
              itemRenderer={renderMenuItem}
              filterable={false}
              onItemSelect={this.handleCategoryValueChange}
            >
              <Button text={this.state.category.name} rightIcon="double-caret-vertical" intent={catIntent} />
            </Select>
          </FormGroup>

          <FormGroup
            label="Metatype"
            labelFor="Metatype"
          >
            <Select
              id="Metatype"
              items={this.state.categoryTypes}
              itemRenderer={renderMenuItem}
              filterable={false}
              onItemSelect={this.handleMetatypeValueChange}
            >
              <Button text={this.state.metatype.name} rightIcon="double-caret-vertical" intent={typeIntent} />
            </Select>
          </FormGroup>

          <FormGroup
            label="Metavariant"
            labelFor="Metavariant"
          >
            <Select
              id="Metavariant"
              items={this.state.metatypeVariants}
              itemRenderer={renderMenuItem}
              filterable={false}
              onItemSelect={this.handleMetavariantValueChange}
            >
              <Button text={this.state.metavariant.name} rightIcon="double-caret-vertical" intent={variantIntent} />
            </Select>
          </FormGroup>
        </ControlGroup>
      </FormGroup>
    );
  }
}

export default Metatype;
