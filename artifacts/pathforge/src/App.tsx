import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { Layout } from './components/Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Level from './pages/Level';
import Gallery from './pages/Gallery';
import Courses from './pages/Courses';
import Lesson from './pages/Lesson';

import StudyGroups from './pages/StudyGroups';
import StudyRoom from './pages/StudyRoom';
import StudyDeck from './pages/StudyDeck';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/lab" component={Home} />
        <Route path="/level/:slug" component={Level} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/courses" component={Courses} />
        <Route path="/courses/:id" component={Lesson} />
        <Route path="/study-groups" component={StudyGroups} />
        <Route path="/study-groups/:roomId" component={StudyRoom} />
        <Route path="/flashcards" component={StudyDeck} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
