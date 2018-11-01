import React from 'react';
import { Button, ControlGroup, FormGroup } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";

import renderMenuItem from './renderMenuItem';
import getMetatypes from './getMetatypes';
import SourceLink from './SourceLink';

class MetatypePanel extends React.Component {
  constructor(props) {
    super(props);

    let metatypeCategories = this.getMetatypeCategories(this.props.metaPrio, this.props.demands);
    let metatypes = getMetatypes(this.props.meta.category, this.props.metaPrio, this.props.demands);
    
    this.state = {
      categoryTypes: metatypes,
      metatypeVariants: this.getMetavariants(this.props.meta.metatype, this.props.metaPrio, this.props.demands),
    };

    this.state.metatypeCategories = metatypeCategories;

    this.handleCategoryValueChange = this.handleCategoryValueChange.bind(this);
    this.handleMetatypeValueChange = this.handleMetatypeValueChange.bind(this);
    this.handleMetavariantValueChange = this.handleMetavariantValueChange.bind(this);
  }

  initPanel(character) {
    const metatypes = getMetatypes({ id: 0, name: "Metahuman" }, character.priorities.data.meta, character.demands);
    return { 
      meta: {
        category: { id: 0, name: "Metahuman" },
        metatype: metatypes[0],
        metavariant: null
      } 
    };
  }

  getMetatypeCategories(metaPrio, demands) {
    let metatypeCategories = [
      {id: 0, name: "Metahuman"}
    ];

    if (['A,4', 'B,3', 'C,2'].includes(metaPrio.value)) {
      metatypeCategories.push({id: 1, name: "Metasapient"});
      metatypeCategories.push({id: 2, name: "Shapeshifter"});
    }

    const excludes = demands.getDemandValues('excludes', 'metatypecategory');
    const requires = demands.getDemandValues('requires', 'metatypecategory');

    return metatypeCategories.filter(cat => (
      (! excludes.includes(cat.name)) &&
      ((requires.length === 0) || requires.includes(cat.name))
    ));
  }

  getMetavariants(metatype, metaPrio, demands) {
    let metavariants = [];
    if (metatype.hasOwnProperty('metavariants')) {
      if (Array.isArray(metatype.metavariants.metavariant)) {
        metavariants = Array.from(metatype.metavariants.metavariant);
      } else {
        metavariants = [metatype.metavariants.metavariant];
      }
    }

    const excludes = demands.getDemandValues('excludes', 'metavariant');
    const requires = demands.getDemandValues('requires', 'metavariant');

    metavariants.filter(metavariant => (
      metaPrio.allowedMetavariants.includes(metavariant.name) &&
      (! excludes.includes(metavariant.name)) &&
      ((requires.length === 0) || requires.includes(metavariant.name))
    ));

    // If a metavariant is required, it's not going to match this metatype we tack onto the list of metavariants
    if (requires.length === 0) {
      metavariants.unshift(metatype);
    }

    metavariants = metavariants.map((m, index) => {
      m.id = m.name;
      return m;
    });

    return metavariants;
  }

  handleCategoryValueChange(item) {
    // If the category actually changed, reset the metatype select
    if (this.props.meta.category !== item) {
      const metatypes = getMetatypes(this.state.metatypeCategories[item.id], this.props.metaPrio, this.props.demands);

      this.setState({
        categoryTypes: metatypes,
        metatypeVariants: this.getMetavariants(metatypes[0], this.props.metaPrio, this.props.demands),
      });

      this.updateMeta({
        category: item,
        metatype: (metatypes.length === 0) ? this.props.meta.metatype : metatypes[0],
        metavariant: null
      });
    }
  }

  handleMetatypeValueChange(item) {
    // If the metatype actually changed, reset the metavariant select
    if (this.props.meta.metatype !== item) {
      this.setState({
        metatypeVariants: this.getMetavariants(item, this.props.metaPrio, this.props.demands),
      });
      this.updateMeta({
        metatype: item,
        metavariant: null
      });
    }
  }

  handleMetavariantValueChange(item) {
    if (this.props.meta.metavariant !== item) {
      this.updateMeta({
        metavariant: (item !== this.props.meta.metatype) ? item : null
      });
    }
  }

  updateMeta(elements) {
    this.props.updateCharacter({ meta: Object.assign(this.props.meta, elements) });
  }

  render() {
    let metavariant = this.props.meta.metavariant ? this.props.meta.metavariant : this.props.meta.metatype; 

    let catIntent = this.state.metatypeCategories.find(function(item) {return (item.id === this.props.meta.category.id);}, this) ? 'none' : 'warning';
    let typeIntent = ((catIntent !== 'warning') && this.state.categoryTypes.includes(this.props.meta.metatype)) ? 'none' : 'warning';
    let variantIntent = ((typeIntent !== 'warning') && this.state.metatypeVariants.includes(metavariant)) ? 'none' : 'warning';

    return (
      <FormGroup
        helperText={<span>Reference: <SourceLink source={metavariant.source} page={metavariant.page} /></span>}
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
              <Button text={this.props.meta.category.name} rightIcon="double-caret-vertical" intent={catIntent} />
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
              <Button text={this.props.meta.metatype.name} rightIcon="double-caret-vertical" intent={typeIntent} />
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
              <Button text={metavariant.name} rightIcon="double-caret-vertical" intent={variantIntent} />
            </Select>
          </FormGroup>
        </ControlGroup>
      </FormGroup>
    );
  }
}

export default MetatypePanel;