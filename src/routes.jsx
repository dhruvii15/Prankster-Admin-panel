import React, { Suspense, Fragment, lazy } from 'react';
import { Routes, Navigate, Route } from 'react-router-dom';

// project import
import Loader from './components/Loader/Loader';
import AdminLayout from './layouts/AdminLayout';

import { BASE_URL } from './config/constant';
import AdminProtect from './components/AdminProtect';

import Dashboard from './views/dashboard';
import Ads from './views/Ads';
import Cover from './views/Cover';
import AudioCharacter from 'views/AudioCharacter';
import Audio from 'views/Audio';
import Video from 'views/Video';

// ==============================|| ROUTES ||============================== //

const renderRoutes = (routes = []) => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Element = route.element;

        return (
          <Route
            key={i}
            path={route.path}
            exact={route.exact}
            element={
              <Guard>
                <Layout>
                  {route.routes ? renderRoutes(route.routes) : <Element />}
                </Layout>
              </Guard>
            }
          />
        );
      })}
    </Routes>
  </Suspense>
);

export const routes = [
  {
    exact: true,
    path: '/login',
    element: lazy(() => import('./views/Login'))
  },
  {
    path: '*',
    layout: AdminLayout,
    routes: [
      {
        exact: true,
        path: '/dashboard',
        element: () => <AdminProtect><Dashboard /></AdminProtect>
      },
      {
        exact: true,
        path: '/ads',
        element: () => <AdminProtect><Ads /></AdminProtect>
      },
      {
        exact: true,
        path: '/cover',
        element: () => <AdminProtect><Cover /></AdminProtect>
      },
      {
        exact: true,
        path: '/character',
        element: () => <AdminProtect><AudioCharacter /></AdminProtect>
      },
      {
        exact: true,
        path: '/category/audio',
        element: () => <AdminProtect><Audio /></AdminProtect>
      },
      {
        exact: true,
        path: '/category/video',
        element: () => <AdminProtect><Video /></AdminProtect>
      },
      {
        path: '*',
        element: () => <Navigate to={BASE_URL} />
      }
    ]
  },
];

export default renderRoutes;
