import React from 'react';
import config from './config.js';

class ConfigPanel extends React.Component {
    constructor(props) {
        super();
        this.state = {
            nodeRestURL: config.restURL,
            authToken: config.authToken,
        }

        this.setNodeRestURL = this.setNodeRestURL.bind(this);
        this.setAuthToken = this.setAuthToken.bind(this);
        this.save = this.save.bind(this);
    }

    save() {
        config.restURL = this.state.nodeRestURL;
        config.authToken = this.state.authToken;

        this.props.onSave();
    }

    setNodeRestURL(e) {
        const value = e.target.value;
        this.setState({ nodeRestURL: value });
    }

    setAuthToken(e) {
        const value = e.target.value;
        this.setState({ authToken: value });
    }

    render() {
        return (
            <div className = {'modal ' + this.props.className} >
                <div onClick={this.props.handleClose} className='modal__background'></div>
                <div className = 'modal__content card' >
                    <p>Config</p>
                    
                    <button className='modal__close-button button' onClick={this.props.handleClose}>Close</button>
                    
                    <label className='page__element input-group'>Hopr Node http  url:
                        <input className='input-group__input' type='text'
                            value={this.state.nodeRestURL} onChange={this.setNodeRestURL}
                            placeholder='http://hoprnode.io' />
                    </label>

                    <label className='page__element input-group'>HOPR authentication code:
                        <input className='input-group__input' type='text' value={this.state.authToken} onChange={this.setAuthToken} />
                    </label>

                    <button className='button button_primary' onClick={this.save}>Save</button>
                </div>
            </div>
        );
    }
}

export default ConfigPanel
