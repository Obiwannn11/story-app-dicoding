class SavedStoryView {
    constructor() {
        this.container = document.getElementById('saved-stories-container');
    }

    renderStories(stories, itemTemplate) {
        if (!this.container) return;

        if (!stories || stories.length === 0) {
            this.container.innerHTML = '<p class="info-message">You have no saved stories.</p>';
            return;
        }

        this.container.innerHTML = ''; // sellau Kosongkan kontainer
        stories.forEach(story => {
            let storyHtml = itemTemplate;
            storyHtml = storyHtml.replace(/\{\{id\}\}/g, story.id)
                                 .replace(/\{\{photoUrl\}\}/g, story.photoUrl)
                                 .replace(/\{\{name\}\}/g, story.name)
                                 .replace(/\{\{description\}\}/g, story.description)
                                 .replace(/\{\{createdAt\}\}/g, new Date(story.createdAt).toLocaleDateString('id-ID'));
            
            if (story.lat != null && story.lon != null) {
                storyHtml = storyHtml.replace(/\{\{lat\}\}/g, parseFloat(story.lat).toFixed(4))
                                     .replace(/\{\{lon\}\}/g, parseFloat(story.lon).toFixed(4));
            } else {
                storyHtml = storyHtml.replace(/<p class="story-location">.*?<\/p>/s, '');
            }
            this.container.innerHTML += storyHtml;
        });
    }

    bindDeleteStoryClick(handler) {
        if (this.container) {
            this.container.addEventListener('click', (event) => {
                if (event.target.classList.contains('delete-button')) {
                    const storyId = event.target.dataset.id;
                    if (confirm('Are you sure you want to delete this story?')) {
                        handler(storyId);
                    }
                }
            });
        }
    }
}

export default SavedStoryView;