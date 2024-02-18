import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from '@/pages/Home.page';
import { UrlTokenSetter } from '@/components/UI/UrlTokenSetter';
import { GlobalOutletPage } from '@/pages/GlobalOutlet.page';

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
