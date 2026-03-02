// LLM Prompt Library — v11.1.0
export const llmPromptLibrary = [
  { id:'LP01', name:'Menu Recommendation', category:'customer', prompt:'Based on the customer preferences: {{preferences}}, recommend 3 menu items from our catalog. Be warm and appetizing in tone.', approved:true, guardrails:['no_competitor_mentions','no_health_claims','no_discount_promises'] },
  { id:'LP02', name:'Order Status Reply', category:'support', prompt:'Customer {{name}} is asking about order #{{order_id}}. Current status: {{status}}. Generate a friendly WhatsApp reply.', approved:true, guardrails:['no_false_eta','no_blame'] },
  { id:'LP03', name:'Review Response', category:'marketing', prompt:'Respond to this customer review: "{{review}}". Be grateful, professional, and address any concerns.', approved:true, guardrails:['no_defensive_tone','acknowledge_issues'] },
  { id:'LP04', name:'Win-Back Message', category:'crm', prompt:'Customer {{name}} last ordered {{days_ago}} days ago. Their favorite items: {{favorites}}. Write a personalized WhatsApp message to bring them back.', approved:true, guardrails:['no_aggressive_selling','include_offer'] },
  { id:'LP05', name:'Festival Greeting', category:'marketing', prompt:'Create a {{festival}} greeting for our customers. Include a subtle mention of our special {{festival}} menu.', approved:true, guardrails:['culturally_sensitive','no_religious_assumptions'] },
  { id:'LP06', name:'Area Landing Content', category:'seo', prompt:'Write SEO-optimized content for the {{area}} landing page. Include local landmarks, delivery info, and why Charminar Mehfil is the best choice in {{area}}.', approved:false, guardrails:['no_false_claims','include_nap'] },
];
