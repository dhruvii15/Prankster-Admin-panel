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
import Category from 'views/Category';
import Audio from 'views/Audio';
import Video from 'views/Video';
import Gallery from 'views/Gallery';
import UserGallery from 'views/UserGallery';
import Spin from 'views/Spin';

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
        path: '/category',
        element: () => <AdminProtect><Category /></AdminProtect>
      },
      {
        exact: true,
        path: '/type/audio',
        element: () => <AdminProtect><Audio /></AdminProtect>
      },
      {
        exact: true,
        path: '/type/video',
        element: () => <AdminProtect><Video /></AdminProtect>
      },
      {
        exact: true,
        path: '/type/gallery',
        element: () => <AdminProtect><Gallery /></AdminProtect>
      },//==================================
      {
        exact: true,
        path: '/spin/prank',
        element: () => <AdminProtect><Spin /></AdminProtect>
      },
      {
        exact: true,
        path: '/user/gallery',
        element: () => <AdminProtect><UserGallery /></AdminProtect>
      },
      {
        path: '*',
        element: () => <Navigate to={BASE_URL} />
      }
    ]
  },
];

export default renderRoutes;
