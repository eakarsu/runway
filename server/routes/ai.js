// Apply pass 5 — adds the following routes to the existing router:
//   GET  /api/ai/usage-analytics              (DB aggregation, no AI)
//   POST /api/ai/brand-consistency            (AI; PRODUCT-DECISION: prompt-based)
// Required env vars (already used by existing endpoints): OPENROUTER_API_KEY,
// OPENROUTER_MODEL.
const express = require('express');
const authenticate = require('../middleware/auth');
const { VideoGeneration, ImageGeneration, Voiceover, Storyboard } = require('../models');

const router = express.Router();

async function callOpenRouter(prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  return {
    raw: content,
    model: data.model,
    usage: data.usage,
    sections: parseSections(content),
  };
}

function parseSections(text) {
  const sections = {};
  const lines = text.split('\n');
  let currentSection = 'main';
  sections[currentSection] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headerMatch) {
      currentSection = headerMatch[1].toLowerCase().replace(/[^a-z0-9]+/g, '_');
      sections[currentSection] = [];
    } else {
      sections[currentSection] = sections[currentSection] || [];
      sections[currentSection].push(line);
    }
  }

  for (const key of Object.keys(sections)) {
    sections[key] = sections[key].join('\n').trim();
  }

  return sections;
}

// Text to Video
router.post('/text-to-video', authenticate, async (req, res) => {
  try {
    const { prompt, duration, resolution, style } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const aiPrompt = `You are a professional video generation AI. Given the following text prompt, generate a detailed video description including scene breakdown, camera movements, transitions, and visual details.

Prompt: "${prompt}"
Duration: ${duration || '10 seconds'}
Resolution: ${resolution || '1080p'}
Style: ${style || 'cinematic'}

Provide the response with these sections:
## Scene Description
## Camera Movements
## Visual Effects
## Color Palette
## Audio Suggestions`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'text-to-video', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Text to Image
router.post('/text-to-image', authenticate, async (req, res) => {
  try {
    const { prompt, width, height, style, negativePrompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const aiPrompt = `You are a professional image generation AI assistant. Generate a detailed image description and creation guide for the following prompt.

Prompt: "${prompt}"
Dimensions: ${width || 1024}x${height || 1024}
Style: ${style || 'photorealistic'}
${negativePrompt ? `Avoid: ${negativePrompt}` : ''}

Provide the response with these sections:
## Image Description
## Composition
## Lighting
## Color Palette
## Technical Details`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'text-to-image', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Image to Video
router.post('/image-to-video', authenticate, async (req, res) => {
  try {
    const { imageDescription, duration, style } = req.body;
    if (!imageDescription) return res.status(400).json({ error: 'Image description is required' });

    const aiPrompt = `You are a professional image-to-video AI. Given this image description, create a detailed video storyboard that animates the image.

Image Description: "${imageDescription}"
Duration: ${duration || '5 seconds'}
Style: ${style || 'smooth animation'}

Provide the response with these sections:
## Animation Plan
## Keyframes
## Motion Details
## Transition Effects
## Timing`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'image-to-video', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Background Removal
router.post('/background-removal', authenticate, async (req, res) => {
  try {
    const { imageDescription } = req.body;
    if (!imageDescription) return res.status(400).json({ error: 'Image description is required' });

    const aiPrompt = `You are an AI image analysis expert. Analyze this image description and provide guidance for background removal.

Image Description: "${imageDescription}"

Provide the response with these sections:
## Subject Identification
## Background Analysis
## Edge Detection Strategy
## Recommended Technique
## Potential Challenges`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'background-removal', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Style Transfer
router.post('/style-transfer', authenticate, async (req, res) => {
  try {
    const { contentDescription, targetStyle } = req.body;
    if (!contentDescription || !targetStyle) return res.status(400).json({ error: 'Content description and target style are required' });

    const aiPrompt = `You are an AI style transfer expert. Describe how to apply the target artistic style to the given content.

Content: "${contentDescription}"
Target Style: "${targetStyle}"

Provide the response with these sections:
## Style Analysis
## Transformation Plan
## Color Adjustments
## Texture Changes
## Final Result Description`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'style-transfer', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upscale
router.post('/upscale', authenticate, async (req, res) => {
  try {
    const { imageDescription, targetResolution } = req.body;
    if (!imageDescription) return res.status(400).json({ error: 'Image description is required' });

    const aiPrompt = `You are an AI upscaling expert. Analyze this image description and provide an upscale strategy.

Image Description: "${imageDescription}"
Target Resolution: ${targetResolution || '4K'}

Provide the response with these sections:
## Current Quality Assessment
## Upscale Strategy
## Detail Enhancement Areas
## Artifact Prevention
## Expected Quality`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'upscale', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Script Writer
router.post('/script-writer', authenticate, async (req, res) => {
  try {
    const { topic, genre, tone, duration } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const aiPrompt = `You are a professional script writer. Write a creative script based on the following parameters.

Topic: "${topic}"
Genre: ${genre || 'drama'}
Tone: ${tone || 'professional'}
Duration: ${duration || '60 seconds'}

Provide the response with these sections:
## Title
## Synopsis
## Script
## Stage Directions
## Character Notes`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'script-writer', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Storyboard Generator
router.post('/storyboard-generator', authenticate, async (req, res) => {
  try {
    const { script, scenes, style } = req.body;
    if (!script) return res.status(400).json({ error: 'Script is required' });

    const aiPrompt = `You are a professional storyboard artist. Create a detailed storyboard from the following script.

Script: "${script}"
Number of Scenes: ${scenes || 6}
Visual Style: ${style || 'cinematic'}

Provide the response with these sections:
## Overview
## Scene Breakdown
## Visual References
## Camera Angles
## Transitions`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'storyboard-generator', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Voice Generator
router.post('/voice-generator', authenticate, async (req, res) => {
  try {
    const { text, voice, language, emotion } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const aiPrompt = `You are a voice generation AI. Create an SSML-annotated voice script from the following text.

Text: "${text}"
Voice Type: ${voice || 'neutral'}
Language: ${language || 'en-US'}
Emotion: ${emotion || 'professional'}

Provide the response with these sections:
## SSML Script
## Pronunciation Guide
## Pacing Notes
## Emphasis Markers
## Estimated Duration`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'voice-generator', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scene Analyzer
router.post('/scene-analyzer', authenticate, async (req, res) => {
  try {
    const { sceneDescription } = req.body;
    if (!sceneDescription) return res.status(400).json({ error: 'Scene description is required' });

    const aiPrompt = `You are a professional video scene analyzer. Analyze the following scene description in detail.

Scene: "${sceneDescription}"

Provide the response with these sections:
## Scene Composition
## Subject Analysis
## Lighting Assessment
## Mood & Atmosphere
## Improvement Suggestions`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'scene-analyzer', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Color Grader
router.post('/color-grader', authenticate, async (req, res) => {
  try {
    const { sceneDescription, mood, reference } = req.body;
    if (!sceneDescription) return res.status(400).json({ error: 'Scene description is required' });

    const aiPrompt = `You are a professional colorist. Suggest color grading for the following scene.

Scene: "${sceneDescription}"
Desired Mood: ${mood || 'cinematic'}
${reference ? `Reference Style: ${reference}` : ''}

Provide the response with these sections:
## Color Palette
## LUT Suggestions
## Contrast & Exposure
## Color Temperature
## Creative Adjustments`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'color-grader', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Motion Tracker
router.post('/motion-tracker', authenticate, async (req, res) => {
  try {
    const { videoDescription } = req.body;
    if (!videoDescription) return res.status(400).json({ error: 'Video description is required' });

    const aiPrompt = `You are a motion tracking AI expert. Analyze the following video description for motion tracking opportunities.

Video Description: "${videoDescription}"

Provide the response with these sections:
## Motion Analysis
## Tracking Points
## Movement Patterns
## Stabilization Suggestions
## Compositing Recommendations`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'motion-tracker', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto Subtitle Generator
router.post('/auto-subtitle-generator', authenticate, async (req, res) => {
  try {
    const { transcript, language, style } = req.body;
    if (!transcript) return res.status(400).json({ error: 'Transcript text is required' });

    const aiPrompt = `You are a subtitle/caption editor. Convert the following transcript into properly timed, broadcast-quality subtitles.

Transcript: "${transcript}"
Target Language: ${language || 'English'}
Style: ${style || 'standard, accessibility-friendly'}

Provide the response with these sections:
## Subtitle Cues
## Timing Notes
## Reading Speed Adjustments
## Accessibility Tips
## Translation/Localization Notes`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'auto-subtitle-generator', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Music Recommendation
router.post('/music-recommendation', authenticate, async (req, res) => {
  try {
    const { sceneDescription, mood, durationSeconds, license } = req.body;
    if (!sceneDescription) return res.status(400).json({ error: 'Scene description is required' });

    const aiPrompt = `You are a music supervisor. Recommend soundtrack directions for the following video scene.

Scene Description: "${sceneDescription}"
Desired Mood: ${mood || 'unspecified'}
Duration (seconds): ${durationSeconds || 'unspecified'}
License Requirements: ${license || 'royalty-free / commercial use'}

Provide the response with these sections:
## Recommended Genres
## Tempo & Key Suggestions
## Reference Tracks (search terms)
## Sound Design / SFX Notes
## License & Rights Notes`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'music-recommendation', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scene Transition Suggester
router.post('/scene-transition-suggester', authenticate, async (req, res) => {
  try {
    const { scenes, projectStyle } = req.body;
    if (!Array.isArray(scenes) || scenes.length < 2) {
      return res.status(400).json({ error: 'scenes (array of at least 2 scene descriptions) is required' });
    }

    const aiPrompt = `You are a film editor. Recommend transitions between consecutive scenes that improve pacing and emotional flow.

Project Style: ${projectStyle || 'modern, cinematic'}
Scenes:\n${scenes.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Provide the response with these sections:
## Recommended Transitions (per pair)
## Pacing Notes
## Audio Bridges
## Cut Type Rationale
## Risks To Avoid`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'scene-transition-suggester', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Performance Predictor — engagement forecast for a video concept
router.post('/performance-predictor', authenticate, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'OPENROUTER_API_KEY not configured' });
    }
    const { title, description, platforms, audience, durationSeconds, hashtags } = req.body;
    if (!title && !description) {
      return res.status(400).json({ error: 'title or description is required' });
    }

    const aiPrompt = `You are a social-video performance analyst. Predict expected engagement for the following concept.

Title: ${title || '(none)'}
Description: ${description || '(none)'}
Target Platforms: ${(Array.isArray(platforms) ? platforms.join(', ') : platforms) || 'YouTube, TikTok, Instagram'}
Target Audience: ${audience || 'general'}
Duration (seconds): ${durationSeconds || 'unspecified'}
Hashtags: ${Array.isArray(hashtags) ? hashtags.join(', ') : (hashtags || 'none')}

Provide the response with these sections:
## Per-Platform Forecast
## Engagement Drivers
## Likely Risks
## A/B Test Suggestions
## Optimization Recommendations
## Confidence`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'performance-predictor', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Platform-Specific Export Optimizer — settings & cuts per target platform
router.post('/platform-export-optimizer', authenticate, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'OPENROUTER_API_KEY not configured' });
    }
    const { sourceFormat, durationSeconds, targets, contentSummary } = req.body;
    if (!Array.isArray(targets) || targets.length === 0) {
      return res.status(400).json({ error: 'targets (array) is required' });
    }

    const aiPrompt = `You are a multi-platform video distribution specialist. For each target platform, recommend export settings, recommended duration, aspect ratio, and content adaptations.

Source Format: ${sourceFormat || 'unspecified'}
Source Duration (seconds): ${durationSeconds || 'unspecified'}
Content Summary: ${contentSummary || '(none)'}
Targets: ${targets.join(', ')}

Provide the response with these sections (one block per platform):
## Per-Platform Settings
## Recommended Cuts / Trims
## Aspect Ratio & Safe Areas
## Caption / Subtitle Notes
## Thumbnail Recommendations
## Posting Tips`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'platform-export-optimizer', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Usage Analytics — credits / generations per user, no AI required.
router.get('/usage-analytics', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [videos, images, voiceovers, storyboards] = await Promise.all([
      VideoGeneration.count({ where: { userId } }),
      ImageGeneration.count({ where: { userId } }),
      Voiceover.count({ where: { userId } }),
      Storyboard.count({ where: { userId } }),
    ]);
    // PRODUCT-DECISION: credit cost per generation type. These are
    // illustrative defaults — production would source from a Plan model.
    const COST = { video: 10, image: 2, voiceover: 5, storyboard: 3 };
    const totalCredits =
      videos * COST.video +
      images * COST.image +
      voiceovers * COST.voiceover +
      storyboards * COST.storyboard;
    res.json({
      success: true,
      counts: { videos, images, voiceovers, storyboards },
      creditCost: COST,
      totalCredits,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Brand Consistency Checker — checks supplied content against brand rules.
// PRODUCT-DECISION: brand rules are passed in the request body as plain
// text (not stored). Storing rules per-team requires a product decision
// about team/permission scope which is out of scope for this pass.
router.post('/brand-consistency', authenticate, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'OPENROUTER_API_KEY not configured', missing: 'OPENROUTER_API_KEY' });
    }
    const { brandRules, content, contentType } = req.body;
    if (!brandRules || !content) {
      return res.status(400).json({ error: 'brandRules and content are required' });
    }

    const aiPrompt = `You are a brand consistency reviewer. Given the brand rules and the content, identify violations, near-misses, and aligned elements.

Brand Rules:
${brandRules}

Content Type: ${contentType || 'unspecified'}
Content:
${content}

Provide the response with these sections:
## Overall Score (0-100)
## Violations
## Near-Misses
## Aligned Elements
## Recommended Fixes`;

    const result = await callOpenRouter(aiPrompt);
    res.json({ success: true, type: 'brand-consistency', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
