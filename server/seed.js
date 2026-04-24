require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const sequelize = require('./config/database');
const {
  User, Project, Asset, VideoGeneration, ImageGeneration,
  Template, Script, Storyboard, Voiceover, StylePreset, Export, Spreadsheet,
} = require('./models');

async function seed() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();

    console.log('Syncing database (force: true)...');
    await sequelize.sync({ force: true });

    // Create default user
    console.log('Creating default user...');
    const user = await User.create({
      email: 'admin@runway.com',
      password: 'admin123',
      name: 'Admin User',
    });
    const userId = user.id;

    // Projects
    console.log('Seeding Projects...');
    const projects = await Project.bulkCreate([
      { name: 'Brand Campaign 2024', description: 'Annual brand refresh campaign with cinematic video content', type: 'video', status: 'active', thumbnail: '/thumbnails/brand-campaign.jpg', userId },
      { name: 'Music Video - Neon Dreams', description: 'Synthwave-inspired music video with retro neon aesthetics', type: 'video', status: 'active', thumbnail: '/thumbnails/neon-dreams.jpg', userId },
      { name: 'Product Launch - TechVision Pro', description: 'Product reveal video for TechVision Pro headset', type: 'video', status: 'in_progress', thumbnail: '/thumbnails/techvision.jpg', userId },
      { name: 'Social Media Ad Pack', description: 'Collection of 15-second ads for Instagram and TikTok', type: 'video', status: 'draft', thumbnail: '/thumbnails/social-ads.jpg', userId },
      { name: 'Documentary - Ocean Depths', description: 'Deep sea documentary with AI-enhanced underwater footage', type: 'video', status: 'active', thumbnail: '/thumbnails/ocean.jpg', userId },
      { name: 'Fashion Lookbook Spring', description: 'Spring collection lookbook with AI-generated backgrounds', type: 'image', status: 'completed', thumbnail: '/thumbnails/fashion-spring.jpg', userId },
      { name: 'Real Estate Virtual Tour', description: 'Interactive virtual property tours with AI narration', type: 'video', status: 'in_progress', thumbnail: '/thumbnails/real-estate.jpg', userId },
      { name: 'Animated Explainer Series', description: 'Educational animated explainer videos for SaaS platform', type: 'video', status: 'active', thumbnail: '/thumbnails/explainer.jpg', userId },
      { name: 'Wedding Highlights Reel', description: 'Cinematic wedding highlight video with AI color grading', type: 'video', status: 'completed', thumbnail: '/thumbnails/wedding.jpg', userId },
      { name: 'Podcast Visual Identity', description: 'Visual branding package for tech podcast', type: 'image', status: 'active', thumbnail: '/thumbnails/podcast.jpg', userId },
      { name: 'Restaurant Menu Shoot', description: 'Food photography and video for upscale restaurant', type: 'image', status: 'draft', thumbnail: '/thumbnails/restaurant.jpg', userId },
      { name: 'Fitness App Promo', description: 'High-energy promotional video for fitness application', type: 'video', status: 'in_progress', thumbnail: '/thumbnails/fitness.jpg', userId },
      { name: 'Travel Vlog - Tokyo', description: 'Travel vlog series exploring Tokyo neighborhoods', type: 'video', status: 'active', thumbnail: '/thumbnails/tokyo.jpg', userId },
      { name: 'Startup Pitch Deck Video', description: 'Investor pitch video with data visualizations', type: 'video', status: 'draft', thumbnail: '/thumbnails/pitch.jpg', userId },
      { name: 'Concert Live Stream Graphics', description: 'Real-time graphics overlay for live concert stream', type: 'video', status: 'active', thumbnail: '/thumbnails/concert.jpg', userId },
      { name: 'E-commerce Product Showcase', description: '360-degree product showcase videos for online store', type: 'video', status: 'in_progress', thumbnail: '/thumbnails/ecommerce.jpg', userId },
    ]);

    // Assets
    console.log('Seeding Assets...');
    await Asset.bulkCreate([
      { name: 'hero-banner-v2.mp4', type: 'video', url: '/assets/hero-banner-v2.mp4', size: 145000000, tags: ['hero', 'banner', 'campaign'], userId },
      { name: 'product-360-spin.mp4', type: 'video', url: '/assets/product-360.mp4', size: 89000000, tags: ['product', '360', 'spin'], userId },
      { name: 'background-music-ambient.mp3', type: 'audio', url: '/assets/ambient-music.mp3', size: 8500000, tags: ['music', 'ambient', 'background'], userId },
      { name: 'logo-animation.mp4', type: 'video', url: '/assets/logo-anim.mp4', size: 12000000, tags: ['logo', 'animation', 'branding'], userId },
      { name: 'team-photo-2024.jpg', type: 'image', url: '/assets/team-2024.jpg', size: 4500000, tags: ['team', 'photo', 'corporate'], userId },
      { name: 'drone-footage-cityscape.mp4', type: 'video', url: '/assets/drone-city.mp4', size: 520000000, tags: ['drone', 'aerial', 'cityscape'], userId },
      { name: 'voiceover-narration-take3.wav', type: 'audio', url: '/assets/narration-t3.wav', size: 25000000, tags: ['voiceover', 'narration', 'final'], userId },
      { name: 'texture-marble-4k.png', type: 'image', url: '/assets/marble-4k.png', size: 18000000, tags: ['texture', 'marble', '4k'], userId },
      { name: 'intro-sequence-final.mp4', type: 'video', url: '/assets/intro-final.mp4', size: 67000000, tags: ['intro', 'sequence', 'motion'], userId },
      { name: 'sfx-whoosh-collection.wav', type: 'audio', url: '/assets/sfx-whoosh.wav', size: 3200000, tags: ['sfx', 'sound', 'whoosh'], userId },
      { name: 'model-portrait-studio.jpg', type: 'image', url: '/assets/portrait-studio.jpg', size: 7800000, tags: ['portrait', 'model', 'studio'], userId },
      { name: 'timelapse-sunset-beach.mp4', type: 'video', url: '/assets/sunset-timelapse.mp4', size: 234000000, tags: ['timelapse', 'sunset', 'beach'], userId },
      { name: 'icon-set-ui-v3.svg', type: 'image', url: '/assets/icons-ui-v3.svg', size: 450000, tags: ['icons', 'ui', 'vector'], userId },
      { name: 'interview-raw-footage.mp4', type: 'video', url: '/assets/interview-raw.mp4', size: 890000000, tags: ['interview', 'raw', 'footage'], userId },
      { name: 'color-grade-lut-cinematic.cube', type: 'image', url: '/assets/lut-cinematic.cube', size: 280000, tags: ['lut', 'color', 'cinematic'], userId },
      { name: 'motion-graphics-pack.zip', type: 'video', url: '/assets/mogrt-pack.zip', size: 156000000, tags: ['motion', 'graphics', 'template'], userId },
    ]);

    // Video Generations
    console.log('Seeding VideoGenerations...');
    await VideoGeneration.bulkCreate([
      { prompt: 'A cinematic drone shot flying over a futuristic city at sunset with neon lights reflecting off glass buildings', status: 'completed', resultUrl: '/generated/video-001.mp4', duration: 10, resolution: '4K', style: 'cinematic', userId },
      { prompt: 'Slow motion water droplets falling into a crystal clear pool creating perfect ripples', status: 'completed', resultUrl: '/generated/video-002.mp4', duration: 8, resolution: '1080p', style: 'macro', userId },
      { prompt: 'Abstract geometric shapes morphing and flowing in a dark space with vibrant color transitions', status: 'completed', resultUrl: '/generated/video-003.mp4', duration: 15, resolution: '4K', style: 'abstract', userId },
      { prompt: 'A golden retriever running through autumn leaves in a sunlit forest path', status: 'processing', resultUrl: null, duration: 12, resolution: '1080p', style: 'natural', userId },
      { prompt: 'Time-lapse of a flower blooming from bud to full bloom with soft studio lighting', status: 'completed', resultUrl: '/generated/video-005.mp4', duration: 6, resolution: '4K', style: 'timelapse', userId },
      { prompt: 'Cyberpunk street scene with rain, holographic advertisements, and flying vehicles', status: 'completed', resultUrl: '/generated/video-006.mp4', duration: 20, resolution: '4K', style: 'sci-fi', userId },
      { prompt: 'Elegant perfume bottle rotating on a marble surface with soft bokeh background', status: 'completed', resultUrl: '/generated/video-007.mp4', duration: 8, resolution: '4K', style: 'commercial', userId },
      { prompt: 'Northern lights dancing over a snowy mountain landscape with a frozen lake', status: 'processing', resultUrl: null, duration: 30, resolution: '4K', style: 'nature', userId },
      { prompt: 'Modern kitchen scene with chef preparing sushi with precise knife work', status: 'completed', resultUrl: '/generated/video-009.mp4', duration: 15, resolution: '1080p', style: 'documentary', userId },
      { prompt: 'Astronaut floating in space station with Earth visible through the window', status: 'completed', resultUrl: '/generated/video-010.mp4', duration: 10, resolution: '4K', style: 'cinematic', userId },
      { prompt: 'Vintage car driving down Route 66 at golden hour with dust trail', status: 'pending', resultUrl: null, duration: 12, resolution: '1080p', style: 'retro', userId },
      { prompt: 'Underwater coral reef teeming with colorful tropical fish and sunlight rays', status: 'completed', resultUrl: '/generated/video-012.mp4', duration: 20, resolution: '4K', style: 'documentary', userId },
      { prompt: 'Fashion model walking through a field of lavender in slow motion', status: 'completed', resultUrl: '/generated/video-013.mp4', duration: 8, resolution: '4K', style: 'fashion', userId },
      { prompt: 'Coffee beans being roasted in a drum roaster with aromatic steam rising', status: 'completed', resultUrl: '/generated/video-014.mp4', duration: 10, resolution: '1080p', style: 'commercial', userId },
      { prompt: 'Lightning storm over a vast desert landscape at night with dramatic clouds', status: 'processing', resultUrl: null, duration: 15, resolution: '4K', style: 'nature', userId },
      { prompt: 'Children playing with colorful paint splashes in an art studio', status: 'completed', resultUrl: '/generated/video-016.mp4', duration: 12, resolution: '1080p', style: 'playful', userId },
    ]);

    // Image Generations
    console.log('Seeding ImageGenerations...');
    await ImageGeneration.bulkCreate([
      { prompt: 'A majestic snow leopard perched on a Himalayan cliff at dawn', status: 'completed', resultUrl: '/generated/img-001.png', width: 2048, height: 2048, style: 'photorealistic', negativePrompt: 'blurry, low quality', userId },
      { prompt: 'Steampunk airship floating above Victorian London with copper gears and steam', status: 'completed', resultUrl: '/generated/img-002.png', width: 1920, height: 1080, style: 'steampunk', negativePrompt: 'modern elements', userId },
      { prompt: 'Minimalist logo design for a sustainable fashion brand using earth tones', status: 'completed', resultUrl: '/generated/img-003.png', width: 1024, height: 1024, style: 'minimalist', negativePrompt: 'complex, cluttered', userId },
      { prompt: 'Surreal floating islands with waterfalls cascading into clouds below', status: 'completed', resultUrl: '/generated/img-004.png', width: 2048, height: 1536, style: 'fantasy', negativePrompt: 'realistic, mundane', userId },
      { prompt: 'Professional headshot of a diverse executive team in modern office', status: 'processing', resultUrl: null, width: 1024, height: 1024, style: 'corporate', negativePrompt: 'casual, informal', userId },
      { prompt: 'Japanese zen garden with cherry blossoms falling into a koi pond', status: 'completed', resultUrl: '/generated/img-006.png', width: 2048, height: 1365, style: 'serene', negativePrompt: 'busy, cluttered', userId },
      { prompt: 'Neon-lit cyberpunk alley with rain puddles reflecting holographic signs', status: 'completed', resultUrl: '/generated/img-007.png', width: 1080, height: 1920, style: 'cyberpunk', negativePrompt: 'bright, daytime', userId },
      { prompt: 'Watercolor painting of a Tuscan countryside villa with olive groves', status: 'completed', resultUrl: '/generated/img-008.png', width: 2048, height: 1536, style: 'watercolor', negativePrompt: 'photorealistic', userId },
      { prompt: 'Futuristic electric vehicle concept car in a sleek showroom', status: 'completed', resultUrl: '/generated/img-009.png', width: 1920, height: 1080, style: 'concept art', negativePrompt: 'old, vintage', userId },
      { prompt: 'Macro shot of morning dew on a spider web with rainbow refractions', status: 'completed', resultUrl: '/generated/img-010.png', width: 2048, height: 2048, style: 'macro', negativePrompt: 'blurry, out of focus', userId },
      { prompt: 'Art deco poster design for a jazz festival in 1920s style', status: 'completed', resultUrl: '/generated/img-011.png', width: 1080, height: 1620, style: 'art deco', negativePrompt: 'modern, minimalist', userId },
      { prompt: 'Aerial view of a tropical island resort with turquoise waters', status: 'pending', resultUrl: null, width: 2048, height: 1536, style: 'aerial', negativePrompt: 'cloudy, overcast', userId },
      { prompt: 'Photorealistic still life with fresh fruits and copper kitchenware', status: 'completed', resultUrl: '/generated/img-013.png', width: 2048, height: 2048, style: 'still life', negativePrompt: 'artificial, plastic', userId },
      { prompt: 'Gothic cathedral interior with stained glass windows and candlelight', status: 'completed', resultUrl: '/generated/img-014.png', width: 1080, height: 1920, style: 'architectural', negativePrompt: 'modern, bright', userId },
      { prompt: 'Pop art portrait in the style of Andy Warhol with vibrant colors', status: 'completed', resultUrl: '/generated/img-015.png', width: 1024, height: 1024, style: 'pop art', negativePrompt: 'muted, desaturated', userId },
      { prompt: 'Cozy cabin interior with fireplace, bookshelves, and warm lighting', status: 'completed', resultUrl: '/generated/img-016.png', width: 1920, height: 1080, style: 'interior design', negativePrompt: 'cold, industrial', userId },
    ]);

    // Templates
    console.log('Seeding Templates...');
    await Template.bulkCreate([
      { name: 'Instagram Reels - Product Showcase', category: 'social_media', description: 'Vertical 9:16 template for product showcase reels with dynamic transitions', thumbnail: '/templates/ig-reels-product.jpg', config: { width: 1080, height: 1920, fps: 30, duration: 15, transitions: ['slide', 'zoom'] }, userId },
      { name: 'YouTube Intro - Tech Channel', category: 'youtube', description: 'Modern tech channel intro with glitch effects and 3D text', thumbnail: '/templates/yt-tech-intro.jpg', config: { width: 1920, height: 1080, fps: 60, duration: 5, effects: ['glitch', '3d_text'] }, userId },
      { name: 'Wedding Invitation - Elegant Gold', category: 'wedding', description: 'Elegant wedding invitation video with gold foil accents', thumbnail: '/templates/wedding-gold.jpg', config: { width: 1080, height: 1080, fps: 30, duration: 30, theme: 'gold_elegant' }, userId },
      { name: 'Corporate Presentation - Clean', category: 'corporate', description: 'Clean corporate presentation template with data visualizations', thumbnail: '/templates/corp-clean.jpg', config: { width: 1920, height: 1080, fps: 30, duration: 60, slides: 10 }, userId },
      { name: 'TikTok Ad - Flash Sale', category: 'advertising', description: 'High-energy flash sale ad template optimized for TikTok', thumbnail: '/templates/tiktok-sale.jpg', config: { width: 1080, height: 1920, fps: 30, duration: 10, urgency: 'high' }, userId },
      { name: 'Podcast Audiogram', category: 'podcast', description: 'Waveform visualization template for podcast clips', thumbnail: '/templates/podcast-audio.jpg', config: { width: 1080, height: 1080, fps: 30, duration: 60, waveform: 'bars' }, userId },
      { name: 'Real Estate Listing Tour', category: 'real_estate', description: 'Professional property listing video with text overlays', thumbnail: '/templates/realestate-tour.jpg', config: { width: 1920, height: 1080, fps: 30, duration: 45, overlays: ['price', 'features', 'contact'] }, userId },
      { name: 'Fitness Workout Timer', category: 'fitness', description: 'Workout timer template with exercise name overlays', thumbnail: '/templates/fitness-timer.jpg', config: { width: 1080, height: 1920, fps: 30, duration: 30, intervals: 'tabata' }, userId },
      { name: 'Restaurant Menu Promo', category: 'food', description: 'Appetizing menu showcase with smooth pan and zoom', thumbnail: '/templates/restaurant-menu.jpg', config: { width: 1080, height: 1080, fps: 30, duration: 20, animations: ['pan', 'zoom'] }, userId },
      { name: 'Music Lyrics Video', category: 'music', description: 'Animated lyrics video template with particle effects', thumbnail: '/templates/lyrics-video.jpg', config: { width: 1920, height: 1080, fps: 30, duration: 180, textStyle: 'kinetic' }, userId },
      { name: 'E-commerce Unboxing', category: 'ecommerce', description: 'Product unboxing reveal with dramatic lighting', thumbnail: '/templates/unboxing.jpg', config: { width: 1080, height: 1920, fps: 60, duration: 20, reveal: 'dramatic' }, userId },
      { name: 'Travel Montage - Cinematic', category: 'travel', description: 'Cinematic travel montage with map animations', thumbnail: '/templates/travel-cinema.jpg', config: { width: 1920, height: 1080, fps: 24, duration: 60, maps: true }, userId },
      { name: 'Birthday Celebration', category: 'personal', description: 'Fun birthday celebration video with confetti and balloons', thumbnail: '/templates/birthday.jpg', config: { width: 1080, height: 1080, fps: 30, duration: 30, particles: ['confetti', 'balloons'] }, userId },
      { name: 'News Lower Third', category: 'broadcast', description: 'Professional news-style lower third graphics', thumbnail: '/templates/news-lower.jpg', config: { width: 1920, height: 1080, fps: 30, duration: 10, position: 'lower_third' }, userId },
      { name: 'Testimonial Card', category: 'marketing', description: 'Customer testimonial video card with star ratings', thumbnail: '/templates/testimonial.jpg', config: { width: 1080, height: 1080, fps: 30, duration: 15, layout: 'card' }, userId },
      { name: 'Cinematic Title Sequence', category: 'film', description: 'Epic movie-style title sequence with particle trails', thumbnail: '/templates/title-seq.jpg', config: { width: 1920, height: 1080, fps: 24, duration: 10, particles: 'trails' }, userId },
    ]);

    // Scripts
    console.log('Seeding Scripts...');
    await Script.bulkCreate([
      { title: 'Brand Story - From Garage to Global', genre: 'corporate', content: 'Every great company starts with a spark of inspiration. Ours began in a small garage in Austin, Texas...', wordCount: 450, tone: 'inspirational', userId },
      { title: 'Product Launch - TechVision Pro', genre: 'commercial', content: 'Introducing TechVision Pro. The future of augmented reality is here. With 8K resolution per eye...', wordCount: 320, tone: 'exciting', userId },
      { title: 'Documentary Narration - Ocean Deep', genre: 'documentary', content: 'Beneath the waves, in the crushing darkness of the abyssal zone, life finds a way to thrive...', wordCount: 1200, tone: 'contemplative', userId },
      { title: 'Social Ad - Summer Collection', genre: 'advertising', content: 'This summer, redefine your style. Bold colors. Sustainable fabrics. Timeless designs...', wordCount: 80, tone: 'energetic', userId },
      { title: 'Explainer - How Blockchain Works', genre: 'educational', content: 'Imagine a notebook that everyone in the world can see, but no one can erase. Thats blockchain...', wordCount: 600, tone: 'friendly', userId },
      { title: 'Wedding Toast - Sarah & Mike', genre: 'personal', content: 'Ladies and gentlemen, raise your glasses. I first met Sarah in college when she accidentally...', wordCount: 350, tone: 'heartfelt', userId },
      { title: 'Podcast Intro - Tech Uncovered', genre: 'podcast', content: 'Welcome to Tech Uncovered, the podcast where we pull back the curtain on the technology shaping our world...', wordCount: 150, tone: 'conversational', userId },
      { title: 'Short Film - The Last Library', genre: 'drama', content: 'INT. ABANDONED LIBRARY - DAY. Dust particles dance in shafts of light piercing through broken windows...', wordCount: 2500, tone: 'dramatic', userId },
      { title: 'App Onboarding Tutorial', genre: 'tutorial', content: 'Welcome to FitTrack! Lets get you set up in just three easy steps. First, tell us about your fitness goals...', wordCount: 400, tone: 'encouraging', userId },
      { title: 'Investor Pitch - Series A', genre: 'pitch', content: 'The creator economy is a $100 billion market, and its growing 25% year over year. Our platform...', wordCount: 800, tone: 'confident', userId },
      { title: 'Meditation Guide - Morning Calm', genre: 'wellness', content: 'Find a comfortable position. Close your eyes. Take a deep breath in through your nose...', wordCount: 500, tone: 'calm', userId },
      { title: 'Game Trailer Narration', genre: 'gaming', content: 'In a world where darkness has consumed the last light, one warrior rises from the ashes...', wordCount: 200, tone: 'epic', userId },
      { title: 'Cooking Show Opening', genre: 'entertainment', content: 'Tonight on Flavor Fusion, were taking your taste buds on a journey from the streets of Bangkok...', wordCount: 180, tone: 'enthusiastic', userId },
      { title: 'Charity Appeal - Clean Water', genre: 'nonprofit', content: 'Every eight seconds, a child dies from waterborne disease. But together, we can change this...', wordCount: 350, tone: 'urgent', userId },
      { title: 'Museum Audio Guide', genre: 'educational', content: 'You are standing before Monets Water Lilies, painted between 1914 and 1926. Notice how the brushstrokes...', wordCount: 250, tone: 'informative', userId },
      { title: 'Fashion Show Voiceover', genre: 'fashion', content: 'Collection seven draws inspiration from the brutalist architecture of postwar London...', wordCount: 300, tone: 'sophisticated', userId },
    ]);

    // Storyboards
    console.log('Seeding Storyboards...');
    await Storyboard.bulkCreate([
      { title: 'Brand Campaign Hero Video', scenes: [{ scene: 1, description: 'Wide aerial shot of city skyline at dawn', duration: 3, camera: 'drone ascending' }, { scene: 2, description: 'Close-up of hands crafting product', duration: 4, camera: 'macro lens' }, { scene: 3, description: 'Team collaboration in modern office', duration: 3, camera: 'tracking shot' }], projectId: projects[0].id, userId },
      { title: 'Neon Dreams Music Video', scenes: [{ scene: 1, description: 'Singer silhouette against neon grid', duration: 5, camera: 'static wide' }, { scene: 2, description: 'Retro car chase through neon city', duration: 8, camera: 'side tracking' }, { scene: 3, description: 'Dance sequence in holographic room', duration: 6, camera: 'orbiting' }], projectId: projects[1].id, userId },
      { title: 'Product Unboxing Sequence', scenes: [{ scene: 1, description: 'Package arrives on doorstep', duration: 2, camera: 'eye level' }, { scene: 2, description: 'Hands opening premium packaging', duration: 4, camera: 'overhead' }, { scene: 3, description: 'Product reveal with dramatic lighting', duration: 3, camera: 'slow push in' }], projectId: projects[2].id, userId },
      { title: 'Social Ad Storyboard', scenes: [{ scene: 1, description: 'Hook - bold text on screen', duration: 1.5, camera: 'static' }, { scene: 2, description: 'Problem demonstration', duration: 3, camera: 'handheld' }, { scene: 3, description: 'Solution showcase', duration: 3, camera: 'smooth dolly' }, { scene: 4, description: 'CTA with offer', duration: 2, camera: 'zoom in' }], projectId: projects[3].id, userId },
      { title: 'Ocean Documentary Opening', scenes: [{ scene: 1, description: 'Sunrise over Pacific Ocean surface', duration: 5, camera: 'aerial pan' }, { scene: 2, description: 'Camera plunges underwater', duration: 3, camera: 'submersible POV' }, { scene: 3, description: 'Bioluminescent creatures in deep', duration: 6, camera: 'slow tracking' }], projectId: projects[4].id, userId },
      { title: 'Fashion Lookbook Montage', scenes: [{ scene: 1, description: 'Model walking through flower garden', duration: 4, camera: 'steadicam follow' }, { scene: 2, description: 'Detail shots of fabric textures', duration: 3, camera: 'macro slider' }, { scene: 3, description: 'Full outfit reveal on runway', duration: 3, camera: 'front static' }], projectId: projects[5].id, userId },
      { title: 'Real Estate Walkthrough', scenes: [{ scene: 1, description: 'Exterior curb appeal shot', duration: 3, camera: 'drone descending' }, { scene: 2, description: 'Grand entrance foyer', duration: 4, camera: 'gimbal walk' }, { scene: 3, description: 'Kitchen and living area open plan', duration: 5, camera: 'smooth pan' }, { scene: 4, description: 'Master suite with view', duration: 4, camera: 'wide to close' }], projectId: projects[6].id, userId },
      { title: 'Explainer Video Flow', scenes: [{ scene: 1, description: 'Animated character with problem', duration: 5, camera: '2D animation' }, { scene: 2, description: 'Solution introduction with icons', duration: 5, camera: 'motion graphics' }, { scene: 3, description: 'Step-by-step demonstration', duration: 10, camera: 'screen recording' }], projectId: projects[7].id, userId },
      { title: 'Wedding Ceremony Highlights', scenes: [{ scene: 1, description: 'Bride preparation getting ready', duration: 4, camera: 'soft focus close-up' }, { scene: 2, description: 'Groom waiting at altar', duration: 3, camera: 'medium shot' }, { scene: 3, description: 'Walking down the aisle', duration: 5, camera: 'dual angle' }, { scene: 4, description: 'Vows exchange and rings', duration: 4, camera: 'tight close-up' }], projectId: projects[8].id, userId },
      { title: 'Podcast Episode Visual', scenes: [{ scene: 1, description: 'Animated logo intro', duration: 3, camera: 'motion graphics' }, { scene: 2, description: 'Host introduction with waveform', duration: 5, camera: 'static frame' }, { scene: 3, description: 'Topic cards with quotes', duration: 10, camera: 'animated cards' }], projectId: projects[9].id, userId },
      { title: 'Restaurant Ambiance Film', scenes: [{ scene: 1, description: 'Exterior at twilight with warm glow', duration: 3, camera: 'slow dolly in' }, { scene: 2, description: 'Chef plating in kitchen', duration: 4, camera: 'over shoulder' }, { scene: 3, description: 'Dish served to table', duration: 3, camera: 'food-level angle' }], projectId: projects[10].id, userId },
      { title: 'Fitness App Demo', scenes: [{ scene: 1, description: 'Person waking up checking phone', duration: 3, camera: 'POV shot' }, { scene: 2, description: 'App UI walkthrough', duration: 5, camera: 'screen capture' }, { scene: 3, description: 'User working out with app', duration: 6, camera: 'wide gym shot' }], projectId: projects[11].id, userId },
      { title: 'Tokyo Travel Highlights', scenes: [{ scene: 1, description: 'Shinjuku crossing chaos', duration: 4, camera: 'overhead time-lapse' }, { scene: 2, description: 'Quiet temple morning', duration: 5, camera: 'slow pan' }, { scene: 3, description: 'Street food market night', duration: 4, camera: 'handheld walk' }], projectId: projects[12].id, userId },
      { title: 'Pitch Deck Video', scenes: [{ scene: 1, description: 'Market opportunity data viz', duration: 4, camera: 'animated infographic' }, { scene: 2, description: 'Product demo screen', duration: 6, camera: 'screen recording' }, { scene: 3, description: 'Team and traction', duration: 4, camera: 'photo montage' }], projectId: projects[13].id, userId },
      { title: 'Concert Stream Overlay', scenes: [{ scene: 1, description: 'Pre-show countdown timer', duration: 10, camera: 'static overlay' }, { scene: 2, description: 'Band intro with graphics', duration: 5, camera: 'lower third' }, { scene: 3, description: 'Song title cards', duration: 3, camera: 'animated overlay' }], projectId: projects[14].id, userId },
      { title: 'E-commerce Lifestyle Shoot', scenes: [{ scene: 1, description: 'Product in lifestyle setting', duration: 4, camera: 'shallow DOF' }, { scene: 2, description: 'Model using product naturally', duration: 5, camera: 'candid style' }, { scene: 3, description: 'Product detail and CTA', duration: 3, camera: 'close macro' }], projectId: projects[15].id, userId },
    ]);

    // Voiceovers
    console.log('Seeding Voiceovers...');
    await Voiceover.bulkCreate([
      { text: 'Welcome to the future of creative content. Where imagination meets artificial intelligence.', voice: 'deep_male', language: 'en-US', duration: 6.5, audioUrl: '/audio/vo-001.mp3', userId },
      { text: 'Introducing TechVision Pro. See the world like never before with augmented reality that feels natural.', voice: 'professional_female', language: 'en-US', duration: 7.2, audioUrl: '/audio/vo-002.mp3', userId },
      { text: 'In the depths of the ocean, where sunlight cannot reach, extraordinary creatures have evolved to create their own light.', voice: 'narrator_male', language: 'en-US', duration: 9.0, audioUrl: '/audio/vo-003.mp3', userId },
      { text: 'Summer vibes are calling! Check out our latest collection - link in bio!', voice: 'energetic_female', language: 'en-US', duration: 4.0, audioUrl: '/audio/vo-004.mp3', userId },
      { text: 'Bienvenue dans notre restaurant. Ce soir, le chef vous propose un menu exceptionnel.', voice: 'elegant_female', language: 'fr-FR', duration: 6.0, audioUrl: '/audio/vo-005.mp3', userId },
      { text: 'Step one: Open the app. Step two: Set your goals. Step three: Start your transformation.', voice: 'friendly_male', language: 'en-US', duration: 7.5, audioUrl: '/audio/vo-006.mp3', userId },
      { text: 'Close your eyes. Take a deep breath. Let the tension melt away from your shoulders.', voice: 'calm_female', language: 'en-US', duration: 8.0, audioUrl: '/audio/vo-007.mp3', userId },
      { text: 'This property features four bedrooms, three bathrooms, and a stunning ocean view from the master suite.', voice: 'professional_male', language: 'en-US', duration: 7.0, audioUrl: '/audio/vo-008.mp3', userId },
      { text: 'Willkommen bei TechVision. Die Zukunft der erweiterten Realitaet beginnt hier.', voice: 'professional_male', language: 'de-DE', duration: 5.5, audioUrl: '/audio/vo-009.mp3', userId },
      { text: 'Every child deserves clean water. Your donation can save lives. Act now.', voice: 'sincere_female', language: 'en-US', duration: 5.0, audioUrl: '/audio/vo-010.mp3', userId },
      { text: 'And the winner of Best Picture goes to... The Last Library, directed by Maria Chen.', voice: 'announcer_male', language: 'en-US', duration: 5.5, audioUrl: '/audio/vo-011.mp3', userId },
      { text: 'Bienvenidos a nuestra experiencia culinaria. Cada plato cuenta una historia.', voice: 'warm_male', language: 'es-ES', duration: 5.0, audioUrl: '/audio/vo-012.mp3', userId },
      { text: 'In a world where darkness reigns, one hero must rise to restore the light. Coming this summer.', voice: 'epic_male', language: 'en-US', duration: 6.5, audioUrl: '/audio/vo-013.mp3', userId },
      { text: 'Subscribe to our channel and hit the bell icon so you never miss an episode of Tech Uncovered.', voice: 'casual_male', language: 'en-US', duration: 5.5, audioUrl: '/audio/vo-014.mp3', userId },
      { text: 'The brushstrokes here demonstrate Monets mastery of light and color, capturing a fleeting moment in time.', voice: 'scholarly_female', language: 'en-US', duration: 7.0, audioUrl: '/audio/vo-015.mp3', userId },
      { text: 'Your order is confirmed. Estimated delivery in two to three business days. Thank you for choosing us.', voice: 'neutral_female', language: 'en-US', duration: 5.0, audioUrl: '/audio/vo-016.mp3', userId },
    ]);

    // Style Presets
    console.log('Seeding StylePresets...');
    await StylePreset.bulkCreate([
      { name: 'Cinematic Teal & Orange', category: 'color_grading', description: 'Hollywood-style teal shadows and orange highlights for a cinematic look', settings: { shadows: '#1a5276', highlights: '#e67e22', contrast: 1.2, saturation: 1.1, brightness: 0.95 }, userId },
      { name: 'Vintage Film Grain', category: 'retro', description: 'Authentic vintage film look with grain, light leaks, and faded colors', settings: { grain: 0.4, lightLeaks: true, fadedBlacks: 0.15, warmth: 1.1, vignette: 0.3 }, userId },
      { name: 'Neon Cyberpunk', category: 'futuristic', description: 'High contrast neon glow effect inspired by cyberpunk aesthetics', settings: { neonGlow: 0.8, contrast: 1.5, saturation: 1.4, bloomRadius: 12, darkShadows: true }, userId },
      { name: 'Soft Pastel Dream', category: 'artistic', description: 'Soft, dreamy pastel color palette with gentle blur', settings: { pastelize: 0.6, softBlur: 2, brightness: 1.1, saturation: 0.7, warmth: 1.05 }, userId },
      { name: 'High Fashion B&W', category: 'fashion', description: 'High contrast black and white with dramatic shadows', settings: { monochrome: true, contrast: 1.8, clarity: 1.3, shadows: -30, highlights: 20 }, userId },
      { name: 'Golden Hour Warmth', category: 'natural', description: 'Warm golden tones mimicking sunset golden hour lighting', settings: { temperature: 6500, tint: 10, warmth: 1.3, softGlow: 0.2, saturation: 1.15 }, userId },
      { name: 'Nordic Minimal', category: 'clean', description: 'Clean, bright Scandinavian-inspired minimalist look', settings: { brightness: 1.2, contrast: 0.9, saturation: 0.6, highlights: 30, whites: 20 }, userId },
      { name: 'Moody Dark Academia', category: 'artistic', description: 'Dark, moody tones with rich browns and deep shadows', settings: { shadows: '#2c1810', midtones: '#8b6914', contrast: 1.3, saturation: 0.8, vignette: 0.4 }, userId },
      { name: 'Anime Cell Shade', category: 'illustration', description: 'Cell-shaded anime-style rendering with bold outlines', settings: { cellShade: true, outlineWidth: 2, colorSteps: 4, saturation: 1.3, contrast: 1.4 }, userId },
      { name: 'Drone Aerial Pop', category: 'aerial', description: 'Vibrant color pop optimized for drone aerial footage', settings: { vibrance: 1.4, clarity: 1.2, dehaze: 0.3, saturation: 1.2, sharpness: 1.5 }, userId },
      { name: 'Horror Desaturated', category: 'genre', description: 'Desaturated cold tones with greenish cast for horror atmosphere', settings: { saturation: 0.3, temperature: 4000, tint: -15, contrast: 1.4, shadows: '#1a2a1a' }, userId },
      { name: 'Retro VHS Glitch', category: 'retro', description: 'VHS tape effect with scan lines, chromatic aberration, and glitch', settings: { scanLines: 0.3, chromaticAberration: 5, noiseLevel: 0.2, tracking: 0.1, colorBleed: true }, userId },
      { name: 'Luxury Brand Gold', category: 'commercial', description: 'Premium luxury brand aesthetic with gold and black tones', settings: { shadows: '#000000', highlights: '#d4af37', contrast: 1.6, saturation: 0.9, vignette: 0.5 }, userId },
      { name: 'Watercolor Wash', category: 'artistic', description: 'Digital watercolor painting effect with soft edges and color bleeding', settings: { watercolor: true, edgeSoftness: 8, colorBleed: 0.4, paperTexture: 0.3, saturation: 0.8 }, userId },
      { name: 'Sports Action HDR', category: 'sports', description: 'High dynamic range look optimized for sports and action footage', settings: { hdr: true, clarity: 1.5, contrast: 1.3, sharpness: 2.0, saturation: 1.2 }, userId },
      { name: 'Clean Corporate', category: 'corporate', description: 'Clean, professional look with neutral tones for corporate content', settings: { brightness: 1.05, contrast: 1.0, saturation: 0.9, sharpness: 1.1, warmth: 1.0 }, userId },
    ]);

    // Exports
    console.log('Seeding Exports...');
    await Export.bulkCreate([
      { name: 'Brand Campaign Final Cut', format: 'mp4', resolution: '4K', status: 'completed', fileUrl: '/exports/brand-campaign-final.mp4', projectId: projects[0].id, userId },
      { name: 'Neon Dreams - Master', format: 'mov', resolution: '4K', status: 'completed', fileUrl: '/exports/neon-dreams-master.mov', projectId: projects[1].id, userId },
      { name: 'TechVision Teaser v2', format: 'mp4', resolution: '1080p', status: 'completed', fileUrl: '/exports/techvision-teaser-v2.mp4', projectId: projects[2].id, userId },
      { name: 'IG Reel - Summer Ad', format: 'mp4', resolution: '1080x1920', status: 'completed', fileUrl: '/exports/ig-summer-ad.mp4', projectId: projects[3].id, userId },
      { name: 'Ocean Depths Trailer', format: 'mp4', resolution: '4K', status: 'processing', fileUrl: null, projectId: projects[4].id, userId },
      { name: 'Spring Lookbook PDF', format: 'pdf', resolution: '300dpi', status: 'completed', fileUrl: '/exports/spring-lookbook.pdf', projectId: projects[5].id, userId },
      { name: 'Property Tour - 123 Oak Lane', format: 'mp4', resolution: '1080p', status: 'completed', fileUrl: '/exports/123-oak-lane.mp4', projectId: projects[6].id, userId },
      { name: 'SaaS Explainer Episode 1', format: 'mp4', resolution: '1080p', status: 'completed', fileUrl: '/exports/explainer-ep1.mp4', projectId: projects[7].id, userId },
      { name: 'Wedding Highlights - 4min', format: 'mp4', resolution: '4K', status: 'completed', fileUrl: '/exports/wedding-highlights.mp4', projectId: projects[8].id, userId },
      { name: 'Podcast Ep.47 Audiogram', format: 'mp4', resolution: '1080x1080', status: 'completed', fileUrl: '/exports/podcast-ep47.mp4', projectId: projects[9].id, userId },
      { name: 'Menu Video - Instagram', format: 'mp4', resolution: '1080x1080', status: 'pending', fileUrl: null, projectId: projects[10].id, userId },
      { name: 'Fitness Promo 30s', format: 'mp4', resolution: '1080x1920', status: 'completed', fileUrl: '/exports/fitness-promo-30s.mp4', projectId: projects[11].id, userId },
      { name: 'Tokyo Vlog Ep.1', format: 'mp4', resolution: '4K', status: 'completed', fileUrl: '/exports/tokyo-vlog-ep1.mp4', projectId: projects[12].id, userId },
      { name: 'Pitch Deck Video Final', format: 'mp4', resolution: '1080p', status: 'processing', fileUrl: null, projectId: projects[13].id, userId },
      { name: 'Concert Overlay Pack', format: 'mov', resolution: '1080p', status: 'completed', fileUrl: '/exports/concert-overlays.mov', projectId: projects[14].id, userId },
      { name: 'Product Showcase GIF Set', format: 'gif', resolution: '800x800', status: 'completed', fileUrl: '/exports/product-gifs.zip', projectId: projects[15].id, userId },
    ]);

    // Spreadsheets
    console.log('Seeding Spreadsheets...');
    await Spreadsheet.bulkCreate([
      {
        userId, name: 'Q1 Sales Report', description: 'Quarterly sales figures by region', template: 'financial', fileName: 'q1_sales.xlsx', fileSize: 45200, status: 'active',
        columns: ['Region', 'Revenue', 'Expenses', 'Profit', 'Units'],
        data: [
          { Region: 'North', Revenue: 125000, Expenses: 85000, Profit: 40000, Units: 520 },
          { Region: 'South', Revenue: 98000, Expenses: 67000, Profit: 31000, Units: 410 },
          { Region: 'East', Revenue: 142000, Expenses: 91000, Profit: 51000, Units: 680 },
          { Region: 'West', Revenue: 115000, Expenses: 78000, Profit: 37000, Units: 490 },
          { Region: 'Central', Revenue: 88000, Expenses: 62000, Profit: 26000, Units: 350 },
        ],
        calculations: [
          { column: 'Revenue', sum: 568000, average: 113600, min: 88000, max: 142000, count: 5 },
          { column: 'Expenses', sum: 383000, average: 76600, min: 62000, max: 91000, count: 5 },
          { column: 'Profit', sum: 185000, average: 37000, min: 26000, max: 51000, count: 5 },
        ],
        summary: { Revenue: { sum: 568000, average: 113600 }, Profit: { sum: 185000, average: 37000 } },
        tabs: ['Variables'],
        variables: [],
      },
      {
        userId, name: 'Employee Performance', description: 'Annual performance metrics', template: 'statistical', fileName: 'performance.xlsx', fileSize: 32100, status: 'active',
        columns: ['Employee', 'Score', 'Projects', 'Hours', 'Rating'],
        data: [
          { Employee: 'Alice Chen', Score: 92, Projects: 8, Hours: 1840, Rating: 4.8 },
          { Employee: 'Bob Smith', Score: 87, Projects: 6, Hours: 1760, Rating: 4.5 },
          { Employee: 'Carol Davis', Score: 95, Projects: 10, Hours: 1920, Rating: 4.9 },
          { Employee: 'Dan Wilson', Score: 78, Projects: 5, Hours: 1680, Rating: 4.0 },
          { Employee: 'Eve Johnson', Score: 91, Projects: 7, Hours: 1800, Rating: 4.7 },
        ],
        calculations: [{ column: 'Score', sum: 443, average: 88.6, min: 78, max: 95, count: 5 }],
        summary: { Score: { sum: 443, average: 88.6 } },
        tabs: ['Variables'],
        variables: [],
      },
      {
        userId, name: 'Marketing Budget', description: 'Monthly marketing spend breakdown', template: 'financial', fileName: 'marketing_budget.xlsx', fileSize: 28700, status: 'active',
        columns: ['Channel', 'Budget', 'Spent', 'ROI', 'Leads'],
        data: [
          { Channel: 'Google Ads', Budget: 15000, Spent: 14200, ROI: 320, Leads: 450 },
          { Channel: 'Facebook', Budget: 10000, Spent: 9800, ROI: 280, Leads: 380 },
          { Channel: 'LinkedIn', Budget: 8000, Spent: 7500, ROI: 190, Leads: 210 },
          { Channel: 'Email', Budget: 3000, Spent: 2800, ROI: 520, Leads: 890 },
          { Channel: 'SEO', Budget: 5000, Spent: 4900, ROI: 410, Leads: 620 },
        ],
        calculations: [{ column: 'Budget', sum: 41000, average: 8200, min: 3000, max: 15000, count: 5 }],
        summary: { Budget: { sum: 41000, average: 8200 }, Spent: { sum: 39200, average: 7840 } },
      },
      {
        userId, name: 'Inventory Tracker', description: 'Product inventory levels', template: 'basic', fileName: 'inventory.xlsx', fileSize: 51400, status: 'active',
        columns: ['Product', 'SKU', 'Stock', 'Reorder', 'Price'],
        data: [
          { Product: 'Widget A', SKU: 'WA-001', Stock: 150, Reorder: 50, Price: 29.99 },
          { Product: 'Widget B', SKU: 'WB-002', Stock: 80, Reorder: 30, Price: 49.99 },
          { Product: 'Gadget X', SKU: 'GX-003', Stock: 200, Reorder: 75, Price: 19.99 },
          { Product: 'Gadget Y', SKU: 'GY-004', Stock: 45, Reorder: 40, Price: 89.99 },
        ],
        calculations: [{ column: 'Stock', sum: 475, average: 118.75, min: 45, max: 200, count: 4 }],
        summary: { Stock: { sum: 475, average: 118.75 } },
      },
      {
        userId, name: 'Monthly Revenue Growth', description: 'Revenue growth tracking over months', template: 'growth', fileName: 'revenue_growth.xlsx', fileSize: 18900, status: 'active',
        columns: ['Month', 'Revenue', 'Customers', 'ARPU'],
        data: [
          { Month: 'Jan', Revenue: 42000, Customers: 120, ARPU: 350 },
          { Month: 'Feb', Revenue: 48000, Customers: 135, ARPU: 356 },
          { Month: 'Mar', Revenue: 55000, Customers: 150, ARPU: 367 },
          { Month: 'Apr', Revenue: 52000, Customers: 148, ARPU: 351 },
          { Month: 'May', Revenue: 61000, Customers: 165, ARPU: 370 },
          { Month: 'Jun', Revenue: 68000, Customers: 180, ARPU: 378 },
        ],
        calculations: [{ column: 'Revenue', sum: 326000, average: 54333.33, min: 42000, max: 68000, count: 6 }],
        summary: { Revenue: { sum: 326000, average: 54333.33 } },
      },
      {
        userId, name: 'Project Timeline', description: 'Project milestones and deadlines', template: 'basic', fileName: 'timeline.xlsx', fileSize: 22300, status: 'active',
        columns: ['Task', 'Assignee', 'Days', 'Priority', 'Progress'],
        data: [
          { Task: 'Design Phase', Assignee: 'Alice', Days: 14, Priority: 'High', Progress: 100 },
          { Task: 'Development', Assignee: 'Bob', Days: 30, Priority: 'High', Progress: 75 },
          { Task: 'Testing', Assignee: 'Carol', Days: 10, Priority: 'Medium', Progress: 40 },
          { Task: 'Deployment', Assignee: 'Dan', Days: 5, Priority: 'High', Progress: 0 },
        ],
        calculations: [{ column: 'Days', sum: 59, average: 14.75, min: 5, max: 30, count: 4 }],
        summary: { Days: { sum: 59, average: 14.75 }, Progress: { sum: 215, average: 53.75 } },
      },
      {
        userId, name: 'Customer Survey Results', description: 'NPS and satisfaction scores', template: 'statistical', fileName: 'survey.xlsx', fileSize: 35600, status: 'completed',
        columns: ['Question', 'Avg Score', 'Responses', 'Satisfaction'],
        data: [
          { Question: 'Overall Experience', 'Avg Score': 4.2, Responses: 500, Satisfaction: 84 },
          { Question: 'Product Quality', 'Avg Score': 4.5, Responses: 480, Satisfaction: 90 },
          { Question: 'Customer Service', 'Avg Score': 3.8, Responses: 450, Satisfaction: 76 },
          { Question: 'Value for Money', 'Avg Score': 3.9, Responses: 470, Satisfaction: 78 },
          { Question: 'Recommend to Others', 'Avg Score': 4.3, Responses: 490, Satisfaction: 86 },
        ],
        calculations: [],
        summary: {},
      },
      {
        userId, name: 'Vendor Comparison', description: 'Comparing vendor pricing and quality', template: 'basic', fileName: 'vendors.xlsx', fileSize: 19800, status: 'active',
        columns: ['Vendor', 'Price', 'Quality', 'Delivery', 'Support'],
        data: [
          { Vendor: 'Acme Corp', Price: 2500, Quality: 92, Delivery: 85, Support: 88 },
          { Vendor: 'Beta LLC', Price: 2200, Quality: 88, Delivery: 90, Support: 82 },
          { Vendor: 'Gamma Inc', Price: 2800, Quality: 95, Delivery: 78, Support: 91 },
          { Vendor: 'Delta Co', Price: 1900, Quality: 80, Delivery: 92, Support: 75 },
        ],
        calculations: [{ column: 'Price', sum: 9400, average: 2350, min: 1900, max: 2800, count: 4 }],
        summary: { Price: { sum: 9400, average: 2350 } },
      },
      {
        userId, name: 'Website Analytics', description: 'Monthly web traffic data', template: 'growth', fileName: 'analytics.xlsx', fileSize: 41200, status: 'active',
        columns: ['Month', 'Visitors', 'PageViews', 'BounceRate', 'Conversions'],
        data: [
          { Month: 'Jan', Visitors: 12000, PageViews: 45000, BounceRate: 42, Conversions: 360 },
          { Month: 'Feb', Visitors: 14500, PageViews: 52000, BounceRate: 39, Conversions: 435 },
          { Month: 'Mar', Visitors: 16200, PageViews: 58000, BounceRate: 37, Conversions: 486 },
          { Month: 'Apr', Visitors: 15800, PageViews: 55000, BounceRate: 40, Conversions: 474 },
        ],
        calculations: [{ column: 'Visitors', sum: 58500, average: 14625, min: 12000, max: 16200, count: 4 }],
        summary: { Visitors: { sum: 58500, average: 14625 } },
      },
      {
        userId, name: 'Expense Report', description: 'Department expense tracking', template: 'financial', fileName: 'expenses.xlsx', fileSize: 27600, status: 'active',
        columns: ['Department', 'Salaries', 'Operations', 'Marketing', 'Total'],
        data: [
          { Department: 'Engineering', Salaries: 250000, Operations: 45000, Marketing: 10000, Total: 305000 },
          { Department: 'Sales', Salaries: 180000, Operations: 30000, Marketing: 50000, Total: 260000 },
          { Department: 'HR', Salaries: 120000, Operations: 25000, Marketing: 5000, Total: 150000 },
          { Department: 'Support', Salaries: 95000, Operations: 20000, Marketing: 8000, Total: 123000 },
        ],
        calculations: [{ column: 'Total', sum: 838000, average: 209500, min: 123000, max: 305000, count: 4 }],
        summary: { Total: { sum: 838000, average: 209500 } },
      },
      {
        userId, name: 'Product Sales Mix', description: 'Sales distribution by product line', template: 'financial', fileName: 'sales_mix.xlsx', fileSize: 33100, status: 'active',
        columns: ['Product', 'UnitsSold', 'Revenue', 'Margin', 'Share'],
        data: [
          { Product: 'Premium Plan', UnitsSold: 250, Revenue: 125000, Margin: 68, Share: 35 },
          { Product: 'Standard Plan', UnitsSold: 480, Revenue: 96000, Margin: 55, Share: 27 },
          { Product: 'Basic Plan', UnitsSold: 820, Revenue: 82000, Margin: 72, Share: 23 },
          { Product: 'Enterprise', UnitsSold: 45, Revenue: 54000, Margin: 80, Share: 15 },
        ],
        calculations: [{ column: 'Revenue', sum: 357000, average: 89250, min: 54000, max: 125000, count: 4 }],
        summary: { Revenue: { sum: 357000, average: 89250 } },
      },
      {
        userId, name: 'Team Capacity', description: 'Team workload and availability', template: 'basic', fileName: 'capacity.xlsx', fileSize: 15800, status: 'active',
        columns: ['Team', 'Members', 'Capacity', 'Allocated', 'Available'],
        data: [
          { Team: 'Frontend', Members: 5, Capacity: 200, Allocated: 175, Available: 25 },
          { Team: 'Backend', Members: 6, Capacity: 240, Allocated: 220, Available: 20 },
          { Team: 'Design', Members: 3, Capacity: 120, Allocated: 100, Available: 20 },
          { Team: 'QA', Members: 4, Capacity: 160, Allocated: 130, Available: 30 },
        ],
        calculations: [{ column: 'Capacity', sum: 720, average: 180, min: 120, max: 240, count: 4 }],
        summary: { Capacity: { sum: 720, average: 180 } },
      },
      {
        userId, name: 'Campaign Performance', description: 'Ad campaign KPIs', template: 'growth', fileName: 'campaigns.xlsx', fileSize: 29400, status: 'completed',
        columns: ['Campaign', 'Impressions', 'Clicks', 'CTR', 'Conversions'],
        data: [
          { Campaign: 'Summer Sale', Impressions: 500000, Clicks: 15000, CTR: 3.0, Conversions: 750 },
          { Campaign: 'Product Launch', Impressions: 800000, Clicks: 32000, CTR: 4.0, Conversions: 1280 },
          { Campaign: 'Brand Awareness', Impressions: 1200000, Clicks: 24000, CTR: 2.0, Conversions: 480 },
        ],
        calculations: [{ column: 'Clicks', sum: 71000, average: 23666.67, min: 15000, max: 32000, count: 3 }],
        summary: { Clicks: { sum: 71000, average: 23666.67 } },
      },
      {
        userId, name: 'Budget Forecast', description: 'Next quarter budget projections', template: 'financial', fileName: 'forecast.xlsx', fileSize: 24500, status: 'draft',
        columns: ['Category', 'Current', 'Projected', 'Change', 'Confidence'],
        data: [
          { Category: 'Revenue', Current: 500000, Projected: 575000, Change: 15, Confidence: 85 },
          { Category: 'COGS', Current: 200000, Projected: 220000, Change: 10, Confidence: 90 },
          { Category: 'OpEx', Current: 150000, Projected: 160000, Change: 6.7, Confidence: 88 },
          { Category: 'Marketing', Current: 50000, Projected: 65000, Change: 30, Confidence: 75 },
        ],
        calculations: [],
        summary: {},
      },
      {
        userId, name: 'KPI Dashboard Data', description: 'Key metrics for executive dashboard', template: 'statistical', fileName: 'kpi.xlsx', fileSize: 38900, status: 'active',
        columns: ['Metric', 'Target', 'Actual', 'Variance', 'Status'],
        data: [
          { Metric: 'Revenue', Target: 500000, Actual: 485000, Variance: -3, Status: 'Warning' },
          { Metric: 'New Customers', Target: 200, Actual: 215, Variance: 7.5, Status: 'On Track' },
          { Metric: 'Churn Rate', Target: 5, Actual: 4.2, Variance: -16, Status: 'On Track' },
          { Metric: 'NPS Score', Target: 45, Actual: 48, Variance: 6.7, Status: 'On Track' },
          { Metric: 'Support Tickets', Target: 100, Actual: 125, Variance: 25, Status: 'At Risk' },
        ],
        calculations: [],
        summary: {},
      },
      {
        userId, name: 'Resource Allocation', description: 'Project resource distribution', template: 'basic', fileName: 'resources.xlsx', fileSize: 20100, status: 'active',
        columns: ['Resource', 'Project', 'Hours', 'Cost', 'Utilization'],
        data: [
          { Resource: 'Developer A', Project: 'Alpha', Hours: 160, Cost: 12800, Utilization: 95 },
          { Resource: 'Developer B', Project: 'Beta', Hours: 140, Cost: 11200, Utilization: 82 },
          { Resource: 'Designer A', Project: 'Alpha', Hours: 120, Cost: 9600, Utilization: 71 },
          { Resource: 'PM', Project: 'Both', Hours: 80, Cost: 8000, Utilization: 47 },
        ],
        calculations: [{ column: 'Hours', sum: 500, average: 125, min: 80, max: 160, count: 4 }],
        summary: { Hours: { sum: 500, average: 125 } },
      },
    ]);

    console.log('\nSeed completed successfully!');
    console.log('Default user: admin@runway.com / admin123');
    console.log('Seeded 16 items each for: Projects, Assets, VideoGenerations, ImageGenerations, Templates, Scripts, Storyboards, Voiceovers, StylePresets, Exports, Spreadsheets');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
