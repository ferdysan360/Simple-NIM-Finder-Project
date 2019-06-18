import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
// import GetForm from './components/GetForm';
import PostForm from './components/PostForm';

class App extends Component {
	render() {
		return (
			<div className="App">
				<PostForm />
				{ /*<GetForm />*/ }
			</div>
		)
	}
}

export default App;
