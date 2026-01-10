export interface RefreshToken {
  id: number;
  token: string;
  user_id: number;
  expires_at: string;
  created_at: string;
  revoked: number;
  device_info?: string;
}

export interface CreateRefreshTokenDTO {
  token: string;
  user_id: number;
  expires_at: Date;
  device_info?: string;
}
