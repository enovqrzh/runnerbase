import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import CharacterSheet from './CharacterSheet';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<CharacterSheet />, document.getElementById('root'));
registerServiceWorker();
