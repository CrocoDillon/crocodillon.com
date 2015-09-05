import React from 'react';
import {RouteHandler, Link} from 'react-router';

class PageComponent extends React.Component {
  render() {
    return (
      <div>
        <h1>My website</h1>
        <Link to="home">HOME</Link>
        <Link to="about">ABOUT</Link>
        <RouteHandler/>
      </div>
    );
  }
}

export default PageComponent;
