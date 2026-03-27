<!DOCTYPE html>
<html>
<head>
<style>
    body {
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #020617; /* पूरी साइट का बैकग्राउंड गहरा नीला */
    }

    .header {
        /* प्रीमियम गहरा नीला बैकग्राउंड */
        background: #0f172a; 
        padding: 20px 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        /* नीचे एक सुनहरी पतली पट्टी */
        border-bottom: 3px solid #eab308;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }

    .logo-container {
        display: flex;
        flex-direction: column;
    }

    .logo {
        color: #ffffff;
        font-size: 32px;
        font-weight: 900;
        letter-spacing: -1px;
        text-transform: uppercase;
        font-style: italic;
    }

    .logo span {
        color: #eab308; /* MART शब्द सुनहरे रंग में */
    }

    .slogan {
        color: #94a3b8;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 3px;
        font-weight: bold;
        margin-top: -5px;
    }

    .nav a {
        color: #f1f5f9;
        margin-left: 25px;
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: 0.3s;
    }

    .nav a:hover {
        color: #eab308; /* होवर करने पर सुनहरा रंग */
    }

    .contact-btn {
        background: #eab308;
        color: #0f172a;
        padding: 10px 20px;
        border-radius: 50px;
        font-weight: 800;
        text-decoration: none;
        font-size: 12px;
        transition: 0.3s;
    }

    .contact-btn:hover {
        background: #ffffff;
        transform: scale(1.05);
    }
</style>
</head>

<body>

<div class="header">
    <div class="logo-container">
        <div class="logo">NM <span>MART</span></div>
        <div class="slogan">Shop More, Save More</div>
    </div>
    
    <div class="nav">
        <a href="#">Home</a>
        <a href="#">Offers</a>
        <a href="#">Products</a>
        <a href="#" class="contact-btn">Contact Us</a>
    </div>
</div>

</body>
</html>
