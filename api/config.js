import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const apiKey = process.env.NOTION_API_KEY;
    const blockId = process.env.NOTION_BLOCK_ID;

    if (!apiKey || !blockId) {
      return res.status(500).json({ error: "Missing Notion credentials in environment variables." });
    }

    const notion = new Client({ auth: apiKey });
    const block = await notion.blocks.retrieve({ block_id: blockId });

    if (block.type === 'code' && block.code.language === 'json') {
      const content = block.code.rich_text.map(t => t.plain_text).join('');
      return res.status(200).json(JSON.parse(content));
    } else {
      return res.status(400).json({ error: "The provided Notion Block ID does not point to a JSON Code Block." });
    }
  } catch (err) {
    console.error("Vercel Function Error: ", err);
    return res.status(500).json({ error: err.message });
  }
}
