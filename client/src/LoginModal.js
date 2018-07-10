import React, { Component } from 'react';
import './loginmodal.css';

class LoginModal extends Component {
  constructor(props){
    super(props);
    this.state = {
      errorCreateAccount: "",
      errorSignIn: "",
      createAccount: {
        username: "",
        password: ""
      },
      signIn: {
        username: "",
        password: ""
      }
    }
  }
  handleUsernameCreateAccount = (event) => {
    let c = this.state.createAccount;
    c.username = event.target.value;
    this.setState({createAccount: c});
  }
  handleUsernameSignIn = (event) => {
    let s = this.state.signIn;
    s.username = event.target.value;
    this.setState({signIn: s});
  }
  handlePasswordCreateAccount = (event) => {
    let c = this.state.createAccount;
    c.password = event.target.value;
    this.setState({createAccount: c});
  }
  handlePasswordSignIn = (event) => {
    let s = this.state.signIn;
    s.password = event.target.value;
    this.setState({signIn: s});
  }
  createAccount = () => {
    let c = this.state.createAccount;
    if(c.username === "" || c.password === "") return;
    fetch('/createAccount', {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(c)
    })
    .then(response => response.json())
    .then(json => {
      if(json.status === "INVALID"){
        this.setState({errorCreateAccount: json.message});
      }else{
        this.setState({errorCreateAccount: ""});
        this.props.signIn(json.username);
      }
    })
    .catch(error => console.error(`Fetch Error =\n`, error));
  }
  signIn = () => {
    let s = this.state.signIn;
    if(s.username === "" || s.password === "") return;
    fetch('/signIn', {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(s)
    })
    .then(response => response.json())
    .then(json => {
      if(json.status === "INVALID"){
        this.setState({errorSignIn: json.message});
      }else{
        this.setState({errorSignIn: ""});
        this.props.signIn(json.username);
      }
    })
    .catch(error => console.error(`Fetch Error =\n`, error));
  }
  render(){
    if(!this.props.visible) return null;
    return(
      <div className="login-modal">
        <div className="login-section">
          <div className="title">
            <span className={this.state.errorCreateAccount ? "error" : ""}>{
            this.state.errorCreateAccount === ""
            ? "Create Account"
            : this.state.errorCreateAccount
          }</span></div>
          <div className="form">
            <label htmlFor="name">Name</label>
            <input type="text" name="name" maxLength="20"
              onChange={this.handleUsernameCreateAccount}/>
            <label htmlFor="password">Password</label>
            <input type="password" name="password" maxLength="20"
              onChange={this.handlePasswordCreateAccount}/>
          </div>
          <div className="submit">
            <div className="submit-btn"
              onClick={this.createAccount}>Create</div>
          </div>
        </div>
        <div className="login-section">
          <div className="title">
            <span className={this.state.errorSignIn ? "error" : ""}>{
            this.state.errorSignIn === ""
            ? "Sign In"
            : this.state.errorSignIn
          }</span></div>
          <div className="form">
            <label htmlFor="name">Name</label>
            <input type="text" name="name" maxLength="20"
              onChange={this.handleUsernameSignIn}/>
            <label htmlFor="password">Password</label>
            <input type="password" name="password" maxLength="20"
              onChange={this.handlePasswordSignIn}/>
          </div>
          <div className="submit">
            <div className="submit-btn"
              onClick={this.signIn}>Login</div>
          </div>
        </div>
      </div>
    )
  }
}

export default LoginModal;