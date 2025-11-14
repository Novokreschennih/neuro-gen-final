export interface Template {
  key: string;
  html: string;
}

export const TEMPLATES: Template[] = [
  {
    key: 'subscriptionPage',
    html: `
<div style="font-family: sans-serif; background-color: #f4f4f9; padding: 20px;">
  <div style="max-width: 480px; margin: 40px auto; background: white; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
    <div style="padding: 30px; text-align: center;">
      <img src="https://placehold.co/120x150/7c3aed/ffffff?text=EBOOK" alt="Ebook Cover" style="width: 120px; height: 150px; object-fit: cover; margin: 0 auto 20px auto; border-radius: 5px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
      <h2 style="font-size: 26px; color: #333; margin-bottom: 10px; font-weight: bold;">Get Your FREE AI Cheatsheet</h2>
      <p style="color: #666; margin-bottom: 25px; line-height: 1.5;">Unlock 10 powerful prompt formulas to get consistent, high-quality results from any AI model.</p>
      
      <div style="text-align: left; margin-bottom: 30px; font-size: 15px;">
          <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 10px; display: flex; align-items: center;">
                  <span style="color: #28a745; margin-right: 10px; font-size: 20px;">✓</span> <span>Master prompt engineering fundamentals.</span>
              </li>
              <li style="margin-bottom: 10px; display: flex; align-items: center;">
                  <span style="color: #28a745; margin-right: 10px; font-size: 20px;">✓</span> <span>Avoid common mistakes that ruin your output.</span>
              </li>
              <li style="margin-bottom: 10px; display: flex; align-items: center;">
                  <span style="color: #28a745; margin-right: 10px; font-size: 20px;">✓</span> <span>Get a copy-paste template for instant use.</span>
              </li>
          </ul>
      </div>

      <form>
        <input type="email" placeholder="Enter your email address" required style="width: 100%; padding: 14px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; margin-bottom: 15px; font-size: 16px;">
        <button type="submit" style="width: 100%; padding: 15px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 18px; font-weight: bold;">Download for FREE</button>
      </form>
      <p style="font-size: 12px; color: #999; margin-top: 20px;">We'll send the cheatsheet to your inbox. No spam, ever.</p>
    </div>
  </div>
</div>
`,
  },
  {
    key: 'courseLandingPage',
    html: `
<div style="font-family: sans-serif; color: #333; background-color: #fff;">
  <!-- Header -->
  <header style="padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
    <h1 style="font-size: 24px; margin: 0;">AI Mastery Course</h1>
    <nav>
      <a href="#" style="margin-left: 15px; text-decoration: none; color: #007bff;">About</a>
      <a href="#" style="margin-left: 15px; text-decoration: none; color: #007bff;">Curriculum</a>
      <a href="#" style="margin-left: 15px; text-decoration: none; color: #007bff;">Enroll</a>
    </nav>
  </header>

  <!-- Hero Section -->
  <section style="text-align: center; padding: 80px 20px;">
    <h2 style="font-size: 48px; margin-bottom: 20px;">Unlock the Power of AI</h2>
    <p style="font-size: 18px; color: #555; max-width: 600px; margin: 0 auto 30px auto;">Go from beginner to expert with our comprehensive course on neural networks and machine learning.</p>
    <button style="background-color: #28a745; color: white; border: none; padding: 15px 30px; border-radius: 5px; cursor: pointer; font-size: 18px;">Enroll Now</button>
  </section>

  <!-- Features Section -->
  <section style="padding: 60px 20px; background-color: #f8f9fa;">
    <h3 style="text-align: center; font-size: 32px; margin-bottom: 40px;">What You'll Learn</h3>
    <div style="display: flex; justify-content: center; gap: 30px; max-width: 1000px; margin: auto;">
      <div style="flex: 1; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h4 style="font-size: 20px;">Fundamentals</h4>
        <p style="color: #666;">Understand the core concepts behind neural networks.</p>
      </div>
      <div style="flex: 1; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h4 style="font-size: 20px;">Practical Projects</h4>
        <p style="color: #666;">Build real-world applications using popular frameworks.</p>
      </div>
      <div style="flex: 1; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h4 style="font-size: 20px;">Advanced Topics</h4>
        <p style="color: #666;">Dive deep into advanced architectures and techniques.</p>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer style="text-align: center; padding: 20px; border-top: 1px solid #eee; margin-top: 40px;">
    <p style="color: #888;">&copy; 2024 AI Mastery Course. All rights reserved.</p>
  </footer>
</div>
`,
  },
];
