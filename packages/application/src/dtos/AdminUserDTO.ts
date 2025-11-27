export interface AdminUserDTO {
  id: number;
  email: string;
  passwordHash: string;
  role: "admin";
}


