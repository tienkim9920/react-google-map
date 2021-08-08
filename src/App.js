import { BrowserRouter, Switch, Route, Link } from 'react-router-dom'
import Home from './component/Home';
import Map from './component/Map';
import './App.css'

function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/map" component={Map} />
        </Switch>
        <Link to='/map'>Map</Link>
      </BrowserRouter>

    </div>
  );
}

export default App;
