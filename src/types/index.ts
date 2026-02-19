export interface Chef {
	id: string;
	name: string;
	english_name?: string;
	image_url?: string;
	bio?: string;
	created_at?: string;
}

export interface Guest {
	id: string;
	name: string;
	image_url?: string;
	job?: string;
	created_at?: string;
}

export interface Episode {
	id: string;
	season: number;
	number: number;
	title?: string;
	aired_at: string;
	created_at?: string;
}

export interface Match {
	id: string;
	episode_id: string;
	guest_id?: string;
	chef_1_id: string;
	chef_2_id: string;
	winner_id: string | null;
	topic: string;
	created_at?: string;
	// Joined relations
	chef_1?: { name: string; image_url: string } | null;
	chef_2?: { name: string; image_url: string } | null;
	episode?: Episode | null;
	guest?: Guest | null;
	recipes?: Recipe[] | null;
}

export interface Recipe {
	id: string;
	match_id: string;
	chef_id: string;
	name: string;
	description?: string;
	image_url?: string;
	video_url?: string;
	is_winner?: boolean;
	created_at?: string;
}
