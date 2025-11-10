export type PaginationMeta = {
  offset: number;
  limit: number;
  total: number;
};

export type ApiSuccessResponse<TData> = {
  success: true;
  data: TData;
  meta?: PaginationMeta;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
};

export type LoginRequest = {
  initData: string;
};

export type LoginResponseData = {
  token: string;
};

export type LoginResponse = ApiSuccessResponse<LoginResponseData>;

export type SongGenerationType =
  | "scenario"
  | "photo"
  | "text"
  | "style"
  | "link";

export type GenerationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type SongDto = {
  id: string;
  status: string;
  prompt?: string;
  title?: string;
  style?: string;
  lyrics?: string;
  author?: string;
  rating?: number;
  duration?: number;
  created_at: string;
  updated_at: string;
  download_url?: string;
  files?: unknown[];
  error_message?: string;
  error_type?: string;
};

export type GenerationDto = {
  id: string;
  generation_type: SongGenerationType;
  status: GenerationStatus;
  prompt: string;
  template_id?: string;
  song_id?: string;
  song?: SongDto;
  generated_lyrics?: string;
  generated_title?: string;
  generated_style?: string;
  suno_task_id?: string;
  error_type?: string;
  error_message?: string;
  metadata?: unknown[];
  gpt_started_at?: string;
  gpt_completed_at?: string;
  suno_started_at?: string;
  suno_completed_at?: string;
  created_at: string;
  updated_at: string;
};

export type GetGenerationsQuery = {
  status?: GenerationStatus;
  limit?: number;
  offset?: number;
};

export type GetGenerationsResponse = ApiSuccessResponse<GenerationDto[]>;

export type CreateGenerationRequest = {
  prompt: string;
  type?: SongGenerationType;
  template_id?: string;
  template_artist_id?: string;
  metadata?: unknown[];
};

export type CreateGenerationResponseData = {
  generation_id: string;
  status: GenerationStatus;
  remaining_limit: number;
};

export type CreateGenerationResponse =
  ApiSuccessResponse<CreateGenerationResponseData>;

export type GetGenerationByIdResponse = ApiSuccessResponse<GenerationDto>;

export type GetMeResponse = ApiSuccessResponse<Record<string, unknown>>;
