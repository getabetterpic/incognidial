<template>
  <div>
    <nav class="navbar bg-blue-800 text-white-50 flex justify-between items-center p-4">
      <div class="logo text-2xl font-bold">IncogniDial</div>
      <ul class="nav-links flex space-x-4">
        <li><a href="#features" class="hover:text-purple-700">Features</a></li>
        <li><a href="#how-it-works" class="hover:text-purple-700">How It Works</a></li>
        <li><a href="#pricing" class="hover:text-purple-700">Pricing</a></li>
        <li><a href="#contact" class="hover:text-purple-700">Contact</a></li>
      </ul>
    </nav>

    <section class="hero bg-blue-800 text-white-50 text-center py-16">
      <h1 class="text-4xl font-bold mb-4">Privacy-First Virtual Phone Numbers</h1>
      <p class="text-lg mb-8">Stay connected without compromising your privacy.</p>
      <a href="#contact" class="cta-button bg-purple-700 text-white-50 px-6 py-3 rounded hover:bg-purple-600">
        Get Started
      </a>
    </section>

    <section id="features" class="features bg-gray-100 text-center py-16">
      <h2 class="text-3xl font-bold mb-8">Features</h2>
      <div class="feature-list flex flex-wrap justify-center">
        <div class="feature-item bg-white p-6 m-4 rounded shadow-md w-72">
          <h3 class="text-xl font-semibold mb-4">Call Forwarding</h3>
          <p>Easily forward calls to any number with logs and statuses.</p>
        </div>
        <div class="feature-item bg-white p-6 m-4 rounded shadow-md w-72">
          <h3 class="text-xl font-semibold mb-4">Text Forwarding</h3>
          <p>Securely forward texts, including multimedia support.</p>
        </div>
        <div class="feature-item bg-white p-6 m-4 rounded shadow-md w-72">
          <h3 class="text-xl font-semibold mb-4">Usage Metrics</h3>
          <p>Track usage for every virtual number in your account.</p>
        </div>
      </div>
    </section>

    <section id="how-it-works" class="how-it-works bg-white text-center py-16">
      <h2 class="text-3xl font-bold mb-8">How It Works</h2>
      <div class="steps flex flex-wrap justify-center">
        <div class="step bg-gray-100 p-6 m-4 rounded shadow-md w-72">
          <h3 class="text-xl font-semibold mb-4">1. Register</h3>
          <p>Sign up with a phone number to get started.</p>
        </div>
        <div class="step bg-gray-100 p-6 m-4 rounded shadow-md w-72">
          <h3 class="text-xl font-semibold mb-4">2. Add Numbers</h3>
          <p>Choose virtual numbers based on area code.</p>
        </div>
        <div class="step bg-gray-100 p-6 m-4 rounded shadow-md w-72">
          <h3 class="text-xl font-semibold mb-4">3. Manage Forwarding</h3>
          <p>Toggle call or text forwarding settings to fit your needs.</p>
        </div>
      </div>
    </section>

    <section id="pricing" class="pricing bg-gray-100 text-center py-16">
      <h2 class="text-3xl font-bold mb-8">Pricing</h2>
      <div class="pricing-tiers flex flex-wrap justify-center">
        <div class="tier bg-white p-6 m-4 rounded shadow-md w-72">
          <h3 class="text-xl font-semibold mb-4">Basic Plan</h3>
          <p class="mb-4">$5/month</p>
          <p>1 virtual number and call/text forwarding.</p>
        </div>
        <div class="tier bg-white p-6 m-4 rounded shadow-md w-72">
          <h3 class="text-xl font-semibold mb-4">Pro Plan</h3>
          <p class="mb-4">$15/month</p>
          <p>5 virtual numbers and advanced metrics.</p>
        </div>
        <div class="tier bg-white p-6 m-4 rounded shadow-md w-72">
          <h3 class="text-xl font-semibold mb-4">Enterprise Plan</h3>
          <p class="mb-4">Contact us for pricing</p>
          <p>Unlimited numbers and priority support.</p>
        </div>
      </div>
    </section>

    <section id="contact" class="contact bg-white text-center py-16">
      <h2 class="text-3xl font-bold mb-8">Contact Us</h2>
      <form name="contact" class="max-w-md mx-auto flex flex-col" data-netlify="true">
        <label class="text-left mb-2">Name</label>
        <input type="text" class="mb-4 p-2 border rounded" placeholder="Your Name">
        <label class="text-left mb-2">Email</label>
        <input type="email" class="mb-4 p-2 border rounded" placeholder="Your Email">
        <label class="text-left mb-2">Message</label>
        <textarea class="mb-4 p-2 border rounded" placeholder="Your Message"></textarea>
        <button type="submit" class="bg-blue-800 text-white-50 px-4 py-2 rounded hover:bg-blue-700">
          Send Message
        </button>
      </form>
    </section>

    <footer class="bg-blue-800 text-white-50 text-center py-4">
      <p>&copy; 2024 IncogniDial. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: "LandingPage",
};
</script>

<style></style>