// Types generated for the API response in the user's message
export interface FileEntry {
	url: string
	active: boolean
}

export interface FilesMap {
	[trackKey: string]: FileEntry
}

export interface SongItem {
	id: string
	chat_id: string
	task_id?: string | null
	prompt?: string | null
	status?: string | null
	title?: string | null
	style?: string | null
	lyrics?: string | null
	author?: string | null
	duration?: number | null
	rating?: number | null
	tags?: string | null
	instrumental?: boolean | null
	current_track_num?: number | null
	download_url?: string | null
	files?: FilesMap | null
	created_at?: string | null
}

export interface Meta {
	limit: number
	offset: number
	total: number
}

export interface SongsResponse {
	success: boolean
	data: SongItem[]
	meta: Meta
}

export type SongsPayload = SongsResponse

