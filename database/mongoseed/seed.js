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
        const homeConnection = mongoose.connection.db.collection("home");
        const insertHomeData = [
            {
                "page_slug": "home",
                "page_section": "home_banner",
                "page_content": [
                    { "projimage": `${process.env.PROJECT_URL}assets/images/homeani1.webp` },
                    { "projimage": `${process.env.PROJECT_URL}assets/images/homeani2.webp` },
                    { "projimage": `${process.env.PROJECT_URL}assets/images/homeani3.webp` },
                    { "projimage": `${process.env.PROJECT_URL}assets/images/homeani4.webp` }
                ]
            },
            {
                "page_slug": "home",
                "page_section": "home_reviews",
                "page_content": [
                    {
                        "profile_image": `${process.env.PROJECT_URL}assets/images/home-profile.webp`,
                        "reviewer": `At Prethviga, we don’t just construct buildings—we create lasting value through quality, integrity, and innovation. Every project reflects our promise of excellence and timely delivery.`,
                        "user_name": "John Davidson",
                        "user_role": "CEO, Prethviga"
                    },
                    {
                        "profile_image": `${process.env.PROJECT_URL}assets/images/home-profile.webp`,
                        "reviewer": `Prethviga was founded with a clear vision: to build spaces that stand strong, serve people, and shape the future. Our journey is driven by trust, craftsmanship, and commitment.`,
                        "user_name": "John Davidson",
                        "user_role": "CEO, Prethviga"
                    },
                    {
                        "profile_image": `${process.env.PROJECT_URL}assets/images/home-profile.webp`,
                        "reviewer": `Strong financial discipline and transparent practices are the backbone of Prethviga sustainable growth. We ensure every project delivers value, efficiency, and long-term returns.`,
                        "user_name": "John Davidson",
                        "user_role": "CFO, Prethviga"
                    }

                ]
            },
            {
                "page_slug": "home",
                "page_section": "recent_projects",
                "page_content": [
                    {
                        "card_image": `${process.env.PROJECT_URL}assets/images/projecthome1.webp`,
                        "project_name": "Pinnacle View Condominiums",
                        "project_area": "East Side",
                        "project_date": "November 2024",
                        "card_footer_text": "24 Premium Apartments",
                    },
                    {
                        "card_image": `${process.env.PROJECT_URL}assets/images/projecthome2.webp`,
                        "project_name": "Pinnacle View Condominiums",
                        "project_area": "East Side",
                        "project_date": "November 2024",
                        "card_footer_text": "24 Premium Apartments",
                    },
                    {
                        "card_image": `${process.env.PROJECT_URL}assets/images/projecthome3.webp`,
                        "project_name": "Pinnacle View Condominiums",
                        "project_area": "East Side",
                        "project_date": "November 2024",
                        "card_footer_text": "24 Premium Apartments",
                    },
                ]
            },
            {
                "page_slug": "home",
                "page_section": "home_tech",
                "page_content": [
                    {
                        "technologies-image": `${process.env.PROJECT_URL}assets/images/window.svg`,
                        "technologies-title": "Technologies",
                    },
                    {
                        "tech-name": "Wall",
                        "tech-text": "We use top-tier materials like reinforced composites and sustainable timber, customized for your project and local climate."
                    },
                    {
                        "tech-name": "Roof",
                        "tech-text": "We ensure dry, comfortable, energy-efficient homes with advanced waterproofing, insulation, and cladding for year-round protection."

                    },
                    {
                        "tech-name": "Window",
                        "tech-text": "Our windows offer stunning views, energy efficiency, and security, seamlessly integrating indoor and outdoor living spaces."
                    }
                ]
            },
            {
                "page_slug": "home",
                "page_section": "reviews",
                "page_content": [
                    {
                        "review-title": "Loved by our clients"
                    },
                    {
                        "review-text": "Prethviga Homes transformed our dream into reality. Their attention to detail and commitment to quality is unmatched. Our new home is everything we hoped for and more!",
                        "client-name": "Rajesh Kumar",
                        "client-role": "Homeowner",
                        "review-footer": "Project: Sunset Ridge Residence"
                    },
                    {
                        "review-text": "Working with Prethviga Homes was a seamless experience. They delivered our commercial space on time and within budget. Professional team with excellent communication!",
                        "client-name": "Priya Sharma",
                        "client-role": "Business Owner",
                        "review-footer": "Project: Tech Hub Commercial Plaza"
                    },
                    {
                        "review-text": "I've invested in multiple projects with Prethviga Homes and every time they've exceeded expectations. Their transparency and quality construction make them my go-to builder",
                        "client-name": "Arun Venkatesh",
                        "client-role": "Investor",
                        "review-footer": "Project: Green Valley Apartments"
                    }
                ]
            }

        ]
        const ProjectPageConnection = mongoose.connection.db.collection("ProjectPage");
        const insertProjectPageData = [
            {
                "page_slug": "ProjectPage",
                "page_section": "project-banner",
                "page_content": [
                    { "image": `${process.env.PROJECT_URL}/assets/images/blog1.webp` },
                    { "image": `${process.env.PROJECT_URL}/assets/images/cardblog3.webp` }
                ]
            },
            {
                "page_slug": "ProjectPage",
                "page_section": "ongoing-gallery",
                "page_content": [
                    {
                        "project_id": new ObjectId(),
                        "card_image": `${process.env.PROJECT_URL}/assets/images/card1.webp`,
                        "project_name": "Pinnacle View Condominiums",
                        "project_location": "West side",
                        "project_date": "November 2024",
                        "card_footer_text": "24 Premium Apartments"
                    },
                    {
                        "project_id": new ObjectId(),
                        "card_image": `${process.env.PROJECT_URL}/assets/images/card2.webp`,
                        "project_name": "Serenity Heights Estate",
                        "project_location": "West side",
                        "project_date": "August 2024",
                        "card_footer_text": "24 Premium Apartments",
                    },
                    {
                        "project_id": new ObjectId(),
                        "card_image": `${process.env.PROJECT_URL}/assets/images/card3.webp`,
                        "project_name": "Grandview Manor Residences",
                        "project_location": "South End",
                        "project_date": "September 2024",
                        "card_footer_text": "24 Premium Apartments",
                    },
                    {
                        "project_id": new ObjectId(),
                        "card_image": `${process.env.PROJECT_URL}/assets/images/card4.webp`,
                        "project_name": "Pinnacle View Condominiums",
                        "project_location": "East Side",
                        "project_date": "November 2024",
                        "card_footer_text": "24 Premium Apartments"
                    },
                    {
                        "project_id": new ObjectId(),
                        "card_image": `${process.env.PROJECT_URL}/assets/images/card1.webp`,
                        "project_name": "Pinnacle View Condominiums",
                        "project_location": "East Side",
                        "project_date": "November 2024",
                        "card_footer_text": "24 Premium Apartments"
                    },
                    {
                        "project_id": new ObjectId(),
                        "card_image": `${process.env.PROJECT_URL}/assets/images/card4.webp`,
                        "project_name": "Pinnacle View Condominiums",
                        "project_location": "East Side",
                        "project_date": "November 2024",
                        "card_footer_text": "24 Premium Apartments"
                    }
                ]
            },
            {
                "page_slug": "ProjectPage",
                "page_section": "completed-gallery",
                "page_content": [
                    {
                        "project_id": new ObjectId(),
                        "card_image": `${process.env.PROJECT_URL}/assets/images/card2.webp`,
                        "project_name": "Pinnacle View Condominiums",
                        "project_location": "West side",
                        "project_date": "November 2024",
                        "card_footer_text": "24 Premium Apartments"
                    },
                    {
                        "project_id": new ObjectId(),
                        "card_image": `${process.env.PROJECT_URL}/assets/images/card3.webp`,
                        "project_name": "Serenity Heights Estate",
                        "project_location": "West side",
                        "project_date": "August 2024",
                        "card_footer_text": "24 Premium Apartments"
                    },
                    {
                        "project_id": new ObjectId(),
                        "card_image": `${process.env.PROJECT_URL}/assets/images/card4.webp`,
                        "project_name": "Grandview Manor Residences",
                        "project_location": "South End",
                        "project_date": "September 2024",
                        "card_footer_text": "24 Premium Apartments",
                    },
                    {
                        "project_id": new ObjectId(),
                        "card_image": `${process.env.PROJECT_URL}/assets/images/card3.webp`,
                        "project_name": "Pinnacle View Condominiums",
                        "project_location": "East Side",
                        "project_date": "November 2024",
                        "card_footer_text": "24 Premium Apartments",
                    },
                    {
                        "project_id": new ObjectId(),
                        "card_image": `${process.env.PROJECT_URL}/assets/images/card3.webp`,
                        "project_name": "Pinnacle View Condominiums",
                        "project_location": "East Side",
                        "project_date": "November 2024",
                        "card_footer_text": "24 Premium Apartments",
                    },
                    {
                        "project_id": new ObjectId(),
                        "card_image": `${process.env.PROJECT_URL}/assets/images/card2.webp`,
                        "project_name": "Pinnacle View Condominiums",
                        "project_location": "East Side",
                        "project_date": "November 2024",
                        "card_footer_text": "24 Premium Apartments"
                    }
                ]

            },
            {
                "page_slug": "ProjectPage",
                "page_section": "faq-section-header",
                "page_content": [
                    {
                        "question": "1. What types of construction projects does Prethviga Homes undertake?",
                        "answer": `Prethviga Homes specializes in residential construction, including individual houses, villas, apartments, and renovation projects.`,
                    },
                    {
                        "question": "2. How does Prethviga Homes ensure construction quality?",
                        "answer": `We follow strict quality standards, use premium materials, and conduct regular inspections at every stage of construction.`,
                    },
                    {
                        "question": "3. Does Prethviga Homes deliver projects on time?",
                        "answer": `Yes, timely delivery is a core commitment. We use structured planning and efficient project management to meet agreed timelines.`,
                    },
                    {
                        "question": "4. Are pricing and agreements transparent?",
                        "answer": `Absolutely. We provide clear cost estimates, detailed agreements, and regular updates to ensure complete transparency.`,
                    },
                    {
                        "question": "5. Can I customize my home design with Prethviga Homes?",
                        "answer": `Yes, we offer design flexibility and customization options to match your lifestyle, preferences, and budget.`,
                    }

                ]
            },
        ]
        const OnGoingPageConnection = mongoose.connection.db.collection("OnGoingPage");
        const insertOnGoingPageData = [
            {
                "page_slug": "OnGoingPage",
                "page_section": "hero-section",
                "page_content": [
                    {
                        "pimage": `${process.env.PROJECT_URL}assets/images/onGoingBG.webp`,
                        "title": "Sunset Ridge Residence",
                        "buiding_name": "24 Premium Apartments",
                        "date": "November 15, 2025",
                        "location": "Chennai"
                    }
                ]
            },
            {
                "page_slug": "OnGoingPage",
                "page_section": "floor-image",
                "page_content": [
                    {
                        "title": "Floor Layout",
                        "floor_image": `${process.env.PROJECT_URL}assets/images/Rectangle 42.webp`
                    }
                ]
            },
            {
                "page_slug": "OnGoingPage",
                "page_section": "features-grid",
                "page_content": [
                    {
                        feature: "Premium Quality",
                        description: "High-quality materials and superior craftsmanship ensuring lasting value",
                        svg: {
                            width: 19,
                            height: 30,
                            viewBox: "0 0 19 30",
                            path: "M13.969 15.8533L15.989 27.2213C16.0116 27.3552 15.9928 27.4928 15.9352 27.6157C15.8775 27.7386 15.7837 27.8409 15.6662 27.9091C15.5488 27.9772 15.4134 28.0079 15.2781 27.997C15.1428 27.986 15.014 27.9341 14.909 27.848L10.1357 24.2653C9.90523 24.0932 9.62531 24.0002 9.33767 24.0002C9.05003 24.0002 8.7701 24.0932 8.53967 24.2653L3.75833 27.8467C3.65343 27.9326 3.52482 27.9845 3.38966 27.9954C3.25451 28.0063 3.11923 27.9758 3.00189 27.9078C2.88454 27.8399 2.7907 27.7378 2.73289 27.6151C2.67508 27.4925 2.65605 27.3551 2.67833 27.2213L4.697 15.8533M17.333 9.33333C17.333 13.7516 13.7513 17.3333 9.33301 17.3333C4.91473 17.3333 1.33301 13.7516 1.33301 9.33333C1.33301 4.91505 4.91473 1.33333 9.33301 1.33333C13.7513 1.33333 17.333 4.91505 17.333 9.33333Z"
                        }
                    },
                    {
                        feature: "Community Living",
                        description: "High-quality materials and superior craftsmanship ensuring lasting value",
                        svg: {
                            width: 30,
                            height: 27,
                            viewBox: "0 0 30 27",
                            path: "M19.9997 25.3333V22.6667C19.9997 21.2522 19.4378 19.8956 18.4376 18.8954C17.4374 17.8952 16.0808 17.3333 14.6663 17.3333H6.66634C5.25185 17.3333 3.8953 17.8952 2.89511 18.8954C1.89491 19.8956 1.33301 21.2522 1.33301 22.6667V25.3333M19.9997 1.50406C21.1433 1.80056 22.1562 2.46842 22.8792 3.40281C23.6023 4.33721 23.9946 5.48525 23.9946 6.66673C23.9946 7.84821 23.6023 8.99625 22.8792 9.93065C22.1562 10.865 21.1433 11.5329 19.9997 11.8294M27.9997 25.3333V22.6667C27.9988 21.485 27.6055 20.337 26.8815 19.4031C26.1575 18.4691 25.1438 17.8021 23.9997 17.5067M15.9997 6.66666C15.9997 9.61218 13.6119 12 10.6663 12C7.72082 12 5.33301 9.61218 5.33301 6.66666C5.33301 3.72114 7.72082 1.33333 10.6663 1.33333C13.6119 1.33333 15.9997 3.72114 15.9997 6.66666Z"
                        }
                    },
                    {
                        feature: "Spacious Design",
                        description: "High-quality materials and superior craftsmanship ensuring lasting value",
                        svg: {
                            width: 27,
                            height: 27,
                            viewBox: "0 0 27 27",
                            path: "M17.333 1.33334H25.333M25.333 1.33334V9.33334M25.333 1.33334L15.9997 10.6667M1.33301 25.3333L10.6663 16M1.33301 25.3333L9.33301 25.3333M1.33301 25.3333V17.3333"
                        }
                    },
                    {
                        feature: "Modern Architecture",
                        description: "High-quality materials and superior craftsmanship ensuring lasting value",
                        svg: {
                            width: 30,
                            height: 30,
                            viewBox: "0 0 30 30",
                            path: "M6.66634 28V4.00001C6.66634 3.29277 6.94729 2.61449 7.44739 2.11439C7.94749 1.61429 8.62576 1.33334 9.33301 1.33334H19.9997C20.7069 1.33334 21.3852 1.61429 21.8853 2.11439C22.3854 2.61449 22.6663 3.29277 22.6663 4.00001V28M6.66634 28H22.6663M6.66634 28L3.99967 28C3.29243 28 2.61415 27.7191 2.11406 27.219C1.61396 26.7189 1.33301 26.0406 1.33301 25.3333V17.3333C1.33301 16.6261 1.61396 15.9478 2.11406 15.4477C2.61415 14.9476 3.29243 14.6667 3.99967 14.6667H6.66634M22.6663 28L25.333 28C26.0403 28 26.7185 27.7191 27.2186 27.219C27.7187 26.7189 27.9997 26.0406 27.9997 25.3333V13.3333C27.9997 12.6261 27.7187 11.9478 27.2186 11.4477C26.7185 10.9476 26.0403 10.6667 25.333 10.6667H22.6663M11.9997 6.66668H17.333M11.9997 12H17.333M11.9997 17.3333H17.333M11.9997 22.6667H17.333"
                        }
                    }
                ]
            },
            {
                "page_slug": "OnGoingPage",
                "page_section": "amenities-list",
                "page_content": [
                    { "feature": "Swimming Pool" },
                    { "feature": "Theater" },
                    { "feature": "Fitness Center" },
                    { "feature": "Parking" },
                    { "feature": "Playground" },
                    { "feature": "24/7 Security" }
                ]
            },
            {
                "page_slug": "OnGoingPage",
                "page_section": "location-container",
                "page_content": {
                    image: `${process.env.PROJECT_URL}assets/images/Rectangle.webp`,
                    details: [
                        {
                            type: "address",
                            title: "Address",
                            text: "Avinashi Road, Coimbatore - 641018",
                            svg: {
                                width: 18,
                                height: 22,
                                viewBox: "0 0 18 22",
                                path: [
                                    "M17 9C17 13.993 11.461 19.193 9.601 20.799C9.42772 20.9293 9.2168 20.9998 9 20.9998C8.7832 20.9998 8.57228 20.9293 8.399 20.799C6.539 19.193 1 13.993 1 9C1 6.87827 1.84285 4.84344 3.34315 3.34315C4.84344 1.84285 6.87827 1 9 1C11.1217 1 13.1566 1.84285 14.6569 3.34315C16.1571 4.84344 17 6.87827 17 9Z",
                                    "M9 12C10.6569 12 12 10.6569 12 9C12 7.34315 10.6569 6 9 6C7.34315 6 6 7.34315 6 9C6 10.6569 7.34315 12 9 12Z"
                                ],
                                stroke: "#C1834E",
                                strokeWidth: 2,
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                fill: "none"
                            }
                        },
                        {
                            type: "landmarks",
                            title: "Nearby Landmarks",
                            list: [
                                "2 km from City Center",
                                "5 min to Schools & Hospitals",
                                "10 min to Shopping Malls",
                                "Easy access to IT Parks"
                            ],
                            svg: {
                                width: 21,
                                height: 22,
                                viewBox: "0 0 21 22",
                                path: [
                                    "M5 21V3C5 2.46957 5.21071 1.96086 5.58579 1.58579C5.96086 1.21071 6.46957 1 7 1H15C15.5304 1 16.0391 1.21071 16.4142 1.58579C16.7893 1.96086 17 2.46957 17 3V21M5 21H17M5 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V13C1 12.4696 1.21071 11.9609 1.58579 11.5858C1.96086 11.2107 2.46957 11 3 11H5M17 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V10C21 9.46957 20.7893 8.96086 20.4142 8.58579C20.0391 8.21071 19.5304 8 19 8H17M9 5H13M9 9H13M9 13H13M9 17H13"
                                ],
                                stroke: "#C1834E",
                                strokeWidth: 2,
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                fill: "none"
                            }
                        },
                        {
                            type: "connectivity",
                            title: "Connectivity",
                            text: "Well-connected by major roads and public transport with easy access to highways",
                            svg: {
                                width: 18,
                                height: 13,
                                viewBox: "0 0 18 13",
                                path: [
                                    "M17 1L6 12L1 7"
                                ],
                                stroke: "#C1834E",
                                strokeWidth: 2,
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                fill: "none"
                            }
                        }
                    ]
                }
            },
            {
                "page_slug": "OnGoingPage",
                "page_section": "gallery-wrapper",
                "page_content": [
                    {
                        title: "Living Room - 3BHK",
                        text: "Spacious living area with modern amenities",
                        coverImage: `${process.env.PROJECT_URL}assets/images/blog1.webp`,
                    },
                    {
                        title: "Master Bedroom",
                        text: "Elegant bedroom with premium finishes",
                        coverImage: `${process.env.PROJECT_URL}assets/images/blog2.webp`,
                    },
                    {
                        title: "Modern Kitchen",
                        text: "Fully equipped modular kitchen",
                        coverImage: `${process.env.PROJECT_URL}assets/images/card4.webp`,
                    },
                    {
                        title: "Luxury Bathroom",
                        text: "Designer bathroom with premium fixtures",
                        coverImage: `${process.env.PROJECT_URL}assets/images/card1.webp`,
                    },
                    {
                        title: "Private Balcony",
                        text: "Spacious balcony with scenic views",
                        coverImage: `${process.env.PROJECT_URL}assets/images/card5.webp`,
                    },
                    {
                        title: "Dining Area",
                        text: "Contemporary dining space",
                        coverImage: `${process.env.PROJECT_URL}assets/images/card6.webp`,
                    }
                ]
            },
            {
                "page_slug": "OnGoingPage",
                "page_section": "faq-items-container",
                "page_content": [
                    {
                        "question": "How long does a typical construction project take?",
                        "answer": `The duration varies based on project complexity and scale. Residential projects
                        typically take 8-14 months, while commercial developments may require 12-24 months. We
                        provide detailed timelines during project planning.`,
                    },
                    {
                        "question": "What types of projects do you specialize in?",
                        "answer": `We specialize in residential condominiums, luxury estates, commercial buildings, and
                        mixed-use developments. Our portfolio includes projects ranging from boutique apartments
                        to large-scale residential complexes.`,
                    },
                    {
                        "question": "Do you offer warranties on completed projects?",
                        "answer": `Yes, all our projects come with comprehensive warranties covering structural integrity,
                        workmanship, and materials. We offer 10-year structural warranties and 2-year warranties
                        on finishes and fittings.`,
                    }
                ]
            },
        ]
        const discoverUsConnection = mongoose.connection.db.collection("discoverUs");
        const insertdiscoverUsData = [
            {
                "page_slug": "discoverUs",
                "page_section": "discover-banner",
                "page_content": [
                    { "image": `${process.env.PROJECT_URL}/assets/images/discover.webp` }
                ]
            },
            // {
            //     "page_slug":"discoverUs",
            //     "page_section":"about-content",
            //     "page_content":[
            //         {
            //             "about-content__image": `${process.env.PROJECT_URL}assets/images/discover.webp`,
            //             "about-content__title": "Building Dreams Since Inception",
            //             "about-content__description": `Prethviga Homes is a leading construction company dedicated to 
            //             | transforming visions into reality. With years of experience in 
            //             | residential and commercial construction, we've built a reputation for 
            //             | excellence, innovation, and reliability.`
            //         },
            //     ]
            // },
            {
                "page_slug": "discoverUs",
                "page_section": "value-container",
                "page_content": [
                    {
                        card_head: "Integrity",
                        description_text: `We uphold the highest standards of honesty and transparency in
                        every interaction and decision.`,
                    },
                    {
                        card_head: "Excellence",
                        description_text: `We strive for perfection in every project, ensuring superior
                        quality and attention to detail.`,
                    },
                    {
                        card_head: "Customer First",
                        description_text: `We uphold the highest standards of honesty and transparency in
                        every interaction and decision.`,
                    },
                ]
            },
            // {
            //     "page_slug":"discoverUs",
            //     "page_section":"buyer-container",
            //     "page_content":[
            //         {
            //             "container-title": "Buyer&apos;s Guide",
            //             "container-description": `Use this holistic checklist to ensure your new home meets all your
            //             | needs for comfort, security, and long-term value.`,
            //         },
            //         {
            //             "row-text": 1,
            //             "row-description": "Location & Connectivity",
            //         },
            //         {
            //             "row-text": 2,
            //             "row-description": "Legal Verification",
            //         },
            //         {
            //             "row-text": 3,
            //             "row-description": "Peaceful Living Environment",
            //         },
            //         {
            //             "row-text": 4,
            //             "row-description": "Sustainable Features",
            //         },
            //         {
            //             "row-text": 5,
            //             "row-description": "Amenities & Lifestyle",
            //         },
            //         {
            //             "row-text": 6,
            //             "row-description": "Investment & Budget",
            //         },
            //     ]
            // },
            {
                "page_slug": "discoverUs",
                "page_section": "blogs-card",
                "page_content": [
                    {
                        blog_id: new ObjectId(),
                        inner_img: `${process.env.PROJECT_URL}assets/images/Blog_1.webp`,
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
                        `
                    },
                    {
                        blog_id: new ObjectId(),
                        inner_img: `${process.env.PROJECT_URL}assets/images/proimage5.webp`,
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
                            <p>Smart orientation, natural ventilation, insulated walls, and energy-efficient lighting help reduce dependency on artificial cooling—especially important in Chennai’s hot and humid climate.</p>
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
                        `
                    },
                    {
                        blog_id: new ObjectId(),
                        inner_img: `${process.env.PROJECT_URL}assets/images/Blog_3.webp`,
                        badge_text: "Sustainability",
                        blog_date: `November 15, 2025`,
                        blog_time: "4",
                        blog_title: "Trending Home Construction Methods & Techniques in India (2026)",
                        blog_description: `As India’s urban landscape evolves rapidly, so do the techniques and technologies used to build homes. In 2026, homeowners and builders alike are embracing smarter, faster, and more sustainable construction methods that deliver quality, efficiency, and long-term value.`,
                        blog_content: `<p>As India’s urban landscape evolves rapidly, so do the techniques and technologies used to build homes. In 2026, homeowners and builders alike are embracing smarter, faster, and more sustainable construction methods that deliver quality, efficiency,and long-term value.</p>
                            <h3>1. Pre-Engineered & Modular Construction</h3>
                            <p>Modular construction involves building sections (modules) off-site and assembling them on location. Pre-engineered steel buildings are growing in popularity for residential and mixed-use developments.</p>
                            <h3>Why it’s trending:</h3>
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
                            <p>Tech isn’t just for homes once they’re built — it’s influencing how we build them. Smart planning and IoT monitoring improve construction outcomes.</p>
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
                        `
                    }
                ]
            }
        ];

        // Admin User Data
        const adminUsersConnection = mongoose.connection.db.collection("admin");

        const adminPassword = "admin@321";
        const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
        const insertAdminData = 
            {
                "userName": "admin@gmail.com",
                "password": hashedAdminPassword,
                "createdAt": new Date()
            };

        // Clear existing data to prevent duplicates
        await homeConnection.deleteMany({});
        await ProjectPageConnection.deleteMany({});
        await OnGoingPageConnection.deleteMany({});
        await discoverUsConnection.deleteMany({});
        
        await adminUsersConnection.deleteMany({});

        // Insert fresh data
        await homeConnection.insertMany(insertHomeData);
        await ProjectPageConnection.insertMany(insertProjectPageData);
        await OnGoingPageConnection.insertMany(insertOnGoingPageData);
        await discoverUsConnection.insertMany(insertdiscoverUsData);

        await adminUsersConnection.insertOne(insertAdminData);

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};
seedMongoDB();