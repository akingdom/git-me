document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const fetchButton = document.getElementById('fetchButton');
    const usernameInput = document.getElementById('username');
    const outputArea = document.getElementById('output');
    const copyButton = document.getElementById('copyButton');

    // Set initial focus on the username input field
    usernameInput.focus();

    fetchButton.addEventListener('click', () => {
        const githubUsername = usernameInput.value.trim();
        if (githubUsername) {
            fetchAndBuild(githubUsername); // Call the fetch and build method
        }
    });

    usernameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            fetchButton.click(); // Trigger fetch on Enter key
        }
    });

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(outputArea.value)
            .then(() => {
                notifyAlert('Copied to clipboard!',copyButton);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });
});

// Fetch Gists and Repositories
async function fetchAndBuild(GITHUB_USERNAME) { // Renamed method for clarity
    let gists = null;
    let repos = null;
    let errors = '';
    const statusOk = '200';
    let status = statusOk;
    
    try {
        const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos`);
        repos = await reposResponse.json();
    	if(repos.status && repos.status != statusOk) {status = repos.status; errors += `\nrepos (${repos.message}) `;}
    } catch (error) {
        console.error('Error fetching data:', error);
        errors += 'repos ';
    }
    
    try {
		const gistsResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/gists`);
        gists = await gistsResponse.json();        
    	if(gists.status && gists.status != statusOk) {status = gists.status; errors += `\ngists (${gists.message}) `;}
	} catch (error) {
        console.error('Error fetching data:', error);
        errors += 'gists ';
    }
    	
	if(errors) {
		notifyAlert(`Errors fetching ${errors}` ,fetchButton);
    }
    
	// Call rebuildList to process the fetched data
	rebuildList(GITHUB_USERNAME, gists, repos);
}

// Process the fetched data into markdown code
function rebuildList(username, gists, repos) {
	const CC_by = "Menu listing by Andrew Kingdom's [Git Me](https://akingdom.github.io/git-me/)";
	const title = `${username}’s GitHub Gists and Repositories`;
	const explanation = `This is a list of my articles, projects, etc.`;
    let markdownOutput = `## ${title}\n\n*${explanation}*\n\n### Repositories\n`;

	if(!repos || (repos.status && repos.status != statusOk)) {
		markdownOutput += '- No repositories were found';
	} else {
		repos.forEach(repo => {
			markdownOutput += `- [${repo.name}](${repo.html_url})\n`;
		});
	}

    markdownOutput += `\n### Gists\n`;
	if(!gists || (gists.status && gists.status != '200')) {
		markdownOutput += '- No gists were found';
	} else {
		gists.forEach(gist => {
			markdownOutput += `- [${gist.description || 'No Description'}](${gist.html_url})\n`;
		});
	}
	
	markdownOutput += `\n\n${CC_by}\n`;

    // Set the markdown output in the output text area
    document.getElementById('output').value = markdownOutput;
}
