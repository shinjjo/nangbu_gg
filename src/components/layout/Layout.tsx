import { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
	children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
	return (
		<div className="min-h-screen bg-slate-50 font-sans text-slate-900">
			{/* Wrapper for Mobile View */}
			<div className="max-w-[600px] mx-auto min-h-screen bg-slate-50 relative shadow-2xl">
				<Header />

				<main className="p-4 pb-24">
					{children}
				</main>
			</div>
		</div>
	);
};

export default Layout;
