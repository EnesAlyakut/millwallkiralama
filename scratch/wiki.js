async function searchWikiImage(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
  const res = await fetch(url).then(r => r.json());
  
  if (res.query.search.length > 0) {
    const title = res.query.search[0].title;
    const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(title)}&pithumbsize=800&format=json`;
    const imgRes = await fetch(imgUrl).then(r => r.json());
    
    const pages = imgRes.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pages[pageId].thumbnail) {
      console.log('FOUND:', pages[pageId].thumbnail.source);
    } else {
      console.log('NO THUMBNAIL FOR:', title);
    }
  } else {
    console.log('NO RESULTS FOR:', query);
  }
}

searchWikiImage('Fiat Tipo interior');
searchWikiImage('Renault Clio interior');
