import React from 'react';
import { Button, FormGroup } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import renderMenuItem from './renderMenuItem';
import SourceLink from './SourceLink';
import gameOptions from './data/gameplayoptions';

class GameOptionsPanel extends React.Component {
  /**
   * Constructor
   *
   * @param {Object} props Component props
   */
  constructor(props) {
    super(props);
    this.updateGameOptions = this.updateGameOptions.bind(this);
  }

  /**
   * Return the values from the panel to initialize the character
   *
   * @return {Object} The default gameoptions values
   */
  initPanel() {
    return { gameOptions: gameOptions.chummer.gameplayoptions.gameplayoption[0], karmaRemaining: gameOptions.chummer.gameplayoptions.gameplayoption[0].karma };
  }

  /**
   * Update game play options in the character object
   *
   * @param  {Object} item An object with the game play options
   */
  updateGameOptions(item) {
    this.props.updateCharacter({
      gameOptions: item,
      karmaRemaining: this.props.gameOptions.hasOwnProperty('karma') ? item.karma - (this.props.gameOptions.karma - this.props.karmaRemaining) : item.karma
    });
  }

  /**
   * Render the component
   * @return {JSX} Component content
   */
  render() {
    const buttonVal = this.props.gameOptions.name;
    return (
      <FormGroup
        label="Runner Level"
        labelFor="RunnerLevel"
        helperText={<span>Reference: <SourceLink source="SR5" page="64" /></span>}
      >
        <Select
          id="RunnerLevel"
          items={gameOptions.chummer.gameplayoptions.gameplayoption}
          itemRenderer={renderMenuItem}
          filterable={false}
          onItemSelect={this.updateGameOptions}
        >
          <Button text={buttonVal} rightIcon="double-caret-vertical" />
        </Select>
      </FormGroup>
    );
  }
}

export default GameOptionsPanel;
