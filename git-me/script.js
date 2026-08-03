document.addEventListener('DOMContentLoaded', () => {
    const fetchButton = document.getElementById('fetchButton');
    const usernameInput = document.getElementById('username');
    const outputArea = document.getElementById('output');
    const copyButton = document.getElementById('copyButton');

    usernameInput.focus();

    fetchButton.addEventListener('click', () => {
        const githubUsername = usernameInput.value.trim();
        if (githubUsername) {
            fetchAndBuild(githubUsername);
        }
    });

    usernameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            fetchButton.click();
        }
    });

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(outputArea.value)
            .then(() => {
                notifyAlert('Copied to clipboard!', copyButton);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });
});

// Fetch all pages from a paginated GitHub API endpoint
async function fetchAllPages(url) {
    let allItems = [];
    let page = 1;
    const perPage = 100; // GitHub's maximum

    while (true) {
        const paginatedUrl = `${url}?per_page=${perPage}&page=${page}`;
        const response = await fetch(paginatedUrl);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`GitHub API error (${response.status}): ${errorData.message || response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            break; // No more data
        }

        allItems = allItems.concat(data);

        // If we got less than the max, this is the last page
        if (data.length < perPage) {
            break;
        }

        page++;
    }

    return allItems;
}

// Fetch Gists and Repositories
async function fetchAndBuild(GITHUB_USERNAME) {
    let gists = [];
    let repos = [];
    let errors = [];

    try {
        repos = await fetchAllPages(`https://api.github.com/users/${GITHUB_USERNAME}/repos`);
    } catch (error) {
        console.error('Error fetching repos:', error);
        errors.push(`repos (${error.message})`);
    }

    try {
        gists = await fetchAllPages(`https://api.github.com/users/${GITHUB_USERNAME}/gists`);
    } catch (error) {
        console.error('Error fetching gists:', error);
        errors.push(`gists (${error.message})`);
    }

    if (errors.length > 0) {
        notifyAlert(`Errors fetching ${errors.join(', ')}`, fetchButton);
    }

    rebuildList(GITHUB_USERNAME, gists, repos);
}

// Process the fetched data into markdown code
function rebuildList(username, gists, repos) {
    const CC_by = "Menu listing by Andrew Kingdom's [Git Me](https://akingdom.github.io/git-me/)";
    const title = `${username}’s GitHub Gists and Repositories`;
    const explanation = `This is a list of my articles, projects, etc.`;
    let markdownOutput = `## ${title}\n\n*${explanation}*\n\n### Repositories\n`;

    if (!repos || repos.length === 0) {
        markdownOutput += '- No repositories were found';
    } else {
        repos.forEach(repo => {
            markdownOutput += `- [${repo.name}](${repo.html_url})\n`;
        });
    }

    markdownOutput += `\n### Gists\n`;
    if (!gists || gists.length === 0) {
        markdownOutput += '- No gists were found';
    } else {
        gists.forEach(gist => {
            markdownOutput += `- [${gist.description || 'No Description'}](${gist.html_url})\n`;
        });
    }

    markdownOutput += `\n\n${CC_by}\n`;

    document.getElementById('output').value = markdownOutput;
}
