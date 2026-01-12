require("dotenv").config();
const mongoose = require("mongoose");
// const connectMongoDB = require("../../config/mongodb.js");
const config = require("../../config/config.js");
const PROJECT_URL = process.env.PROJECT_URL;


const seedMongoDB = async () => {
    try {
        await mongoose.connect(config.mongodb.uri);
        console.log('MongoDB connected successfully');
        console.log('Seeding MongoDB...');
        const homeConnection = mongoose.connection.db.collection("home");
        const insertHomeData = [
            {
                "page_slug":"home",
                "page_section":"home_banner",
                "page_content":[
                    {
                        "projimage":`${process.env.PROJECT_URL}/assets/images/homeani1.webp`
                    },
                    {
                        "projimage":`${process.env.PROJECT_URL}/assets/images/homeani2.webp`
                    },
                    {
                        "projimage":`${process.env.PROJECT_URL}/assets/images/homeani3.webp`
                    },
                    {
                        "projimage":`${process.env.PROJECT_URL}/assets/images/homeani4.webp`

                    }
                ]
            },
            {
                "page_slug":"home",
                "page_section":"home_reviews",
                "page_content":[
                    {
                        "profile_image":`${process.env.PROJECT_URL}/assets/images/home-profile.webp`,
                        "reviewer":`Outstanding work!
                        They completed out commercial building ahead of schedule and
                        the quality exceeded our expectations. Highly professional team.`,
                        "user_name":"John Davidson",
                        "user_role":"CEO, Davidson Enterprices"
                    },
                    {
                        "profile_image":`${process.env.PROJECT_URL}/assets/images/home-profile.webp`,
                        "reviewer":`Outstanding work!
                        They completed out commercial building ahead of schedule and
                        the quality exceeded our expectations. Highly professional team.`,
                        "user_name":"John Davidson",
                        "user_role":"CEO, Davidson Enterprices"
                    },
                    {
                        "profile_image":`${process.env.PROJECT_URL}/assets/images/home-profile.webp`,
                        "reviewer":`Excellent  work!
                        They completed our commercial building ahead of schedule and
                        the quality exceeded our excpectations. Highly professional team.`,
                        "user_name":"John Davidson",
                        "user_role":"CEO, Davidson Enterprises"
                    }

                ]
            },
            {
                "page_slug":"home",
                "page_section":"recent_projects",
                "page_content":[
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/projecthome1.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-area":"East Side",
                        "project-date":"November 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/projecthome2.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-area":"East Side",
                        "project-date":"November 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/projecthome3.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-area":"East Side",
                        "project-date":"November 2024",
                        "card-footer-text":"24 Premium Apartments",
                    },
                ]
            },
            {
                "page_slug":"home",
                "page_section":"home_tech",
                "page_content":[
                    {
                        "technologies-image":`${process.env.PROJECT_URL}assets/images/window.svg`,
                        "technologies-title":"Technologies",
                    },
                    {
                        "tech-name":"Wall",
                        "tech-text":"We use top-tier materials like reinforced composites and sustainable timber, customized for your project and local climate."
                    },
                    {
                        "tech-name":"Roof",
                        "tech-text":"We ensure dry, comfortable, energy-efficient homes with advanced waterproofing, insulation, and cladding for year-round protection."

                    },
                    {
                        "tech-name":"Window",
                        "tech-text":"Our windows offer stunning views, energy efficiency, and security, seamlessly integrating indoor and outdoor living spaces."
                    }
                ]
            },
            {
                "page_slug":"home",
                "page_section":"reviews",
                "page_content":[
                    {
                        "review-title":"Loved by our clients"
                    },
                    {
                        "review-text":"Prethviga Homes transformed our dream into reality. Their attention to detail and commitment to quality is unmatched. Our new home is everything we hoped for and more!",
                        "client-name":"Rajesh Kumar",
                        "client-role":"Homeowner",
                        "review-footer":"Project: Sunset Ridge Residence"
                    },
                    {
                        "review-text":"Working with Prethviga Homes was a seamless experience. They delivered our commercial space on time and within budget. Professional team with excellent communication!",
                        "client-name":"Priya Sharma",
                        "client-role":"Business Owner",
                        "review-footer":"Project: Tech Hub Commercial Plaza"
                    },
                    {
                        "review-text":"I've invested in multiple projects with Prethviga Homes and every time they've exceeded expectations. Their transparency and quality construction make them my go-to builder",
                        "client-name":"Arun Venkatesh",
                        "client-role":"Investor",
                        "review-footer":"Project: Green Valley Apartments"
                    }
                ]
            }

        ]
        const ProjectPageConnection= mongoose.connection.db.collection("ProjectPage");
        const insertProjectPageData=[
            {
                "page_slug":"ProjectPage",
                "page_section":"ongoing-gallery",
                "page_content":[
                    {
                        "card_image":`${process.env.PROJECT_URL}/assets/images/card1.webp`,
                        "project_name":"Pinnacle View Condominiums",
                        "project_location":"West side",
                        "project_date":"November 2024",
                        "card_footer_text":"24 Premium Apartments"
                    },
                    {
                        "card_image":`${process.env.PROJECT_URL}/assets/images/card2.webp`,
                        "project_name":"Serenity Heights Estate",
                        "project_location":"West side",
                        "project_date":"August 2024",
                        "card_footer_text":"24 Premium Apartments",
                    },
                    {
                        "card_image":`${process.env.PROJECT_URL}/assets/images/card3.webp`,
                        "project_name":"Grandview Manor Residences",
                        "project_location":"South End",
                        "project_date":"September 2024",
                        "card_footer_text":"24 Premium Apartments",
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card4.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-location":"East Side",
                        "project-date":"November 2024",
                        "card-footer-text":"24 Premium Apartments"
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card1.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-location":"East Side",
                        "project-date":"November 2024",
                        "card-footer-text":"24 Premium Apartments"
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card4.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-location":"East Side",
                        "project-date":"November 2024",
                        "card-footer-text":"24 Premium Apartments"
                    }
                ]
            },
            {
                "page_slug":"ProjectPage",
                "page_section":"card-grid-wrapper",
                "page_content":[
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card2.webp`,
                        "project-name":"Pinnacle View Condominiums",
                        "project-location":"West side",
                        "project-date":"November 2024",
                        "card-footer-text":"24 Premium Apartments"
                    },
                    {
                        "card-image":`${process.env.PROJECT_URL}/assets/images/card3.webp`,
                        "project-name":"Serenity Heights Estate",
                        "project-location":"West side",
                        "project-date":"August 2024",
                        "card-footer-text":"24 Premium Apartments"
                    },
                    {
                        "card_image":`${process.env.PROJECT_URL}/assets/images/card4.webp`,
                        "project_name":"Grandview Manor Residences",
                        "project_location":"South End",
                        "project_date":"September 2024",
                        "card_footer_text":"24 Premium Apartments",
                    },
                    {
                        "card_image":`${process.env.PROJECT_URL}/assets/images/card3.webp`,
                        "project_name":"Pinnacle View Condominiums",
                        "project_location":"East Side",
                        "project_date":"November 2024",
                        "card_footer_text":"24 Premium Apartments",
                    },
                    {
                        "card_image":`${process.env.PROJECT_URL}/assets/images/card3.webp`,
                        "project_name":"Pinnacle View Condominiums",
                        "project_location":"East Side",
                        "project_date":"November 2024",
                        "card_footer_text":"24 Premium Apartments",
                    },
                    {
                        "card_image":`${process.env.PROJECT_URL}/assets/images/card2.webp`,
                        "project_name":"Pinnacle View Condominiums",
                        "project_location":"East Side",
                        "project_date":"November 2024",
                        "card_footer_text":"24 Premium Apartments"
                    }
                ]

            },
            {
                "page_slug":"ProjectPage",
                "page_section":"faq-section-header",
                "page_content":[
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
                "page_slug":"OnGoingPage",
                "page_section":"amenities-list",
                "page_content":[
                    {
                        "feature": "Swimming Pool"
                    },
                    {
                        "feature": "Theater"
                    },
                    {
                        "feature": "Fitness Center"
                    },
                    {
                        "feature": "Parking"
                    },
                    {
                        "feature": "Playground"
                    },
                    {
                        "feature": "24/7 Security"
                    }
                ]
            },
            {
                "page_slug": "OnGoingPage",
                "page_section": "location-container",
                "page_content": {
                    image:`${process.env.PROJECT_URL}assets/images/Rectangle.webp`,
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
                "page_slug":"OnGoingPage",
                "page_section":"faq-items-container",
                "page_content":[
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
                "page_slug":"discoverUs",
                "page_section":"value-container",
                "page_content":[
                    {
                        card_head: "Integrity",
                        description_text:`We uphold the highest standards of honesty and transparency in
                        every interaction and decision.`,
                    },
                    {
                        card_head: "Excellence",
                        description_text:`We strive for perfection in every project, ensuring superior
                        quality and attention to detail.`,
                    },
                    {
                        card_head: "Customer First",
                        description_text:`We uphold the highest standards of honesty and transparency in
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
            //             "row-description": "Location &amp; Connectivity",
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
            //             "row-description": "Amenities &amp; Lifestyle",
            //         },
            //         {
            //             "row-text": 6,
            //             "row-description": "Investment &amp; Budget",
            //         },
            //     ]
            // },
            {
                "page_slug":"discoverUs",
                "page_section":"blogs-card",
                "page_content":[
                    {
                        inner_img: `${process.env.PROJECT_URL}assets/images/blog1.webp`,
                        badge_text: "Sustainability",
                        c_text: `November 15, 2025`,
                        c_times: "4 min read",
                        h_texts: "Innovative Materials Revolutionizing Construction",
                        cs_text: `Explore cutting-edge materials that enhance structural
                        integrity and reduce costs in modern building projects.`,
                    },
                    {
                        inner_img: `${process.env.PROJECT_URL}assets/images/blog2.webp`,
                        badge_text: "Sustainability",
                        c_text: `November 15, 2025`,
                        c_times: "4 min read",
                        h_texts: "Top 10 Sustainable Building Practices for 2025",
                        cs_text: `Explore cutting-edge materials that enhance structural
                        integrity and reduce costs in modern building projects.`,
                    },
                    {
                        inner_img: `${process.env.PROJECT_URL}assets/images/proimage5.webp`,
                        badge_text: "Sustainability",
                        c_text: `November 15, 2025`,
                        c_times: "4 min read",
                        h_texts: "Eco-Friendly Construction: The Future of Home Building",
                        cs_text: `Explore cutting-edge materials that enhance structural
                        integrity and reduce costs in modern building projects.`,
                    },
                ]
            }
        ]

        // Clear existing data to prevent duplicates
        await homeConnection.deleteMany({});
        await ProjectPageConnection.deleteMany({});
        await OnGoingPageConnection.deleteMany({});
        await discoverUsConnection.deleteMany({});

        // Insert fresh data
        await homeConnection.insertMany(insertHomeData);
        await ProjectPageConnection.insertMany(insertProjectPageData);
        await OnGoingPageConnection.insertMany(insertOnGoingPageData);
        await discoverUsConnection.insertMany(insertdiscoverUsData);
        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};
seedMongoDB();