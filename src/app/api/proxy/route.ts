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
        },
        redirect: 'follow'
    });
    
    const finalUrl = response.url; // Get the final URL after any redirects
    const contentType = response.headers.get('content-type') || '';
    
    // If it's not HTML, just redirect to the final URL
    if (!contentType.includes('text/html')) {
        return NextResponse.redirect(finalUrl);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);

    // Make all links absolute
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
            try {
                const absoluteUrl = new URL(href, finalUrl).toString();
                // Route internal navigation through the proxy
                $(el).attr('href', `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`);
            } catch (e) {
                // ignore invalid URLs
            }
        }
    });
    
    // Remove script and style elements
    $('script, style, noscript, nav, footer, header, aside').remove();

    // Get text from the main content, or body if main is not found
    let text = $('main').text();
    if (!text) {
      text = $('body').text();
    }

    // Basic cleanup
    text = text.replace(/\s\s+/g, ' ').trim();

    const MAX_LENGTH = 5000;
    if (text.length > MAX_LENGTH) {
      text = text.substring(0, MAX_LENGTH);
    }
    
    // Return the modified HTML to be rendered in the iframe, and include the extracted text and finalUrl in headers
    const headers = new Headers();
    headers.set('X-Final-Url', finalUrl);
    headers.set('X-Page-Content', encodeURIComponent(text));
    headers.set('Content-Type', 'text/html; charset=utf-8');

    return new NextResponse($.html(), { status: 200, headers });


  } catch (error) {
    console.error('Proxy error:', error);
    // Return the error in the body for the iframe to display
    const errorHtml = `
      <html>
        <body style="font-family: sans-serif; padding: 2rem;">
          <h1>Error</h1>
          <p>Failed to fetch and process the URL: ${url}</p>
          <p>${(error as Error).message}</p>
        </body>
      </html>
    `;
    return new NextResponse(errorHtml, { status: 500, headers: {'Content-Type': 'text/html'} });
  }
}
