import { motion, AnimatePresence } from 'framer-motion';
import { Chef } from '../../types';
import { X } from 'lucide-react';
import { getChefAvatar } from '../../utils/chefAvatars';

interface ChefSelectorModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (chef: Chef) => void;
	chefs: Chef[];
	selectedChefId?: string | null;
}

const ChefSelectorModal = ({ isOpen, onClose, onSelect, chefs, selectedChefId }: ChefSelectorModalProps) => {
	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
					/>

					{/* Modal */}
					<motion.div
						className="fixed bottom-0 left-0 right-0 md:top-1/2 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-[600px] bg-white rounded-t-3xl md:rounded-3xl p-6 shadow-2xl pb-10 md:pb-6"
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "100%" }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
					>
						<div className="flex justify-between items-center mb-6">
							<h3 className="text-xl font-black text-slate-900">
								셰프 선택
							</h3>
							<button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
								<X size={20} className="text-slate-500" />
							</button>
						</div>

						<div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-1">
							{chefs.map((chef: Chef) => (
								<motion.button
									key={chef.id}
									className={`relative p-3 rounded-2xl border-2 text-left flex flex-col items-center space-y-2 transition-colors ${selectedChefId === chef.id
										? 'border-orange-500 bg-orange-50'
										: 'border-slate-100 bg-white hover:border-orange-200'
										}`}
									onClick={() => onSelect(chef)}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.95 }}
								>
									<div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200">
										<img src={getChefAvatar(chef.name, chef.image_url)} alt={chef.name} className="w-full h-full object-cover" />
									</div>
									<div className="text-center">
										<span className="block text-sm font-bold text-slate-900">{chef.name}</span>
										<span className="block text-[10px] text-slate-500">{chef.english_name || 'Chef'}</span>
									</div>
									{selectedChefId === chef.id && (
										<div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full shadow-sm" />
									)}
								</motion.button>
							))}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};

export default ChefSelectorModal;
