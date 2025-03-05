export function urlFormat(url:string) {
    const queryString = url.split('?')[1] || '';
    const queryParams: { [key: string]: string } = {};
    
    if (queryString) {
      const pairs = queryString.split('&');
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        queryParams[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    }

    return queryParams
}