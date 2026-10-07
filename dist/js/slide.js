//slide
var slideIndex = 0;

function currentSlide(n) {
  slideIndex = n - 1;
  showSlides();
}

var createDot = (index) => {
  var dotBtn = document.createElement('button');
  dotBtn.innerHTML = index + 1;
  dotBtn.setAttribute('class', 'slide-dot');
  dotBtn.setAttribute('type', 'button');
  dotBtn.addEventListener('click', () => currentSlide(index + 1));
  return dotBtn;
}

function showSlides() {
  var slides = document.querySelectorAll('.slide-item');
  var dots = document.querySelectorAll('.slide-dot');

  if (slideIndex >= slides.length) slideIndex = 0;
  if (slideIndex < 0) slideIndex = slides.length - 1;

  slides.forEach(slide => {
    slide.style.display = 'none';
  });

  dots.forEach(dot => {
    dot.classList.remove('active');
  });

  slides[slideIndex].style.display = 'flex';
  dots[slideIndex].classList.add('active');
}

function initSlideshow() {
  var slides = document.querySelectorAll('.slide-item');
  var slideRemote = document.querySelector('.slide__remote');
  var dotContainer = document.querySelector('.slide__dot-container');
  if (slides.length === 0) return;
  if (slides.length <= 1) {
    slideRemote.style.display = 'none';
    dotContainer.style.display = 'none';
  }else{
    slideRemote.style.display = 'block';
    dotContainer.style.display = 'block';
  }
  
  for (var i = 0; i < slides.length; i++) {
    dotContainer.appendChild(createDot(i));
  }
  
  showSlides(); // Initial display of the first slide
}

function nextSlide() {
  slideIndex++;
  showSlides();
}

function prevSlide() {
  slideIndex--;
  showSlides();
}