import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Rankings from './pages/Rankings';
import ChefList from './pages/ChefList';
import ChefDetail from './pages/ChefDetail';

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<Layout>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/rankings" element={<Rankings />} />
						<Route path="/analysis" element={<ChefList />} /> {/* Using ChefList as temporary Analysis selection */}
						<Route path="/chef/:id" element={<ChefDetail />} />
						<Route
							path="/settings"
							element={
								<div className="p-10 text-center text-slate-500">
									Settings (Coming Soon)
								</div>
							}
						/>
					</Routes>
				</Layout>
			</BrowserRouter>
		</QueryClientProvider>
	);
}

export default App;
