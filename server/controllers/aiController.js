const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const FollowUp = require('../models/FollowUp');

exports.generateInsights = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId).populate('assignedTo', 'name');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const activities = await Activity.find({ leadId: lead._id }).populate('performedBy', 'name').sort('-createdAt').limit(20);
    const followups = await FollowUp.find({ leadId: lead._id }).sort('-scheduledDate').limit(10);

    const activitySummary = activities.map(a => `${new Date(a.createdAt).toLocaleDateString()} - ${a.activityType}: ${a.description}`).join('\n');
    const followupSummary = followups.map(f => `${new Date(f.scheduledDate).toLocaleDateString()} - ${f.purpose} [${f.status}]`).join('\n');

    const prompt = `You are a senior sales analyst AI. Analyze this B2B lead and provide detailed insights.

LEAD INFORMATION:
Company: ${lead.companyName}
Contact: ${lead.contactPerson}
Industry: ${lead.industry}
Source: ${lead.source}
Current Status: ${lead.status}
Estimated Deal Value: $${lead.estimatedDealValue?.toLocaleString() || 0}
Notes: ${lead.notes || 'None'}

COMMUNICATION HISTORY:
${activitySummary || 'No activities recorded'}

FOLLOW-UP HISTORY:
${followupSummary || 'No follow-ups recorded'}

Provide a JSON response with this exact structure:
{
  "leadScore": <number 0-100>,
  "priority": "<Low|Medium|High|Critical>",
  "conversionProbability": <number 0-100>,
  "summary": "<2-3 sentence sales summary>",
  "strengths": ["<strength1>", "<strength2>"],
  "risks": ["<risk1>", "<risk2>"],
  "nextBestAction": "<specific actionable recommendation>",
  "followUpRecommendation": "<when and how to follow up>",
  "talkingPoints": ["<point1>", "<point2>", "<point3>"]
}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return mock data if no API key
      const mockInsights = {
        leadScore: Math.floor(Math.random() * 40) + 50,
        priority: ['Medium', 'High', 'Critical'][Math.floor(Math.random() * 3)],
        conversionProbability: Math.floor(Math.random() * 40) + 40,
        summary: `${lead.companyName} is a promising ${lead.industry || 'industry'} lead currently in ${lead.status} stage. The lead was sourced through ${lead.source} and shows potential for conversion.`,
        strengths: ['Active communication history', 'Clear budget indication', 'Decision maker engaged'],
        risks: ['Long sales cycle possible', 'Competition may be involved'],
        nextBestAction: `Schedule a product demonstration call with ${lead.contactPerson} to showcase key value propositions tailored to their industry.`,
        followUpRecommendation: 'Follow up within 48 hours with a personalized email summarizing key benefits.',
        talkingPoints: ['ROI and cost savings', 'Industry-specific use cases', 'Implementation timeline and support']
      };
      lead.aiScore = mockInsights.leadScore;
      lead.aiInsights = JSON.stringify(mockInsights);
      lead.aiLastGeneratedAt = new Date();
      await lead.save();
      return res.json({ success: true, insights: mockInsights });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 1024 } })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const insights = JSON.parse(jsonMatch[0]);
    lead.aiScore = insights.leadScore;
    lead.aiInsights = JSON.stringify(insights);
    lead.aiLastGeneratedAt = new Date();
    await lead.save();

    res.json({ success: true, insights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
