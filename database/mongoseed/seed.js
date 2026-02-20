require("dotenv").config();
const mongoose = require("mongoose");
// const connectMongoDB = require("../../config/mongodb.js");
const bcrypt = require("bcryptjs");
const config = require("../../config/config.js");
const PROJECT_URL = process.env.PROJECT_URL;
const { ObjectId } = require("mongodb");

const seedMongoDB = async () => {
    try {
        await mongoose.connect(config.mongodb.uri);
        console.log('MongoDB connected successfully');
        console.log('Seeding MongoDB...');

        const upcomingProjectIds = Array.from({ length: 6 }, () => new ObjectId());
        const completedProjectIds = Array.from({ length: 6 }, () => new ObjectId());

        const homeDetailsConn = mongoose.connection.db.collection("home_details");
        const insertHomeDetailsData = [
            {
                "page_slug": "home",
                "page_section": "home_tech",
                "technologies-image": `${PROJECT_URL}assets/images/window.svg`,
                "technologies-title": "Technologies",
                "createdAt": new Date()
            },
            {
                "page_slug": "home",
                "page_section": "home_tech",
                "tech-name": "Wall",
                "tech-text": "We use top-tier materials like reinforced composites and sustainable timber, customized for your project and local climate.",
                "createdAt": new Date()
            },
            {
                "page_slug": "home",
                "page_section": "home_tech",
                "tech-name": "Roof",
                "tech-text": "We ensure dry, comfortable, energy-efficient homes with advanced waterproofing, insulation, and cladding for year-round protection.",
                "createdAt": new Date()
            },
            {
                "page_slug": "home",
                "page_section": "home_tech",
                "tech-name": "Window",
                "tech-text": "Our windows offer stunning views, energy efficiency, and security, seamlessly integrating indoor and outdoor living spaces.",
                "createdAt": new Date()
            }
        ]

        const discoverDetailsConn = mongoose.connection.db.collection("discover_details");
        const insertDiscoverDetailsData = [
            {
                "page_slug": "discoverUs",
                "page_section": "value-container",
                card_head: "Integrity",
                description_text: `We uphold the highest standards of honesty and transparency in every interaction and decision.`,
                "createdAt": new Date()
            },
            {
                "page_slug": "discoverUs",
                "page_section": "value-container",
                card_head: "Excellence",
                description_text: `We strive for perfection in every project, ensuring superior quality and attention to detail.`,
                "createdAt": new Date()
            },
            {
                "page_slug": "discoverUs",
                "page_section": "value-container",
                card_head: "Customer First",
                description_text: `We uphold the highest standards of honesty and transparency in every interaction and decision.`,
                "createdAt": new Date()
            },
            {
                "page_slug": "discoverUs",
                "page_section": "buyer-container",
                "heading": {
                    "title": "Buyer's Guide",
                    "description": `Use this holistic checklist to ensure your new home meets all your needs for comfort, security, and long-term value.`,
                },
                "rows": [
                    { "row_description": "Location & Connectivity" },
                    { "row_description": "Legal Verification" },
                    { "row_description": "Peaceful Living Environment" },
                    { "row_description": "Sustainable Features" },
                    { "row_description": "Amenities & Lifestyle" },
                    { "row_description": "Investment & Budget" }
                ],
                "createdAt": new Date()
            }
        ];

        const projectsConn = mongoose.connection.db.collection("projects");
        const insertProjectsData = [
            {
                "page_slug": "projects",
                "page_section": "ongoing-gallery",
                "project_id": upcomingProjectIds[0],
                "card_image": `${PROJECT_URL}assets/images/card1.webp`,
                "project_name": "Pinnacle View Condominiums",
                "project_location": "West side",
                "project_date": "November 2024",
                "card_footer_text": "24 Premium Apartments",
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "ongoing-gallery",
                "project_id": upcomingProjectIds[1],
                "card_image": `${PROJECT_URL}assets/images/card2.webp`,
                "project_name": "Serenity Heights Estate",
                "project_location": "West side",
                "project_date": "August 2024",
                "card_footer_text": "24 Premium Apartments",
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "ongoing-gallery",
                "project_id": upcomingProjectIds[2],
                "card_image": `${PROJECT_URL}assets/images/card3.webp`,
                "project_name": "Grandview Manor Residences",
                "project_location": "South End",
                "project_date": "September 2024",
                "card_footer_text": "24 Premium Apartments",
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "ongoing-gallery",
                "project_id": upcomingProjectIds[3],
                "card_image": `${PROJECT_URL}assets/images/card4.webp`,
                "project_name": "Pinnacle View Condominiums",
                "project_location": "East side",
                "project_date": "November 2024",
                "card_footer_text": "24 Premium Apartments",
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "ongoing-gallery",
                "project_id": upcomingProjectIds[4],
                "card_image": `${PROJECT_URL}assets/images/card1.webp`,
                "project_name": "Pinnacle View Condominiums",
                "project_location": "East side",
                "project_date": "November 2024",
                "card_footer_text": "24 Premium Apartments",
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "ongoing-gallery",
                "project_id": upcomingProjectIds[5],
                "card_image": `${PROJECT_URL}assets/images/card4.webp`,
                "project_name": "Pinnacle View Condominiums",
                "project_location": "East side",
                "project_date": "November 2024",
                "card_footer_text": "24 Premium Apartments",
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "completed-gallery",
                "project_id": completedProjectIds[0],
                "card_image": `${PROJECT_URL}assets/images/card2.webp`,
                "project_name": "Pinnacle View Condominiums",
                "project_location": "West side",
                "project_date": "November 2024",
                "card_footer_text": "24 Premium Apartments",
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "completed-gallery",
                "project_id": completedProjectIds[1],
                "card_image": `${PROJECT_URL}assets/images/card3.webp`,
                "project_name": "Serenity Heights Estate",
                "project_location": "West side",
                "project_date": "August 2024",
                "card_footer_text": "24 Premium Apartments",
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "completed-gallery",
                "project_id": completedProjectIds[2],
                "card_image": `${PROJECT_URL}assets/images/card4.webp`,
                "project_name": "Grandview Manor Residences",
                "project_location": "South End",
                "project_date": "September 2024",
                "card_footer_text": "24 Premium Apartments",
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "completed-gallery",
                "project_id": completedProjectIds[3],
                "card_image": `${PROJECT_URL}assets/images/card3.webp`,
                "project_name": "Pinnacle View Condominiums",
                "project_location": "East side",
                "project_date": "November 2024",
                "card_footer_text": "24 Premium Apartments",
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "completed-gallery",
                "project_id": completedProjectIds[4],
                "card_image": `${PROJECT_URL}assets/images/card3.webp`,
                "project_name": "Pinnacle View Condominiums",
                "project_location": "East side",
                "project_date": "November 2024",
                "card_footer_text": "24 Premium Apartments",
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "completed-gallery",
                "project_id": completedProjectIds[5],
                "card_image": `${PROJECT_URL}assets/images/card2.webp`,
                "project_name": "Pinnacle View Condominiums",
                "project_location": "East side",
                "project_date": "November 2024",
                "card_footer_text": "24 Premium Apartments",
                "createdAt": new Date()
            }
        ];

        const upcomingProjectsList = insertProjectsData.filter(p => p.page_section === 'ongoing-gallery');
        const completedProjectsList = insertProjectsData.filter(p => p.page_section === 'completed-gallery');

        const projectDetailsConn = mongoose.connection.db.collection("project_details");
        const createProjectDetails = (pid, name, location, date, cardImage) => ({
            "page_slug": "project_details",
            "project_id": pid,
            "sections": [
                {
                    "page_section": "hero-section",
                    "page_content": [
                        {
                            "pimage": cardImage,
                            "title": name,
                            "buiding_name": name,
                            "date": date,
                            "location": location
                        }
                    ]
                },
                {
                    "page_section": "features-grid",
                    "page_content": [
                        {
                            feature: "Premium Quality",
                            description: "High-quality materials and superior craftsmanship ensuring lasting value"
                        },
                        {
                            feature: "Community Living",
                            description: "High-quality materials and superior craftsmanship ensuring lasting value"
                        },
                        {
                            feature: "Spacious Design",
                            description: "High-quality materials and superior craftsmanship ensuring lasting value"
                        },
                        {
                            feature: "Modern Architecture",
                            description: "High-quality materials and superior craftsmanship ensuring lasting value"
                        }
                    ]
                },
                {
                    "page_section": "amenities-list",
                    "page_content": [
                        { "features_Description": `Discover the exceptional amenities and features that make ${name} stand out.` },
                        { "feature": "Swimming Pool" },
                        { "feature": "Theater" },
                        { "feature": "Fitness Center" },
                        { "feature": "Parking" },
                        { "feature": "Playground" },
                        { "feature": "24/7 Security" }
                    ]
                },
                {
                    "page_section": "location-container",
                    "page_content": [
                        { "location_Description": `Ideally located in ${location}, providing excellent connectivity.` },
                        { "image": `${PROJECT_URL}assets/images/Rectangle.webp` },
                        {
                            details: [
                                {
                                    type: "address",
                                    title: "Address",
                                    text: `${location}, Chennai - 600001`
                                },
                                {
                                    type: "landmarks",
                                    title: "Nearby Landmarks",
                                    list: [
                                        "2 km from Connectivity Hub",
                                        "5 min to Schools & Hospitals",
                                        "10 min to Shopping Malls",
                                        "Easy access to IT Parks"
                                    ]
                                },
                                {
                                    type: "connectivity",
                                    title: "Connectivity",
                                    text: "Well-connected by major roads and public transport with easy access to highways",
                                }
                            ]
                        }
                    ]
                },
                {
                    "page_section": "floor-image",
                    "page_content": [
                        {
                            "title": "Floor Layout",
                            "floor_image": `${PROJECT_URL}assets/images/Rectangle 42.webp`
                        }
                    ]
                },
                {
                    "page_section": "gallery-wrapper",
                    "page_content": [
                        { "gallery_Description": `Explore the stunning interiors and features of ${name}` },
                        {
                            title: "Living Room - 3BHK",
                            text: "Spacious living area with modern amenities",
                            coverImage: `${PROJECT_URL}assets/images/blog1.webp`,
                        },
                        {
                            title: "Master Bedroom",
                            text: "Elegant bedroom with premium finishes",
                            coverImage: `${PROJECT_URL}assets/images/blog2.webp`,
                        },
                        {
                            title: "Modern Kitchen",
                            text: "Fully equipped modular kitchen",
                            coverImage: `${PROJECT_URL}assets/images/card4.webp`,
                        },
                        {
                            title: "Luxury Bathroom",
                            text: "Designer bathroom with premium fixtures",
                            coverImage: `${PROJECT_URL}assets/images/card1.webp`,
                        },
                        {
                            title: "Private Balcony",
                            text: "Spacious balcony with scenic views",
                            coverImage: `${PROJECT_URL}assets/images/card5.webp`,
                        },
                        {
                            title: "Dining Area",
                            text: "Contemporary dining space",
                            coverImage: `${PROJECT_URL}assets/images/card6.webp`,
                        }
                    ]
                },
                {
                    "page_section": "faq-items-container",
                    "page_content": [
                        {
                            "question": "How long does a typical construction project take?",
                            "answer": "The duration varies based on project complexity and scale. Residential projects typically take 8-14 months, while commercial developments may require 12-24 months. We provide detailed timelines during project planning."
                        },
                        {
                            "question": "What types of projects do you specialize in?",
                            "answer": "We specialize in residential condominiums, luxury estates, commercial buildings, and mixed-use developments. Our portfolio includes projects ranging from boutique apartments to large-scale residential complexes."
                        },
                        {
                            "question": "Do you offer warranties on completed projects?",
                            "answer": "Yes, we provide comprehensive warranties on structural integrity and workmanship. We stand by our quality and ensure long-term satisfaction."
                        }
                    ],
                    "createdAt": new Date()
                }
            ]
        });

        const insertProjectDetailsData = [
            ...upcomingProjectsList.map((project) => {
                return createProjectDetails(project.project_id, project.project_name, project.project_location, project.project_date, project.card_image);
            }),
            ...completedProjectsList.map((project) => {
                return createProjectDetails(project.project_id, project.project_name, project.project_location, project.project_date, project.card_image);
            })
        ];

        const faqConn = mongoose.connection.db.collection("faq");
        const insertFaqData = [
            {
                "page_slug": "projects",
                "page_section": "faq-section-header",
                "question": "1. What types of construction projects does Prethviga Homes undertake?",
                "answer": `Prethviga Homes specializes in residential construction, including individual houses, villas, apartments, and renovation projects.`,
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "faq-section-header",
                "question": "2. How does Prethviga Homes ensure construction quality?",
                "answer": `We follow strict quality standards, use premium materials, and conduct regular inspections at every stage of construction.`,
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "faq-section-header",
                "question": "3. Does Prethviga Homes deliver projects on time?",
                "answer": `Yes, timely delivery is a core commitment. We use structured planning and efficient project management to meet agreed timelines.`,
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "faq-section-header",
                "question": "4. Are pricing and agreements transparent?",
                "answer": `Absolutely. We provide clear cost estimates, detailed agreements, and regular updates to ensure complete transparency.`,
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "faq-section-header",
                "question": "5. Can I customize my home design with Prethviga Homes?",
                "answer": `Yes, we offer design flexibility and customization options to match your lifestyle, preferences, and budget.`,
                "createdAt": new Date()
            },
        ];

        const bannerConn = mongoose.connection.db.collection("banner");
        const insertBannerData = [
            {
                "page_slug": "home",
                "page_section": "home_banner",
                "projimage": `${PROJECT_URL}assets/images/homeani1.webp`,
                "createdAt": new Date()
            },
            {
                "page_slug": "home",
                "page_section": "home_banner",
                "projimage": `${PROJECT_URL}assets/images/homeani2.webp`,
                "createdAt": new Date()
            },
            {
                "page_slug": "home",
                "page_section": "home_banner",
                "projimage": `${PROJECT_URL}assets/images/homeani3.webp`,
                "createdAt": new Date()
            },
            {
                "page_slug": "home",
                "page_section": "home_banner",
                "projimage": `${PROJECT_URL}assets/images/homeani4.webp`,
                "createdAt": new Date()
            },
            {
                "page_slug": "home",
                "page_section": "home_banner",
                "Heading": "EXCELLENCE IN EVERY BUILD",
                "subHeading": "Building Strong Foundations for a Better Tomorrow",
                "description": "We are a trusted construction and building company delivering high-quality residential, commercial, and infrastructure projects. With a commitment to safety, innovation, and timely delivery, we turn your vision into reality.",
                "number": "+1 (555) 123-4567",
                "createdAt": new Date()
            },
            {
                "page_slug": "home",
                "page_section": "home_reviews",
                "profile_image": `${PROJECT_URL}assets/images/home-profile.webp`,
                "reviewer": `At Prethviga, we don't just construct buildings—we create lasting value through quality, integrity, and innovation. Every project reflects our promise of excellence and timely delivery.`,
                "user_name": "John Davidson",
                "user_role": "CEO, Prethviga",
                "createdAt": new Date()
            },
            {
                "page_slug": "home",
                "page_section": "home_reviews",
                "profile_image": `${PROJECT_URL}assets/images/home-profile.webp`,
                "reviewer": `Prethviga was founded with a clear vision: to build spaces that stand strong, serve people, and shape the future. Our journey is driven by trust, craftsmanship, and commitment.`,
                "user_name": "John Davidson",
                "user_role": "CEO, Prethviga",
                "createdAt": new Date()
            },
            {
                "page_slug": "home",
                "page_section": "home_reviews",
                "profile_image": `${PROJECT_URL}assets/images/home-profile.webp`,
                "reviewer": `Strong financial discipline and transparent practices are the backbone of Prethviga sustainable growth. We ensure every project delivers value, efficiency, and long-term returns.`,
                "user_name": "John Davidson",
                "user_role": "CFO, Prethviga",
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "project-banner",
                "image": `${PROJECT_URL}assets/images/blog1.webp`,
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "project-banner",
                "image": `${PROJECT_URL}assets/images/cardblog3.webp`,
                "createdAt": new Date()
            },
            {
                "page_slug": "projects",
                "page_section": "project-banner",
                "Heading": "OUR PROJECTS",
                "description": "Explore our portfolio of exceptional construction projects, from completed masterpieces to exciting works in progress.",
                "number": "+1 (555) 123-4567",
                "createdAt": new Date()
            },
            {
                "page_slug": "discoverUs",
                "page_section": "discover-banner",
                "image": `${PROJECT_URL}assets/images/discover.webp`,
                "createdAt": new Date()
            },
            {
                "page_slug": "discoverUs",
                "page_section": "discover-banner",
                "Heading": "Building Dreams Since Inception",
                "description": `Prethviga Homes is a leading construction company dedicated to transforming visions into reality. With years of experience in residential and commercial construction, we've built a reputation for excellence, innovation, and reliability.`,
                "createdAt": new Date()
            }
        ];

        const reviewsConn = mongoose.connection.db.collection("reviews");
        const insertReviewsData = [
            {
                "page_slug": "home",
                "page_section": "reviews",
                "review-title": "Loved by our clients",
                "createdAt": new Date()
            },
            {
                "page_slug": "home",
                "page_section": "reviews",
                "review-text": "Prethviga Homes transformed our dream into reality. Their attention to detail and commitment to quality is unmatched. Our new home is everything we hoped for and more!",
                "client-name": "Rajesh Kumar",
                "client-role": "Homeowner",
                "review-footer": "Sunset Ridge Residence",
                "createdAt": new Date()
            },
            {
                "page_slug": "home",
                "page_section": "reviews",
                "review-text": "Working with Prethviga Homes was a seamless experience. They delivered our commercial space on time and within budget. Professional team with excellent communication!",
                "client-name": "Priya Sharma",
                "client-role": "Business Owner",
                "review-footer": "Tech Hub Commercial Plaza",
                "createdAt": new Date()
            },
            {
                "page_slug": "home",
                "page_section": "reviews",
                "review-text": "I've invested in multiple projects with Prethviga Homes and every time they've exceeded expectations. Their transparency and quality construction make them my go-to builder",
                "client-name": "Arun Venkatesh",
                "client-role": "Investor",
                "review-footer": "Green Valley Apartments",
                "createdAt": new Date()
            }
        ];

        const blogsConn = mongoose.connection.db.collection("blogs");
        const insertBlogsData = [
            {
                "page_slug": "discoverUs",
                "page_section": "blogs-card",
                "blog_id": new ObjectId(),
                inner_img: `${PROJECT_URL}assets/images/Blog_1.webp`,
                badge_text: "Sustainability",
                blog_date: `November 15, 2025`,
                blog_time: "4",
                blog_title: "Lintel Level Brickwork & Sill Concreting: A Key Stage in Home Construction",
                blog_description: `When a building reaches the stage of lintel level brickwork and sill concreting, it marks an important milestone in the construction process. These elements play a critical role in providing structural strength, proper load distribution, and long-term durability to a home.`,
                blog_content: `<p>When a building reaches the stage of lintel level brickwork and sill concreting, it marks an important milestone in the construction process. These elements play a critical role in providing structural strength, proper load distribution, and long-term durability to a home.</p>
                    <h3>What Is Lintel Level Brickwork?</h3>
                    <p>Lintel level brickwork refers to the masonry work carried out up to the height where lintels are placed above doors and windows. A lintel is a horizontal structural member that supports the load of the wall above openings.</p>
                    <h3>Why Lintel Level Brickwork Is Important</h3>
                    <ul><li>Distributes the load above doors and windows evenly</li><li>Prevents cracks around openings</li><li>Improves structural stability</li><li>Acts as a level reference for further construction</li></ul>
                    <p>Proper alignment and quality workmanship at this stage ensure the building remains strong and well-balanced.</p>
                    <h3>Understanding Sill Concreting</h3>
                    <p>Sill concreting is the process of casting concrete at the base of window openings. The sill supports the window frame and protects the wall from water seepage.</p>
                    <h3>Benefits of Sill Concreting</h3>
                    <ul><li>Provides a solid base for window installation</li><li>Prevents water penetration into walls</li><li>Enhances durability of window openings</li><li>Improves overall finishing and appearance</li></ul>
                    <p>Well-executed sill concreting helps avoid long-term issues such as dampness and wall damage.</p>
                    <h3>Why Quality Matters at This Stage</h3>
                    <p>Both lintel level brickwork and sill concreting must be executed with precision and quality materials. Errors at this stage can lead to structural weakness, cracks, or water leakage issues in the future.</p>
                    <p>At <strong>Prethviga Homes</strong>, we follow strict construction standards, accurate measurements, and quality checks to ensure strength and durability at every level of construction.</p>
                    <h3>Best Practices Followed in Construction</h3>
                    <ul><li>Use of quality bricks and concrete mix</li><li>Proper curing for strength development</li><li>Accurate alignment and level checking</li><li>Skilled workmanship and supervision</li></ul>
                    <p>These practices ensure long-lasting performance and structural safety.</p>
                `,
                "createdAt": new Date()
            },
            {
                "page_slug": "discoverUs",
                "page_section": "blogs-card",
                "blog_id": new ObjectId(),
                inner_img: `${PROJECT_URL}assets/images/proimage5.webp`,
                badge_text: "Sustainability",
                blog_date: `November 15, 2025`,
                blog_time: "4",
                blog_title: "Why Eco-Friendly Construction Matters in Metro Cities Like Chennai",
                blog_description: `As urban cities continue to grow, sustainable construction has become more than a trend—it is a necessity. In fast-developing cities like Chennai, eco-friendly construction plays a vital role in reducing environmental impact while creating healthier and more efficient living spaces.`,
                blog_content: `<p>As urban cities continue to grow, sustainable construction has become more than a trend—it is a necessity. In fast-developing cities like Chennai, eco-friendly construction plays a vital role in reducing environmental impact while creating healthier and more efficient living spaces.</p>
                    <h3>Why Eco-Friendly Construction Matters in Urban Areas</h3>
                    <p>Urban environments face challenges such as rising temperatures, water scarcity, pollution, and limited open spaces. Traditional construction methods often increase energy consumption and environmental stress.</p>
                    <p>Eco-friendly construction focuses on:</p>
                    <ul><li>Reducing carbon footprint</li><li>Conserving natural resources</li><li>Improving indoor air quality</li><li>Lowering long-term energy and maintenance costs</li></ul>
                    <h3>Key Eco-Friendly Construction Practices</h3>
                    <h4>1. Sustainable Building Materials</h4>
                    <p>Using eco-friendly materials such as fly ash bricks, AAC blocks, recycled steel, and low-VOC paints reduces environmental damage and improves energy efficiency.</p>
                    <h4>2. Energy-Efficient Design</h4>
                    <p>Smart orientation, natural ventilation, insulated walls, and energy-efficient lighting help reduce dependency on artificial cooling—especially important in Chennai's hot and humid climate.</p>
                    <h4>3. Water Conservation Systems</h4>
                    <p>Rainwater harvesting, groundwater recharge pits, low-flow plumbing fixtures, and greywater reuse systems are essential for water sustainability in urban homes.</p>
                    <h4>4. Green Roofing & Landscaping</h4>
                    <p>Green roofs and landscaped spaces reduce heat absorption, improve air quality, and create natural insulation in dense city environments.</p>
                    <h4>5. Waste Management & Recycling</h4>
                    <p>Proper segregation of construction waste and reuse of materials help minimize landfill impact and promote responsible construction practices.</p>
                    <h3>Benefits of Eco-Friendly Homes in Cities Like Chennai</h3>
                    <ul><li>🌱 Lower electricity and water bills</li><li>🌱 Healthier indoor living environment</li><li>🌱 Reduced heat island effect</li><li>🌱 Long-term property value appreciation</li><li>🌱 Compliance with future sustainability norms</li></ul>
                    <p>Eco-friendly homes are not just good for the environment—they are a smart investment for urban homeowners.</p>
                    <h3>Challenges & the Way Forward</h3>
                    <p>While eco-friendly construction may involve slightly higher initial planning and material costs, the long-term savings and environmental benefits far outweigh them.</p>
                    <h3>Prethviga Homes Commitment to Sustainable Living</h3>
                    <p>At <strong>Prethviga Homes</strong>, we believe responsible construction is the foundation of future-ready living. By adopting eco-friendly materials, efficient designs, and sustainable practices, we aim to build homes that are durable, comfortable, and environmentally conscious.</p>
                `,
                "createdAt": new Date()
            },
            {
                "page_slug": "discoverUs",
                "page_section": "blogs-card",
                "blog_id": new ObjectId(),
                inner_img: `${PROJECT_URL}assets/images/Blog_3.webp`,
                badge_text: "Sustainability",
                blog_date: `November 15, 2025`,
                blog_time: "4",
                blog_title: "Trending Home Construction Methods & Techniques in India (2026)",
                blog_description: `As India's urban landscape evolves rapidly, so do the techniques and technologies used to build homes. In 2026, homeowners and builders alike are embracing smarter, faster, and more sustainable construction methods that deliver quality, efficiency, and long-term value.`,
                blog_content: `<p>As India's urban landscape evolves rapidly, so do the techniques and technologies used to build homes. In 2026, homeowners and builders alike are embracing smarter, faster, and more sustainable construction methods that deliver quality, efficiency,and long-term value.</p>
                    <h3>1. Pre-Engineered & Modular Construction</h3>
                    <p>Modular construction involves building sections (modules) off-site and assembling them on location. Pre-engineered steel buildings are growing in popularity for residential and mixed-use developments.</p>
                    <h3>Why it's trending:</h3>
                    <ul><li>Faster completion timelines</li><li>Less on-site waste and disruption</li><li>Higher precision and quality control</li><li>Ideal for tight urban sites</li></ul>
                    <p>Modular homes allow for customization while reducing labor and cost uncertainties.</p>
                    <h3>2. 3D Printing of Structures</h3>
                    <p>3D concrete printing has moved beyond prototypes to real home projects in India. Large gantry printers or robotic arms lay down concrete layers per digital designs.</p>
                    <h3>Benefits:</h3>
                    <ul><li>Reduces construction time drastically</li><li>Uses less material</li><li>Enables complex architectural forms</li><li>Improves labor safety</li></ul>
                    <p>While still emerging, 3D-printed homes are gaining traction for affordable housing and experimental builds.</p>
                    <h3>3. Sustainable & Green Building Techniques</h3>
                    <p>Sustainability remains at the core of modern construction. Green building certifications (like GRIHA and IGBC) are increasingly sought after.</p>
                    <h3>Top sustainable practices:</h3>
                    <ul><li>Fly ash bricks and AAC blocks</li><li>Solar passive design</li><li>Rainwater harvesting & recycling</li><li>Green roofs and vertical gardens</li></ul>
                    <p>These techniques reduce environmental impact and utility costs while improving comfort.</p>
                    <h3>4. Insulated Concrete Formwork (ICF)</h3>
                    <p>ICF combines reinforced concrete with insulation panels, creating a strong and energy-efficient wall system.</p>
                    <h3>Why builders love it:</h3>
                    <ul><li>Excellent thermal insulation</li><li>Higher strength and durability</li><li>Faster assembly</li><li>Lower energy bills</li></ul>
                    <p>For cities like Chennai and Bengaluru where heat load is high, ICF is becoming a preferred choice.</p>
                    <h3>5. Advanced Brickwork with Precision Tools</h3>
                    <p>Traditional brickwork is being modernized through laser leveling, digital measurement tools, and mechanized brick cutters. These improve alignment, reduce rework, and enhance finish quality.</p>
                    <h3>Trends include:</h3>
                    <ul><li>Laser-guided leveling systems</li><li>Pneumatic bricklaying assists</li><li>Jointless masonry techniques</li><li>High-strength mortar mixes</li></ul>
                    <p>This fusion of tradition with technology upgrades quality without losing the familiar construction workflow.</p>
                    <h3>6. Smart Building Integration</h3>
                    <p>Tech isn't just for homes once they're built — it's influencing how we build them. Smart planning and IoT monitoring improve construction outcomes.</p>
                    <h3>Examples:</h3>
                    <ul><li>IoT sensors for curing and moisture control</li><li>Drone-based site tracking</li><li>Digital project management dashboards</li><li>Predictive analytics</li></ul>
                    <p>This data-driven approach improves safety, efficiency, and transparency.</p>
                    <h3>7. Prefab Roof & Floor Systems</h3>
                    <p>Engineered slab systems and prefab roofing units help manage structural loads and speed up build cycles.</p>
                    <h3>Advantages:</h3>
                    <ul><li>Enhanced structural performance</li><li>Reduced on-site labor</li><li>Fewer weather delays</li><li>Consistent quality</li></ul>
                    <p>These systems are especially useful in multi-story residential projects.</p>
                    <h3>8. Eco-Friendly Paints & Low VOC Finishes</h3>
                    <p>Interior and exterior finishes are shifting toward low VOC (Volatile Organic Compound) paints and coatings that improve indoor air quality.</p>
                    <h3>Benefits:</h3>
                    <ul><li>Healthier living environments</li><li>Reduced off-gassing odors</li><li>Eco-certified products</li><li>Sustainable sourcing</li></ul>
                    <p>Homebuyers now expect healthier material specifications as standard.</p>
                `,
                "createdAt": new Date()
            }
        ];

        const adminConn = mongoose.connection.db.collection("admin");
        const adminPassword = "admin@321";
        const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
        const insertAdminData = {
            "userName": "admin@gmail.com",
            "password": hashedAdminPassword,
        };

        await homeDetailsConn.deleteMany({});
        await discoverDetailsConn.deleteMany({});
        await projectDetailsConn.deleteMany({});
        await projectsConn.deleteMany({});
        await faqConn.deleteMany({});
        await bannerConn.deleteMany({});
        await blogsConn.deleteMany({});
        await reviewsConn.deleteMany({});
        await adminConn.deleteMany({});

        // Insert fresh data 
        await homeDetailsConn.insertMany(insertHomeDetailsData);
        await discoverDetailsConn.insertMany(insertDiscoverDetailsData);
        await projectsConn.insertMany(insertProjectsData);
        await projectDetailsConn.insertMany(insertProjectDetailsData);
        await faqConn.insertMany(insertFaqData);
        await bannerConn.insertMany(insertBannerData);
        await reviewsConn.insertMany(insertReviewsData);
        await blogsConn.insertMany(insertBlogsData);
        await adminConn.insertOne(insertAdminData);

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};
seedMongoDB();