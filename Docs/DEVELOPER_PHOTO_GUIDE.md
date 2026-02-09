# How to Add Your Developer Photo

To display your photo in the "About the Developer" section:

1. **Add your photo** to the `public` folder with the name `developer-photo.jpg`

   - Recommended size: 800x800 pixels (square)
   - Format: JPG, PNG, or WebP
   - File path: `/public/developer-photo.jpg`

2. The placeholder currently shows your initials "RK" with instructions

3. Once you add the photo, update line 605 in `app/page.tsx`:

**Replace this:**

```tsx
<div className="w-48 h-48 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center text-6xl font-bold text-white shadow-2xl group-hover:scale-110 transition-transform">
  RK
</div>
<p className="text-slate-400 text-sm">
  📸 Upload your photo to: <br/>
  <code className="text-cyan-400">/public/developer-photo.jpg</code>
</p>
```

**With this:**

```tsx
<img
  src="/developer-photo.jpg"
  alt="Rohit Kumar Kundu - Block Builder Developer"
  className="w-48 h-48 mx-auto mb-6 rounded-full object-cover border-4 border-cyan-500/50 shadow-2xl group-hover:scale-110 transition-transform"
/>
```

## What I've Added to Your Landing Page:

### 1. **How to Use Section** (After Faucet Section)

- ✅ 4-step guide with animated progress bars
- ✅ Screenshots from your project (Builder page, Project Section, Landing page)
- ✅ Interactive hover effects on each step
- ✅ Pro tips section at the bottom
- ✅ Color-coded steps (cyan → blue → purple → fuchsia)

### 2. **Developer Section** (Before CTA Section)

- ✅ Your name: Rohit Kumar Kundu
- ✅ Title: Full-Stack Blockchain Developer
- ✅ Bio about your mission and vision
- ✅ Expertise areas (Next.js, React, TypeScript, Solidity, etc.)
- ✅ Social links (GitHub, Twitter)
- ✅ Project stats (Open Source, Built for Celo, TypeScript, Next.js 15)
- ✅ Personal quote about your vision
- ✅ Photo placeholder with instructions (RK initials + upload message)

## Features:

- 🎨 **Beautiful animations** - scroll reveals, hover effects, scale transforms
- 📱 **Fully responsive** - looks great on mobile, tablet, and desktop
- 🌈 **Gradient accents** - cyan, blue, purple, fuchsia theme
- 🖼️ **Real screenshots** - from your actual project
- ⚡ **Interactive** - hover states on all elements
- 🎯 **Clear hierarchy** - numbered steps, color-coded sections

## Screenshot Descriptions:

1. **Builder Interface** - Shows the drag-and-drop contract builder
2. **Project Management** - Displays deployed contracts and frontend generation
3. **Landing Page** - Modern UI design preview

All sections are fully integrated with your existing design system and color scheme!
