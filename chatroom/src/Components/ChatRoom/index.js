import React from "react";
import uniqid from "uniqid";
import { Grid, Input, Header } from 'semantic-ui-react'
import Comment from "semantic-ui-react/dist/commonjs/views/Comment/Comment";
import "./chatroom.css";
import io from "socket.io-client";
import List from "semantic-ui-react/dist/commonjs/elements/List/List";
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment/Segment";
import ReactList from 'react-list';



class Chat extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            currentMessage: "",
            currentRoom: "",
            currentUser: "",
            messages: [],
            rooms: [],
        };
        this.socket = io.connect('http://localhost');
    }

    componentDidMount() {
        this.socket.emit("LOGIN");
        this.socket.on("LOGIN_SUCCESS", res => {
            this.setState({
                currentUser: res.user,
                rooms: res.rooms,
                room: res.room
            });
            alert(`${res.user} you logged  in!`);
        });
        // this.socket.on('RECEIVE_MESSAGE', function(data){
        //     addMessage(data);
        // });
        // const addMessage = data => {
        //     this.setState({messages: [...this.state.messages.filter(el => el.room === data.room), data]});
        // };
        //
        // this.socket.on('ROOM_CHANGE_RECEIVE', (data) => {
        //     let room = data.roomChangeTo;
        //     if (!this.state.rooms.includes(room)) {
        //         this.setState({rooms: [...this.state.rooms, room]});
        //     }
        //     this.setState({currentRoom: room});
        // });
    }

    changeHandler = (event) => {
        this.setState({currentMessage: event.target.value});
    };

    submitHandler =(event) => {
        event.preventDefault();
        let input = this.state.currentMessage;
        this.setState({currentMessage: ''});
        if (this.state.currentRoom === "" && input.split(" ")[0] !== "/join" && input.split(" ")[0] !== "/nick") {
            return alert("You have to choose a room first!");
        }
        // If input starts with "/nick [username]", this operation just set current user
        if (input.split(" ")[0] === "/nick") {
            this.setState({currentUser: input.split(" ").slice(1).join()});
        } else if (input.split(" ")[0] === "/join") {
            let roomCreated = input.split(" ").slice(1).join();
            this.socket.emit('ROOM_CHANGE', {
                roomChangeTo:  roomCreated
            });
        }else {
            this.socket.emit('SEND_MESSAGE', {
                author: this.state.currentUser,
                message: this.state.currentMessage,
                id: uniqid(),
                room: this.state.currentRoom
            });
        }

    };
    renderItem = (index) =>{
        return (
            <Comment key={this.state.messages[index].id}>
                <Comment.Content>
                    <Comment.Author style={{ color: "blue" }}>{this.state.messages[index].author}:</Comment.Author>
                    <Comment.Text>
                        {this.state.messages[index].message}
                    </Comment.Text>
                </Comment.Content>
            </Comment>
        )
    };


    render(){
        return (
            <div>
                <div className="ui fixed borderless inverted menu">
                    <div className="ui container">
                        <a className="header item">You are {this.state.currentUser}</a>
                        <a className="header item">Your room is {this.state.currentRoom}</a>
                    </div>
                </div>
                <div className="ui grid massive message">
                    <Grid.Row style={{ height: 500 }}>
                        <Grid.Column width={13}>
                            <div className="ui container">
                                <Comment.Group size='massive'>
                                    <Header as='h3' dividing>
                                        Messages
                                    </Header>
                                    <div style={{overflow: 'auto', height: 400}} >
                                        <ReactList
                                            itemRenderer={this.renderItem}
                                            initialIndex={this.state.messages.length > 5 ? this.state.messages.length - 5 : 0}
                                            length={this.state.messages.length}
                                            type='uniform'
                                        />
                                    </div>
                                    {/*{*/}
                                        {/*this.state.messages.map(el => {*/}
                                            {/*return (*/}
                                                {/*<Comment key={el.id}>*/}
                                                    {/*<Comment.Content>*/}
                                                        {/*<Comment.Author style={{ color: "blue" }}>{el.author}:</Comment.Author>*/}
                                                        {/*<Comment.Text>*/}
                                                            {/*{el.message}*/}
                                                        {/*</Comment.Text>*/}
                                                    {/*</Comment.Content>*/}
                                                {/*</Comment>*/}
                                            {/*)*/}
                                        {/*})*/}
                                    {/*}*/}
                                </Comment.Group>
                            </div>
                        </Grid.Column>
                        <Grid.Column width={3}>
                            <div className="ui container">
                                <Header as='h2'>Rooms:</Header>
                                <Segment style={{overflow: 'auto', height: 400 }}>
                                    <List>
                                        {
                                            this.state.rooms.map(el => {
                                                return <List.Item key={el.index}>{el}</List.Item>
                                            })
                                        }
                                    </List>
                                </Segment>
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                    <div className="ui container">
                        <form onSubmit={this.submitHandler}>
                            <Input focus fluid placeholder='Type here...' value={this.state.currentMessage} onChange={this.changeHandler}/>
                        </form>
                    </div>
                </div>
                <div className="ui container">
                    <p>Chat commands:</p>
                    <li>Change nickname: /nick [username]</li>
                    <li>Join/Create: /join [room name]</li>
                </div>
            </div>
        );
    }
}

export default Chat;