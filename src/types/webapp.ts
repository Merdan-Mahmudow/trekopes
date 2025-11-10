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

export type SongFileEntry = {
  url?: string;
  active?: boolean;
  [key: string]: unknown;
};

export type SongDto = {
  id: string;
  status: string;
  prompt?: string | null;
  title?: string | null;
  style?: string | null;
  lyrics?: string | null;
  author?: string | null;
  rating?: number | null;
  duration?: number | null;
  created_at: string;
  updated_at: string;
  download_url?: string | null;
  files?: SongFileEntry[] | null;
  error_message?: string | null;
  error_type?: string | null;
};

export type GenerationDto = {
  id: string;
  generation_type: SongGenerationType;
  status: GenerationStatus;
  prompt: string;
  template_id?: string | null;
  song_id?: string | null;
  song?: SongDto | null;
  generated_lyrics?: string | null;
  generated_title?: string | null;
  generated_style?: string | null;
  suno_task_id?: string | null;
  error_type?: string | null;
  error_message?: string | null;
  metadata?: Record<string, unknown>[] | null;
  gpt_started_at?: string | null;
  gpt_completed_at?: string | null;
  suno_started_at?: string | null;
  suno_completed_at?: string | null;
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

export type ChatDto = {
  id: string;
  telegram_chat_id: number;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  limit: number;
  used_limit: number;
  bonus_limit: number;
  ref?: number | null;
  ref_gift_activated?: boolean;
  ref_gave_first_payment_bonus?: boolean;
};

export type GetMeResponse = ApiSuccessResponse<ChatDto>;
