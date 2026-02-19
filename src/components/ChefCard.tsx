import { Chef } from '../types';
import { getChefAvatar } from '../utils/chefAvatars';

interface ChefCardProps {
	chef: Chef;
}

const ChefCard = ({ chef }: ChefCardProps) => {
	return (
		<div className="bg-white rounded-none shadow-sm border-l-4 border-slate-900 overflow-hidden hover:shadow-lg transition-all duration-300 relative group">
			{/* Rank Badge - Optional visualization */}
			<div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 z-10">
				CHEF
			</div>

			<div className="flex flex-row h-36">
				{/* Image Section */}
				<div className="w-32 flex-shrink-0 relative overflow-hidden bg-slate-100">
					<img
						src={getChefAvatar(chef.name, chef.image_url)}
						alt={chef.name}
						className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
					/>
				</div>

				{/* Content Section */}
				<div className="flex-1 p-3 flex flex-col justify-between bg-white relative">
					<div>
						<div className="flex items-end baseline">
							<h3 className="text-xl font-black text-slate-900 leading-none tracking-tight">
								{chef.name}
							</h3>
							<span className="text-[10px] text-slate-400 font-medium ml-1 mb-0.5">
								{chef.english_name}
							</span>
						</div>
						<div className="w-8 h-0.5 bg-red-600 mt-2 mb-1"></div>
					</div>

					{chef.bio && (
						<p className="text-xs text-slate-500 line-clamp-2 mt-1">{chef.bio}</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default ChefCard;
