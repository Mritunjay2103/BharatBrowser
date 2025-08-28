import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
    });
    
    if (!response.ok) {
        return NextResponse.json({ error: `Failed to fetch the URL, status: ${response.status}` }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script and style elements
    $('script, style, noscript, nav, footer, header, aside').remove();

    // Get text from the body, attempting to get meaningful content
    let text = $('body').text();

    // Basic cleanup
    text = text.replace(/\s\s+/g, ' ').trim();

    const MAX_LENGTH = 5000;
    if (text.length > MAX_LENGTH) {
      text = text.substring(0, MAX_LENGTH);
    }

    return NextResponse.json({ content: text });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch and process the URL.' }, { status: 500 });
  }
}
