<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import router from '../router';
import parsePhoneNumber from 'libphonenumber-js';

const phone = ref('');
const password = ref('');
const confirmPassword = ref('');

const validatePassword = (pass: string) => {
  return pass.length >= 12;
};

const isPasswordValid = ref(false);
const isConfirmPasswordValid = ref(false);

watch(password, (newValue) => {
  isPasswordValid.value = validatePassword(newValue);
  isConfirmPasswordValid.value = newValue === confirmPassword.value;
});

watch(confirmPassword, (newValue) => {
  isConfirmPasswordValid.value = validatePassword(newValue);
  isPasswordValid.value = newValue === password.value;
});

const validatePhone = (phoneNumber: string): boolean => {
  const phoneNumberObject = parsePhoneNumber(phoneNumber, 'US');
  if (phoneNumberObject) {
    console.log(phoneNumberObject);
    return phoneNumberObject.isValid();
  }
  return false;
};

const isPhoneValid = ref(false);
const phoneIsDirty = ref(false);

const debounce = (fn: (...args: any[]) => any, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

watch(phone, debounce((newValue) => {
  isPhoneValid.value = validatePhone(newValue);
  phoneIsDirty.value = true;
}, 500));


const isFormValid = computed(() => isPasswordValid.value && isConfirmPasswordValid.value);

const handleSubmit = async () => {
  if (!isFormValid.value) {
    console.log('Form is not valid');
    return;
  }
  // Handle form submission logic here
  // const response = await fetch('/api/users/register', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     phone: phone.value,
  //     password: password.value,
  //     confirmPassword: confirmPassword.value
  //   })
  // });

  // if (response.ok) {
  router.push({ name: 'home' });
  // } else {
  //   console.error('Registration failed');
  // }
  console.log(phone.value, password.value, confirmPassword.value);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div>
            <div v-if="phone.length >= 7 && phoneIsDirty && !isPhoneValid" class="text-red-500 text-sm mt-1">
              Please enter a valid US phone number
            </div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <div class="mt-1">
              <input id="phone" v-model="phone" type="tel" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800 sm:text-sm"
                :class="{ 'border-red-500': phone.length && !isPhoneValid }">
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password *
            </label>
            <div class="mt-1">
              <input id="password" v-model="password" type="password" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800 sm:text-sm">
            </div>
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700">
              Confirm Password *
            </label>
            <div class="mt-1">
              <input id="confirm-password" v-model="confirmPassword" type="password" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800 sm:text-sm">
            </div>
          </div>

          <div>
            <button type="submit" :disabled="!isFormValid"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>