import React from 'react';
import { Button, Classes, FormGroup, Dialog, InputGroup, RadioGroup, Radio } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { v4 as uuid } from 'uuid';
import renderMenuItem from './renderMenuItem';

class SkillSpecDialog extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      addingCustomType: null,
      addingCustomName: null,
      selectedSpec: null,
      payWith: 'base',
    };

    this.changeSelectedSpec = this.changeSelectedSpec.bind(this);
    this.changeCustomName = this.changeCustomName.bind(this);
    this.changePayWith = this.changePayWith.bind(this);
    this.submitSpec = this.submitSpec.bind(this);
    this.closeSpecAdd = this.closeSpecAdd.bind(this);
  }

  changeSelectedSpec(spec) {
    let stateUpdate = { selectedSpec: spec };
    if (spec.isCustomCategory) {
      stateUpdate.addingCustomType = spec.name.slice(1, -1);
    }
    this.setState(stateUpdate);
  }

  changeCustomName(event) {
    this.setState({ addingCustomName: event.target.value });
  }

  changePayWith(event) {
    this.setState({ payWith: event.currentTarget.value });
  }

  submitSpec() {
    let spec;
    if (this.state.addingCustomName) {
      spec = {
        id: uuid(),
        name: this.state.addingCustomName,
        isCustomCategory: false,
        isCustom: true
      };
    } else if (this.state.selectedSpec === null) {
      spec = this.props.specAddSkill.specOptions[0];
    } else {
      spec = this.state.selectedSpec;
    }
    this.props.addSpec(this.props.specAddSkill, Object.assign(spec, { type: this.state.payWith }));
    this.closeSpecAdd();
  }

  closeSpecAdd() {
    this.setState({
      addingCustomType: null,
      addingCustomName: null,
      selectedSpec: null,
      payWith: 'base'
    });
    this.props.closeSpecAdd();
  }

  render() {
    if (this.props.specAddSkill !== null) {
      const specAddSkill = this.props.specAddSkill;

      let specInput = null;

      if (this.state.addingCustomType) {
        specInput = (
          <FormGroup
            labelFor="custom-spec"
            helperText={"Enter a " + this.state.addingCustomType + " specialization."}
          >
            <InputGroup
              id="custom-spec"
              placeholder={this.state.addingCustomType}
              onChange={this.changeCustomName}
            />
          </FormGroup>
        );
      } else {
        specInput = (
          <FormGroup
            labelFor="spec"
            helperText="Select a specialization to add"
          >
            <Select
              id="spec"
              items={this.props.specAddSkill.specOptions}
              itemRenderer={renderMenuItem}
              filterable={false}
              onItemSelect={this.changeSelectedSpec}
            >
              <Button text={this.state.selectedSpec ? this.state.selectedSpec.name : specAddSkill.specOptions[0].name} rightIcon="double-caret-vertical" />
            </Select>
          </FormGroup>
        );
      }
      return (
        <Dialog
          isOpen={true}
          onClose={this.closeSpecAdd}
          title="Add specialization"
          className={Classes.DARK}
        >
          <div className="rb-dialog-content rb-spec-add-dialog">
            {specInput}
            <FormGroup
              labelFor="rb-karma-radio"
              helperText="Use skill points or karma to pay for the specialization"
            >
              <RadioGroup
                onChange={this.changePayWith}
                selectedValue={this.state.payWith}
                inline={true}
                id="rb-karma-radio"
              >
                <Radio label="Skill Points" value="base" />
                <Radio label="Karma" value="karma" />
              </RadioGroup>
            </FormGroup>
            <div>
              <Button fill={false} icon="add" onClick={this.submitSpec}>Add</Button>
              <Button fill={false} icon="delete" onClick={this.closeSpecAdd}>Cancel</Button>
            </div>
          </div>
        </Dialog>
      );
    }

    return null;
  }
}

export default SkillSpecDialog;
