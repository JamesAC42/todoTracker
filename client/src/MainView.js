import React, { Component } from 'react';
import './MainView.css';
import EditList from './EditList.js';
import io from 'socket.io-client';

class Section extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editListVisible: false
    }
  }
  check = (index) => {
    if(!this.props.signedIn ) return;
    this.props.check(this.props.list.username, index);
  }
  undo = () => {
    if(!this.props.signedIn) return;
    this.props.undo(this.props.list.username);
  }
  toggleEditList = () => {
    let editListVisible = !this.state.editListVisible;
    this.setState({editListVisible});
  }
  render(){

    //const colors = ["blue", "navy", "red", "green", "pink", "purple", "orange"];

    let complete = this.props.list.itemsCompleted.length;
    let pending = this.props.list.itemsPending.length;
    let height = Math.floor((complete / (complete + pending)) * 100);

    let controlsActive = 
      this.props.signedIn 
      && this.props.currentUser === this.props.list.username

    let itemClass = "list-item";
    if(controlsActive) itemClass += " list-item-hover";

    return(
      <div className={"section " + this.props.list.color}>
        <div className="section-name">
          {this.props.list.username}
        </div>
        <canvas id="canvas-one"></canvas>
        <div className="list-container">
          <div className="list-container-inner">
            {this.props.list.itemsPending.map((item, index) => 
              <div
                className={itemClass}
                onClick={() => this.check(index)}
                key={index}>
                {item}
              </div>
            )}
          </div>
        </div>
        {
          controlsActive &&
          <div className="undo-button" title="Undo" onClick={this.undo}>
            <img src={window.location.origin + "/undo-white.png"} alt="UNDO" />
          </div>
        }
        {
          controlsActive &&
          <div className="show-edit-list" title="Edit List" onClick={this.toggleEditList}>
            <img src={window.location.origin + "/edit.png"} alt="EDIT" />
          </div>
        }
        <div
          className={"fill-line " + this.props.list.color + "-status"} 
          style={{
            "height": height + "vh"
          }}>
        </div>
        <EditList
          visible={this.state.editListVisible}
          list={this.props.list}
          close={this.toggleEditList}/>
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
    this.io = io.connect();
  }
  componentDidMount() {
    this.io.on('update', data => {
      this.setState({lists: data.lists});
    });
  }
  emit = () => {
    let lists = {lists: this.state.lists};
    fetch('/editLists', {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(lists)
    })
    .then(response => response.json())
    .then(json => {
      if(!json.success) console.log(json);
    })
    .catch(error => console.error(`Fetch Error =\n`, error));
  }
  check = (username, index) => {
    if(username !== this.props.username) return;
    let lists = [...this.state.lists];
    for(let i in lists) {
      if(lists[i].username === username) {
        let list = {...lists[i]};
        lists.splice(i, 1);
        let item = list.itemsPending[index];
        list.itemsPending.splice(index, 1);
        list.itemsCompleted.push(item);
        lists.splice(i, 0, list);
      }
    }
    this.setState({lists});
    this.emit();
  }
  undo = (username) => {
    if(username !== this.props.username) return;
    let lists = [...this.state.lists];
    for(let i in lists) {
      if(lists[i].username === username){
        let list = {...lists[i]};
        lists.splice(i, 1);
        let final = list.itemsCompleted.length - 1;
        let item = list.itemsCompleted[final];
        list.itemsCompleted.splice(final, 1);
        list.itemsPending.push(item);
        lists.splice(i, 0, list);
      }
    }
    this.setState({lists});
    this.emit();
  }

  render(){
    if(!this.state.lists.length) return null;
    return(
      <div className="container">
        {this.state.lists.map(user => 
          <Section
            key={user.username}
            signedIn={this.props.signedIn}
            currentUser={this.props.username}
            list={user}
            undo={this.undo}
            check={this.check}/>
        )}
      </div>
    )
  }
}

export default MainView;