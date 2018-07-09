import React, { Component } from 'react';
import './MainView.css';
import io from 'socket.io-client';

class Section extends Component {
  check = (index) => {
    this.props.check(this.props.username, index);
  }
  undo = () => {
    this.props.undo(this.props.username);
  }
  render(){

    const colors = ["blue", "navy", "red", "green", "pink", "purple", "orange"];
    let color = colors[Math.floor(Math.random() * colors.length)];
    let percentage = this.props.items

    return(
      <div className={"section " + color}>
        <div className="section-name">
          {this.props.username}
        </div>
        <canvas id="canvas-one"></canvas>
        <div className="list-container">
          <div className="list-container-inner">
            <ul>
              {this.props.itemsPending.map((item, index) => 
                <li 
                  onClick={() => this.check(index)}
                  key={index}>
                  {item}
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="undo-button" title="Undo" onClick={this.undo}>
          <img src={window.location.origin + "/undo-white.png"} alt="UNDO" />
        </div>
        <div
          className="fill-line"
          style={{
            "height":0,
            "background":color + "-status"
          }}>
        </div>
      </div>
    )
  }
}

class MainView extends Component {
  constructor(props){
    super(props);
    this.state = {
      lists: []
    }
    this.io = io();
  }
  check = (username, index) => {
    return;
    //io.emit();
  }
  undo = (username) => {
    return;
    //io.emit();
  }
  render(){
    
    this.io.on('update', data => {
      this.setState({lists: data.lists});
    });

    if(!this.state.lists.length) return null;
    return(
      <div className="container">
        {this.state.lists.map(user => 
          <Section
            key={user.username}
            itemsPending={user.itemsPending}
            itemCompleted={user.itemsCompleted}
            username={user.username}
            undo={this.undo}
            check={this.check} />
        )}
      </div>
    )
  }
}

export default MainView;