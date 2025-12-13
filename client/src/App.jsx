import './App.css';
import { Toaster } from 'sonner';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import MyLibrary from './pages/MyLibrary';
import IssueBook from './components/modal/IssueNewBook';
// import Borrow from './pages/Borrow';
//import Lent from './pages/Lent';
//import Store from './pages/Store';
import Explore from './pages/Explore';
import EditBook from './components/modal/EditBook';
import AdminDashboard from './pages/AdminDashboard';
import { Redirect } from './pages/Redirect';
import Error from './pages/Error';

import SideBar from './components/SideBar';
import TopBar from './components/TopBar';
import AuthHOC from './hooks/AuthHOC';

function AppContent() {
  const location = useLocation();
  const publicRoutes = ['/', '/signin', '/signup'];
  const shouldHideSidebar = publicRoutes.includes(location.pathname);

  return (
    <div className='h-screen w-screen'>
      {/* Sidebar and TopBar only for private routes */}
      {!shouldHideSidebar && <SideBar />}
      {!shouldHideSidebar && <TopBar />}

      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Landing />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/signin' element={<SignIn />} />

        {/* Private User Routes */}
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/mylibrary' element={<MyLibrary />} />
        <Route path='/issuebook' element={<IssueBook />} />
        {/* <Route path='/book/borrow' element={<Borrow />} />
        <Route path='/book/lent' element={<Lent />} />
        <Route path='/store' element={<Store />} />*/}
        <Route path='/explore' element={<Explore />} />
        <Route path='/editbook' element={<EditBook />} />

        {/* Admin Route */}
        <Route path='/admin' element={<AdminDashboard />} />

        {/* OAuth Redirect & Error */}
        <Route path='/google/redirect' element={<Redirect />} />
        <Route path='*' element={<Error />} />
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
