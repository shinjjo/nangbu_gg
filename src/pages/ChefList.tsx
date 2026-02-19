import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import ChefCard from '../components/ChefCard';
import { Chef } from '../types';
import { useWindowVirtualizer } from '@tanstack/react-virtual';

const fetchChefs = async (): Promise<Chef[]> => {
	const { data, error } = await supabase
		.from('chefs')
		.select('*')
		.order('name');

	if (error) {
		throw new Error(error.message);
	}

	return data as unknown as Chef[];
};

const getColumnCount = () => {
	if (typeof window === 'undefined') return 1;
	// Match Tailwind breakpoints (sm: 640, md: 768, lg: 1024)
	if (window.innerWidth >= 1024) return 4;
	if (window.innerWidth >= 768) return 3;
	if (window.innerWidth >= 640) return 2;
	return 1;
};

const ChefList = () => {
	const {
		data: chefs,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['chefs'],
		queryFn: fetchChefs,
	});

	const [columnCount, setColumnCount] = useState(getColumnCount());

	useEffect(() => {
		const handleResize = () => setColumnCount(getColumnCount());
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const chefsList = chefs || [];
	const rowCount = Math.ceil(chefsList.length / columnCount);

	const listRef = useRef<HTMLDivElement | null>(null);

	const virtualizer = useWindowVirtualizer({
		count: rowCount,
		estimateSize: () => 180, // Estimated height of ChefCard (144px) + gap
		overscan: 3,
		scrollMargin: listRef.current?.offsetTop ?? 0,
	});

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center min-h-screen text-red-500">
				Error loading chefs: {error.message}
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8" ref={listRef}>
			<h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
				Naengbu Chefs
			</h1>

			{chefsList.length > 0 && (
				<div
					style={{
						height: `${virtualizer.getTotalSize()}px`,
						width: '100%',
						position: 'relative',
					}}
				>
					{virtualizer.getVirtualItems().map((virtualRow: any) => {
						const fromIndex = virtualRow.index * columnCount;
						const toIndex = Math.min(fromIndex + columnCount, chefsList.length);
						const rowChefs = chefsList.slice(fromIndex, toIndex);

						return (
							<div
								key={virtualRow.key}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									height: `${virtualRow.size}px`,
									transform: `translateY(${virtualRow.start}px)`,
									paddingBottom: '24px', // Acts as gap
								}}
							>
								<div
									style={{
										display: 'grid',
										gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
										gap: '24px',
										height: '100%',
									}}
								>
									{rowChefs.map((chef) => (
										<div key={chef.id}>
											<ChefCard chef={chef} />
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default ChefList;
