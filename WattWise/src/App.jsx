import AppShell from './components/AppShell.jsx';
import ToastProvider from './components/ToastProvider.jsx';
import { WorkspaceProvider } from './context/WorkspaceContext.jsx';
import { useRoute } from './lib/router.js';
import Budget from './pages/Budget.jsx';
import Devices from './pages/Devices.jsx';
import EmergencyPlan from './pages/EmergencyPlan.jsx';
import Landing from './pages/Landing.jsx';
import Overview from './pages/Overview.jsx';
import Profile from './pages/Profile.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import './styles/app.css';

/** Pages that live inside the workspace shell (sidebar + top bar). */
const WORKSPACE_ROUTES = {
  '/overview': Overview,
  '/devices': Devices,
  '/budget': Budget,
  '/plan': EmergencyPlan,
  '/profile': Profile,
};

/** Full-bleed pages with their own layout. */
const PUBLIC_ROUTES = {
  '/': Landing,
  '/signin': SignIn,
  '/signup': SignUp,
};

function Router() {
  const route = useRoute();

  const PublicPage = PUBLIC_ROUTES[route];
  if (PublicPage) return <PublicPage />;

  const WorkspacePage = WORKSPACE_ROUTES[route];
  if (WorkspacePage) {
    return (
      <AppShell route={route}>
        <WorkspacePage />
      </AppShell>
    );
  }

  return (
    <AppShell route="/overview">
      <div className="page-head">
        <div>
          <p className="eyebrow">PAGE NOT FOUND</p>
          <h1 className="page-title">We couldn&rsquo;t find that page</h1>
          <p className="page-sub">
            The link may be out of date. Head back to your energy overview.
          </p>
        </div>
        <a className="btn btn--primary" href="#/overview">
          Go to overview
        </a>
      </div>
    </AppShell>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <ToastProvider>
        <Router />
      </ToastProvider>
    </WorkspaceProvider>
  );
}
