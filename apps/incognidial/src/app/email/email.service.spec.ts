import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let httpService: any;

  beforeEach(() => {
    httpService = {
      post: jest.fn(),
    };
    service = new EmailService(httpService);
  });

  it('should send a confirmation email', () => {
    const email = 'test@test.com';
    const token = '1234567890';
    service.sendConfirmationEmail(email, token);
    expect(httpService.post).toHaveBeenCalledWith(
      'https://api.mailgun.net/v3/mg.incognidial.com/messages',
      expect.anything(),
      {
        auth: {
          username: 'api',
          password: 'test-key',
        },
      }
    );
  });
});
