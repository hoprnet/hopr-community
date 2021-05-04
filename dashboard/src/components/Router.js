import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Home from '../screens/Home';
import NodeScreen from '../screens/Node';

const Router = () => {
  return (
    <Switch>
      <Route path="/" component={Home} exact />
      <Route path="/node" component={NodeScreen} />
    </Switch>
  );
};

export default Router;
