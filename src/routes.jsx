import React, { Suspense, Fragment, lazy } from 'react';
import { Routes, Navigate, Route } from 'react-router-dom';

// project import
import Loader from './components/Loader/Loader';
import AdminLayout from './layouts/AdminLayout';

import { BASE_URL } from './config/constant';
import AdminProtect from './components/AdminProtect';

import Dashboard from './views/dashboard';
import Ads from './views/Ads';
import MoreAPP from './views/MoreApp';
import CardTitle from './views/CardTitle';
import CardBg from './views/CardBg';
import  Inbox  from './views/Inbox';

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
        path: '/moreApp',
        element: () => <AdminProtect><MoreAPP /></AdminProtect>
      },
      {
        exact: true,
        path: '/cardtitle',
        element: () => <AdminProtect><CardTitle /></AdminProtect>
      },
      {
        exact: true,
        path: '/cardBackground',
        element: () => <AdminProtect><CardBg /></AdminProtect>
      },
      {
        exact: true,
        path: '/notification-inbox',
        element: () => <AdminProtect><Inbox /></AdminProtect>
      },
      {
        path: '*',
        element: () => <Navigate to={BASE_URL} />
      }
    ]
  },
];

export default renderRoutes;
