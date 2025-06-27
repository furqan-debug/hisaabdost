import React, { useEffect } from 'react';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { useAuth } from './lib/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Loading from './pages/Loading';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import { Toaster } from './components/ui/sonner';
import { useOnboarding } from './hooks/useOnboarding';
import { FinnyProvider } from './components/finny/FinnyProvider';
import { MonthProvider } from './hooks/use-month-context';
import { CurrencyProvider } from './components/currency/CurrencyProvider';

setupIonicReact();

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isOnboarded } = useOnboarding();

  // Show loading screen while checking authentication status
  if (isLoading) {
    return <Loading />;
  }

  // Initialize push notifications
  useEffect(() => {
    import('./services/pushNotificationService').then(({ PushNotificationService }) => {
      PushNotificationService.initialize();
    });
  }, []);

  return (
    <IonApp>
      <CurrencyProvider>
        <MonthProvider>
          <FinnyProvider>
            <IonReactRouter>
              <IonRouterOutlet>
                <Route exact path="/">
                  {isAuthenticated ? (
                    isOnboarded ? (
                      <Dashboard />
                    ) : (
                      <Onboarding />
                    )
                  ) : (
                    <Redirect to="/login" />
                  )}
                </Route>
                <Route path="/login">
                  {isAuthenticated ? <Redirect to="/" /> : <Login />}
                </Route>
                <Route path="/register">
                  {isAuthenticated ? <Redirect to="/" /> : <Register />}
                </Route>
                <Route path="/forgot-password">
                  {isAuthenticated ? <Redirect to="/" /> : <ForgotPassword />}
                </Route>
                <Route path="/onboarding">
                  {isAuthenticated ? (isOnboarded ? <Redirect to="/" /> : <Onboarding />) : <Redirect to="/login" />}
                </Route>
                <Route path="/dashboard">
                  {isAuthenticated ? (isOnboarded ? <Dashboard /> : <Redirect to="/onboarding" />) : <Redirect to="/login" />}
                </Route>
                <Route>
                  <Redirect to="/" />
                </Route>
              </IonRouterOutlet>
            </IonReactRouter>
            <Toaster />
          </FinnyProvider>
        </MonthProvider>
      </CurrencyProvider>
    </IonApp>
  );
}

export default App;
