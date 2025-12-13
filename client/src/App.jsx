import './App.css';
import { Toaster } from 'sonner';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import MyLibrary from './pages/MyLibrary';
import Explore from './pages/Explore';
import AdminBooks from './pages/AdminBooks';
import AdminUsers from './pages/AdminUsers';
import Error from './pages/Error';

import SideBar from './components/SideBar';
import TopBar from './components/TopBar';
import AuthHOC from './hooks/AuthHOC';
import DashboardRedirect from './pages/DashboardRedirect';

function AppContent() {
  const location = useLocation();
  const publicRoutes = ['/', '/signup', '/signin'];
  const shouldHideSidebar = publicRoutes.includes(location.pathname);

  return (
    <div className="h-screen w-screen">
      {!shouldHideSidebar && <SideBar />}
      {!shouldHideSidebar && <TopBar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />

        {/* Role-based Redirect */}
        <Route path="/dashboardredirect" element={<DashboardRedirect />} />

        {/* User Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mylibrary" element={<MyLibrary />} />
        <Route path="/explore" element={<Explore />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/books" element={<AdminBooks />} />
        <Route path="/admin/users" element={<AdminUsers />} />

        {/* Error */}
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster position="bottom-right" richColors />
      <Router>
        <AuthHOC>
          <AppContent />
        </AuthHOC>
      </Router>
    </>
  );
}

export default App;
