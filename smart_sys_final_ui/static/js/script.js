let selectedRecipe = null;
let selectedRecipeData = null; 

function selectRecipe(element) {
  if (selectedRecipe) {
    selectedRecipe.classList.remove('selected');
  }
  if (selectedRecipe === element) {
    selectedRecipe = null;
    selectedRecipeData = null;
  } else {
    selectedRecipe = element;
    selectedRecipe.classList.add('selected');
    selectedRecipeData = element.dataset; 
  }
  console.log('Selected recipe ID:', element.getAttribute('data-recipeid'));
  console.log('Selected recipe data:', selectedRecipeData);
}

function refresh_recipes() {
  fetch('/random_recipes')
    .then(response => response.json())
    .then(data => {
      console.log(data);

      const recipeContainer = document.getElementById('recipe-items-row');
      
      // cclear existing items
      recipeContainer.innerHTML = '';

      data.forEach(recipe => {
        const recipeItemContainer = document.createElement('div');
        recipeItemContainer.classList.add('col-md-4', 'col-sm-6', 'mb-3', 'recipe-item-container');

        const recipeItem = document.createElement('div');
        recipeItem.classList.add('recipe-item', 'd-flex', 'align-items-center', 'text-light');
        recipeItem.dataset.recipeid = recipe.recipeid;
        recipeItem.dataset.name = recipe.name;
        recipeItem.dataset.image = recipe.images;
        recipeItem.dataset.description = recipe.description;
        recipeItem.dataset.ingredients = recipe.recipeinstructions;
        recipeItem.dataset.aggregatedrating = recipe.aggregatedrating;
        recipeItem.dataset.author = recipe.author;
        recipeItem.dataset.bigcategory = recipe.bigcategory;
        recipeItem.dataset.calories = recipe.calories;
        recipeItem.dataset.datepublished = recipe.datepublished;
        recipeItem.dataset.fatcontent = recipe.fatcontent;
        recipeItem.dataset.keywords = recipe.keywords;
        recipeItem.dataset.proteincontent = recipe.proteincontent;
        recipeItem.dataset.rating = recipe.rating;
        recipeItem.dataset.recipecategory = recipe.recipecategory;
        recipeItem.dataset.reviewcount = recipe.reviewcount;
        recipeItem.dataset.reviewer = recipe.reviewer;
        recipeItem.dataset.reviewid = recipe.reviewid;
        recipeItem.dataset.totaltime = recipe.totaltime;

        recipeItem.setAttribute('onclick', 'selectRecipe(this)');

        const img = document.createElement('img');
        img.src = recipe.images;
        img.alt = recipe.name;
        img.classList.add('recipe-item-img');

        const title = document.createElement('h4');
        title.classList.add('pl-3');
        title.textContent = recipe.name;

        recipeItem.appendChild(img);
        recipeItem.appendChild(title);
        recipeItemContainer.appendChild(recipeItem);
        recipeContainer.appendChild(recipeItemContainer);
      });
    })
    .catch(error => console.error('Error fetching recipes:', error));
}

// refresh_recipes onload
document.addEventListener('DOMContentLoaded', () => {
  refresh_recipes();
});

// back to here....
// generate recommendations based on the selected recipe
function generateRecommendations() {
  if (selectedRecipe) {
    const recipeId = selectedRecipe.dataset.recipeid;
    const recipeName = selectedRecipe.dataset.name;
    document.getElementById('recommendation-title-1').innerText = `Because you liked '${recipeName}'`;
    document.getElementById('recommendation-title-2').innerText = `Other users who liked '${recipeName}' also liked`;

    fetch('/generate_recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipeid: recipeId }),
    })
      .then(response => response.json())
      .then(data => {
        if (data) {
          console.log('Recommendations:', data);
          populateRecommendations(data.item_recommendations, 'recommendation-carousel-1');
          populateRecommendations(data.user_recommendations, 'recommendation-carousel-2');
        } else {
          console.error('No recommendations found.');
        }
      })
      .catch(error => {
        console.error('Error fetching recommendations:', error);
      });
  } else {
    console.log('No recipe selected.');
  }
}

function clearCarousel(carouselId) {
  const carousel = document.getElementById(carouselId);
  const items = carousel.querySelectorAll('.carousel-item');
  items.forEach(item => {
    item.innerHTML = '<div class="row"></div>';
  });
}

function populateRecommendations(recommendations, carouselId) {
  const carouselInner = document.querySelector(`#${carouselId} .carousel-inner`);

  if (!carouselInner) {
    console.error(`Carousel inner not found for ${carouselId}`);
    return;
  }

  let carouselItems = '';

  recommendations.forEach((recipe, index) => {
    const isActive = index === 0 ? 'active' : '';
    const recipeCard = `
  <div class="col-md-3 carousel-recommendation">
    <div class="card recommended-item">
      <div class="img-container">
        <img src="${recipe.images}" class="card-img-top" alt="${recipe.name}">
      </div>
      <div class="card-body">
        <h5 class="card-title">${recipe.name}</h5>
        <div class="rating-circle">
          <svg viewBox="0 0 100 100" class="rating-svg">
            <circle cx="50" cy="50" r="45" class="rating-outer-circle"/>
            <text x="50%" y="45%" text-anchor="middle" dy=".3em" class="rating-text-number">${recipe.rating}</text>
            <text x="50%" y="70%" text-anchor="middle" class="rating-text">Rating</text>
          </svg>
        </div>
      </div>
    </div>
  </div>
`
;

    if (index % 4 === 0) {
      if (index !== 0) carouselItems += '</div></div>';
      carouselItems += `<div class="carousel-item ${isActive}"><div class="row">`;
    }

    carouselItems += recipeCard;

    if (index === recommendations.length - 1) {
      carouselItems += '</div></div>';
    }
  });

  carouselInner.innerHTML = carouselItems;
}

function populateRecommendations(recommendations, carouselId) {
  const carouselInner = document.querySelector(`#${carouselId} .carousel-inner`);
  carouselInner.innerHTML = '';

  // Split recommendations into two sets of 4 for the carousel effect
  const firstSet = recommendations.slice(0, 4);
  const secondSet = recommendations.slice(0, 4); // Repeating the same 4 recommendations

  const createCarouselItem = (recommendationSet, isActive) => {
    const carouselItem = document.createElement('div');
    carouselItem.classList.add('carousel-item');
    if (isActive) {
      carouselItem.classList.add('active');
    }

    const row = document.createElement('div');
    row.classList.add('row');

    recommendationSet.forEach(rec => {
      const col = document.createElement('div');
      col.classList.add('col-md-3', 'carousel-recommendation', 'position-relative');

      const img = document.createElement('img');
      img.src = rec.images;
      img.classList.add('d-block', 'w-100');
      img.alt = rec.name;

      // Recipe name with transparent background
      const nameDiv = document.createElement('div');
      nameDiv.classList.add('recipe-name');
      nameDiv.innerText = rec.name;

      // Rating in a circle
      const ratingDiv = document.createElement('div');
      ratingDiv.classList.add('rating-circle');
      const ratingText = document.createElement('span');
      ratingText.classList.add('rating-text');
      ratingText.innerText = rec.aggregatedrating;
      const ratingLabel = document.createElement('span');
      ratingLabel.classList.add('rating-label');
      ratingLabel.innerText = 'Rating';
      ratingDiv.appendChild(ratingText);
      ratingDiv.appendChild(ratingLabel);

      // Add click event to open modal
      col.addEventListener('click', () => showRecipeDetails(rec));

      col.appendChild(img);
      col.appendChild(nameDiv);
      col.appendChild(ratingDiv);
      row.appendChild(col);
    });

    carouselItem.appendChild(row);
    return carouselItem;
  };

  carouselInner.appendChild(createCarouselItem(firstSet, true));
  carouselInner.appendChild(createCarouselItem(secondSet, false));
}

function getStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  let stars = '';
  
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  
  if (halfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }
  
  return stars;
}

// Function to show recipe details in the modal
function showRecipeDetails(recipe) {
  document.getElementById('recipeModalLabel').innerText = recipe.name;
  const recipeDetails = `
  <div class="recipe-text-container">
    <div class="text-center mb-4">
      <img src="${recipe.images}" class="img-fluid recipe-image" alt="${recipe.name}">
    </div>
    <div class="recipe-facts mb-4 d-flex justify-content-between align-items-center">
      <p class="mb-1"><strong class="recipe-details-subtitles">Category:</strong> ${recipe.recipecategory}</p>
      <p class="mb-1"><strong></strong> ${getStars(recipe.aggregatedrating)}</p>
    </div>
    <div class="nutrition-facts mb-4">
      <div class="row">
        <div class="col-md-3 col-6">
          <p><strong>Calories:</strong> ${recipe.calories}</p>
        </div>
        <div class="col-md-3 col-6">
          <p><strong>Fat:</strong> ${recipe.fatcontent}</p>
        </div>
        <div class="col-md-3 col-6">
          <p><strong>Protein:</strong> ${recipe.proteincontent}</p>
        </div>
        <div class="col-md-3 col-6">
          <p><strong>Total Time:</strong> ${recipe.totaltime}</p>
        </div>
      </div>
    </div>
    <div class="description mb-4">
      <p class="recipe-details-subtitles"><strong>Description:</strong></p> 
      <p>${recipe.description}</p>
    </div>
    <div class="instructions">
      <p class="recipe-details-subtitles"><strong>How to Make:</strong></p>
      <p>${recipe.recipeinstructions}</p>
    </div>
    </div>
  `;
  document.getElementById('recipeDetails').innerHTML = recipeDetails;
  $('#recipeModal').modal('show');
}



