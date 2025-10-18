export interface WikipediaArticle {
    title: string;
    content: string;
    extract: string;
    url: string;
    redirectedFrom?: string;
}

export async function fetchWikipediaArticle(topic: string): Promise<WikipediaArticle | null> {
    try {
        const encodedTopic = encodeURIComponent(topic);

        const [contentResponse, extractResponse] = await Promise.all([
            fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=${encodedTopic}&prop=text&redirects=1&formatversion=2`),
            fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodedTopic}&prop=extracts&explaintext=1&redirects=1&formatversion=2`)
        ]);

        const contentData = await contentResponse.json();
        const extractData = await extractResponse.json();

        if (contentData.error || extractData.error) {
            return null;
        }

        const page = extractData.query?.pages?.[0];
        if (!page || page.missing) {
            return null;
        }

        const finalTitle = contentData.parse.title;
        const redirectedFrom = extractData.query?.redirects?.[0]?.from;

        return {
            title: finalTitle,
            content: contentData.parse.text,
            extract: page.extract || '',
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(finalTitle)}`,
            redirectedFrom: redirectedFrom !== finalTitle ? redirectedFrom : undefined
        };
    } catch (error) {
        console.error('Error fetching Wikipedia article:', error);
        return null;
    }
}
