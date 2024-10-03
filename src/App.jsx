import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// project-import
import renderRoutes, { routes } from './routes';

// ==============================|| APP ||============================== //

const App = () => {
  return <BrowserRouter basename={'/admin'}>{renderRoutes(routes)}</BrowserRouter>;
};

export default App;
