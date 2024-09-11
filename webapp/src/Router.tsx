import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GlobalOutletPage, HomePage } from '@pages';
import { UrlTokenSetter } from '@components';

const router = createBrowserRouter([
  {
    path: '/register/:urlToken',
    element: <UrlTokenSetter />,
  },
  {
    path: '/',
    element: <GlobalOutletPage />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
