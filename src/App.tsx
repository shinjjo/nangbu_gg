import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import TeamRankings from './pages/TeamRankings';
import ChefList from './pages/ChefList';
import ChefDetail from './pages/ChefDetail';
import RecipeDetail from './pages/RecipeDetail';
import RecipeList from './pages/RecipeList';
import MatchDetail from './pages/MatchDetail';

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<Layout>
                    <ErrorBoundary>
    					<Routes>
    						<Route path="/" element={<Home />} />
    						<Route path="/teams" element={<TeamRankings />} />
    						<Route path="/analysis" element={<ChefList />} /> {/* Using ChefList as temporary Analysis selection */}
    						<Route path="/chef/:id" element={<ChefDetail />} />
    						<Route path="/recipe/:id" element={<RecipeDetail />} />
    						<Route path="/recipes" element={<RecipeList />} />
    						<Route path="/match/:id" element={<MatchDetail />} />
    						<Route
    							path="/settings"
    							element={
    								<div className="p-10 text-center text-slate-500">
    									Settings (Coming Soon)
    								</div>
    							}
    						/>
    					</Routes>
                    </ErrorBoundary>
				</Layout>
			</BrowserRouter>
		</QueryClientProvider>
	);
}

export default App;
