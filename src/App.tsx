import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LandingPage } from './pages/LandingPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { Profile } from './pages/Profile'
import { Onboarding } from './pages/Onboarding'
import { Settings } from './pages/Settings'
import { AICoach } from './pages/AICoach'

import { Explore } from './pages/Explore'
import { Messages } from './pages/Messages'
import { MobileNav } from './components/MobileNav'
import { useAuth } from './contexts/AuthContext'
import { useLocation } from 'react-router-dom'
import { NotFound } from './pages/NotFound'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/coach" element={<AICoach />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && !isLandingPage && <MobileNav />}
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
