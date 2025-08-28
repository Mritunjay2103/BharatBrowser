import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Helper to create an absolute URL
const toAbsoluteUrl = (url: string, base: string): string => {
  try {
    // If url is already absolute, URL constructor will use it as is.
    // If it's relative, it will be resolved relative to the base.
    return new URL(url, base).toString();
  } catch {
    // Fallback for invalid URLs
    return url;
  }
};


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
        redirect: 'follow' // Important to get the final URL after redirects
    });
    
    const finalUrl = response.url;
    const contentType = response.headers.get('content-type') || '';
    
    // For non-HTML content, we just want to know the final URL, no content needed.
    if (!contentType.includes('text/html')) {
        // Instead of redirecting, which can be complex with iframes,
        // we'll just inform the client it's not HTML.
        return NextResponse.json({ finalUrl, content: null, html: `<p>Cannot display content of type: ${contentType}</p>` });
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);

    // Add a <base> tag to resolve relative resource paths correctly
    $('head').prepend(`<base href="${finalUrl}">`);

    // Make all links absolute and route them through the proxy
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
            const absoluteUrl = toAbsoluteUrl(href, finalUrl);
            // We need to re-encode the URL for the proxy parameter
            $(el).attr('href', `/?url=${encodeURIComponent(absoluteUrl)}`);
        }
    });
    
    // Make form actions absolute and route them through the proxy
    $('form').each((i, el) => {
        const action = $(el).attr('action');
        if (action) {
            const absoluteUrl = toAbsoluteUrl(action, finalUrl);
             $(el).attr('action', `/?url=${encodeURIComponent(absoluteUrl)}`);
        }
    });

    // Remove script and style elements, plus common noise
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
    
    // We send back the final URL, the extracted text content, and the modified HTML
    return NextResponse.json({ finalUrl, content: text, html: $.html() });

  } catch (error) {
    console.error('Proxy error:', error);
    // Return the error in JSON format
    return NextResponse.json(
        { 
            error: 'Failed to fetch and process the URL.',
            details: (error as Error).message,
            finalUrl: url, // Return original URL on failure
            content: null,
            html: `<h2>Error</h2><p>Could not load page: ${(error as Error).message}</p>`
        },
        { status: 500 }
    );
  }
}