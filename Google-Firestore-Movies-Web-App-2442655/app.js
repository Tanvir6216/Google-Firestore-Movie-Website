import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB63CZnNjiFZwoXIgbC2HjYT9c6NGPPzGI",
    authDomain: "movies-review-web-app-2442655.firebaseapp.com",
    projectId: "movies-review-web-app-2442655",
    storageBucket: "movies-review-web-app-2442655.firebasestorage.app",
    messagingSenderId: "361416878825",
    appId: "1:361416878825:web:587a0754beafdf9afb1e78"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function formatDisplayDate(dateStr) {
    if (!dateStr) return "N/A";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
}

window.addMovie = async function () {
    const name = document.getElementById("name").value;
    const rating = parseInt(document.getElementById("rating").value);
    const director = document.getElementById("director").value;
    const date = document.getElementById("date").value;
    const poster = document.getElementById("poster").value;
    const genre = document.getElementById("genre").value;

    if (!name || isNaN(rating) || rating < 0 || rating > 5) {
        alert("Please enter a Title and a Rating between 0-5!");
        return;
    }

    await addDoc(collection(db, "movies"), {
        movie_name: name,
        movie_rating: rating,
        director_name: director,
        releaseDate: date,
        movie_poster: poster,
        genre: genre
    });

    ["name", "rating", "director", "date", "poster", "genre"].forEach(id => document.getElementById(id).value = "");
    loadMovies();
};

async function loadMovies(sortField = "") {
    let moviesRef = collection(db, "movies");
    if (sortField) {
        const direction = sortField === 'movie_rating' ? 'desc' : 'asc';
        moviesRef = query(moviesRef, orderBy(sortField, direction));
    }

    const snapshot = await getDocs(moviesRef);
    let html = "";

    snapshot.forEach(docSnap => {
        const m = docSnap.data();
        const posterUrl = m.movie_poster || 'https://via.placeholder.com/300x450/141414/FFFFFF?text=No+Poster';
        const displayDate = formatDisplayDate(m.releaseDate);
        
        // FIXED STAR LOGIC: Matches rating 1-to-1 for 0-5 scale
        const ratingValue = parseInt(m.movie_rating) || 0;
        const starCount = Math.min(Math.max(ratingValue, 0), 5); 

        html += `
        <div class="col">
            <div class="card h-100 movie-card border-0 shadow">
                <img src="${posterUrl}" class="card-img-top poster-img" alt="${m.movie_name}">
                <div class="card-body">
                    <h5 class="card-title text-white mb-1">${m.movie_name || "Untitled"}</h5>
                    <div class="mb-2">
                        <span class="badge genre-badge">${m.genre ? m.genre.toUpperCase() : 'GENERAL'}</span>
                    </div>
                    <div class="rating-stars mb-2 small">
                        <span class="text-white fw-bold me-1">Rating: ${ratingValue}</span> 
                        <span style="color: #ffc107;">
                            ${"★".repeat(starCount)}${"☆".repeat(5 - starCount)}
                        </span>
                    </div>
                    <p class="text-white small mb-0"><strong>Director:</strong> ${m.director_name || "N/A"}</p>
                    <p class="text-white small"><strong>Date:</strong> ${displayDate}</p>
                </div>
                <div class="card-footer bg-transparent border-top border-secondary d-flex gap-2 pb-3">
                    <button class="btn btn-edit btn-sm flex-grow-1 text-white" onclick="editMovie('${docSnap.id}')">EDIT</button>
                    <button class="btn btn-outline-danger btn-sm flex-grow-1" onclick="deleteMovie('${docSnap.id}')">DELETE</button>
                </div>
            </div>
        </div>
        `;
    });
    document.getElementById("movies").innerHTML = html;
}

window.deleteMovie = async function (id) {
    if (confirm("Remove this movie?")) {
        await deleteDoc(doc(db, "movies", id));
        loadMovies();
    }
};

window.editMovie = async function (id) {
    const docSnap = await getDoc(doc(db, "movies", id));
    if (docSnap.exists()) {
        const m = docSnap.data();
        document.getElementById("edit-id").value = id;
        document.getElementById("edit-name").value = m.movie_name || "";
        document.getElementById("edit-genre").value = m.genre || "";
        document.getElementById("edit-rating").value = m.movie_rating || 0;
        document.getElementById("edit-director").value = m.director_name || "";
        document.getElementById("edit-date").value = m.releaseDate || "";
        document.getElementById("edit-poster").value = m.movie_poster || "";
        new bootstrap.Modal(document.getElementById('editModal')).show();
    }
};

window.saveEdit = async function () {
    const id = document.getElementById("edit-id").value;
    const updatedData = {
        movie_name: document.getElementById("edit-name").value,
        genre: document.getElementById("edit-genre").value,
        movie_rating: parseInt(document.getElementById("edit-rating").value),
        director_name: document.getElementById("edit-director").value,
        releaseDate: document.getElementById("edit-date").value,
        movie_poster: document.getElementById("edit-poster").value
    };
    await updateDoc(doc(db, "movies", id), updatedData);
    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    loadMovies();
};

window.sortMovies = function (field) { loadMovies(field); };
loadMovies();