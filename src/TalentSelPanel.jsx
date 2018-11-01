import React from 'react';
import { Button, FormGroup } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import renderMenuItem from './renderMenuItem';
import SourceLink from './SourceLink';

class TalentSelPanel extends React.Component {
  constructor(props) {
    super(props);
    const talentOptions = this.props.talentPrio.talents.talent.map((talent) => {
      return Object.assign(talent, { id: talent.name });
    });
    this.state = {
      talentOptions: talentOptions,
    };
    this.updateTalent = this.updateTalent.bind(this);
  }

  initPanel(character) {
    return { talent: character.priorities.data.talent.talents.talent[0] };
  }

  updateTalent(talent) {
    if (talent !== this.props.talent) {
      // TODO: Qualities, skill selection, spells/complexforms
      this.props.updateCharacter({ talent: talent });
      this.props.updateDemands('talent', talent.hasOwnProperty('forbidden') ? talent.forbidden : null, talent.hasOwnProperty('required') ? talent.required : null);
    }
  }

  render() {
    let talentIntent = null;
    if (! this.state.talentOptions.includes(this.props.talent)) {
      talentIntent = 'warning';
    }
    // TODO: Skill select based on talent
    return (
      <FormGroup 
        helperText={<span>Reference: <SourceLink source="SR5" page="68" /></span>}
      >
        <Select 
          id="Talent" 
          items={this.state.talentOptions} 
          itemRenderer={renderMenuItem} 
          filterable={false} 
          onItemSelect={this.updateTalent}
        >
          <Button intent={talentIntent} text={this.props.talent.name} rightIcon="double-caret-vertical" />
        </Select>
    </FormGroup>);
  }
}

export default TalentSelPanel;