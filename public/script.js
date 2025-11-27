const searchInput = document.getElementById("search");
const itemsContainer = document.getElementById("items-container");

// Function to render items
async function renderItems(filter = "") {
  const res = await fetch("/items");
  const items = await res.json();

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(filter.toLowerCase()) ||
    i.description.toLowerCase().includes(filter.toLowerCase()) ||
    i.category.toLowerCase().includes(filter.toLowerCase())
  );

  itemsContainer.innerHTML = "";
  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      ${item.image ? `<img src="${item.image}" alt="${item.title}">` : ""}
      <div class="card-content">
        <h3>${item.title}</h3>
        <p><strong>Category:</strong> ${item.category}</p>
        <p><strong>Location:</strong> ${item.location}</p>
        <p><strong>Status:</strong> ${item.status}</p>
        <p><strong>Date:</strong> ${item.date}</p>
      </div>
    `;
    itemsContainer.appendChild(card);
  });
}

// Load all items on page load
window.addEventListener("DOMContentLoaded", () => {
  renderItems();
});

// Search items on input
searchInput?.addEventListener("input", () => {
  renderItems(searchInput.value);
});
