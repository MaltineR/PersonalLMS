import './App.css'
import { Toaster, toast } from 'sonner';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import { useState } from 'react';
import SideBar from './components/SideBar';
import MyLibrary from './pages/MyLibrary';
import TopBar from './components/TopBar';
import IssueBook from './components/modal/IssueNewBook';
import Borrow from './pages/Borrow';
import { Redirect } from './pages/Redirect';
import Store from './pages/Store';
import Explore from './pages/Explore';
import AuthHOC from './hooks/AuthHOC';
import Error from './pages/Error';
import EditBook from './components/modal/EditBook';
import Lent from './pages/Lent';
// Component that uses useLocation (must be inside Router)


function AppContent() {
  const location = useLocation();
  const routesToHide = ['/', '/signup', '/signin'];
  const shouldHideSidebar = routesToHide.includes(location.pathname);

  return (
    <div className='h-screen w-screen'>
      {!shouldHideSidebar && <SideBar />}
      {!shouldHideSidebar && <TopBar />}

      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/mylibrary' element={<MyLibrary />} />
        <Route path='/issuebook' element={<IssueBook />} />
        <Route path='/book/borrow' element={<Borrow />} />
        <Route path='/book/lent' element={<Lent />} />
        <Route path="/google/redirect" element={<Redirect />} />
        <Route path='/store' element={<Store/>}/>
        <Route path='/explore' element={<Explore/>}/>
        <Route path='*' element={<Error />} />
        <Route path='/editbook' element={<EditBook />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster position="bottom-right" richColors />
      <Router>
        <AppContent />
      </Router>
    </>
  )
}

export default App;