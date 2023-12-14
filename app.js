
const bannerContentDiv = document.querySelector('.bannerContentDiv');
const sliders = document.querySelectorAll('.slider');
let currentSlide = 0;

function showSlide(index) {
    const newPosition = -index * 70;
    bannerContentDiv.style.transform = `translateX(${newPosition}vw)`;
}

function nextSlide() {
    sliders[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % sliders.length;
    sliders[currentSlide].classList.add('active');
    showSlide(currentSlide);
}

setInterval(nextSlide, 5000); // Change slide every 5 seconds