
#Home Page of the GIST
GIST is an interactive web tool for learning Indo-Pacific geography and geopolitics via map-based quizzes, a boat adventure quiz, and a course schedule drop-down menu.


##Features
- Map Quiz: Tests region knowledge using Leaflet.js and GeoJSON.
- Boat Quiz: Timed multiple-choice quiz with boat progress.
- Carousel: Displays course topics with images.
- Responsive: Mobile-friendly with accessibility support.


##Installation
1. git clone https://github.com/lengthrrr/2025-ITP2-Group3.git
cd 2025-ITP2-Group3/Home_Page
2. npx http-server .
Access at http://localhost:8080.
3. Dependencies: Leaflet.js (via CDN in index.html).
Ensure images/ contains drop-down menu images.


##Configuration
Quizzes (script.js): Edit map quiz in questions array:


##Dataset Management
- GeoJSON: Add to json_files/ (create if missing), update questions. Validate at geojsonlint.com.
- Images: Add to images/, reference in index.html.


##Extending
<section id="new-section"><div class="container"><h2>Title</h2><p>Content</p></div></section>


##Maintenance
- Update Leaflet.js CDN in index.html.
- Debug: Check GeoJSON paths, quiz rendering.
- Sync with main branch. I.e.,
1. git checkout main
2. git pull
3. git checkout HomePage
4. git rebase main
5. git push


##License
© 2025 MIP. All rights reserved.







