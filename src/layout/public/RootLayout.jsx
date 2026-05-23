import { Outlet } from 'react-router-dom';
import NavbarLayout from './NavbarLayout';
import FooterLayout from './FooterLayout';

const RootLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarLayout />
      <main className="flex-1">
        <Outlet />
      </main>
      <FooterLayout />
    </div>
  );
};

export default RootLayout;
