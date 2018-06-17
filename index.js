const CancelToken = axios.CancelToken;

// dom refs
const languages = document.querySelector('.languages');
const loadingEle = document.querySelector('.loading');
const result = document.querySelector('#result');
const endPoint = 'https://api.github.com/search/repositories';

let selectedLanguage = 'All';
let source = null;
let currentRequest = null;

// handle tab change
languages.addEventListener('click', (e) => {
  const { textContent } = e.target;

  // user click same tab again
  if (
    !e.target ||
    e.target.tagName !== 'LI' ||
    selectedLanguage === textContent
  ) return;

  selectedLanguage = textContent;
  highlightCurrentTab(e);
  handleLanguageSelection(textContent);
});

function handleLanguageSelection(language) {
  toggleLoading();
  toggleResults();

  if (currentRequest) {
    source.cancel();
    toggleLoading();
    toggleResults();
  }

  source = CancelToken.source();
  currentRequest = fetchPopularRepos(language, source.token)
    .then(res => {
      renderResults(res);
      toggleLoading();
      toggleResults();
      currentRequest = null;
    })
  .catch(err => {
    console.error(err);
  });
}

function fetchPopularRepos(language, cancelToken) {
  const query = `?q=stars:>10000+language:${language}&sort=stars&order=desc&type=Repositories`;
  const url = encodeURI(`${endPoint}${query}`);

  // delay the resolve time for demo purpose (don't use in production)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios.get(url, {cancelToken})
        .then(res => {
          let items = res.data.items.map((item) => {
            return {
              name: item.name,
              avatar: item.owner.avatar_url,
              starsCount: item.stargazers_count
            }
          });

          resolve(items);
        })
        .catch(err => { reject(err); });
    }, 300);
  });

  // production code will be
  // return axios.get(url, {cancelToken})
  //   .then((res) => {
  //     let items = res.data.items.map((item) => {
  //       return {
  //         name: item.name,
  //         avatar: item.owner.avatar_url,
  //         starsCount: item.stargazers_count
  //       }
  //     });
  //
  //     resolve(items);
  //   })
  //   .catch(err => { reject(err); });
}

function toggleLoading() {
  loadingEle.classList.toggle('show');
}

function toggleResults() {
  result.classList.toggle('hide');
}

function highlightCurrentTab(e) {
  for (let i = 0; i < e.target.parentNode.children.length; i++) {
    e.target.parentNode.children[i].classList.remove('highlight');
  }

  e.target.classList.add('highlight');
}

function renderResults(repos) {
  let ul = document.createElement('ul');

  repos.forEach((repo) => {
    let li = document.createElement('li');

    // repo name
    let repoName = document.createElement('span');
    repoName.innerHTML = repo.name;

    // star count
    let starCount = document.createElement('span');
    starCount.innerHTML = `✨${repo.starsCount}`;

    // avatar
    let avatar = document.createElement('img');
    avatar.setAttribute('src', repo.avatar);

    li.appendChild(repoName);
    li.appendChild(avatar);
    li.appendChild(starCount);

    ul.appendChild(li);
  });

  if (!result.childNodes.length) {
    result.appendChild(ul);
  } else {
    result.replaceChild(ul, result.childNodes[0]);
  }
}

// initially fetch the data
handleLanguageSelection('All');
