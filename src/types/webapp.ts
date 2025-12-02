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
  answers?: unknown[];
  tempo?: number;
  style?: string;
  mood?: string;
  voice?: string;
  skip_lyrics_generation?: boolean;
  lyrics?: string;
  title?: string;
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
  pack_id?: number | null;
  used_limit: number;
  bonus_limit: number;
  ref?: number | null;
  ref_gift_activated?: boolean;
  ref_gave_first_payment_bonus?: boolean;
  referrals_signup_count: number;
  referrals_purchase_count: number;
  isPro?: boolean;
};

export type GetMeResponse = ApiSuccessResponse<ChatDto>;

// Payment types
export type PaymentStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "error";

export type PaymentDto = {
  uuid: string;
  pack_id: number;
  is_recurring: boolean;
  status: PaymentStatus;
  amount: number;
  currency: string;
  payment_url?: string | null;
  email?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  error_message?: string | null;
};

export type CreatePaymentRequest = {
  pack_id: number;
  is_recurring: boolean;
  email?: string;
};

export type CreatePaymentResponse = ApiSuccessResponse<PaymentDto>;

export type GetPaymentsQuery = {
  limit?: number;
  offset?: number;
};

export type GetPaymentsResponse = ApiSuccessResponse<PaymentDto[]>;

export type GetPaymentByUUIDResponse = ApiSuccessResponse<PaymentDto>;

// Generation Template types
export type GenerationTemplateArtist = {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  templates_count: number;
  avatar_url?: string | null;
};

export type GenerationTemplateList = {
  id: string;
  name: string;
};

export type GenerationTemplate = {
  id: string;
  generation_type: string;
  title: string;
  description?: string | null;
  artist_id?: string | null;
  artist_name?: string | null;
  prompt_id?: string | null;
  gpt_prompt?: string | null;
  upload_url?: string | null;
  prompt?: string | null;
  style?: string | null;
  custom_mode: boolean;
  instrumental: boolean;
  model?: string | null;
  persona_id?: string | null;
  negative_tags?: string | null;
  vocal_gender?: string | null;
  style_weight?: number | null;
  weirdness_constraint?: number | null;
  audio_weight?: number | null;
  is_active: boolean;
  is_cover: boolean;
};

export type GetGenerationTemplateArtistsQuery = {
  limit?: number;
  offset?: number;
};

export type GetGenerationTemplateArtistsResponse = ApiSuccessResponse<GenerationTemplateArtist[]>;

export type GetGenerationTemplatesQuery = {
  limit?: number;
  offset?: number;
};

export type GetGenerationTemplatesResponse = ApiSuccessResponse<GenerationTemplateList[]>;

// Chat types
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  updated_at?: string;
};

export type SendChatMessageRequest = {
  message: string;
};

export type SendChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  updated_at?: string;
};

export type GetChatMessagesQuery = {
  limit?: number;
  offset?: number;
};

export type GetChatMessagesResponse = ApiSuccessResponse<ChatMessage[]>;

export type SendChatMessageResponse = ApiSuccessResponse<SendChatMessage>;

export type StreamChatMessageResponse = ApiSuccessResponse<{
  status?: string;
  message?: string;
}>;

export type ClearChatMessagesResponse = ApiSuccessResponse<{
  success: boolean;
}>;

// Lyrics Generation types
export type CreateLyricsGenerationRequest = {
  prompt: string;
  type: "suno" | "gpt";
};

export type LyricsGenerationStatus = "pending" | "processing" | "completed" | "failed";

export type LyricsGenerationDto = {
  id: string;
  status: LyricsGenerationStatus;
  lyrics: string;
  created_at: string;
  started_at: string;
  completed_at: string;
};

export type CreateLyricsGenerationResponse = ApiSuccessResponse<LyricsGenerationDto>;

export type GetLyricsGenerationResponse = ApiSuccessResponse<LyricsGenerationDto>;

export type ChatMessageChunkEvent = {
  chunk?: string;
  done?: boolean;
  role?: "assistant" | "user";
  message_id?: string;
  sent?: string;
  error?: string;
};


export type WebSocketChatMessage = {
  role: "user" | "assistant";
  content: string;
  sent: string;
};

export type WebSocketHelpBoxItem = {
  command: "helpbox";
};

export type WebSocketHistoryDataItem = WebSocketChatMessage | WebSocketHelpBoxItem;

export type WebSocketCommand = 
  | "new_connection" 
  | "new_message" 
  | "answer" 
  | "clear";

export type WebSocketRequest = {
  command: WebSocketCommand;
  data: WebSocketChatMessage[];
  telegram_chat_id: string;
};

// WebSocket Response types
export type WebSocketHistoryResponse = {
  command: "history";
  data: WebSocketHistoryDataItem[];
  sent: string;
};

export type WebSocketAnswerResponse = {
  command: "answer";
  data: WebSocketChatMessage[];
  sent: string;
};

export type WebSocketErrorResponse = {
  command: "error";
  error: string;
  message?: string;
  details?: string;
  sent: string;
};

export type WebSocketClearResponse = {
  command: "clear";
  success: boolean;
  sent: string;
};

export type WebSocketResponse = 
  | WebSocketHistoryResponse 
  | WebSocketAnswerResponse 
  | WebSocketErrorResponse 
  | WebSocketClearResponse;

// Speech-to-Text types
export type TranscribeAudioResponseData = {
  text: string;
  language?: string;
  duration?: number;
};

export type TranscribeAudioResponse = ApiSuccessResponse<TranscribeAudioResponseData>;