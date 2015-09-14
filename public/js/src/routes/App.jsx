import React from 'react';
import { Link } from 'react-router';

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>My website</h1>
        <Link to="/" activeClassName="active">HOME</Link>
        <Link to="/about" activeClassName="active">ABOUT</Link>
        {this.props.children}
      </div>
    );
  }
}

export default App;
