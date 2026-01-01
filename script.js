/* Reset some default styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Cairo', sans-serif;
    color: #333;
    line-height: 1.6;
    background: #f4f4f4;
}

/* Header */
header {
    background: #2563eb;
    padding: 1rem;
    position: sticky;
    top: 0;
    z-index: 1000;
}

nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo-img {
    width: 80px;
}

.nav-links {
    list-style: none;
    display: flex;
    gap: 1rem;
}

.nav-link {
    color: white;
    text-decoration: none;
    font-weight: bold;
}

/* Hero Section */
.hero {
    background: #4facfe;
    color: white;
    padding: 4rem;
    text-align: center;
}

.hero-content h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.cta-button {
    padding: 1rem 2rem;
    background-color: #ff8c00;
    color: white;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
}

.cta-button:hover {
    background-color: #ff6f00;
}

/* Quick Services Section */
.quick-services {
    display: flex;
    gap: 2rem;
    justify-content: center;
    padding: 2rem;
}

.service-card {
    background-color: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.service-card i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

/* Shipping Form Section */
.shipping-form-section {
    padding: 2rem;
    background-color: white;
    text-align: center;
}

.shipping-form-section input {
    width: 80%;
    padding: 1rem;
    margin: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.shipping-form-section button {
    padding: 1rem 2rem;
    background-color: #2563eb;
    color: white;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
}

.shipping-form-section button:hover {
    background-color: #1d4ed8;
}

/* Footer */
footer {
    background: #2563eb;
    color: white;
    text-align: center;
    padding: 1rem;
}

/* Media Queries */
@media (max-width: 768px) {
    .hero-content {
        padding: 2rem;
    }

    .quick-services {
        flex-direction: column;
    }

    .service-card {
        width: 90%;
        margin: 1rem auto;
    }
}
