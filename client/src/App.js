import React, { Component } from 'react';
import LoginModal from './LoginModal.js';
import MainView from './MainView.js';
import './index.css';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      loginVisible: false,
      signedIn: false,
      username: null
    }
  }
  toggleModal = () => {
    let visible = !this.state.loginVisible;
    this.setState({loginVisible: visible});
  }
  signIn = (username) => {
    console.log(username);
    this.setState({
      username,
      signedIn: true,
      loginVisible: false
    });
  }
  render() {
    return (
      <div>
        { !this.state.signedIn && 
          <div 
            className="login-btn"
            onClick={this.toggleModal}>
            Sign In
          </div>
        }
        { this.state.signedIn &&
          <div
            className="usernameLabel">
            {this.state.username}
          </div>
        }
        <LoginModal 
          visible={this.state.loginVisible} 
          signIn={this.signIn}/>
        <MainView 
          signedIn={this.state.signedIn}
          username={this.state.username}/>
        <div
          className="no-lists-message">
          No lists have been created by the admin yet.
          Sign in or make an account to participate.
        </div>
      </div>
    );
  }
}

export default App;
