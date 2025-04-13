import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as env } from '../../environments/environment';
export interface UserRegistrationDto {
  phoneNumber: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private readonly http: HttpClient) {}

  register(body: UserRegistrationDto) {
    return this.http.post<UserRegistrationDto>(
      `${env.apiUrl}/users/register`,
      body
    );
  }
}
