import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserRegistrationDto, UsersService } from './users.service';
@Component({
  selector: 'dial-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  usersService = inject(UsersService);
  registerForm = new FormBuilder().group({
    phoneNumber: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(12)]],
    passwordConfirmation: ['', [Validators.required, Validators.minLength(12)]],
  });

  onSubmit() {
    this.usersService
      .register(this.registerForm.value as UserRegistrationDto)
      .subscribe((response) => {
        console.log(response);
        alert('Registration successful');
      });
  }

  get passwordConfirmation() {
    return this.registerForm.get('passwordConfirmation');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get phoneNumber() {
    return this.registerForm.get('phoneNumber');
  }
}
