import React,  { Component } from 'react';
import './EditList.css';

class EditList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            itemsPending: [],
            itemsCompleted: []
        }
    }
    componentDidMount() {
        const list = {...this.props.list}
        this.setState({
            itemsPending: list.itemsPending,
            itemsCompleted: list.itemsCompleted
        });
    }
    componentWillReceiveProps(props){
        const list = {...this.props.list}
        this.setState({
            itemsPending: list.itemsPending,
            itemsCompleted: list.itemsCompleted
        });
    }
    updatePending = (e) => {
        const text = e.target.value.split(/\r?\n/g);
        this.setState({itemsPending: text});
    }
    updateCompleted = (e) => {
        const text = e.target.value.split(/\r?\n/g);
        this.setState({itemsCompleted: text});
    }
    apply = () => {
        let pending = [...this.state.itemsPending];
        let completed = [...this.state.itemsCompleted];
        pending = pending.filter(item => {return item !== ""});
        completed = completed.filter(item => {return item !== ""});
        const newUserList = {...this.props.list};
        newUserList.itemsCompleted = completed;
        newUserList.itemsPending = pending;
        fetch('/editListUser', {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({item: newUserList})
        })
        .then(response => response.json())
        .then(json => {
            if(!json.success) console.log(json);
            this.props.close();
        })
        .catch(error => console.error(`Fetch Error =\n`, error));
    }
    render() {
        if(!this.props.visible) return null;
        return(
            <div className="edit-list">
                <div className="edit-list-section section-text-area">
                    <div className="text-area-label">Pending Items</div>
                    <textarea 
                        className="edit-list-area items-pending"
                        onChange={this.updatePending}
                        value={
                            this.state.itemsPending.join("\n")
                        }>
                    </textarea>
                </div>
                <div className="edit-list-section section-text-area">
                    <div className="text-area-label">Completed Items</div>
                    <textarea 
                        className="edit-list-area items-completed"
                        onChange={this.updateCompleted}
                        value={                            
                            this.state.itemsCompleted.join("\n")
                        }>
                    </textarea>
                </div>
                <div className="edit-list-section section-controls">
                    <div className="buttons-container">
                        <div 
                            className="edit-btn apply-btn"
                            onClick={this.apply}>
                            Apply
                        </div>
                        <div 
                            className="edit-btn close-btn"
                            onClick={this.props.close}>
                            Close
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default EditList;