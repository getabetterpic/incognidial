import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

const MAILGUN_URL = 'https://api.mailgun.net/v3/mg.incognidial.com/messages';
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY!;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const API_URL = process.env.API_URL!;

@Injectable()
export class EmailService {
  constructor(private readonly http: HttpService) {}

  sendConfirmationEmail(
    email: string,
    token: string
  ): Observable<AxiosResponse> {
    const url = `${API_URL}/api/users/confirm/${token}`;
    const data = new FormData();
    data.append('from', 'No Reply <noreply@mg.incognidial.com>');
    data.append('to', email);
    data.append('subject', 'Incognidial: Confirm your email');
    data.append(
      'html',
      `<p>Click <a href="${url}">here</a> to confirm your email.</p>`
    );
    data.append('text', `Visit ${url} to confirm your email.`);
    return this.http.post(MAILGUN_URL, data, {
      auth: {
        username: 'api',
        password: MAILGUN_API_KEY,
      },
    });
  }
}
