import { useState, useRef, useEffect } from 'react';
import { Search, MoreVertical, Home as HomeIcon, Trophy } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const location = useLocation();

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Close menu on route change
	useEffect(() => {
		setMenuOpen(false);
	}, [location]);

	return (
		<header className="sticky top-0 z-50 bg-white border-b border-slate-200">
			<div className="max-w-[600px] mx-auto px-4 h-14 flex items-center justify-between relative">
				{/* Logo */}
				<div className="flex items-center">
					<Link to="/" className="text-xl font-black text-slate-900 tracking-tighter cursor-pointer hover:text-amber-600 transition-colors">
						Naengbu.gg
					</Link>
				</div>

				{/* Actions */}
				<div className="flex items-center space-x-1">
					<button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
						<Search size={22} strokeWidth={2.5} />
					</button>

					{/* Dropdown Menu Container */}
					<div className="relative" ref={menuRef}>
						<button
							onClick={() => setMenuOpen(!menuOpen)}
							className={`p-2 rounded-full transition-colors ${menuOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
						>
							<MoreVertical size={22} strokeWidth={2.5} />
						</button>

						{/* Dropdown Content */}
						{menuOpen && (
							<div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 overflow-hidden">
								<Link
									to="/"
									className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors
                    ${location.pathname === '/' ? 'bg-amber-50 text-amber-600' : 'text-slate-700 hover:bg-slate-50'}`}
								>
									<HomeIcon size={18} />
									Home
								</Link>
								<Link
									to="/rankings"
									className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors
                    ${location.pathname === '/rankings' ? 'bg-amber-50 text-amber-600' : 'text-slate-700 hover:bg-slate-50'}`}
								>
									<Trophy size={18} />
									순위보기
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
